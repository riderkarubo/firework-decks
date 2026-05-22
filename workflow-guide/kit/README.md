# Firework 企画案HTML キット

このキットに含まれるもの：

| ファイル | 役割 |
|---|---|
| `prompts/00_AIセットアップ指示書.md` | まずこれをCoworkに貼る。AIが1問ずつ質問して企画案を作ってくれる |
| `template/index.html` | 企画案HTMLのベーステンプレート |
| `template/gate.js` | パスワードゲート（コピーして使う） |
| `prompts/01_企画案生成.md` | Coworkに渡すプロンプト（素材を書いて渡す） |
| `prompts/02_HTML化.md` | 企画案をHTMLに変換するプロンプト |
| `prompts/03_編集指示例.md` | カード追加・削除・並び替えの指示例集 |
| `prompts/04_Slackメッセージ.md` | クライアントへの送付Slackの作成プロンプト |

## 使い方の流れ

1. `prompts/00_AIセットアップ指示書.md` をCoworkに貼る → AIが質問してくれるので答えるだけでOK
2. AIが企画案を出したら `prompts/02_HTML化.md` を使ってHTML化を依頼する
3. `template/gate.js` のパスワード設定をして `template/index.html` と一緒にデプロイ
4. URLとパスワードをクライアントに別経路で送る

詳細手順：https://riderkarubo.github.io/firework-decks/workflow-guide/
