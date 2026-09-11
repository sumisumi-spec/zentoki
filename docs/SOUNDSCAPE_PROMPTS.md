# サウンドスケープ用 背景画像の生成指示書（Codex / 画像生成AI向け）

参考アプリの「周波数 × 情景写真」という見せ方を ZENTOKI に取り入れるための素材仕様と、
画像生成AI（Codex から API を呼ぶ場合、または DALL·E / Midjourney / Firefly に直接貼る場合）用のプロンプト集。

## 共通仕様（すべての画像に適用）

| 項目 | 値 |
|---|---|
| 縦横比 | 9:19.5（iPhone 全画面）。生成は 1320 × 2868 px、無理なら 1024 × 2224 相当の縦長で生成して拡大 |
| 保存先 | `assets/scenes/<id>.jpg`（品質 80、300KB 目安）と `assets/scenes/<id>-thumb.jpg`（330 × 717） |
| 明るさ | 画面の下 40% は暗く落とす（文字と操作ボタンを重ねるため）。上 60% に主役を置く |
| 色 | 低彩度・低コントラスト。黒に溶ける階調。ZENTOKI の黒背景と馴染むこと |
| 質感 | 写真的（フォトリアル）。フィルム粒子をわずかに。イラスト調・CG 感は不可 |
| 禁止 | 文字、ロゴ、人の顔、ブランド商品、派手な色、レンズフレアの多用、透かし |
| 動き（動画にする場合） | 8〜12 秒ループ。カメラ固定で、光・粒子・水面・葉だけがゆっくり動く |

英語プロンプトの末尾に必ず付ける共通句:

```
vertical 9:19.5 smartphone wallpaper, photorealistic, cinematic, soft natural light, low contrast, desaturated, subtle film grain, lower third fades to near black, no text, no people, no logos
```

ネガティブ（対応するツールのみ）:

```
text, watermark, logo, face, person, cartoon, illustration, 3d render, oversaturated, neon, lens flare, blurry mess, frame, border
```

## 情景ごとのプロンプト

`id` は ZENTOKI 側のサウンド ID と合わせる。ヘルツ表記は参考アプリの分類で、ZENTOKI では「バイノーラルの差周波数」として使う。

### 1. `spirit-22` — 22Hz スピリチュアルな探求（モノクロの砂丘）
- JP: 夜の砂丘。風紋の流れる黒い砂、稜線に薄い光。ほぼモノクロ。静寂と広がり。
- EN:
```
endless black sand dunes at night, wind ripples flowing diagonally, a faint silver light grazing the ridge, near-monochrome, deep shadows, vast and silent
```

### 2. `med-6` — 6Hz 瞑想（洞窟に差す光）
- JP: 岩の洞窟の天井の穴から差し込む光の筋。舞う塵、湿った岩肌、暖かい琥珀色の光と暗い岩のコントラスト。
- EN:
```
inside a dim rock cave, shafts of warm amber light falling from an opening in the ceiling, floating dust in the beams, wet stone walls, quiet and sacred
```

### 3. `calm-16` — 16Hz 考えすぎをやめる（霞む海の水平線）
- JP: 霧の朝の海。波のないフラットな水面、空と海の境がとける灰青色。何もない。
- EN:
```
flat calm ocean at foggy dawn, horizon dissolving into pale grey-blue haze, glassy water with barely any ripple, empty and weightless, minimal
```

### 4. `relax-9` — 9Hz リラックス（逆光の葉）
- JP: 若葉のマクロ。逆光で葉脈が透け、柔らかい黄緑。浅い被写界深度で背景はとろける。
- EN:
```
extreme macro of a fresh green leaf backlit by soft sunlight, translucent veins, gentle yellow-green tones, very shallow depth of field, dreamy bokeh
```

### 5. `focus-40` — 40Hz 集中（青い砂丘の稜線）
- JP: 夕暮れの砂丘。鋭い稜線が画面を斜めに横切る。群青と紺、ひとすじの薄いオレンジ。
- EN:
```
a sharp sand dune ridge cutting diagonally across the frame at blue hour, deep ultramarine and navy tones, a thin line of faint orange on the horizon, crisp and quiet
```

### 6. `sleep-7` — 7Hz 睡眠「聖夜」（窓辺のクリスマスツリー）
- JP: 木枠の大きな窓越しに、暖色の電飾のツリーと雪の降る夜の街。手前にキャンドル。琥珀色。
- EN:
```
view through a large wooden-framed window at night, a christmas tree with warm amber string lights, snow falling over old city buildings, candles in the foreground, cozy and nostalgic, amber and deep navy
```

### 7. `lullaby-2` — 2Hz 甘い子守唄（ベビーベッドのメリー）
- JP: ベビーベッドの上で回るぬいぐるみのメリー。朝のカーテン越しの柔らかい光。淡いベージュとグレー、浅いピント。
- EN:
```
a soft plush crib mobile with small animal toys hanging above a bassinet, morning light diffused through sheer curtains, pale beige and grey, shallow focus, tender and hushed
```

### 8. `focus-12` — 12Hz 集中「欠けゆく月」（薄明の山稜と三日月）
- JP: 日没後の薄明。濃紺から淡いオレンジへのグラデーションの空、黒い山の稜線、細い三日月。手前に暗い針葉樹。
- EN:
```
twilight sky after sunset fading from deep indigo to a thin band of pale orange, a black jagged mountain ridge silhouette, a slender crescent moon high in the sky, dark pine trees in the foreground, still and clear
```

### ZENTOKI の既存サウンド用（同じ仕様で）

| id | JP | EN |
|---|---|---|
| `rain` | 夜の窓ガラスを伝う雨粒、遠くの街灯のにじみ | raindrops running down a dark window pane at night, distant street lights blurred into soft glows |
| `stream` | 苔むした岩の間を流れる浅い小川、朝の木漏れ日 | a shallow clear stream flowing between mossy rocks, dappled morning light, long exposure silky water |
| `ocean` | 月明かりの静かな海、長時間露光で滑らかな波 | calm sea under moonlight, long-exposure smooth waves, silver and charcoal |
| `forest` | 霧の杉林、光の筋、湿った土 | misty cedar forest, thin light shafts between trunks, damp earth, green-grey |
| `fire` | 暗闇に浮かぶ焚き火の熾、舞う火の粉 | glowing embers of a campfire in darkness, drifting sparks, warm orange on black |
| `drone` | 深い夜空と薄い雲、星のかすかな光 | deep night sky with thin veils of cloud, faint stars, near black |
| `binaural` | 水面に広がる同心円の波紋、真上から | concentric ripples spreading on still dark water seen from directly above |
| `melody` | 夕暮れの草原、風に揺れる穂、淡いラベンダー色 | grassland at dusk, seed heads swaying in wind, pale lavender and dusty gold |

## Codex に渡すときの指示文（そのまま貼る）

```
リポジトリ zentoki の docs/SOUNDSCAPE_PROMPTS.md を読み、画像生成 API（OpenAI Images）で
「情景ごとのプロンプト」と「既存サウンド用」の全 16 枚を生成してください。
- 各 EN プロンプトの末尾に「共通句」を連結する。サイズは縦長最大（1024x1792 など）で生成し、
  Pillow で 1320x2868 に中央クロップ＋リサイズ、さらに 330x717 のサムネイルを作る。
- 保存先は assets/scenes/<id>.jpg と assets/scenes/<id>-thumb.jpg（JPEG 品質 80）。
- 生成後、下 40% が十分暗いか（平均輝度 < 60/255）を確認し、暗くなければ
  グラデーションで黒に落とす後処理を入れる。
- 16 枚を並べたコンタクトシート assets/scenes/_sheet.jpg も作る。
- 画像はコミットするが、API キーは環境変数 OPENAI_API_KEY から読み、コードに書かない。
```

## 数字のアニメーション（参考アプリの動き）

- 再生画面の巨大な数字（例: 12）は、細い 1 本線のアウトライン。**線を筆でなぞるように約 7 秒かけて描画**し、描き終わったら静止。「1」の縦線 → 「2」の曲線 → 「2」の底辺、の順にストロークが伸びる。
- 描画中は再生ボタンの位置に読み込みスピナー、音の準備ができると一時停止アイコンに切り替わる（描画 = 読み込み待ちの演出を兼ねている）。
- ZENTOKI で再現するなら SVG の `stroke-dasharray` / `stroke-dashoffset` を CSS アニメーションで 0 に向けて減らすだけで済む。フォントは Jost の Thin 相当を SVG パスに変換して用意する。

## 音の仕様（参考アプリの実測から）

参考アプリの 3 本の録画を解析した結果（`docs/SOUNDSCAPE_PROMPTS.md` と同じ情景に対応）:

| 情景 | 実測 | ZENTOKI で再現するときの設計 |
|---|---|---|
| 7Hz 睡眠「聖夜」 | 左 172.5Hz / 右 177.5Hz の持続音（差 5Hz）に、G#2・C3・D#3・B3・F#4・G#4 の暗いパッド。1kHz 以上はほぼ無し。音圧 -6dBFS と強めに圧縮。0.3〜0.8Hz のゆっくりした揺れ | `buildBinaural` の搬送波を 175Hz、差を 5〜7Hz。`buildDrone` に G# マイナー系の 6 音パッドを重ね、ローパス 900Hz。揺れは LFO 0.5Hz でゲインを ±2dB |
| 12Hz 集中「欠けゆく月」 | 左 82.5Hz / 右 117.5Hz の持続音（差 35Hz）に、両耳共通の 43.7Hz サブベース。60〜120Hz に 97% のエネルギーが集中し、上はほぼ無音。左右の相関 0.02（完全に別々の音） | `buildBinaural` の搬送波を 100Hz、差 12〜35Hz。43Hz のサブを両耳に薄く足す。ローパス 300Hz。表示する Hz と実際の差周波数は一致させる（参考アプリは 12Hz 表示で実測 35Hz、7Hz 表示で実測 5Hz と、表示と中身がずれている） |
| 2Hz 甘い子守唄 | F#3・B3・D4・F#4・G4・A4・B4・D5・G5・D6 のオルゴール音（ロ短調/ニ長調）。約 90BPM で疎らに鳴る。500〜1000Hz が中心。左右差なし（2Hz 成分は検出されず） | `buildMelody` の音階を B マイナー・ペンタ寄りに、音色を正弦波＋短い倍音（オルゴール）に。テンポ 1.5 音/秒。バイノーラルは重ねない |

共通して言えるのは、**参考アプリの音は「1 つの差周波数 ＋ 情景に合った和音パッド」の 2 層**で、ZENTOKI が今持っている部品（`buildBinaural` と `buildDrone` / `buildMelody`）で再現できる、ということ。
