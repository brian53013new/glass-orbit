export type CourseText = { en: string; zh: string }

export type MicroCourse = {
  missionId: string
  eventId: string
  learningGoal: CourseText
  sourceRefs: string[]
  clue: CourseText
  choices: { id: string; label: CourseText; effect: CourseText }[]
  reflectionPrompt: CourseText
  replaySeed: string
  accent: string
}

// Each short course is tied to one record in the checked-in NASA DONKI snapshot.
// Resource values are intentionally educational game rules, never operational advice.
export const microCourses: MicroCourse[] = [
  {
    missionId: 'solar-shield-choice-01',
    eventId: '2024-05-10T07:12:00-CME-001',
    learningGoal: { en: 'Compare protection with observation during solar activity.', zh: '在太陽活動期間比較防護與觀測。' },
    sourceRefs: ['NASA-DONKI:2024-05-10T07:12:00-CME-001'],
    clue: { en: 'Read the event time, then decide what the outpost can afford first.', zh: '先讀事件時間，再決定前哨站要先負擔什麼。' },
    choices: [
      { id: 'radiation-shield', label: { en: 'Protect first', zh: '先做防護' }, effect: { en: 'Spend power for shield.', zh: '用電力換取護盾。' } },
      { id: 'observation', label: { en: 'Observe first', zh: '先做觀測' }, effect: { en: 'Spend life support for evidence.', zh: '用生命維持換取證據。' } },
    ],
    reflectionPrompt: { en: 'What did you observe, and what did you infer?', zh: '你觀察到什麼？又推測了什麼？' },
    replaySeed: 'solar-shield-choice-01',
    accent: '#d5b261',
  },
  {
    missionId: 'life-support-alert-02',
    eventId: '2024-05-10T16:36:00-CME-001',
    learningGoal: { en: 'Keep a living space viable while resources are limited.', zh: '在資源有限時維持可生活的基地。' },
    sourceRefs: ['NASA-DONKI:2024-05-10T16:36:00-CME-001'],
    clue: { en: 'The room needs power before it can make more safe choices.', zh: '房間先要有電力，才有更多安全選項。' },
    choices: [
      { id: 'life-support', label: { en: 'Restore life support', zh: '修復生命維持' }, effect: { en: 'Trade power for room stability.', zh: '以電力換取房間穩定。' } },
      { id: 'power-route', label: { en: 'Store a reserve', zh: '保留備用電力' }, effect: { en: 'Spend now to widen later choices.', zh: '現在花費，換取後續選擇。' } },
    ],
    reflectionPrompt: { en: 'Which need could not wait, and why?', zh: '哪一種需求不能等待？為什麼？' },
    replaySeed: 'life-support-alert-02',
    accent: '#5aa7a4',
  },
  {
    missionId: 'moon-supply-evidence-03',
    eventId: '2024-05-10T21:17:00-CME-001',
    learningGoal: { en: 'Separate a measured clue from a game decision.', zh: '把量測到的線索和遊戲決策分開。' },
    sourceRefs: ['NASA-DONKI:2024-05-10T21:17:00-CME-001'],
    clue: { en: 'The record is a clue; the resource points are our model.', zh: '原始紀錄是線索；資源點是我們的模型。' },
    choices: [
      { id: 'observation', label: { en: 'Gather evidence', zh: '收集證據' }, effect: { en: 'Gain one evidence marker.', zh: '取得一枚證據標記。' } },
      { id: 'supply-trade', label: { en: 'Trade for supply', zh: '交換補給' }, effect: { en: 'Trade shield for life support.', zh: '以護盾交換生命維持。' } },
    ],
    reflectionPrompt: { en: 'Which part came from NASA, and which part was our model?', zh: '哪一部分來自 NASA？哪一部分是我們的模型？' },
    replaySeed: 'moon-supply-evidence-03',
    accent: '#80b4c8',
  },
  {
    missionId: 'mars-delay-comms-04',
    eventId: '2024-05-11T03:12:00-CME-002',
    learningGoal: { en: 'Plan a signal when information and time are incomplete.', zh: '在資訊與時間都不完整時規劃訊號。' },
    sourceRefs: ['NASA-DONKI:2024-05-11T03:12:00-CME-002'],
    clue: { en: 'A far mission can align a signal or pause to protect options.', zh: '遠距任務可以先對準訊號，或暫停以保留選項。' },
    choices: [
      { id: 'antenna', label: { en: 'Align the antenna', zh: '對準天線' }, effect: { en: 'Spend power for a communication marker.', zh: '用電力換取通訊標記。' } },
      { id: 'safe-standby', label: { en: 'Hold safely', zh: '安全等待' }, effect: { en: 'Keep resources and add one shield.', zh: '保留資源並增加一點護盾。' } },
    ],
    reflectionPrompt: { en: 'What could you change on the next replay?', zh: '下次重玩時，你會改變什麼？' },
    replaySeed: 'mars-delay-comms-04',
    accent: '#c86e5c',
  },
]
