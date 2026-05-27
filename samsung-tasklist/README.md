# Samsung ライブ配信 制作タスクリスト（共有同期版）

制作パートナー（久野さん・GIFTVOX等）と共有する、チェック状態・回答・備考がリアルタイム同期されるタスクリスト。

## 構成

| ファイル | 役割 |
|---|---|
| `index.html` | タスクリスト本体。チェック→取り消し線＋グレーアウト。回答欄・備考欄あり |
| `gate.js` | パスワードゲート（SHA-256・「記憶する」チェックでlocalStorage/sessionStorage切替） |
| `sync.gs` | GAS Web App。チェック/回答/備考をスプレッドシートに保存し全員に共有 |

## パスワード

- パスワード：`Sam-0lIc10O7`
- ハッシュは `gate.js` に埋め込み済み（平文はコードに無い）
- 🔴 URLとパスワードは**別経路で送付**すること（同じメール/Slackに両方書かない）

## 共有同期のセットアップ（GAS）

「誰がアクセスしてもチェック状態が共有・記憶される」ために、Googleスプレッドシートをバックエンドにする。

1. 共有用のGoogleスプレッドシートを1つ用意（共有設定はIssyさん側で実施）
2. そのスプレッドシートで「拡張機能 > Apps Script」を開く
3. `sync.gs` の内容を貼り付けて保存
4. 「デプロイ > 新しいデプロイ > 種類：ウェブアプリ」
   - 実行ユーザー：**自分**
   - アクセスできるユーザー：**全員**
5. 発行された **ウェブアプリURL** をコピー
6. `index.html` 内の `var GAS_URL = 'PASTE_YOUR_GAS_WEB_APP_URL_HERE';` を、コピーしたURLに差し替える
7. commit & push でデプロイ反映

> GAS_URL を設定するまでは「同期サーバー未設定（ローカル表示のみ）」と表示され、チェックは保存されません。

## 動作

- チェックON → 取り消し線＋グレーアウト、即スプレッドシートへ保存
- 回答欄・備考欄 → 入力（0.7秒デバウンス）＋フォーカス外しで保存
- 20秒ごとに最新状態をポーリング、タブ復帰時にも再取得 → 全員の編集が反映される
- 「あなたの表示名」を入れると、誰が更新したかがスプレッドシートに記録される（任意）

## デプロイ先

- リポジトリ：`riderkarubo/firework-decks`
- 公開URL（予定）：`https://riderkarubo.github.io/firework-decks/samsung-tasklist/`

## gate.js 更新時の注意

このリポの `gate.js` 仕様を変えたら、`coopkobe-wine-teaser/gate.js`・`workflow-guide/gate.js`・`workflow-guide/kit/template/gate.js` との整合も確認すること（CLAUDE.md参照）。
