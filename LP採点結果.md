### カルステップ LP 採点結果（index.html中心）

**総合評価：91 / 100**

最初の印象と訴求軸が明快で、信頼要素（導入実績・医師の声・動画・特商法/プライポリ）も揃っており、CV導線も二段（ファーストビュー＋追従CTA）で良好です。SEOと構造化データも基礎ができています。一方で、パフォーマンス（LCP/CLS）・アクセシビリティ（FAQやアイコンのARIA）・計測の粒度は伸びしろがあります。

---

### 配点内訳（コメント付き）

| 項目 | 満点 | 得点 | コメント |
|---|---:|---:|---|
| コンテンツ/コピー | 15 | 13 | ベネフィット訴求が端的。「踏むだけ」×「向き合える」が強い。数値根拠の明示を一部追加できると尚良。 |
| 情報設計/ストーリー | 10 | 9 | 問題提起→解決→How it works→実績→USP→価格→FAQ→クロージングの流れが自然。セクション内ジャンプ導線を補う余地。 |
| ビジュアル/ブランド | 10 | 8 | 一貫した配色/タイポ/カードUI。本文最大幅600pxは可読性高いが、デスクトップでの“情報の密度”最適化の余地あり。 |
| CTA/コンバージョン | 15 | 13 | ファーストビューCTA＋追従CTAで回遊損失を抑制。決済前不安（支払い手段、返品/返金）をCTA近傍に補足提示するとCVR向上が期待。 |
| 社会的証明/信頼 | 10 | 9 | 医師の声・ロゴ・動画が効いている。導入数/更新日/写真クレジットなど“メタ情報”の明示でさらに信頼性向上。 |
| SEO基礎 | 15 | 13 | title/description/OG/Twitter/canonical/JSON-LDあり。画像最適化（WebP/AVIF）・サイトマップ/robots整備で底上げ余地。 |
| パフォーマンス | 10 | 6 | GSAP/Font Awesome/Google Fontsの合算コストと画像寸法未指定がLCP/CLSリスク。主要画像の寸法/優先度指定とフォント最適化推奨。 |
| アクセシビリティ | 10 | 7 | altや見出し階層は良好。FAQのaria対応、アイコンaria-hidden、reduced-motion対応で改善。 |
| 計測・運用 | 5 | 4 | GTM導入済。CTA/動画/FAQなどイベント計測を拡充したい。 |
| 法令/表記 | 10 | 9 | プライポリ/特商法/問い合わせあり。Cookie同意（用途に応じて）と返品/返金の明示表示で万全に。 |
| 合計 | 100 | 91 |  |

---

### 強み（ハイライト）
- ベネフィット一発理解のコピーとビジュアライズ（Before/After、3 Step）
- 社会的証明が多層（ロゴ/声/動画）で信頼醸成に寄与
- 構造化データ（Product/Offer）が整備済み
- 追従CTAにより回遊中のコンバージョンを取りこぼしにくい
- FAQと推奨環境ページへの導線で不明点を解消

---

### 改善提案（優先度順）

【P0：今すぐ取り組むと効果大】
1) 主要画像の寸法と優先度を明示（CLS/LCP対策）
```html
<!-- ヒーロー画像（index.html） -->
<img src="img/karustep-hero-img.jpg"
     alt="医師と患者が穏やかに向き合っている診察の様子"
     width="1200" height="800"
     fetchpriority="high"
     loading="eager">
```
2) ヒーロー画像/ロゴのpreload（実測LCPに応じて適用）
```html
<link rel="preload" as="image" href="img/karustep-hero-img.jpg" imagesrcset="img/karustep-hero-img.jpg" imagesizes="100vw">
```
3) 主要CTAのクリック計測（GTM前提で識別子を付与）
```html
<a class="cta-button primary large with-subtext"
   data-gtm="cta_buy_hero" ...>今すぐ、理想の診察をはじめる</a>
```
（GTMで「クリック要素の属性 data-gtm = cta_buy_hero」をトリガ）

4) FAQのARIA対応（キーボード操作とスクリーンリーダー最適化）
```html
<!-- buttonに状態を付与してJSでトグル -->
<button class="faq-question"
        aria-expanded="false"
        aria-controls="faq-a-1"
        id="faq-q-1">…</button>
<div class="faq-answer" id="faq-a-1" role="region" aria-labelledby="faq-q-1">…</div>
```

5) アイコンを装飾扱いに（スクリーンリーダーでの冗長読み上げ抑止）
```html
<i class="fas fa-check-circle" aria-hidden="true"></i>
```

6) 外部スクリプトにdefer付与（描画ブロック回避、現状はフッター読込でも保険として）
```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" defer></script>
```

7) 画像の軽量化（優先度：ヒーロー、O GP、セクションキービジュアル）
- WebP/AVIFの導入、適正リサイズ、適正圧縮（75–85%目安）
- `<source type="image/webp">` の提供または`<img srcset>`活用

8) 動きの軽減設定を尊重
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

【P1：今週中に整備】
1) JSON-LDの拡張（任意項目）
   - Productに `url`, `sku`、レビューが用意できる場合は `aggregateRating`/`review`
2) CTA近傍に「お支払い方法/返品・返金」概要を明示（安心材料の即時表示）
3) `sitemap.xml` と `robots.txt` の配置（Search Consoleにプロパティ送信）
4) メタの拡充：`<meta name="theme-color">`、`apple-touch-icon`、`mask-icon`、manifest
5) YouTubeのプライバシー強化モードへ変更（`youtube-nocookie.com`）
6) セクション内アンカー導線（例：ヘッダーメニューで「料金」「FAQ」へスムーズ遷移）
7) ScrollTriggerの適用範囲最適化（初回描画要素のアニメ縮小）

【P2：次回改善サイクルで】
1) クリニックロゴカルーセルに `aria-live="off"` 等の配慮を追加  
2) 継続的LCP計測と最適化（トップ画像のサイズ/圧縮/優先度を実測で調整）  
3) A/Bテスト準備（ヒーローコピー/CTAラベル/価格の見せ方）  
4) 将来の多言語対応に向け `hreflang` 設計  
5) E-E-A-Tの補強（代表者名・実績数値・更新日・監修表記の整備）  

---

### 計測設計（GTMイベント例）
- click_cta_buy_hero（ヒーローの購入CTA）
- click_cta_buy_sticky（追従フッター購入CTA）
- click_cta_trial（無料トライアル）
- click_cta_contact（お問い合わせ）
- video_play_demo / video_play_interview（YouTube埋め込み再生）
- faq_open（FAQ開閉）
- scroll_depth_25_50_75（滞在意図計測）

イベントパラメータ（例）：`{ page: 'index', position: 'hero' | 'sticky', label: 'buy' | 'trial' }`

---

### SEO/技術チェックリスト（要点）
- title/description/OG/Twitter/canonical：OK
- JSON-LD（Product/Offer）：OK（`url`/`sku`/`aggregateRating`拡張余地）
- H1は1つ・見出し階層：OK
- 画像alt：OK（主要画像はさらにリッチなaltで文脈補強も可）
- 画像最適化（WebP/AVIF・寸法指定・遅延読込）：要対応
- sitemap.xml / robots.txt：要作成・送信
- フォント/スクリプトの最適化（preload/defer/自己ホスト検討）：要検討

---

### LCP/CLS 予測と対策（要点）
- 想定LCP：ヒーロー画像（`img/karustep-hero-img.jpg`）  
  対策：preload/fetchpriority、適正サイズ・次世代フォーマット、CDNキャッシュ
- 想定CLS：画像寸法未指定とYouTube iframeの読み込み  
  対策：すべての主要画像に `width`/`height`、iframeはアスペクト比コンテナで確保済（OK）

---

### 総評
現状のLPは「価値が伝わる」「信頼が積み上がる」「行動を促す」の三点が高い水準で実装されています。次の一歩は、パフォーマンス（LCP/CLS）とアクセシビリティ/計測の強化です。P0改善だけでも初回表示の体感品質とCVR/分析精度の両面で効果が見込めます。

---

### 次アクション（推奨順）
1) 主要画像の寸法・優先度指定＋ヒーロー画像preload（P0）  
2) 主要CTA/動画/FAQのイベント計測をGTMに実装（P0）  
3) 画像のWebP化と圧縮・サイズ最適化（P0→P1）  
4) FAQ ARIA・アイコンaria-hidden・reduced-motion対応（P0）  
5) サイトマップ/robots、YouTube nocookie、メタ拡充（P1）  


