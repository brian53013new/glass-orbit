import type { Language } from '../types'

export type OfficialResource = {
  id: string
  agency: 'NASA' | 'CSA'
  category: Record<Language, string>
  name: Record<Language, string>
  url: string
  apiUrl?: string
  summary: Record<Language, string>
  gameIntegration: Record<Language, string>
}

export const CHALLENGE_RESOURCES_URL =
  'https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/?tab=resources'

export const OFFICIAL_RESOURCES: OfficialResource[] = [
  {
    id: 'nasa-open-apis',
    agency: 'NASA',
    category: { en: 'Central API Portal', zh: '官方 API 入口' },
    name: { en: 'NASA Open APIs', zh: 'NASA Open APIs 開放資料平台' },
    url: 'https://api.nasa.gov/',
    summary: {
      en: 'Central public portal providing programmatic access to APOD, Mars Rover Photos, and Space Weather (DONKI).',
      zh: 'NASA 公開資料入口，提供每日天文圖 (APOD)、火星探測車影像與太空天氣 (DONKI) 等免費 API。',
    },
    gameIntegration: {
      en: 'Powers the verified offline DONKI CME JSON snapshot and observatory screen telemetry.',
      zh: '提供本遊戲離線驗證的 DONKI CME 太陽風暴快照與觀測站螢幕遙測資料。',
    },
  },
  {
    id: 'nasa-donki',
    agency: 'NASA',
    category: { en: 'Space Weather', zh: '太空天氣' },
    name: {
      en: 'Space Weather Database Of Notifications, Knowledge, Information (DONKI)',
      zh: 'DONKI 太空天氣通知與知識資料庫',
    },
    url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
    summary: {
      en: 'Real, regularly updated solar flare and coronal mass ejection (CME) data driving radiation and comms risk.',
      zh: '定期更新的太陽閃焰與日冕物質拋射 (CME) 實測資料，決定輻射防護、通訊中斷與任務風險。',
    },
    gameIntegration: {
      en: 'Grounds every solar-storm event card, CME speed clue (km/s), and shield target trade-off.',
      zh: '驅動遊戲內每次太陽風暴事件卡、CME 速度線索 (km/s) 與護盾防護目標決策。',
    },
  },
  {
    id: 'nasa-osdr',
    agency: 'NASA',
    category: { en: 'Space Biology & Health', zh: '太空生物與太空人健康' },
    name: {
      en: 'NASA Open Science Data Repository (OSDR)',
      zh: 'NASA OSDR 開放科學生物資料庫',
    },
    url: 'https://osdr.nasa.gov/bio/repo/',
    apiUrl: 'https://osdr.nasa.gov/osdr/data/search?term=KEYWORD',
    summary: {
      en: 'Public archive of space biology and astronaut health studies (bone density, muscle mass, immune response, sleep).',
      zh: '公開的太空生物與太空人健康研究庫，涵蓋骨密度、肌肉量、免疫反應與睡眠等關鍵生理數據。',
    },
    gameIntegration: {
      en: 'Inspires Life Support, Crew Sleep, and Health Trade-Off cards balancing human endurance under storm stress.',
      zh: '啟發遊戲中的「維生支援」與健康取捨卡牌，模擬太空人在高壓任務下的生理與睡眠負荷。',
    },
  },
  {
    id: 'nasa-radlab',
    agency: 'NASA',
    category: { en: 'Radiation Dosimetry', zh: '輻射劑量實測' },
    name: {
      en: 'RadLab (OSDR Radiation Dosimetry Database)',
      zh: 'RadLab 國際太空站輻射劑量資料庫',
    },
    url: 'https://visualization.osdr.nasa.gov/radlab/gui/data-api/',
    summary: {
      en: 'Real absorbed radiation dose measurements recorded aboard the ISS across international space agencies.',
      zh: '收錄多國太空機構於國際太空站 (ISS) 實測的吸收輻射劑量率數據，量化長期任務暴露風險。',
    },
    gameIntegration: {
      en: 'Grounds Storm Shield vs. Power Reserve prioritization and radiation-safety disclaimer education.',
      zh: '作為「風暴護盾」與「電力儲備」優先順序教學及輻射安全界線說明的科學依據。',
    },
  },
  {
    id: 'nasa-mars-trek',
    agency: 'NASA',
    category: { en: 'Mars Terrain & Imagery', zh: '火星地形與影像' },
    name: { en: 'Mars Trek', zh: 'Mars Trek 火星地形探索平台' },
    url: 'https://trek.nasa.gov/mars/',
    summary: {
      en: 'Interactive portal for real Mars surface imagery, elevation, and terrain data from Curiosity and Perseverance.',
      zh: '整合好奇號與毅力號等任務的真實火星表面影像、高程與地形圖資互動平台。',
    },
    gameIntegration: {
      en: 'Anchors the Mars Outpost scenario screen and compares Lunar South Pole vs. Mars surface shelter conditions.',
      zh: '對應觀測站右側「火星 / 比較」螢幕，讓玩家對比月球南極與火星前哨站的真實環境條件。',
    },
  },
  {
    id: 'csa-stem-youth',
    agency: 'CSA',
    category: { en: 'STEM & Youth Outreach', zh: 'STEM 與青少年教育' },
    name: {
      en: 'CSA: Space resources for STEM and youth organizations',
      zh: '加拿大太空總署 (CSA)：STEM 與青少年太空教育資源',
    },
    url: 'https://www.asc-csa.gc.ca/eng/youth-educators/resources-stem-and-youth-organizations.asp',
    summary: {
      en: 'Free bilingual tools and activities helping museums, libraries, schools, and clubs engage youth in space STEM.',
      zh: '提供雙語免費工具與互動活動，協助博物館、圖書館與學校帶領青少年認識太空與 STEM。',
    },
    gameIntegration: {
      en: 'Shapes the bilingual (EN / 繁中) plain-language NOVA narrator and step-by-step Junior Astronaut onboarding.',
      zh: '啟發本遊戲的 EN / 繁中雙語 NOVA 引導旁白與適合青少年上手的逐步任務訓練流程。',
    },
  },
  {
    id: 'csa-food-production',
    agency: 'CSA',
    category: { en: 'Lunar Food & Nutrition', zh: '月球糧食與營養補給' },
    name: {
      en: 'CSA: Food production on the moon and in remote areas',
      zh: '加拿大太空總署 (CSA)：月球與偏遠地區糧食生產工具包',
    },
    url: 'https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/',
    summary: {
      en: 'One-stop resource linking space food production to astronaut health, nutrition, and remote Earth sustainability.',
      zh: '探討月球與極端環境下的糧食生產如何維持太空人營養與健康，並回饋地球偏遠地區永續發展。',
    },
    gameIntegration: {
      en: 'Informs the Supply Trade & Life Support loop—teaching how food, power, and shelter compete in closed habitats.',
      zh: '融入「補給交換」與「維生系統」卡牌循環，讓玩家體驗密閉棲息地中糧食、電力與護盾的資源權衡。',
    },
  },
]
