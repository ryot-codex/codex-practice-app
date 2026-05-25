# ディズニー待ち時間メモ

スマホで見やすい、シンプルなカード型UIのWebアプリです。GitHub Pages で動作する静的構成（HTML/CSS/JavaScript）で、Queue-Times.com の API から東京ディズニーランド / 東京ディズニーシーの待ち時間を表示します。

> ⚠️ このアプリは **東京ディズニーリゾート公式アプリではありません**。

## 外部APIについて

- 本アプリは外部APIとして **Queue-Times.com Real Time API** を利用します。
- APIキーや認証情報は使用していません。
- 公式サイト・公式アプリのスクレイピングは行いません。
- 画面内に **Powered by Queue-Times.com** の表示を必須で入れています。

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
const API_BASE_URL = "https://your-worker-name.your-subdomain.workers.dev";
```

- `API_BASE_URL` が空文字（未設定）の場合はサンプルデータ表示へフォールバックします。
- Worker からの取得成功時は UI に「リアルタイム」と表示します。
- 取得失敗時は自動でサンプル表示にフォールバックします。

## できること

- ランド / シー / すべて の切り替え
- おすすめ順 / 待ち時間順 の切り替え
- アトラクション名・待ち時間・ステータスの表示
- 最終更新時刻の表示
- API取得失敗時のフォールバック表示

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
