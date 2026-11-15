# Article publishing tools

Python 3.9+; standard library only. Run commands from the repository root.
`python3` is the documented command; on this Windows PC the tested executable
is `python` (Python 3.12.10).

## Content workflow

1. Add a unique lowercase ASCII slug (letters, digits, hyphens; max 80 characters,
   excluding `index`) to `articles/ledger.json`. Use one of the five category keys
   in `build_articles.py`. Set `status` to `draft` while editing.
2. Write `articles/bodies/{slug}.html`: the contents of the article only, with
   H2/H3, paragraphs, lists, tables or FAQ sections. The template provides H1.
   Bodies are trusted, reviewed HTML. Do not include patient data.
3. Fill in title, category, main_keyword, cluster, description, publish_date
   (`YYYY-MM-DD`), gbp_posted (boolean), and source_refs (array). The fixture
   ledger demonstrates all fields. Give case studies, testimonials and
   supervision claims real source references.
4. Run `python3 tools/lint_article.py <slug>`. Errors exit 1; warnings exit 0.
   Keywords normalize Unicode width, case and whitespace. Body length excludes
   whitespace, tags and script/style content. Price checks associate yen amounts
   within 40 characters with the nearest fee label in the same sentence;
   initial cost is 55,000 yen, maintenance is 5,500 yen. Other contextual claims
   still require editorial review.
5. Set `status` to `queued` with a publication date, then run
   `python3 tools/lint_article.py --all-queued` before committing content.
6. `python3 tools/publish_next.py --dry-run` previews the oldest due item using
   today's JST date without changing files. Without `--dry-run`, one eligible
   item is linted, marked published and built. A lint failure leaves it queued.
   Equal dates sort by slug. No due item means no writes, including no rebuild.

`python3 tools/build_articles.py` regenerates the index and all published article
pages. Edit templates, never generated HTML. Listing sections and their cards
show newest first. Related links prefer the same category, then fill remaining
slots from other published articles, up to two. Sitemap updates are additive:
existing URLs and metadata remain; reruns add no duplicates. Removing a published
entry is not an unpublishing mechanism; generated pages and existing sitemap URLs
are intentionally not deleted by this Phase 1 tool.

The committed ledger is empty. Fixtures are synthetic pipeline test material and
are never installed into the production ledger by the acceptance runner.

## Daily workflow

`.github/workflows/publish.yml` runs at `0 0 * * *` (09:00 JST) or manually.
It operates only on main, once this branch is reviewed and merged by the owner.
It commits/pushes only when files changed, using the GitHub Actions bot, then
performs FTP deployment with the same action version, secrets and server directory
as the existing deploy workflow. No eligible article means no commit or FTP step.
The main guard prevents a manual run on this feature branch from publishing it.
Repository Actions must allow `contents: write` and the existing FTP secrets must
be available. No main merge or production FTP execution is part of this task.

## Reproducible acceptance checks and actual results

Executed on 2026-11-15 JST, Windows, Python 3.12.10:

```text
python tools/build_articles.py
  exit 0; built 0 published articles and index; added articles/ to sitemap.
python tools/lint_article.py --all-queued
  exit 0; empty queue.
python tools/publish_next.py --dry-run
  exit 0; No due queued articles (2026-11-15 JST); no files changed.
python tools/check_articles.py
  exit 0; all acceptance assertions passed.
```

Portable equivalent: `python3 tools/check_articles.py`. The runner creates a
temporary copy of articles/, tools/, sitemap.xml; temporarily installs
`tools/fixtures/ledger.json` into that copy's ledger, and copies the positive
body to its bodies/ folder. It executes these real CLI commands there:

```text
python3 tools/build_articles.py
  exit 0; fixture article and index generated; one article URL added.
python3 tools/build_articles.py
  exit 0; second build byte-identical; no duplicate sitemap URL.
python3 tools/lint_article.py ai-karte-fixture
  exit 0; PASS.
# Replace the temporary body with ai-karte-fixture-ng.html.
python3 tools/lint_article.py ai-karte-fixture
  exit 1; banned expression: 業界最安.
# Restore the positive fixture body.
python3 tools/publish_next.py --dry-run
python3 tools/publish_next.py
  both exit 0; zero queued entries; all file bytes unchanged.
```

Additional assertions cover JSON-LD parseability, exact CTA attribution URL,
all existing sitemap entries retained, same-category related links before other
categories, unpublished entries excluded, future queued entries excluded, dry-run
not writing, exactly one oldest eligible entry published, current prices accepted,
incorrect initial/maintenance prices rejected, source_refs required, and cluster/H2
warnings. Temporary copies are deleted automatically; the real ledger stays `[]`.
The runner also verifies title/description/intro/body-length failures, the JST
date rollover at UTC 15:30, and rejection of a banned-expression queued article
without changing any file.

Protected-file review: `git diff -- .github/workflows/deploy.yml forms/` is empty.
`git diff -- index.html` contains only the article footer link row. No other
existing page, LP stylesheet or measurement asset is changed.
