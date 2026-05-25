# ディズニー待ち時間メモ

スマホで見やすい、シンプルなカード型UIのWebアプリです。GitHub Pages で動作する静的構成（HTML/CSS/JavaScript）で、Queue-Times.com の API から東京ディズニーランド / 東京ディズニーシーの待ち時間を表示します。

> ⚠️ このアプリは **東京ディズニーリゾート公式アプリではありません**。

## 外部APIについて

- 本アプリは外部APIとして **Queue-Times.com Real Time API** を利用します。
- APIキーや認証情報は使用していません。
- 公式サイト・公式アプリのスクレイピングは行いません。
- 画面内に **Powered by Queue-Times.com** の表示を必須で入れています。
- Queue-Times API は英語名を返すため、Worker 側で主要アトラクション名を日本語へ変換して返却します。
- 変換表に未対応の名称は英語のまま表示される場合があります。
- 閉園後や運営時間外、または待ち時間案内が少ない時間帯は「案内なし」「休止中」が多く表示される場合があります。

## GitHub Pages + CORS 対応方針

GitHub Pages 上のフロントエンドから Queue-Times API を直接 `fetch` すると、ブラウザ環境によっては CORS / NetworkError（`TypeError: Failed to fetch`）で失敗することがあります。

そのため、以下の構成を採用します。

GitHub Pages フロントエンド → Cloudflare Workers 中継API → Queue-Times API

## Cloudflare Worker 実装

`worker.js` を追加しています。

- `GET /?park=land` → `parks/274/queue_times.json`
- `GET /?park=sea` → `parks/275/queue_times.json`
- `GET /?park=all` → 274 と 275 を両方取得し、1レスポンスに統合
- `OPTIONS` リクエスト対応（CORS preflight）
- `Access-Control-Allow-Origin: *` を返却
- `lands[].rides[]` を展開し、以下を返却
  - park（ランド/シー）
  - area（エリア名）
  - name（アトラクション名）
  - wait_time（待ち時間）
  - is_open / status（稼働状態）
  - last_updated（最終更新時刻）

## Cloudflare Workers デプロイ手順

1. Cloudflare ダッシュボードで Workers を作成
2. Worker のコードを `worker.js` の内容に置き換える
3. Deploy して `https://<worker-name>.<subdomain>.workers.dev` を取得
4. ブラウザで疎通確認
   - `https://<worker-url>/?park=land`
   - `https://<worker-url>/?park=sea`
   - `https://<worker-url>/?park=all`

## GitHub Pages 側の設定

`app.js` 先頭の `API_BASE_URL` を Cloudflare Workers のURLに設定します。

```js
const API_BASE_URL = "https://dark-pine-957e.oqosfyqziob.workers.dev";
```

- 本リポジトリでは `API_BASE_URL` に `https://dark-pine-957e.oqosfyqziob.workers.dev` を設定済みです。
- フロントエンドは Queue-Times API を直接 `fetch` せず、必ず Cloudflare Worker (`?park=land/sea/all`) 経由で取得します。
- Worker からの取得成功時は UI に「リアルタイム」と表示します。
- 最終更新時刻は Worker の `fetchedAt`（または `generated_at`）と、ride ごとの `last_updated` を利用します。
- 閉園後や休止中は `wait_time` が `null`（または `0`）になり、待ち時間が「案内なし」相当の状態になる場合があります（UIでは運営時間外・休止中として表示）。
- Worker 側で一部主要アトラクション名を英語から日本語へ変換し、`nameJa` を返しています。未対応のアトラクションは英語表示になる場合があります。
- 取得失敗時のみサンプル表示にフォールバックします。

## できること

- ランド / シー / すべて の切り替え
- おすすめ順 / 待ち時間順 の切り替え
- アトラクション名・待ち時間・ステータスの表示

- 「次の一手」カードで、現在の待ち時間とメタ情報をもとにした候補と理由バッジ（2〜3個）を表示
- モード切替（通常 / 子連れ / 効率重視 / 休憩向き / ショー・パレード優先）
- モードごとにおすすめ順（総合スコア）と「次の一手」の判定基準を変更
- アトラクションカードに「屋内」「休憩向き」「ショー前後向き」「子連れ向け」などの属性バッジを表示
- 最終更新時刻の表示
- API取得失敗時のフォールバック表示


## UI改善（2026-05）

- ヘッダーを白基調のカード化し、英字ラベル・メインタイトル・短いサブコピーの階層を整理しました。
- 「現在の表示 / 件数 / 最終更新 / リアルタイム状態」をステータスカードとして再構成し、スマホで視認しやすくしました。
- パーク切り替え・並び順をセグメントコントロール風のUIに調整し、選択中状態をより明確にしました。
- 「今おすすめ」カードとアトラクションカードの余白・角丸・バッジ表示を統一し、落ち着いた旅行アプリ風の見た目に改善しました。
- デバッグ表示は折りたたみを維持しつつ、通常利用時の視覚ノイズを抑えています。
- `worker.js` は未変更で、リアルタイム取得・日本語名表示・エリア表示・注意文言（非公式 / Powered by Queue-Times.com）は維持しています。


- 白ベース×低彩度ブルーを軸に、淡いシャンパンゴールドと星空ネイビーのニュアンスを最小限で加え、
  「シンプル・上品・ほんのり魔法感」のトーンに更新しました。

## 起動方法

1. このリポジトリを開く
2. `index.html` をブラウザで開く

または簡易サーバーを使う場合（任意）:

```bash
python3 -m http.server 8000
```

その後、ブラウザで `http://localhost:8000` にアクセスします。

## ファイル構成

- `index.html`: 画面レイアウト
- `style.css`: UIスタイル
- `app.js`: フロントエンド取得・フォールバック・描画ロジック
- `worker.js`: Cloudflare Workers 中継API


## 動作確認方法（GitHub Pages）

1. GitHub Pages を開き、ステータス表示が「サンプル」ではなく「リアルタイム」になることを確認する。
2. パークを「ランド / シー / すべて」に切り替え、表示件数と一覧内容が切り替わることを確認する（`?park=land` / `?park=sea` / `?park=all`）。
3. 件数が Queue-Times API 由来の件数になっていることを確認する（例: Worker の `normalizedRidesCount` / `count` と整合）。
4. Worker URL を一時的に無効値に変更した場合のみ、サンプル表示へフォールバックすることを確認する。
5. 画面下部の「Powered by Queue-Times.com」と「東京ディズニーリゾート公式アプリではありません」の表示が維持されていることを確認する。


## UIデザイン刷新（2026-05 / Night Guide）

- コンセプトを「夜のパーク前に見る、上品で少し魔法感のある待ち時間ガイド」に再定義し、背景を夜空ブルー〜白グラデーションへ変更しました。
- ヘッダー、フィルター、ステータス、おすすめ、一覧カードを全面的に再デザインし、星・きらめき・チケット風ディテールを加えつつ、情報の読みやすさは維持しています。
- 機能面（リアルタイム取得、ランド/シー/すべて、おすすめ順/待ち時間順、日本語名表示、エリア表示、Powered by Queue-Times.com、非公式注意書き）はそのまま維持し、`worker.js` は変更していません。
