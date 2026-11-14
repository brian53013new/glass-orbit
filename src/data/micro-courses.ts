export type CourseText = { en: string; zh: string }

export type MicroCourse = {
  missionId: string
  eventId: string
  title: CourseText
  purpose: CourseText
  learningGoal: CourseText
  sourceRefs: string[]
  clue: CourseText
  choices: { id: string; label: CourseText; effect: CourseText }[]
  reflectionPrompt: CourseText
  replaySeed: string
  accent: string
  shieldTarget: number
  lifeTarget: number
  evidenceTarget: number
  commsTarget: number
  isSimulated?: boolean
}

// Anchored to checked-in NASA DONKI CME snapshots + 2 designed training scenarios.
// Resource values are educational game rules, never operational advice.
export const microCourses: MicroCourse[] = [
  {
    missionId: 'solar-shield-choice-01',
    eventId: '2024-05-10T07:12:00-CME-001',
    title: { zh: '事件 01｜月球南極基地直擊警報', en: 'EVENT 01 | LUNAR SOUTH POLE DIRECT HIT' },
    purpose: {
      zh: '1018 km/s 高速日冕物質拋射直衝地月軌道！月球沒有大氣層與磁場，必須在 5 回合內撐起護盾並保住維生氧氣。',
      en: 'A 1018 km/s halo CME is heading toward cislunar space. Without an atmosphere or magnetic field, raise shields and keep air alive in 5 turns.',
    },
    learningGoal: { en: 'Compare protection with observation during solar activity.', zh: '在太陽活動期間比較防護與觀測。' },
    sourceRefs: ['NASA-DONKI:2024-05-10T07:12:00-CME-001'],
    clue: { en: 'Read the event speed, then decide what the outpost can afford first.', zh: '先讀風暴速度，再決定前哨站要先負擔護盾還是儲能。' },
    choices: [
      { id: 'radiation-shield', label: { en: 'Protect first', zh: '先做防護' }, effect: { en: 'Spend power for shield.', zh: '用電力換取護盾。' } },
      { id: 'observation', label: { en: 'Observe first', zh: '先做觀測' }, effect: { en: 'Spend life support for evidence.', zh: '用生命維持換取證據。' } },
    ],
    reflectionPrompt: { en: 'What did you observe, and what did you infer?', zh: '你觀察到什麼？又推測了什麼？' },
    replaySeed: 'solar-shield-choice-01',
    accent: '#ffffff',
    shieldTarget: 3,
    lifeTarget: 4,
    evidenceTarget: 0,
    commsTarget: 0,
  },
  {
    missionId: 'life-support-alert-02',
    eventId: '2024-05-10T16:36:00-CME-001',
    title: { zh: '事件 02｜維生艙壓力與電力維修窗', en: 'EVENT 02 | LIFE SUPPORT MAINTENANCE WINDOW' },
    purpose: {
      zh: '這波 393 km/s 慢速電漿雲衝擊較弱，正是補充前哨站氧氣與淨水系統的黃金窗口！目標把生命維持拉升到 5 格以上。',
      en: 'This slower 393 km/s CME brings lower shock pressure—your golden window to stabilize air & water recyclers up to 5.',
    },
    learningGoal: { en: 'Keep a living space viable while resources are limited.', zh: '在資源有限時維持可生活的基地。' },
    sourceRefs: ['NASA-DONKI:2024-05-10T16:36:00-CME-001'],
    clue: { en: 'The room needs power before it can sustain higher life support.', zh: '房間先有足夠電力，才能把維生系統拉高。' },
    choices: [
      { id: 'life-support', label: { en: 'Restore life support', zh: '修復生命維持' }, effect: { en: 'Trade power for room stability.', zh: '以電力換取房間穩定。' } },
      { id: 'power-route', label: { en: 'Store a reserve', zh: '保留備用電力' }, effect: { en: 'Spend now to widen later choices.', zh: '現在花費，換取後續選擇。' } },
    ],
    reflectionPrompt: { en: 'Which need could not wait, and why?', zh: '哪一種需求不能等待？為什麼？' },
    replaySeed: 'life-support-alert-02',
    accent: '#cccccc',
    shieldTarget: 2,
    lifeTarget: 5,
    evidenceTarget: 0,
    commsTarget: 0,
  },
  {
    missionId: 'moon-supply-evidence-03',
    eventId: '2024-05-10T21:17:00-CME-001',
    title: { zh: '事件 03｜日冕儀盲區：雙重證據搜集', en: 'EVENT 03 | CORONAGRAPH BLIND-SPOT SURVEY' },
    purpose: {
      zh: 'STEREO 衛星當時出現資料缺口！科學家需要前哨站回傳實測證據來補齊軌跡，除了護盾與維生，還要累積至少 1 枚證據。',
      en: 'STEREO A had a data gap during this 678 km/s CME. Gather at least 1 Science Evidence alongside Shield and Life Support.',
    },
    learningGoal: { en: 'Separate a measured clue from a game decision.', zh: '把量測到的線索和遊戲決策分開。' },
    sourceRefs: ['NASA-DONKI:2024-05-10T21:17:00-CME-001'],
    clue: { en: 'Observation cards cost life support or power—balance science with survival.', zh: '觀測卡需要取捨資源：先保命，再把證據帶回家。' },
    choices: [
      { id: 'observation', label: { en: 'Gather evidence', zh: '收集證據' }, effect: { en: 'Gain one evidence marker.', zh: '取得一枚證據標記。' } },
      { id: 'supply-trade', label: { en: 'Trade for supply', zh: '交換補給' }, effect: { en: 'Trade shield for life support.', zh: '以護盾交換生命維持。' } },
    ],
    reflectionPrompt: { en: 'Which part came from NASA, and which part was our model?', zh: '哪一部分來自 NASA？哪一部分是我們的模型？' },
    replaySeed: 'moon-supply-evidence-03',
    accent: '#bbbbbb',
    shieldTarget: 2,
    lifeTarget: 4,
    evidenceTarget: 1,
    commsTarget: 0,
  },
  {
    missionId: 'mars-delay-comms-04',
    eventId: '2024-05-11T03:12:00-CME-002',
    title: { zh: '事件 04｜雙波段連環衝擊與火星中繼', en: 'EVENT 04 | DOUBLE-WAVE SHOCK & MARS RELAY' },
    purpose: {
      zh: '前一波剛過，1032 km/s 的第二波追擊緊接著報到！你必須撐起 3 格護盾，同時對準天線維持 1 格深空通訊向火星發報警訊。',
      en: 'A 1032 km/s follow-up wave hits right behind the first! Hold Shield ≥ 3 while keeping Comms ≥ 1 to warn Mars.',
    },
    learningGoal: { en: 'Plan a signal when information and time are incomplete.', zh: '在資訊與時間都不完整時規劃訊號。' },
    sourceRefs: ['NASA-DONKI:2024-05-11T03:12:00-CME-002'],
    clue: { en: 'Aligning comms early unlocks CME Forecast synergy.', zh: '先建立通訊標記，能觸發「CME 預報」特技加乘。' },
    choices: [
      { id: 'antenna', label: { en: 'Align the antenna', zh: '對準天線' }, effect: { en: 'Spend power for a communication marker.', zh: '用電力換取通訊標記。' } },
      { id: 'safe-standby', label: { en: 'Hold safely', zh: '安全等待' }, effect: { en: 'Keep resources and add one shield.', zh: '保留資源並增加一點護盾。' } },
    ],
    reflectionPrompt: { en: 'What could you change on the next replay?', zh: '下次重玩時，你會改變什麼？' },
    replaySeed: 'mars-delay-comms-04',
    accent: '#dddddd',
    shieldTarget: 3,
    lifeTarget: 4,
    evidenceTarget: 0,
    commsTarget: 1,
  },
  {
    missionId: 'extreme-x58-storm-05',
    eventId: '2024-05-11T01:36:00-CME-001',
    title: { zh: '事件 05｜X5.8 極端太陽閃焰超級風暴', en: 'EVENT 05 | X5.8 EXTREME SUPERSTORM' },
    purpose: {
      zh: '2024 年 5 月最強主波之一：速度高達 1263 km/s！一般護盾不夠用，必須把護盾推上 4 格才能守住玻璃穹頂。',
      en: 'One of May 2024’s fiercest eruptions at 1263 km/s! Standard shielding is not enough—push Shield to 4.',
    },
    learningGoal: { en: 'Stack reserves and multi-layer shielding against extreme CME speeds.', zh: '面對破千公里超高速風暴，學習疊加儲能與多層屏蔽。' },
    sourceRefs: ['NASA-DONKI:2024-05-11T01:36:00-CME-001'],
    clue: { en: 'Use Power Reserve or Solar Wing early so you can afford heavy shields.', zh: '善用儲能分配與太陽能翼，才能負擔高階防護。' },
    choices: [
      { id: 'water-wall', label: { en: 'Water Wall Shield', zh: '水牆輻射屏蔽' }, effect: { en: 'Boost both Shield and Life Support.', zh: '同時拉升護盾與生命維持。' } },
      { id: 'radiation-shield', label: { en: 'Storm Shield', zh: '磁暴防護盾' }, effect: { en: 'Heavy shield boost after reserve.', zh: '儲能後快速堆高護盾。' } },
    ],
    reflectionPrompt: { en: 'How did high CME speed force a different card order?', zh: '超高風暴速度如何迫使你改變出牌順序？' },
    replaySeed: 'extreme-x58-storm-05',
    accent: '#ffffff',
    shieldTarget: 4,
    lifeTarget: 4,
    evidenceTarget: 0,
    commsTarget: 0,
  },
  {
    missionId: 'mars-corridor-relay-06',
    eventId: '2024-05-11T16:24:00-CME-001',
    title: { zh: '事件 06｜M8.8 窄束電漿走廊護航', en: 'EVENT 06 | M8.8 NARROW CORRIDOR ESCORT' },
    purpose: {
      zh: '946 km/s 的窄束閃焰電漿正穿過火星補給航線，一邊擋住輻射、一邊對準通訊波束並留下觀測紀錄！',
      en: 'A 946 km/s narrow CME crosses the Mars supply lane. Hold Shield ≥ 3, Life ≥ 4, and log Comms ≥ 1.',
    },
    learningGoal: { en: 'Coordinate defense and deep-space relay under tight turn limits.', zh: '在有限回合內同時協調基地防禦與深空通訊。' },
    sourceRefs: ['NASA-DONKI:2024-05-11T16:24:00-CME-001'],
    clue: { en: 'Comms + Shield cards keep the supply lane visible and safe.', zh: '通訊與護盾並重，才能確保補給船安全通過。' },
    choices: [
      { id: 'antenna', label: { en: 'Lock Relay Beam', zh: '鎖定中繼波束' }, effect: { en: 'Establish Comms ≥ 1.', zh: '建立深空通訊標記。' } },
      { id: 'cme-forecast', label: { en: 'Run CME Forecast', zh: '執行 CME 預報' }, effect: { en: 'Synergy bonus if Comms is ready.', zh: '通訊就緒時觸發額外電力與護盾。' } },
    ],
    reflectionPrompt: { en: 'Why do distant missions need early warning from Earth?', zh: '為什麼遠距火星任務需要地球端提早預警？' },
    replaySeed: 'mars-corridor-relay-06',
    accent: '#cccccc',
    shieldTarget: 3,
    lifeTarget: 4,
    evidenceTarget: 0,
    commsTarget: 1,
  },
  {
    missionId: 'sim-quiet-calibration-07',
    eventId: '2024-05-10T02:12:00-CME-001',
    title: { zh: '訓練情境 07｜平靜太陽期：雙倍科學採樣', en: 'TRAINING 07 | QUIET SUN SCIENCE CALIBRATION' },
    purpose: {
      zh: '【自研訓練情境】以 232 km/s 慢速基準風為背景，考驗太空員「趁風暴還沒來之前」收集 2 枚科學證據，為下一次大風暴做準備！',
      en: '[TRAINING SCENARIO] Using a calm 232 km/s baseline wind, collect 2 Science Evidence markers before the next storm hits.',
    },
    learningGoal: { en: 'Use calm space-weather windows to invest in long-term science data.', zh: '在太陽平靜期投資科學觀測與數據校準。' },
    sourceRefs: ['NASA-DONKI:2024-05-10T02:12:00-CME-001', 'GLASS-ORBIT-TRAINING-07'],
    clue: { en: 'You only need Shield ≥ 2 here—spend remaining turns gathering Evidence ≥ 2.', zh: '這局只需護盾 2 格，把多餘回合拿來衝高科學證據！' },
    choices: [
      { id: 'observation', label: { en: 'Solar Window Scan', zh: '觀測窗口掃描' }, effect: { en: 'Gain +1 Science Evidence.', zh: '取得 +1 科學證據。' } },
      { id: 'deep-scan', label: { en: 'Deep Telemetry Log', zh: '深空遙測紀錄' }, effect: { en: 'Combine observation & forecast.', zh: '結合觀測與預報累積證據。' } },
    ],
    reflectionPrompt: { en: 'Why is calm weather the best time for calibration?', zh: '為什麼平靜時期反而是校準儀器的最佳時機？' },
    replaySeed: 'sim-quiet-calibration-07',
    accent: '#aaaaaa',
    shieldTarget: 2,
    lifeTarget: 4,
    evidenceTarget: 2,
    commsTarget: 0,
    isSimulated: true,
  },
  {
    missionId: 'sim-blackout-shock-08',
    eventId: '2024-05-10T21:28:00-CME-001',
    title: { zh: '訓練情境 08｜磁暴通訊黑障突圍戰', en: 'TRAINING 08 | GEOMAGNETIC BLACKOUT BREAKOUT' },
    purpose: {
      zh: '【自研訓練情境】模擬多波段電漿重疊造成的無線電黑障！你必須同時達成護盾 4、維生 4、通訊 1 與證據 1，完成全能指揮官測試。',
      en: '[TRAINING SCENARIO] Overlapping plasma fronts threaten a radio blackout. Achieve Shield 4, Life 4, Comms 1, and Evidence 1.',
    },
    learningGoal: { en: 'Master all-around resource synergy across power, shields, comms, and science.', zh: '綜合運用所有牌組特技，完成全能指揮官挑戰。' },
    sourceRefs: ['NASA-DONKI:2024-05-10T21:28:00-CME-001', 'GLASS-ORBIT-TRAINING-08'],
    clue: { en: 'Chain free Solar Wing + Comms + CME Forecast to hit every target in 5 turns.', zh: '串聯「太陽能翼 → 天線 → CME 預報 → 水牆/防護盾」就能五回合全破！' },
    choices: [
      { id: 'solar-wing', label: { en: 'Deploy Solar Wing', zh: '展開太陽能翼' }, effect: { en: 'Free +2 Power boost.', zh: '無消耗立即補電 +2。' } },
      { id: 'cme-forecast', label: { en: 'Forecast Synergy', zh: '預報連動特技' }, effect: { en: 'Extra Power & Shield with Comms.', zh: '搭配通訊多拿電力與護盾。' } },
    ],
    reflectionPrompt: { en: 'Which card synergy made the biggest difference?', zh: '哪一組卡牌連動發揮了最大關鍵？' },
    replaySeed: 'sim-blackout-shock-08',
    accent: '#ffffff',
    shieldTarget: 4,
    lifeTarget: 4,
    evidenceTarget: 1,
    commsTarget: 1,
    isSimulated: true,
  },
]
