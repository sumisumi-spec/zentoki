#!/usr/bin/env node
// ZENTOKI Plus: ライセンスキーを手動発行する（Airペイ / 銀行振込などで入金を確認したあとに実行）
//
//   使い方:  ZENTOKI_WORKER=https://zentoki-license.<you>.workers.dev ZENTOKI_ADMIN_TOKEN=xxxx \
//            node worker/issue-key.mjs "山田太郎 2026-09-11 Airペイ"
//            node worker/issue-key.mjs --list            発行済み一覧
//            node worker/issue-key.mjs --revoke ZK-....  キーを無効化
//
// 出力: キー、ワンタップ有効化リンク、購入者へ返信するメール文（日本語 / English）

const WORKER = process.env.ZENTOKI_WORKER || '';
const TOKEN = process.env.ZENTOKI_ADMIN_TOKEN || '';
const APP = process.env.ZENTOKI_APP_URL || 'https://sumisumi-spec.github.io/zentoki/';
if (!WORKER || !TOKEN) { console.error('ZENTOKI_WORKER と ZENTOKI_ADMIN_TOKEN を環境変数で指定してください'); process.exit(1); }

async function call(path, body) {
  const r = await fetch(WORKER.replace(/\/$/, '') + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN }, body: JSON.stringify(body || {}) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) { console.error('失敗:', r.status, j.error || ''); process.exit(1); }
  return j;
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === '--list') {
  const { keys } = await call('/keys');
  for (const k of keys) console.log(`${k.key}  ${new Date(k.created).toISOString().slice(0, 10)}  ${k.revoked ? '無効' : '有効'}  ${k.note || k.email || ''}`);
} else if (cmd === '--revoke') {
  await call('/revoke', { key: rest[0] }); console.log('無効にしました:', rest[0]);
} else {
  const note = [cmd, ...rest].filter(Boolean).join(' ');
  const { key } = await call('/issue', { note });
  const link = APP.replace(/\/$/, '') + '/?plus_key=' + encodeURIComponent(key);
  console.log(`\nキー:  ${key}\nリンク: ${link}\n`);
  console.log(`----- 返信メール（日本語） -----
件名: ZENTOKI Plus ライセンスキーのお届け

ZENTOKI Plus をご購入いただき、ありがとうございます。
ライセンスキーをお送りします。

  ${key}

下のリンクを、ZENTOKI を使っているブラウザ（ホーム画面に追加した場合はそのアプリ）で開くと、そのまま有効になります。
  ${link}

開いても有効にならない場合は、ZENTOKI の 設定 → ZENTOKI Plus → ライセンスキー にキーを入力してください。
キーは他の端末やブラウザでも使えます。大切に保管してください。

----- Reply (English) -----
Subject: Your ZENTOKI Plus licence key

Thank you for purchasing ZENTOKI Plus. Here is your licence key:

  ${key}

Open this link in the browser (or the Home Screen app) where you use ZENTOKI and Plus will turn on:
  ${link}

If it does not activate, open ZENTOKI → Settings → ZENTOKI Plus → Licence key and enter the key.
The key also works on your other devices and browsers. Please keep it safe.
`);
}
