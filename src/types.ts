import snapshot from './data/donki-cme-2024-05-10.snapshot.json'
import { microCourses } from './data/micro-courses'

export type Language = 'zh' | 'en'
export type LocalText = Record<Language, string>
export type ResourceKey = 'power' | 'lifeSupport' | 'shield'
export type Resources = Record<ResourceKey, number>
export type PartialResources = Partial<Resources>
export type Outcome = 'playing' | 'success' | 'partial' | 'failed'
export type PlanetName = 'EARTH' | 'MOON' | 'MARS'
export type CardDetailState = 'closed' | 'lifting' | 'moving' | 'expanded' | 'returning'
export type ScreenId = 'event' | 'outpost' | 'field'
export type ScreenFocusState = 'overview' | 'targeting' | 'dollyIn' | 'focused' | 'returning'
export type TutorialStep = 'room' | 'look' | 'language' | 'screen' | 'card' | 'play' | 'complete' | 'skipped'

export type CmeRecord = {
  activityID: string
  startTime: string
  instruments: { displayName: string }[]
  sourceLocation: string
  cmeAnalyses: {
    isMostAccurate: boolean
    speed: number
    measurementTechnique: string
    note: string
  }[]
  link: string
}

export type MissionEvent = {
  missionId: string
  record: CmeRecord
  title: LocalText
  purpose: LocalText
  speed: number
  technique: string
  shieldTarget: number
  lifeTarget: number
  evidenceTarget: number
  commsTarget: number
  isSimulated: boolean
}

import { cards } from './data/cards'

export type CardDefinition = {
  id: string
  symbol: string
  category: LocalText
  title: LocalText
  shortEffect: LocalText
  detail: LocalText
  lesson: LocalText
  specialSkill?: LocalText
  cost: Partial<Resources>
  effects: Partial<Resources> & { evidence?: number; comms?: number }
  prerequisites: string[]
  limitations: LocalText
}

export type GameEvent = {
  type: 'draw_event' | 'play_card' | 'consume_cost' | 'update_resource' | 'reveal_evidence' | 'finish_run'
  cardId?: string
  resources?: Resources
  cost?: Partial<Resources>
  event?: MissionEvent
  outcome?: Outcome
}

export type RunState = {
  resources: Resources
  evidence: number
  comms: number
  turns: number
  played: string[]
  hand: string[]
  deck: string[]
  outcome: Outcome
  events: GameEvent[]
}

export const text = (value: LocalText, language: Language) => value[language]

export const source = {
  officialUrl: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
  challengeUrl: 'https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/',
  retrievedAtUtc: '2026-11-14T07:23:36.1615613Z',
  originalDate: '2024-05-10T07:12Z',
  sha256: 'b2437563d9e53752ca97ee28b6c6d3495a24d92f8ad4ba21533e6e3e86b04f00',
}

const records = snapshot as CmeRecord[]

const makeMission = (course: (typeof microCourses)[number]): MissionEvent => {
  const record = records.find((item) => item.activityID === course.eventId)!
  const analysis = record.cmeAnalyses.find((item) => item.isMostAccurate)!
  return {
    missionId: course.missionId,
    record,
    title: course.title,
    purpose: course.purpose,
    speed: analysis.speed,
    technique: analysis.measurementTechnique,
    shieldTarget: course.shieldTarget,
    lifeTarget: course.lifeTarget,
    evidenceTarget: course.evidenceTarget,
    commsTarget: course.commsTarget,
    isSimulated: Boolean(course.isSimulated),
  }
}

export const missionEvents = microCourses.map((course) => makeMission(course))

export { cards } from './data/cards'

export const resources: Record<ResourceKey, { label: LocalText; icon: string; tone: string }> = {
  power: { label: { zh: '電力', en: 'Power' }, icon: '⚡', tone: 'gold' },
  lifeSupport: { label: { zh: '生命維持', en: 'Life support' }, icon: '◌', tone: 'aqua' },
  shield: { label: { zh: '護盾', en: 'Shield' }, icon: '◇', tone: 'coral' },
}

function shuffleIds(ids: string[]) {
  const copy = [...ids]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export const initialRun = (event: MissionEvent): RunState => {
  const starter = ['power-route', 'life-support', 'radiation-shield']
  const pool = shuffleIds(cards.map((item) => item.id).filter((id) => !starter.includes(id)))
  const hand = shuffleIds([...starter, ...pool.slice(0, 3)])
  const deck = pool.slice(3)
  return {
    resources: { power: 4, lifeSupport: 3, shield: 0 },
    evidence: 0,
    comms: 0,
    turns: 0,
    played: [],
    hand,
    deck,
    outcome: 'playing',
    events: [{ type: 'draw_event', event }],
  }
}
