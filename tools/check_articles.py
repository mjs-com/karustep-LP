"""Reproduce acceptance checks in an isolated temporary repository copy."""
import copy
import json
import shutil
import subprocess
import sys
import tempfile
from datetime import date
from pathlib import Path
import xml.etree.ElementTree as ET
from build_articles import ROOT, BASE, build
from lint_article import lint
from publish_next import publish


def check():
    with tempfile.TemporaryDirectory(prefix='karustep-acceptance-') as folder:
        root = Path(folder)
        for name in ('articles', 'tools'):
            shutil.copytree(ROOT / name, root / name, ignore=shutil.ignore_patterns('__pycache__'))
        shutil.copy2(ROOT / 'sitemap.xml', root / 'sitemap.xml')
        fixture = ROOT / 'tools/fixtures'
        ledger = json.loads((fixture / 'ledger.json').read_text(encoding='utf-8'))
        item = ledger[0]
        slug = item['slug']
        body_path = root / 'articles/bodies' / (slug + '.html')
        body_path.write_bytes((fixture / (slug + '.html')).read_bytes())
        ledger_path = root / 'articles/ledger.json'

        def save():
            ledger_path.write_text(json.dumps(ledger, ensure_ascii=False), encoding='utf-8')

        def run(script, *args, expected=0):
            result = subprocess.run([sys.executable, str(root / 'tools' / script), *args], cwd=root, capture_output=True, text=True, encoding='utf-8')
            print(f'python3 tools/{script} {" ".join(args)} -> exit {result.returncode}')
            print(result.stdout.strip())
            assert result.returncode == expected, result.stderr
            return result.stdout

        def snapshot():
            return {str(p.relative_to(root)): p.read_bytes() for p in root.rglob('*') if p.is_file() and '__pycache__' not in p.parts}

        save()
        ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        def locations():
            return [node.text for node in ET.parse(root / 'sitemap.xml').findall('s:url/s:loc', ns)]
        before = locations()
        run('build_articles.py')
        article = (root / 'articles' / (slug + '.html')).read_text(encoding='utf-8')
        assert item['title'] in article and '{{' not in article
        assert f'?entry=article_end&article={slug}' in article
        assert slug + '.html' in (root / 'articles/index.html').read_text(encoding='utf-8')
        assert set(before) <= set(locations()) and len(locations()) == len(set(locations()))
        for path in (root / 'articles/index.html', root / 'articles' / (slug + '.html')):
            import re
            data = re.search(r'<script type="application/ld\+json">(.*?)</script>', path.read_text(encoding='utf-8'), re.S)[1]
            json.loads(data)
        stable = snapshot()
        run('build_articles.py')
        assert stable == snapshot(), 'build must be idempotent'
        run('lint_article.py', slug)
        body_path.write_bytes((fixture / (slug + '-ng.html')).read_bytes())
        assert 'banned expression' in run('lint_article.py', slug, expected=1)
        body_path.write_bytes((fixture / (slug + '.html')).read_bytes())
        stable = snapshot()
        run('publish_next.py', '--dry-run')
        run('publish_next.py')
        assert stable == snapshot(), 'empty queue must not change files'

        # Same-category priority, unpublished exclusion, newest-first order.
        for suffix, category, status in [('older', 'ai-karte-basics', 'published'), ('other', 'operations', 'published'), ('draft', 'ai-karte-basics', 'draft')]:
            extra = copy.deepcopy(item)
            extra.update(slug=suffix, category=category, status=status, publish_date='2026-11-14')
            ledger.append(extra)
            (root / 'articles/bodies' / (suffix + '.html')).write_bytes(body_path.read_bytes())
        save()
        build(root)
        article = (root / 'articles' / (slug + '.html')).read_text(encoding='utf-8')
        assert article.index('href="older.html"') < article.index('href="other.html"')
        assert 'draft.html' not in article

        # Due selection, future exclusion, one item only, non-mutating dry run.
        for e in ledger:
            e['status'] = 'queued'
        ledger[2]['publish_date'] = '2099-01-01'
        save()
        stable = snapshot()
        assert not publish(root, dry_run=True, today=date(2026, 11, 15))
        assert stable == snapshot()
        assert publish(root, today=date(2026, 11, 15))
        changed = json.loads(ledger_path.read_text(encoding='utf-8'))
        assert [e['slug'] for e in changed if e['status'] == 'published'] == ['draft']

        keywords = json.loads((ROOT / 'tools/keywords.json').read_text(encoding='utf-8'))
        body = body_path.read_text(encoding='utf-8')
        for field, value in [('title', 'キーワードのない記事'), ('description', '短い説明')]:
            invalid = copy.deepcopy(item)
            invalid[field] = value
            assert lint(invalid, body, keywords)[0]
        assert lint(item, '<p>短い本文</p>', keywords)[0]
        assert lint(item, body * 2, keywords)[0]
        assert lint(item, '<p>' + '前' * 100 + '</p>' + body, keywords)[0]
        for addition, expected_error in [('<p>初期費用55,000円、保守費用5,500円です。</p>', False),
                                        ('<p>初期費用77,000円です。</p>', True),
                                        ('<p>保守費用6,000円です。</p>', True),
                                        ('<p>監修について</p>', True)]:
            errors, _ = lint(item, body + addition, keywords)
            assert bool(errors) == expected_error, errors
        fewer = copy.deepcopy(item)
        fewer['cluster'] = ['存在しない語']
        errors, warnings = lint(fewer, body.replace('<h2>', '<h3>').replace('</h2>', '</h3>'), keywords)
        assert len(warnings) == 2 and errors
        # At UTC 15:30 the calendar date is already the next day in JST.
        import publish_next
        from datetime import datetime, timezone
        from unittest.mock import patch
        class BoundaryClock:
            @staticmethod
            def now(tz):
                return datetime(2026, 11, 14, 15, 30, tzinfo=timezone.utc).astimezone(tz)
        ledger[:] = [copy.deepcopy(item)]
        ledger[0]['status'] = 'queued'
        ledger[0]['publish_date'] = '2026-11-15'
        save()
        with patch.object(publish_next, 'datetime', BoundaryClock):
            assert publish(root)
        # Invalid queued copy cannot be published or change the ledger.
        ledger[0]['status'] = 'queued'
        save()
        body_path.write_bytes((fixture / (slug + '-ng.html')).read_bytes())
        stable = snapshot()
        try:
            publish(root, today=date(2026, 11, 15))
        except ValueError:
            pass
        else:
            raise AssertionError('invalid queued article was published')
        assert stable == snapshot()
        print('PASS: build/idempotence, sitemap preservation, JSON-LD/CTA, lint PASS/NG/prices/sources/warnings, related priority, no-op/dry-run, oldest due one-item publication.')


if __name__ == '__main__':
    check()
