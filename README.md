# ディズニー待ち時間メモ

スマホで見やすい、シンプルなカード型UIのWebアプリです。GitHub Pages で動作する静的構成（HTML/CSS/JavaScript）で、Queue-Times.com の API から東京ディズニーランド / 東京ディズニーシーの待ち時間を取得して表示します。

> ⚠️ このアプリは **東京ディズニーリゾート公式アプリではありません**。

## 外部APIについて

- 本アプリは外部APIとして **Queue-Times.com Real Time API** を利用します。
- 画面内に **Powered by Queue-Times.com** の表示を必須で入れています。
- 使用エンドポイント:
  - `https://queue-times.com/parks/274/queue_times.json`（東京ディズニーランド）
  - `https://queue-times.com/parks/275/queue_times.json`（東京ディズニーシー）
- APIキーや認証情報は使用していません。
- 公式サイト・公式アプリのスクレイピングは行いません。

## フォールバック仕様

- API取得に失敗した場合は、既存のサンプルデータ表示へ自動フォールバックします。
- その際、UI上に「現在はサンプル表示です」と分かる案内を表示します。
- 待ち時間が取得できない項目は「案内なし」と表示します。

## CORSと次善策

- まずはブラウザから Queue-Times API を直接取得する方式です（GitHub Pages対応を優先）。
- もしブラウザ環境で CORS 制約により取得できない場合は、serverless proxy（例: Vercel Functions, Cloudflare Workers）経由に切り替えるのが次善策です。

## できること

- ランド / シー / すべて の切り替えに応じたデータ取得
- おすすめ順 / 待ち時間順 の切り替え
- アトラクション名・待ち時間・ステータスの表示
- 最終更新時刻の表示
- API取得失敗時のやさしいエラーメッセージ表示

## 起動方法

1. このリポジトリを開く
2. `index.html` をブラウザで開く

または簡易サーバーを使う場合（任意）:

```bash
python3 -m http.server 8000
```

その後、ブラウザで `http://localhost:8000` にアクセスします。

## ファイル構成

- `index.html`: 画面レイアウト（フィルター、最終更新、注意文、Powered by 表示）
- `style.css`: 白ベースのカードUIと状態表示のスタイル
- `app.js`: API取得、フォールバック、並び替え、描画ロジック
