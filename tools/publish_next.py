"""Publish at most one due queued article, using the calendar date in JST."""
import argparse
import json
from datetime import datetime, timedelta, timezone
from build_articles import ROOT, build, load_ledger
from lint_article import lint


def publish(root=ROOT, dry_run=False, today=None):
    today = today or datetime.now(timezone(timedelta(hours=9))).date()
    entries = load_ledger(root)
    due = sorted((e for e in entries if e['status'] == 'queued' and e['publish_date'] <= today.isoformat()),
                 key=lambda e: (e['publish_date'], e['slug']))
    if not due:
        print(f'No due queued articles ({today} JST); no files changed.')
        return False
    item = due[0]
    keywords = json.loads((root / 'tools/keywords.json').read_text(encoding='utf-8'))
    errors, warnings = lint(item, (root / 'articles/bodies' / (item['slug'] + '.html')).read_text(encoding='utf-8'), keywords)
    for warning in warnings:
        print(f'WARNING: {warning}')
    if errors:
        raise ValueError('; '.join(errors))
    if dry_run:
        print(f'Would publish: {item["slug"]}; no files changed.')
        return False
    path = root / 'articles/ledger.json'
    original = path.read_bytes()
    item['status'] = 'published'
    path.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    try:
        build(root)
    except Exception:
        path.write_bytes(original)
        raise
    print(f'Published: {item["slug"]}')
    return True


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    publish(dry_run=args.dry_run)
