"""Lint one ledger entry/body or every queued article; no dependencies."""
import argparse
import json
import re
import unicodedata
from html.parser import HTMLParser
from build_articles import ROOT, load_ledger


def normalize(text):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', text)).casefold()


class Text(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts, self.h2 = [], []
        self.heading = None
        self.hidden = 0

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.hidden += 1
        if tag == 'h2':
            self.heading = []

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.hidden = max(0, self.hidden - 1)
        if tag == 'h2' and self.heading is not None:
            self.h2.append(''.join(self.heading))
            self.heading = None

    def handle_data(self, data):
        if not self.hidden:
            self.parts.append(data)
            if self.heading is not None:
                self.heading.append(data)


def lint(item, body, keywords):
    parser = Text()
    parser.feed(body)
    text = re.sub(r'\s+', '', ''.join(parser.parts))
    norm = normalize(text)
    keyword = normalize(item['main_keyword'])
    cluster = list(dict.fromkeys(normalize(w) for w in item['cluster'] if normalize(w)))
    errors, warnings = [], []
    if not keyword or keyword not in normalize(item['title']):
        errors.append('title must contain main_keyword')
    if not keyword or keyword not in normalize(text[:100]):
        errors.append('first 100 body characters must contain main_keyword')
    if not any(any(w in normalize(h) for w in [keyword] + cluster if w) for h in parser.h2):
        errors.append('an H2 must contain main_keyword or a cluster term')
    if not 1100 <= len(text) <= 1700:
        errors.append(f'body length {len(text)} outside 1100..1700')
    all_text = normalize(item['title'] + text + item['description'])
    for word in keywords['banned']:
        if normalize(word) in all_text:
            errors.append(f'banned expression: {word}')
    # Associate each amount with the nearest fee label in its sentence.
    # This allows both valid fees in one sentence without confusing them.
    pricing = unicodedata.normalize('NFKC', item['title'] + '。' + text + '。' + item['description'])
    for sentence in re.split(r'[。！？\n]', pricing):
        labels = list(re.finditer(r'初期費用|初期料金|導入費用|保守(?:費用|料金)?', sentence))
        for amount in re.finditer(r'(\d[\d,]*(?:\.\d+)?)\s*(万)?\s*円', sentence):
            if not labels:
                continue
            label = min(labels, key=lambda m: min(abs(amount.start() - m.end()), abs(m.start() - amount.end())))
            distance = min(abs(amount.start() - label.end()), abs(label.start() - amount.end()))
            if distance > 40:
                continue
            value = float(amount[1].replace(',', '')) * (10000 if amount[2] else 1)
            expected = 5500 if label[0].startswith('保守') else 55000
            if value != expected:
                errors.append(f'inconsistent price near {label[0]}: {amount[0]} (expected {expected}円)')
    if any(w in item['title'] + text + item['description'] for w in ('導入事例', '体験談', '監修')) and not any(str(ref).strip() for ref in item['source_refs']):
        errors.append('source_refs required for case studies/testimonials/supervision')
    if not 90 <= len(item['description']) <= 120:
        errors.append('description length outside 90..120')
    if sum(w in norm for w in cluster) < 3:
        warnings.append('fewer than 3 distinct cluster terms in body')
    if len(parser.h2) < 3:
        warnings.append('fewer than 3 H2 headings')
    return errors, warnings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('slug', nargs='?')
    group.add_argument('--all-queued', action='store_true')
    args = parser.parse_args()
    try:
        entries = load_ledger()
        chosen = [e for e in entries if e['status'] == 'queued'] if args.all_queued else [e for e in entries if e['slug'] == args.slug]
        if not args.all_queued and not chosen:
            raise ValueError(f'Unknown slug: {args.slug}')
        keywords = json.loads((ROOT / 'tools/keywords.json').read_text(encoding='utf-8'))
        failed = False
        for item in chosen:
            errors, warnings = lint(item, (ROOT / 'articles/bodies' / (item['slug'] + '.html')).read_text(encoding='utf-8'), keywords)
            for level, messages in [('ERROR', errors), ('WARNING', warnings)]:
                for message in messages:
                    print(f'{level} {item["slug"]}: {message}')
            print(f'{item["slug"]}: {"FAIL" if errors else "PASS"}')
            failed |= bool(errors)
        return int(failed)
    except (ValueError, KeyError, OSError) as error:
        print(f'ERROR: {error}')
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
