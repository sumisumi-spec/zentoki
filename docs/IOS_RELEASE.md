# ZENTOKI iOS リリース手順（Macなしで TestFlight まで）

このリポジトリには Capacitor による iOS プロジェクト（`ios/`）と、GitHub Actions の macOS ランナーでビルドして TestFlight に送るワークフロー（`.github/workflows/ios.yml`）が入っています。手元に Mac がなくても、以下の準備だけで実機テストまで進められます。

## 1. Apple 側の準備（1回だけ）

1. **Apple Developer Program に登録**（年 14,800 円）
   https://developer.apple.com/programs/ → 個人か法人を選んで登録。本人確認に数日かかることがあります。
2. **Team ID を控える**
   https://developer.apple.com/account → Membership details → Team ID（10桁の英数字）。
3. **App ID（バンドル ID）を登録**
   https://developer.apple.com/account/resources/identifiers/list → 「+」→ App IDs → App
   Bundle ID: `app.zentoki`（Explicit）。Capabilities は今は何も付けなくて大丈夫です（Push Notifications 不要。ローカル通知だけ使います）。
4. **App Store Connect にアプリを作成**
   https://appstoreconnect.apple.com → My Apps → 「+」→ New App
   - Platform: iOS / Name: `ZENTOKI` / Primary Language: Japanese / Bundle ID: `app.zentoki` / SKU: `zentoki`
5. **App Store Connect API キーを作成**
   App Store Connect → Users and Access → Integrations → App Store Connect API → Team Keys → 「+」
   - Name: `github-actions` / Access: **App Manager**
   - 作成後に **Issuer ID**、**Key ID** を控え、`.p8` ファイルをダウンロード（ダウンロードは1回しかできません）。

## 2. GitHub に秘密情報を登録

リポジトリ → Settings → Secrets and variables → Actions → New repository secret

| Secret 名 | 値 |
|---|---|
| `APPLE_TEAM_ID` | 手順 1-2 の Team ID |
| `ASC_ISSUER_ID` | 手順 1-5 の Issuer ID |
| `ASC_KEY_ID` | 手順 1-5 の Key ID |
| `ASC_KEY_P8_BASE64` | `.p8` ファイルを base64 にした文字列（Mac/Linux: `base64 -i AuthKey_XXXX.p8`。Windows: `certutil -encode` の出力から先頭と末尾の行を除く） |

## 3. ビルドして TestFlight へ

- GitHub → Actions → **iOS build & TestFlight** → Run workflow（`upload` は `true` のまま）
- 10〜15 分で完了。証明書とプロビジョニングは Xcode の自動署名（クラウド署名）が API キーで自動作成します。
- 完了後、App Store Connect → TestFlight にビルドが現れます（「輸出コンプライアンス」は Info.plist で「暗号化なし」を宣言済みなので質問は出ません）。
- iPhone に **TestFlight** アプリを入れ、自分を内部テスターに追加すると、その場でインストールできます。

`ios-v1.3.0` のようなタグを push しても同じワークフローが走ります。ビルド番号は GitHub の実行番号が自動で入ります。

## 4. 審査提出の前に

- スクリーンショット: 6.9 インチと 6.5 インチの 2 サイズ × 日英。`docs/store/screenshots/` に生成済み。
- 説明文・キーワード・審査メモ・URL 類: `docs/APP_STORE.md` にコピペ用の文面をまとめてあります。
- App Privacy: 「データを収集しない」を選択（アプリはサーバーを持たず、記録は端末内のみ）。
- 年齢制限: 4+。カテゴリ: Health & Fitness（サブ: Lifestyle）。
- 審査メモに書くと通りやすい内容: 「医療的助言ではない旨をアプリ内・ポリシーに明記」「通知はローカル通知のみ」「アカウント不要」「オフライン動作」。

## 5. ローカルで開発する場合（Mac がある人向け）

```sh
npm ci
npm run ios:sync   # web を www/ にコピーして iOS プロジェクトへ同期
npm run ios:open   # Xcode で開く
```

## ネイティブ版で追加される動作

- 目標達成・ステージ到達の通知が、アプリを閉じていても予定時刻に届く（ローカル通知）
- 瞑想中の画面維持（KeepAwake）
- チャイム時の触覚フィードバック（Haptics）
- 起動画面・ステータスバーが黒で統一

Web 版と同じ `index.html` を使っているため、機能追加は一度で両方に反映されます。
