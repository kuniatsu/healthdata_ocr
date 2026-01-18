# 健康診断 OCR API

Google Gemini 1.5 Flash を使用して、健康診断書の画像から検査データを自動抽出するシステムです。

## プロジェクト構成

```
healthdata_ocr/
├── backend/          # Next.js API サーバー
├── frontend/         # React + Vite フロントエンド
└── README.md
```

## バックエンド (Next.js)

### 技術スタック
- Next.js 14+ (App Router)
- TypeScript
- Google Generative AI SDK
- Node.js

### セットアップ

1. **環境変数の設定**
   ```bash
   cd backend
   cp .env.example .env.local
   # .env.local に GEMINI_API_KEY を設定してください
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```
   サーバーは `http://localhost:3000` で起動します。

### API エンドポイント

**POST /api/analyze**

健康診断書の画像から検査データを抽出します。

**リクエスト:**
- Content-Type: `multipart/form-data`
- Body: `image` フィールドに画像ファイル

**レスポンス:**
```json
{
  "date": "2024-01-15",
  "items": [
    {
      "name": "LDLコレステロール",
      "value": "120",
      "unit": "mg/dL"
    },
    {
      "name": "HDLコレステロール",
      "value": "45",
      "unit": "mg/dL"
    }
  ]
}
```

### 本番ビルド

```bash
npm run build
npm start
```

## フロントエンド (Vite + React)

### 技術スタック
- React 19
- TypeScript
- Vite
- Tailwind CSS v4

### セットアップ

1. **環境変数の設定**
   ```bash
   cd frontend
   cp .env.example .env
   # 必要に応じて API URL を編集
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```
   アプリケーションは `http://localhost:5173` で起動します。

### 機能

- **ファイルアップロード**: ドラッグ&ドロップまたはクリック選択対応
- **リアルタイム解析**: 画像をアップロードして解析ボタンをクリック
- **結果表示**: 測定日と検査項目を見やすいテーブルで表示
- **ローディング表示**: 解析中はスピナーを表示
- **エラーハンドリング**: エラーメッセージを画面に表示

### 本番ビルド

```bash
npm run build
```

ビルド後のファイルは `dist/` ディレクトリに出力されます。

## ローカル開発

両方のサーバーを同時に起動して開発できます。

**ターミナル 1: バックエンド**
```bash
cd backend
npm install
npm run dev
```

**ターミナル 2: フロントエンド**
```bash
cd frontend
npm install
npm run dev
```

その後、ブラウザで `http://localhost:5173` にアクセスしてください。

## 環境変数

### バックエンド (.env.local)
```
GEMINI_API_KEY=your_api_key_here
```

### フロントエンド (.env)
```
VITE_API_URL=http://localhost:3000/api
```

**本番環境** (.env.production)
```
VITE_API_URL=https://your-vercel-url.vercel.app/api
```

## デプロイ

### バックエンド (Vercel)

1. Vercel に接続
2. プロジェクトをインポート
3. 環境変数を設定 (GEMINI_API_KEY)
4. デプロイ

### フロントエンド (GitHub Pages または Vercel)

**GitHub Pages:**
```bash
npm run build
# dist/ フォルダを GitHub Pages にデプロイ
```

**Vercel:**
```bash
# vercel コマンドでデプロイ
vercel
```

## API キーの取得

Google Gemini API キーを取得するには：
1. https://aistudio.google.com/app/apikey にアクセス
2. 「Get API key」をクリック
3. 新しいプロジェクトを作成または既存プロジェクトを選択
4. 「Create API key」をクリック
5. 生成されたキーをコピーして .env.local に貼り付け

## 使用技術

- **API**: Google Generative AI (Gemini 1.5 Flash)
- **フロントエンド**: React 19 + TypeScript + Tailwind CSS v4
- **バックエンド**: Next.js 14 + TypeScript
- **ビルドツール**: Vite
- **デプロイ**: Vercel

## ライセンス

MIT License