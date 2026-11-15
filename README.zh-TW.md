# Glass Orbit｜玻璃軌道

> **線上試玩（Live Demo）**：https://brian53013new.github.io/glass-orbit/ ｜ [English README](README.md)

**Glass Orbit（玻璃軌道）** 是一款為 7–12 歲學習者設計的網頁 3D 太空天氣桌遊教學原型，針對 **2026 NASA Space Apps Challenge — The Next Frontier / Build a Junior Astronaut Mission Trainer** 打造。玩家在 360° 全透明玻璃觀測艙內，透過真實 NASA 觀測資料做出月球／火星前哨站的電力、生命維持與輻射防護決策。

> 本專案為獨立製作之非官方 NASA 教育原型（Non-official NASA education prototype），並非 NASA 官方認證訓練、輻射劑量計算器、安全預測工具或實際任務模擬系統。

## AI 使用說明（AI Usage Disclosure）

- **開發環境**：Visual Studio Code（VS Code）。
- **原創設計聲明**：本網站從核心玩法、360° 透明玻璃觀測艙空間構想、艙內白／灰／黑極簡與艙外彩色太空的反差美學、12 張戰術卡牌與 8 場任務架構，到每一個互動細節皆為**作者原創設計**，並非由 AI 自動生成的套版網站。
- **AI 協助範圍（約占總程式碼 40%）**：於 VS Code 開發環境中，請 AI 協助修改較複雜的程式邏輯並優化既有程式碼，其中**絕大部分的 AI 程式碼集中於前端 UI 介面與樣式設計**：
  - **前端 UI 與介面樣式（主要使用比例）**：啟動主畫面、頂部 HUD 工具列、可展開式旁白抽屜與純白灰黑排版樣式調整。
  - **複雜程式優化與重構**：協助優化 Three.js / React Three Fiber 鏡頭平滑切換、Canvas 2D 卡牌／螢幕貼圖繪製、Web Audio API 原創背景音樂合成、以及 TypeScript 型別與 lint 整理。
- **人工把關與驗證**：所有 NASA DONKI 原始資料、SHA-256 雜湊校驗（`npm run verify:data`）、科學限制邊界與最終視覺／遊玩體驗皆由開發者親自審核與驗證。

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

官方參考與已整合資料庫（遊戲內點擊 **NASA 資料來源** 及 [`src/data/official-resources.ts`](src/data/official-resources.ts) 皆可查閱）：
- [2026 NASA Space Apps Challenge 官方資源頁](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/?tab=resources)

### NASA 官方資料與 API
- **[NASA Open APIs](https://api.nasa.gov/)**：NASA 公開 API 入口（APOD、火星探測車影像與 DONKI），提供本遊戲驗證的離線太陽風暴快照。
- **[Space Weather Database Of Notifications, Knowledge, Information (DONKI)](https://ccmc.gsfc.nasa.gov/tools/DONKI/)**：真實太陽閃焰與日冕物質拋射 (CME) 資料庫，驅動遊戲內風暴事件與護盾防護決策。
- **[NASA Open Science Data Repository (OSDR)](https://osdr.nasa.gov/bio/repo/)**（[Search API](https://osdr.nasa.gov/osdr/data/search?term=KEYWORD)）：太空生物學與太空人健康研究庫（骨密度、肌肉量、免疫反應、睡眠），啟發維生支援與健康取捨卡牌。
- **[RadLab (OSDR Radiation Dosimetry Database)](https://visualization.osdr.nasa.gov/radlab/gui/data-api/)**：國際太空站 (ISS) 實測吸收輻射劑量資料庫，作為護盾優先順序與輻射安全界線教學依據。
- **[Mars Trek](https://trek.nasa.gov/mars/)**：整合好奇號與毅力號的真實火星表面影像與高程地形平台，對應觀測站右側火星前哨站比較螢幕。

### 合作太空機構資源（加拿大太空總署 CSA）
- **[CSA：STEM 與青少年太空教育資源](https://www.asc-csa.gc.ca/eng/youth-educators/resources-stem-and-youth-organizations.asp)**：雙語青少年與教育者 STEM 工具，啟發本遊戲 EN / 繁中雙語 NOVA 旁白與新手引導流程。
- **[CSA：月球與偏遠地區糧食生產工具包](https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/)**：太空糧食生產、太空人營養與密閉棲息地補給概念，融入「補給交換」與「維生系統」決策循環。

## 繳交相關文件

- [資料來源與第三方授權聲明（THIRD_PARTY.md）](THIRD_PARTY.md)
- [MIT 開源授權條款（LICENSE）](LICENSE)
