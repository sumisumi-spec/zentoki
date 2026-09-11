# ZENTOKI Plus — 課金の設計と有効化手順

## 方針

- **名称**: ZENTOKI Plus。**買い切り 1,500円**（税込）。サブスクなし、自動更新なし。
- **無料のまま**: 断食タイマー全機能、瞑想（ガイドなし / 5-5 / 4-7-8）、サウンド 雨音・小川、記録・体重・カレンダー・バックアップ。
  → 「記録が人質にならない」ことがブランドの信頼につながる。
- **Plus で解放**: サウンド 6 種（波音・森・焚き火・ドローン・バイノーラル・メロディ）、呼吸法（ボックス / 4-8 / 5-10 / 6-12 / 7-14）、今後のガイド音声・ヘルスケア同期・週の振り返り。
- **販売経路**
  - Web 版（GitHub Pages）: **Airペイ オンライン決済の決済リンク** で支払い → 支払完了メールを転送してもらう → 手動でライセンスキーを発行してメールで返信 → キー（またはリンク）でアプリが有効化。
    （Stripe を使う場合は Payment Link → `thanks.html` で自動発行。どちらも同じ Worker を使う）
  - iOS 版: App 内課金（非消耗型 `app.zentoki.plus`）。RevenueCat 経由で購入・復元。
- **既定はオフ**: `index.html` の `PLUS.web.paymentLink` / `PLUS.ios.rcApiKey` が空の間は、ロックも購入画面も出ません。

## アプリ内の実装（済み）

| 要素 | 場所 | 内容 |
|---|---|---|
| 設定 | `index.html` の `const PLUS = {...}` | 価格、決済リンク、検証サーバー、RevenueCat キー、有料機能の一覧 |
| 状態 | localStorage `ft.plus` | `{active, source: 'web-license' \| 'ios-iap', since, grant}` |
| 出し分け | `lockedSound()` / `lockedBreath()` | 有料の音は錠アイコン、有料の呼吸法は錠マーク。タップで購入画面 |
| 購入画面 | `#plusDialog` | 特典 3 点、価格、購入 / 復元 / ライセンスキー、特商法とポリシーへのリンク |
| 設定の行 | 設定 → ZENTOKI Plus | 有効 / 未購入 の表示と購入画面への導線 |
| Web 有効化 | `verifyKey()` | 検証サーバーの `/verify` に問い合わせ、成功時に `ft.plus` を保存 |
| 購入完了 | `thanks.html` | Stripe から戻ってきた `session_id` で `/claim` を呼び、キーを表示。「ZENTOKIを開く」で自動有効化 |
| iOS 課金 | `rc` オブジェクト | RevenueCat の configure / getOfferings / purchasePackage / restorePurchases / getCustomerInfo。エンタイトルメント `plus` |
| デバッグ | localStorage `ft.plusDebug = true` | 決済リンク未設定でもロック表示を確認できる |

## Web 版を有効にする手順（Airペイ オンライン決済）

Airペイのオンライン決済は「決済リンクを作って送るだけ」の仕組みで、決済後の自動リダイレクトや Webhook・API はありません（購入者はリクルート ID でログインして支払い、完了すると **加盟店と購入者の両方に支払完了メール** が届きます）。
そのため Web 版は「支払い → 支払完了メールを転送 → キーを返信」の半自動運用にしてあります。1 件あたりの手作業は 1 分ほどです。

1. **Airペイ 管理画面**（https://merchant.online.airpayment.jp/plan/list）
   1. 「都度決済」のプランを作成: 商品名 `ZENTOKI Plus（買い切り）`、金額 1,500 円。
   2. 決済リンク（`https://` で始まる URL）をコピー。
2. **Cloudflare Worker**（無料枠で十分。キーの検証と発行に使う）
   ```sh
   cd worker
   npx wrangler login
   npx wrangler kv namespace create KEYS      # 表示された id を wrangler.toml に貼る
   npx wrangler secret put LICENSE_SECRET     # 例: openssl rand -hex 32 の出力
   npx wrangler secret put ADMIN_TOKEN        # 例: openssl rand -hex 32 の出力（キー発行用。誰にも渡さない）
   npx wrangler deploy                        # https://zentoki-license.<account>.workers.dev
   ```
3. **アプリに設定**（`index.html` の `const PLUS`）
   - `web.paymentLink`: Airペイの決済リンク
   - `web.verifyUrl`: Worker の URL
   - `web.manualKey`: `true`（そのまま）
   - `web.supportEmail`: キー申請を受け取るメールアドレス（購入画面に表示され、タップでメールが立ち上がる）
   - `tokushoho.html`: 【 】の箇所（事業者名・責任者・所在地・連絡先）を記入。**これは法律上の必須表示**。
4. **日々の運用**（支払完了メールが届いたら）
   ```sh
   export ZENTOKI_WORKER=https://zentoki-license.<account>.workers.dev
   export ZENTOKI_ADMIN_TOKEN=（ADMIN_TOKEN）
   node worker/issue-key.mjs "購入者名 2026-09-11 Airペイ"   # キーと返信メール文が表示される
   node worker/issue-key.mjs --list                          # 発行済み一覧
   node worker/issue-key.mjs --revoke ZK-XXXX-XXXX-XXXX-XXXX # 返金時など
   ```
   表示された返信文をそのまま購入者に送る。購入者はリンクを開くだけで有効化される（`?plus_key=` を `index.html` が読む）。
5. main に push すると公開。先に `ft.plusDebug` で購入画面の表示を確認しておく。

### 別案: Stripe で全自動にする場合

1. **Stripe**（https://dashboard.stripe.com）
   1. 商品を作成: 名前 `ZENTOKI Plus`、価格 1,500 円、一回払い。
   2. Payment Link を作成。「支払い後」の設定で **「ウェブサイトにリダイレクト」** を選び、URL に
      `https://sumisumi-spec.github.io/zentoki/thanks.html?session_id={CHECKOUT_SESSION_ID}` を入力。
   3. Developers → API keys の **Secret key** を控える。
2. **Cloudflare Worker**（無料枠で十分）
   ```sh
   cd worker
   npx wrangler login
   npx wrangler kv namespace create KEYS      # 表示された id を wrangler.toml に貼る
   npx wrangler secret put STRIPE_SECRET_KEY  # sk_live_...
   npx wrangler secret put LICENSE_SECRET     # 例: openssl rand -hex 32 の出力
   npx wrangler deploy                        # https://zentoki-license.<account>.workers.dev
   ```
3. **アプリに設定**
   - `index.html`: `PLUS.web.paymentLink` に Payment Link の URL、`PLUS.web.verifyUrl` に Worker の URL。
   - `thanks.html`: `VERIFY_URL` に同じ Worker の URL。
   - `tokushoho.html`: 【 】の箇所（事業者名・責任者・所在地・連絡先）を記入。**これは法律上の必須表示**。
4. main に push すると公開。テストは Stripe のテストモード（`sk_test_` と テスト用 Payment Link）で先に行う。

キーの再発行: 同じ `session_id` なら同じキーを返す。キーの無効化は KV の `key:ZK-...` の `revoked` を `true` に。

## iOS 版を有効にする手順

1. **App Store Connect** → ZENTOKI → App 内課金 → 「+」
   - 種類: **非消耗型** / 参照名 `ZENTOKI Plus` / 製品 ID `app.zentoki.plus` / 価格 1,500 円（Tier）
   - ローカライズ（日本語・英語）の表示名と説明、審査用スクリーンショット（購入画面）を登録。
   - 「有料 App 契約」に同意し、税務・銀行情報を登録（Agreements, Tax, and Banking）。
2. **RevenueCat**（https://app.revenuecat.com、月 2,500 ドルの売上まで無料）
   - プロジェクト作成 → App Store アプリを追加（App-Specific Shared Secret を App Store Connect から取得して登録）
   - Products に `app.zentoki.plus` を追加 → Entitlement `plus` に紐付け → Offering `default` に Lifetime パッケージとして登録
   - **Public SDK key（iOS）** を控える。
3. `index.html` の `PLUS.ios.rcApiKey` に SDK key を設定 → `ios-v*` タグを push か Actions からビルド → TestFlight で Sandbox 購入をテスト。
4. 審査で見られる点: 購入画面に価格と「買い切り」の明示、「購入を復元」ボタン、利用規約とプライバシーへのリンク（実装済み）。

## 収益の目安

- Web（Airペイ オンライン決済）: 手数料 3.24%、振込手数料 0 円、入金は月 1 回 → 1,500 円あたり約 1,451 円。
- Web（Stripe）: 手数料 3.6% → 1,500 円あたり約 1,446 円。
- iOS: App Store 手数料 15%（小規模事業者プログラム申請後） → 約 1,275 円。
- 100 人が購入で 約 13〜14 万円。運用コストは Worker 0 円、Pages 0 円。

## 将来の拡張

- 年額プランを足す場合: Stripe に定期課金の価格を追加し、Worker の `/verify` で期限を返す。iOS は自動更新サブスクを RevenueCat に追加。
- 端末をまたぐ同期（アカウント）を足す場合: 同じ Worker にメールのワンタイムリンク認証を追加し、`ft.plus` と記録を紐付ける。
