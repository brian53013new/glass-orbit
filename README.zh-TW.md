# Glass Orbit｜玻璃軌道

> [English README](README.md)

**Glass Orbit（玻璃軌道）** 是一款為 7–12 歲學習者設計的網頁 3D 太空天氣桌遊教學原型，針對 **2026 NASA Space Apps Challenge — The Next Frontier / Build a Junior Astronaut Mission Trainer** 打造。玩家在 360° 全透明玻璃觀測艙內，透過真實 NASA 觀測資料做出月球／火星前哨站的電力、生命維持與輻射防護決策。

> 本專案為獨立製作之非官方 NASA 教育原型（Non-official NASA education prototype），並非 NASA 官方認證訓練、輻射劑量計算器、安全預測工具或實際任務模擬系統。

## 目前可遊玩特色

- **360° 透明玻璃觀測艙與彩色深空**：以 Three.js / React Three Fiber 建置，艙內採用極簡白／灰／黑設計，艙外則是彩色的太陽與日冕、地球、月球、火星、小行星帶與環狀行星。
- **實體 3D 互動桌面**：12 張具「★ 特技」的戰術卡牌（每局隨機抽 6 張手牌並於出牌後補牌）、點擊卡牌自動回正視角並「左卡右詳情」並排檢視、遠處右前方小圓桌上的三根彩色能量柱（電力／維生／護盾）、以及實體語言切換旋鈕。
- **三台 NASA 觀測終端機**：分別顯示地球通訊與線索、NASA DONKI 即時任務目標、以及任務思考與反思，點擊可平順推進鏡頭聚焦閱讀，按空白處或 `Esc` 返回。
- **預設英文與即時雙語切換**：每次重新載入皆預設為英文（`en`）；可隨時透過桌面實體旋鈕或介面上方按鈕切換繁體中文。
- **8 場任務事件（6 筆 NASA 真實事件 + 2 場訓練情境）**：結合 `donki-cme-2024-05-10.snapshot.json` 真實太陽風暴快照，並配有全程陪伴的 **NOVA 旁白系統**（含頂部展開抽屜）與 **100% Web Audio 原創背景音樂**。

## 本機啟動方式

```bash
npm install
npm run dev
```

啟動後打開終端機顯示的本機網址即可遊玩。正式建置與檢查指令：

```bash
npm run verify:data
npm run build
npm run lint
```

## 資料來源與科學邊界

原始 NASA DONKI CME 快照保存於 [`src/data/donki-cme-2024-05-10.snapshot.json`](src/data/donki-cme-2024-05-10.snapshot.json)，請求網址、UTC 擷取時間、HTTP 狀態、SHA-256 雜湊值、教學用途與限制聲明皆記錄於 [`src/data/manifest.json`](src/data/manifest.json)。

執行 `npm run verify:data` 會重新驗證快照雜湊值並確認指定 CME 紀錄存在。本專案明確區分以下四層資訊：

| 層級 | Glass Orbit 的呈現方式 |
| --- | --- |
| NASA 觀測紀錄 | 歷史 DONKI CME 事件、發生時間、觀測儀器與分析速度（km/s）。 |
| 遊戲推論 | 以太空天氣線索練習「先防護再探索」的決策思維。 |
| 教育模型 | 遊戲內的護盾目標與各項資源點數（教學簡化規則）。 |
| 未知與限制 | 不計算真實輻射劑量、暴露風險或太空人實際安全指標。 |

官方參考連結：[NASA DONKI 入口網站](https://ccmc.gsfc.nasa.gov/tools/DONKI/) 與 [2026 NASA Space Apps Challenge 題目頁面](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/)。

## 繳交相關文件

- [資料來源與第三方授權聲明（THIRD_PARTY.md）](THIRD_PARTY.md)
- [MIT 開源授權條款（LICENSE）](LICENSE)

## AI 使用說明（AI Usage Disclosure）

- **開發環境**：Visual Studio Code（VS Code）
- **原創聲明**：本網站整體架構、遊戲機制、360° 玻璃觀測艙設計、黑白內裝與彩色外太空反差美學、以及各處互動細節皆為**原創設計**，並非 AI 生成模板。
- **AI 協助範圍（約占總程式碼 40%）**：開發過程中在 VS Code 內請 AI 協助修改較複雜的邏輯並優化既有程式碼，其中**絕大部分 AI 協助比例集中在前端 UI 介面排版與樣式實作**。
