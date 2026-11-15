"""Build static article pages and extend the sitemap (stdlib only)."""
import json
import re
from datetime import date
from html import escape
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://mjs.main.jp/karustep-LP/articles/'
CATEGORIES = {'ai-karte-basics': 'AIカルテ基礎知識', 'ehr-linkage': '電子カルテ連携',
              'efficiency': '診療効率化', 'operations': '導入・運用', 'cost-subsidy': '料金・補助金'}


def load_ledger(root=ROOT):
    entries = json.loads((root / 'articles/ledger.json').read_text(encoding='utf-8'))
    seen = set()
    for item in entries:
        slug = item['slug']
        if not re.fullmatch(r'[a-z0-9-]{1,80}', slug) or slug in seen or slug == 'index':
            raise ValueError(f'Invalid or duplicate slug: {slug}')
        seen.add(slug)
        if item['category'] not in CATEGORIES or item['status'] not in ('draft', 'queued', 'published'):
            raise ValueError(f'Invalid category/status: {slug}')
        date.fromisoformat(item['publish_date'])
    return entries


def json_ld(value):
    return json.dumps(value, ensure_ascii=False).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')


def render(template, values):
    # Single substitution pass: body text cannot introduce template instructions.
    return re.sub(r'\{\{([A-Z_]+)\}\}', lambda m: values[m[1]], template)


def build(root=ROOT):
    articles = root / 'articles'
    entries = sorted((e for e in load_ledger(root) if e['status'] == 'published'),
                     key=lambda e: (e['publish_date'], e['slug']), reverse=True)
    template = (articles / 'article.template.html').read_text(encoding='utf-8')
    outputs = {}
    for item in entries:
        slug = item['slug']
        related = sorted((e for e in entries if e['slug'] != slug),
                         key=lambda e: e['category'] != item['category'])[:2]
        links = '<ul>' + ''.join(f'<li><a href="{e["slug"]}.html">{escape(e["title"])}</a></li>' for e in related) + '</ul>' if related else '<p>関連記事は準備中です。</p>'
        data = {'TITLE': item['title'], 'SLUG': slug, 'DATE': item['publish_date'],
                'CATEGORY': CATEGORIES[item['category']], 'DESCRIPTION': item['description'], 'CANONICAL': BASE + slug + '.html'}
        values = {k: escape(v, quote=True) for k, v in data.items()}
        org = {'@type': 'Organization', 'name': '合同会社MJSカンパニー'}
        values.update(BODY_HTML=(articles / 'bodies' / f'{slug}.html').read_text(encoding='utf-8'), RELATED_HTML=links,
                      JSON_LD=json_ld({'@context': 'https://schema.org', '@type': 'Article', 'headline': item['title'],
                                      'datePublished': item['publish_date'], 'author': org, 'publisher': org,
                                      'description': item['description'], 'mainEntityOfPage': data['CANONICAL']}))
        outputs[articles / f'{slug}.html'] = render(template, values)
    sections = []
    for key, label in CATEGORIES.items():
        cards = ''.join(f'<div class="card"><h3><a href="{e["slug"]}.html">{escape(e["title"])}</a></h3>'
                        f'<div class="meta"><time datetime="{e["publish_date"]}">{e["publish_date"]}</time> · {label}</div>'
                        f'<p>{escape(e["description"][:80])}…</p></div>' for e in entries if e['category'] == key)
        sections.append(f'<section id="{key}"><h2>{label}</h2><div class="cards">{cards}</div>' + ('' if cards else '<p>記事は準備中です。</p>') + '</section>')
    outputs[articles / 'index.html'] = render((articles / 'index.template.html').read_text(encoding='utf-8'), {
        'TITLE': '医療DX関連記事', 'DESCRIPTION': 'AIカルテ、電子カルテ連携、診療効率化、導入・運用、料金・補助金に関する情報を紹介します。',
        'CANONICAL': BASE, 'CATEGORY_LINKS': ''.join(f'<a href="#{k}">{v}</a>' for k, v in CATEGORIES.items()),
        'SECTIONS_HTML': '\n'.join(sections), 'JSON_LD': json_ld({'@context': 'https://schema.org', '@type': 'ItemList',
            'itemListElement': [{'@type': 'ListItem', 'position': i, 'url': BASE + e['slug'] + '.html', 'name': e['title']} for i, e in enumerate(entries, 1)]})})
    # Preserve all existing XML entries, adding only missing URLs.
    path = root / 'sitemap.xml'
    xml = path.read_text(encoding='utf-8')
    ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
    tree = ET.fromstring(xml)
    existing = [node.text for node in tree.findall(f'{ns}url/{ns}loc')]
    if len(existing) != len(set(existing)):
        raise ValueError('Existing sitemap contains duplicate URLs')
    missing = [url for url in [BASE] + [BASE + e['slug'] + '.html' for e in entries] if url not in existing]
    if missing:
        closing = '</urlset>'
        if closing not in xml:
            raise ValueError('Expected urlset sitemap')
        outputs[path] = xml.replace(closing, ''.join(f'  <url>\n    <loc>{url}</loc>\n  </url>\n' for url in missing) + closing)
    for path, content in outputs.items():
        path.write_text(content, encoding='utf-8', newline='\n')
    print(f'Built {len(entries)} published articles and index; added {len(missing)} sitemap URLs.')


if __name__ == '__main__':
    build()
