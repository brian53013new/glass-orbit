import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import snapshot from './data/donki-cme-2024-05-10.snapshot.json'
import './App.css'
import './fixes.css'

type ResourceKey = 'power' | 'lifeSupport' | 'shield'
type Resources = Record<ResourceKey, number>
type Outcome = 'playing' | 'success' | 'partial' | 'failed'
type PlanetName = 'EARTH' | 'MOON' | 'MARS'

type CardDefinition = {
  id: string
  symbol: string
  title: string
  category: string
  cost: Partial<Resources>
  effects: Partial<Resources> & { evidence?: number; comms?: number }
  prerequisites: string[]
  educationCopy: string
  sourceRefs: string[]
  limitations: string
}

type GameEvent = {
  type: 'draw_event' | 'play_card' | 'consume_cost' | 'update_resource' | 'reveal_evidence' | 'finish_run'
  detail: string
}

type RunState = {
  resources: Resources
  evidence: number
  comms: number
  turns: number
  played: string[]
  outcome: Outcome
  events: GameEvent[]
}

type CmeRecord = {
  activityID: string
  startTime: string
  instruments: { displayName: string }[]
  sourceLocation: string
  cmeAnalyses: { isMostAccurate: boolean; speed: number; measurementTechnique: string; note: string }[]
  link: string
}

const source = {
  provider: 'NASA DONKI',
  officialUrl: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
  challengeUrl: 'https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/',
  requestUrl: 'https://api.nasa.gov/DONKI/CME?startDate=2024-05-10&endDate=2024-05-11&api_key=DEMO_KEY',
  retrievedAtUtc: '2026-11-14T07:23:36.1615613Z',
  originalDate: '2024-05-10T07:12Z',
  sha256: 'b2437563d9e53752ca97ee28b6c6d3495a24d92f8ad4ba21533e6e3e86b04f00',
}

const cme = (snapshot as CmeRecord[]).find((event) => event.activityID === '2024-05-10T07:12:00-CME-001')!
const analysis = cme.cmeAnalyses.find((item) => item.isMostAccurate)!
// This is deliberately an education rule, not a scientific risk calculation.
// It makes the imported observation visibly change the mission's objective.
const shieldTarget = analysis.speed >= 1000 ? 3 : 2

const cards: CardDefinition[] = [
  { id: 'power-route', symbol: '⚡', title: '儲能分配', category: '能源', cost: { power: 1 }, effects: { power: 2 }, prerequisites: [], educationCopy: '把今天可用的能量先存成明天能用的選項。', sourceRefs: ['NASA-DONKI'], limitations: '能量點是遊戲規則，不是 NASA 電力預算。' },
  { id: 'life-support', symbol: '◌', title: '生命維持', category: '基地', cost: { power: 2 }, effects: { lifeSupport: 2 }, prerequisites: [], educationCopy: '氧氣、水與舒適空間都需要先分配能量。', sourceRefs: ['NASA-DONKI'], limitations: '生命維持點是兒童教育抽象，不是醫療或工程建議。' },
  { id: 'radiation-shield', symbol: '◇', title: '輻射護盾', category: '防護', cost: { power: 2 }, effects: { shield: 3 }, prerequisites: ['power-route'], educationCopy: '太空天氣資料可以提醒我們：保護與備援值得先準備。', sourceRefs: ['NASA-DONKI'], limitations: '護盾點不是輻射劑量預測或任務安全判定。' },
  { id: 'antenna', symbol: '⌁', title: '對準天線', category: '通訊', cost: { power: 1 }, effects: { comms: 1 }, prerequisites: [], educationCopy: '遠距離的訊息要對準、等待，也可能延遲。', sourceRefs: ['NASA-DONKI'], limitations: '通訊標記不是實際網路延遲量測。' },
  { id: 'observation', symbol: '◉', title: '觀測窗口', category: '科學', cost: { lifeSupport: 1 }, effects: { evidence: 1 }, prerequisites: [], educationCopy: '先看見證據，再把觀察和自己的推論分開。', sourceRefs: ['NASA-DONKI'], limitations: '一張證據卡不能證明所有太空環境結論。' },
  { id: 'repair', symbol: '⌘', title: '維修接線', category: '維修', cost: { power: 1 }, effects: { shield: 1 }, prerequisites: [], educationCopy: '先修好共同的基礎設備，其他選擇才會有空間。', sourceRefs: ['NASA-DONKI'], limitations: '此效果是遊戲化維修，不代表真實操作程序。' },
  { id: 'supply-trade', symbol: '↔', title: '補給交換', category: '取捨', cost: { shield: 1 }, effects: { lifeSupport: 2 }, prerequisites: [], educationCopy: '資源有限時，補上一種需求可能會少掉另一種保護。', sourceRefs: ['NASA-DONKI'], limitations: '交換比率只服務教學，不是補給規格。' },
  { id: 'safe-standby', symbol: '□', title: '安全停機', category: '備援', cost: {}, effects: { shield: 1 }, prerequisites: [], educationCopy: '暫停探索也可以是照顧基地的一種決定。', sourceRefs: ['NASA-DONKI'], limitations: '停機情境是遊戲化選擇，並非 NASA 指令。' },
]

const initialRun = (): RunState => ({
  resources: { power: 4, lifeSupport: 3, shield: 0 }, evidence: 0, comms: 0, turns: 0, played: [], outcome: 'playing',
  events: [{ type: 'draw_event', detail: `抽到 DONKI CME：${cme.startTime}，觀測速度 ${analysis.speed} km/s；教育模型目標：護盾 ${shieldTarget}。` }],
})

const resourceLabels: Record<ResourceKey, { label: string; icon: string; tone: string }> = {
  power: { label: '電力', icon: '⚡', tone: 'amber' }, lifeSupport: { label: '生命維持', icon: '◌', tone: 'mint' }, shield: { label: '護盾', icon: '◇', tone: 'coral' },
}
const formatDelta = (value?: number) => value ? `${value > 0 ? '+' : ''}${value}` : '—'

function CameraRig({ focus, reducedMotion }: { focus: PlanetName | null; reducedMotion: boolean }) {
  const { camera, pointer } = useThree()
  const lookAt = useRef(new THREE.Vector3(0, 1.35, 0))
  const targetPosition = useRef(new THREE.Vector3(0, 3.5, 10))
  useFrame(() => {
    const targets: Record<PlanetName, { position: [number, number, number]; look: [number, number, number] }> = {
      EARTH: { position: [-5.2, 3, 6.1], look: [-3.1, 1.5, -0.3] }, MOON: { position: [0, 3, 6], look: [0, 1.4, -0.7] }, MARS: { position: [5.2, 3, 6.1], look: [3.1, 1.5, -0.3] },
    }
    if (focus) { targetPosition.current.set(...targets[focus].position); lookAt.current.set(...targets[focus].look) }
    else { const swayX = reducedMotion ? 0 : pointer.x * 0.38; const swayY = reducedMotion ? 0 : pointer.y * 0.2; targetPosition.current.set(swayX, 3.5 + swayY, 10); lookAt.current.set(swayX * 0.18, 1.35 + swayY * 0.14, 0) }
    camera.position.lerp(targetPosition.current, 0.055)
    camera.lookAt(lookAt.current)
  })
  return null
}

function StarField() {
  const stars = useMemo(() => Array.from({ length: 92 }, (_, index) => ({ key: index, position: [((index * 29) % 19) - 9.5, ((index * 17) % 12) - 2, -7 - ((index * 7) % 9)] as [number, number, number], size: index % 9 === 0 ? 0.05 : 0.022 })), [])
  return <group>{stars.map((star) => <mesh key={star.key} position={star.position}><sphereGeometry args={[star.size, 4, 4]} /><meshBasicMaterial color="#c9e7ff" /></mesh>)}</group>
}

function GlassRoom({ shieldActive }: { shieldActive: boolean }) {
  return <group>
    <mesh position={[0, 2.5, -2.5]}><boxGeometry args={[13, 6.2, 0.06]} /><meshPhysicalMaterial color="#6bd7db" transparent opacity={0.055} roughness={0.1} metalness={0.25} /></mesh>
    <lineSegments position={[0, 2.5, -2.5]}><edgesGeometry args={[new THREE.BoxGeometry(13, 6.2, 0.08)]} /><lineBasicMaterial color="#7aeef0" transparent opacity={0.68} /></lineSegments>
    {[-6.5, 6.5].map((x) => <group key={x}><mesh position={[x, 2.5, 0]}><boxGeometry args={[0.12, 6.2, 5.4]} /><meshStandardMaterial color="#274354" metalness={0.8} roughness={0.35} /></mesh><mesh position={[x, 5.58, -2.5]}><boxGeometry args={[0.2, 0.16, 0.2]} /><meshStandardMaterial color="#f3c46c" emissive="#8a5923" emissiveIntensity={1.5} /></mesh></group>)}
    {shieldActive && <group><mesh position={[0, 2.25, -1.8]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[5.8, 0.035, 4, 42]} /><meshBasicMaterial color="#ff8a70" transparent opacity={0.85} /></mesh><mesh position={[0, 2.25, -1.8]} rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[5.1, 5.13, 36]} /><meshBasicMaterial color="#ff8a70" transparent opacity={0.23} side={THREE.DoubleSide} /></mesh></group>}
  </group>
}

function Planet({ name, position, color, accent, onFocus }: { name: PlanetName; position: [number, number, number]; color: string; accent: string; onFocus: (planet: PlanetName) => void }) {
  const group = useRef<THREE.Group>(null)
  useFrame((state) => { if (group.current) group.current.rotation.y = state.clock.elapsedTime * 0.1 })
  return <group ref={group} position={position} onClick={(event) => { event.stopPropagation(); onFocus(name) }}>
    <mesh castShadow><icosahedronGeometry args={[name === 'EARTH' ? 1.02 : name === 'MARS' ? 0.72 : 0.6, 2]} /><meshStandardMaterial color={color} emissive={accent} emissiveIntensity={0.18} flatShading roughness={0.82} /></mesh>
    <mesh rotation={[0.4, 0.8, 0]} scale={[1.03, 1.03, 1.03]}><icosahedronGeometry args={[name === 'EARTH' ? 1.02 : name === 'MARS' ? 0.72 : 0.6, 1]} /><meshBasicMaterial color={accent} wireframe transparent opacity={0.17} /></mesh>
  </group>
}

function ConsoleDesk() {
  return <group>
    <mesh position={[0, 0, 0]} receiveShadow><boxGeometry args={[8.2, 0.58, 4.6]} /><meshStandardMaterial color="#172838" metalness={0.8} roughness={0.34} /></mesh><mesh position={[0, 0.32, 0]}><boxGeometry args={[7.82, 0.08, 4.18]} /><meshStandardMaterial color="#315261" metalness={0.45} roughness={0.5} /></mesh><mesh position={[0, 0.38, -1.55]} rotation={[-0.18, 0, 0]}><boxGeometry args={[3.2, 0.08, 1.25]} /><meshStandardMaterial color="#0b1420" emissive="#12314a" emissiveIntensity={1.6} /></mesh><mesh position={[-3.15, 0.4, 1.38]}><cylinderGeometry args={[0.45, 0.45, 0.08, 6]} /><meshStandardMaterial color="#1b3944" emissive="#2dcdd2" emissiveIntensity={0.35} /></mesh><mesh position={[3.15, 0.4, 1.38]}><cylinderGeometry args={[0.45, 0.45, 0.08, 6]} /><meshStandardMaterial color="#412a38" emissive="#fa7b68" emissiveIntensity={0.34} /></mesh>
  </group>
}

function CardMesh({ card, index, selected, disabled, onSelect }: { card: CardDefinition; index: number; selected: boolean; disabled: boolean; onSelect: (id: string) => void }) {
  const cardRef = useRef<THREE.Group>(null)
  const x = (index - 3.5) * 1.05
  useFrame((state) => { if (cardRef.current) { const lift = selected ? 0.62 : 0.48 + Math.sin(state.clock.elapsedTime * 1.45 + index) * 0.026; cardRef.current.position.y = THREE.MathUtils.lerp(cardRef.current.position.y, lift, 0.13); cardRef.current.rotation.z = THREE.MathUtils.lerp(cardRef.current.rotation.z, selected ? 0 : (index - 3.5) * 0.035, 0.13) } })
  const hue = card.category === '防護' ? '#ff8370' : card.category === '能源' ? '#f7c65f' : card.category === '科學' ? '#60d9d5' : '#b5a8ff'
  return <group ref={cardRef} position={[x, 0.48, 1.05]} rotation={[-0.16, 0, (index - 3.5) * 0.035]} onClick={(event) => { event.stopPropagation(); if (!disabled) onSelect(card.id) }}>
    <mesh castShadow><boxGeometry args={[0.86, 0.09, 1.18]} /><meshStandardMaterial color={disabled ? '#303c47' : '#eef3e7'} metalness={0.1} roughness={0.62} /></mesh><mesh position={[0, 0.055, 0]}><boxGeometry args={[0.76, 0.012, 1.06]} /><meshStandardMaterial color={hue} emissive={hue} emissiveIntensity={selected ? 0.48 : 0.1} /></mesh><mesh position={[0, 0.065, 0.24]}><boxGeometry args={[0.6, 0.014, 0.08]} /><meshBasicMaterial color="#112130" /></mesh><mesh position={[0, 0.065, -0.22]}><boxGeometry args={[0.46, 0.014, 0.05]} /><meshBasicMaterial color="#112130" /></mesh>
  </group>
}

function RoomScene({ selected, played, shieldActive, focus, onFocus, onSelect, reducedMotion }: { selected: string | null; played: string[]; shieldActive: boolean; focus: PlanetName | null; onFocus: (planet: PlanetName | null) => void; onSelect: (id: string) => void; reducedMotion: boolean }) {
  return <Canvas className="orbit-canvas" shadows dpr={[1, 1]} gl={{ antialias: false, preserveDrawingBuffer: true }} camera={{ position: [0, 3.5, 10], fov: 43 }} onPointerMissed={() => onFocus(null)}>
    <color attach="background" args={['#07111d']} /><fog attach="fog" args={['#07111d', 8, 22]} /><ambientLight intensity={0.55} color="#a7c9e7" /><pointLight position={[-5, 5, 4]} intensity={48} distance={14} color="#4ed9dc" /><pointLight position={[5, 3, 2]} intensity={34} distance={12} color="#f0a65b" /><directionalLight position={[0, 7, 4]} intensity={1.2} color="#ffffff" castShadow />
    <CameraRig focus={focus} reducedMotion={reducedMotion} /><StarField /><GlassRoom shieldActive={shieldActive} /><Planet name="EARTH" position={[-3.9, 2.45, -1.8]} color="#2083a3" accent="#63f1de" onFocus={onFocus} /><Planet name="MOON" position={[0, 2.35, -2.1]} color="#9aa5aa" accent="#e9f4ee" onFocus={onFocus} /><Planet name="MARS" position={[3.9, 2.52, -1.8]} color="#b84f3d" accent="#ff9b6b" onFocus={onFocus} /><ConsoleDesk />
    {cards.map((card, index) => <CardMesh key={card.id} card={card} index={index} selected={selected === card.id} disabled={played.includes(card.id)} onSelect={onSelect} />)}
  </Canvas>
}

function ResourceMeter({ resource, value }: { resource: ResourceKey; value: number }) {
  const meta = resourceLabels[resource]
  return <div className={`resource-meter ${meta.tone}`}><span className="resource-icon" aria-hidden="true">{meta.icon}</span><span>{meta.label}</span><strong>{value}</strong><i aria-hidden="true" style={{ '--level': `${Math.min(value, 6) * 16}%` } as CSSProperties} /></div>
}

function App() {
  const [started, setStarted] = useState(false)
  const [run, setRun] = useState<RunState>(initialRun)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sourceOpen, setSourceOpen] = useState(false)
  const [focus, setFocus] = useState<PlanetName | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const sync = () => setReducedMotion(media.matches); sync(); media.addEventListener('change', sync); return () => media.removeEventListener('change', sync) }, [])
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { setFocus(null); setSourceOpen(false) } }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown) }, [])
  const selected = cards.find((card) => card.id === selectedId) ?? null
  const missingPrerequisite = selected?.prerequisites.find((item) => !run.played.includes(item))
  const unmetCost = selected && (Object.entries(selected.cost) as [ResourceKey, number][]).find(([key, value]) => run.resources[key] < value)
  const canPlay = Boolean(selected && !missingPrerequisite && !unmetCost && run.outcome === 'playing')
  const finishRun = (next: RunState): RunState => { const protectedBase = next.resources.shield >= shieldTarget; const sustainedBase = next.resources.lifeSupport >= 4; const outcome: Outcome = protectedBase && sustainedBase ? 'success' : protectedBase || sustainedBase ? 'partial' : 'failed'; return { ...next, outcome, events: [...next.events, { type: 'finish_run', detail: outcome === 'success' ? '任務完成：基地有足夠保護與生命維持。' : outcome === 'partial' ? '部分完成：保住了一項關鍵需求。' : '任務未完成：下次試著先安排基礎保護。' }] } }
  const playSelected = () => { if (!selected || !canPlay) return; setRun((current) => { const resources = { ...current.resources }; for (const [key, value] of Object.entries(selected.cost) as [ResourceKey, number][]) resources[key] -= value; for (const key of ['power', 'lifeSupport', 'shield'] as ResourceKey[]) { const value = selected.effects[key]; if (value) resources[key] += value } const next: RunState = { ...current, resources, evidence: current.evidence + (selected.effects.evidence ?? 0), comms: current.comms + (selected.effects.comms ?? 0), turns: current.turns + 1, played: [...current.played, selected.id], events: [...current.events, { type: 'play_card', detail: `打出「${selected.title}」。` }, { type: 'consume_cost', detail: `支付：${Object.entries(selected.cost).map(([key, value]) => `${resourceLabels[key as ResourceKey].label} ${value}`).join('、') || '無'}` }, { type: 'update_resource', detail: `資源更新：電力 ${resources.power}、生命維持 ${resources.lifeSupport}、護盾 ${resources.shield}。` }, ...(selected.effects.evidence ? [{ type: 'reveal_evidence' as const, detail: '獲得一張證據標記。' }] : [])] }; return (resources.shield >= shieldTarget && resources.lifeSupport >= 4) || next.turns >= 5 ? finishRun(next) : next }); setSelectedId(null) }
  const restart = () => { setRun(initialRun()); setSelectedId(null); setFocus(null); setSourceOpen(false); setStarted(true) }
  const guide = !started ? '準備好了嗎？我們要把 NASA 的一筆觀察資料變成安全的學習選擇。' : run.outcome !== 'playing' ? '任務已結算。重玩時試著改變牌序，看看結果如何不同。' : !selected ? '第 1 步：點桌上的任務卡，先看成本和後果。' : !canPlay ? '這張卡現在還不能出：先看看下方的紅色提示。' : '第 2 步：確認預覽；準備好就把任務送進控制台。'
  return <main className={`app-shell ${started ? 'in-mission' : 'at-launch'}`}>
    <div className="scanlines" aria-hidden="true" /><header className="topbar"><button className="wordmark" onClick={() => setStarted(false)} aria-label="回到 Glass Orbit 首頁"><span>GLASS</span> ORBIT <small>／玻璃軌道</small></button><div className="top-actions"><span className="mission-chip">2026 SPACE APPS · THE NEXT FRONTIER</span><button className="source-button" onClick={() => setSourceOpen((open) => !open)} aria-expanded={sourceOpen}>NASA 資料來源 ↗</button></div></header>
    {!started && <section className="launch-screen" aria-labelledby="launch-title"><p className="eyebrow">2026 NASA SPACE APPS CHALLENGE · BUILD A JUNIOR ASTRONAUT MISSION TRAINER</p><h1 id="launch-title">在玻璃軌道裡，<br /><em>每一張牌都是選擇。</em></h1><p className="launch-copy">給 7–12 歲太空探險家的 3D 像素卡牌任務。讀懂一筆 NASA 太空天氣資料，在電力、生命維持與防護之間做取捨。</p><div className="launch-actions"><button className="primary-button" onClick={() => setStarted(true)}>開始任務 <span>↗</span></button><button className="quiet-button" onClick={() => setSourceOpen(true)}>先看 NASA 資料</button></div><div className="launch-facts"><span><b>3D</b> 玻璃房</span><span><b>8</b> 張任務卡</span><span><b>1</b> 筆真實資料快照</span></div><p className="disclaimer">非官方 NASA 教育遊戲，非 NASA 認證、任務標準或安全建議。</p></section>}
    <section className="mission-room" aria-label="玻璃太空房間"><RoomScene selected={selectedId} played={run.played} shieldActive={run.resources.shield >= shieldTarget} focus={focus} onFocus={setFocus} onSelect={setSelectedId} reducedMotion={reducedMotion} /><div className="celestial-label earth-label"><b>EARTH</b><span>補給與通訊</span></div><div className="celestial-label moon-label"><b>MOON</b><span>近期前哨</span></div><div className="celestial-label mars-label"><b>MARS</b><span>遠距離任務</span></div>{focus && <div className="planet-focus"><b>{focus}</b><span>{focus === 'EARTH' ? '回望補給與訊號的出發點。' : focus === 'MOON' ? '練習靠近家園的前哨取捨。' : '想像更長的等待與更高的成本。'}</span><button onClick={() => setFocus(null)}>回到控制桌 · Esc</button></div>}<div className="event-card"><div className="event-head"><span className="event-dot" />ARCHIVED NASA SNAPSHOT <button onClick={() => setSourceOpen(true)}>查來源</button></div><strong>日冕物質拋射（CME）</strong><p>DONKI 在 {cme.startTime.replace('T', ' ')} 記錄到事件；其中一筆分析速度為 <b>{analysis.speed} km/s</b>。</p><div className="event-tags"><span>觀察：日期</span><span>觀察：速度</span><span>教育模型：護盾 ≥ {shieldTarget}</span></div></div><div className="nova"><span className="nova-mark">N</span><p><b>NOVA</b>{guide}</p></div><div className="resource-bar">{(Object.keys(resourceLabels) as ResourceKey[]).map((resource) => <ResourceMeter key={resource} resource={resource} value={run.resources[resource]} />)}<div className="turn-meter"><span>回合</span><strong>{run.turns}<small>/5</small></strong></div></div></section>
    {started && <section className="control-deck" aria-label="任務卡控制台"><div className="deck-heading"><p className="eyebrow">CONTROL DESK · 點選 3D 卡牌或使用下方按鈕</p><h2>任務手牌 <span>{run.played.length}/8 已使用</span></h2></div><div className="card-access-list">{cards.map((card) => <button key={card.id} onClick={() => setSelectedId(card.id)} disabled={run.played.includes(card.id)} className={selectedId === card.id ? 'active' : ''}><span>{card.symbol}</span>{card.title}</button>)}</div><div className="preview-panel">{selected ? <><div className="preview-title"><span>{selected.symbol}</span><div><p>{selected.category} · EDUCATION CARD</p><h3>{selected.title}</h3></div></div><p className="education-copy">{selected.educationCopy}</p><div className="cost-effect"><div><small>支付成本</small>{(['power', 'lifeSupport', 'shield'] as ResourceKey[]).filter((key) => selected.cost[key]).map((key) => <span key={key} className={resourceLabels[key].tone}>{resourceLabels[key].icon} −{selected.cost[key]}</span>)}{Object.keys(selected.cost).length === 0 && <span>無</span>}</div><div><small>立即後果</small>{(['power', 'lifeSupport', 'shield'] as ResourceKey[]).filter((key) => selected.effects[key]).map((key) => <span key={key} className={resourceLabels[key].tone}>{resourceLabels[key].icon} {formatDelta(selected.effects[key])}</span>)}{selected.effects.evidence && <span className="mint">◉ +1 證據</span>}{selected.effects.comms && <span className="mint">⌁ +1 通訊</span>}</div></div><p className="limitation">限制：{selected.limitations}</p>{missingPrerequisite && <p className="validation">需要先打出「{cards.find((card) => card.id === missingPrerequisite)?.title}」。</p>}{unmetCost && <p className="validation">{resourceLabels[unmetCost[0]].label}不足，無法支付 {unmetCost[1]} 點成本。</p>}<div className="preview-actions"><button className="primary-button" disabled={!canPlay} onClick={playSelected}>送入控制台 <span>↗</span></button><button className="quiet-button" onClick={() => setSelectedId(null)}>取消選取</button></div></> : <div className="empty-preview"><span>✦</span><h3>選一張任務卡</h3><p>先看右側成本，再想想哪一項基地需求要先照顧。</p></div>}</div><div className="run-log"><div><p className="eyebrow">MISSION TRACE</p><h3>可回放的任務紀錄</h3></div><ol>{run.events.slice(-4).reverse().map((event, index) => <li key={`${event.type}-${index}`}><span>{event.type.replace('_', ' ')}</span>{event.detail}</li>)}</ol>{run.outcome === 'playing' && <button className="quiet-button finish-button" onClick={() => setRun((current) => finishRun(current))}>現在結算</button>}</div></section>}
    {run.outcome !== 'playing' && started && <section className={`result-card ${run.outcome}`} role="status"><p className="eyebrow">MISSION RESULT</p><h2>{run.outcome === 'success' ? '基地準備好了。' : run.outcome === 'partial' ? '你保住了一部分基地。' : '這次基地還需要更多照顧。'}</h2><p>{run.outcome === 'success' ? '你先建立了能源餘裕，再同時照顧生命維持與防護。' : '任務沒有失敗的懲罰；重玩時改變牌序，看看哪個取捨更適合這筆資料。'}</p><div><span>護盾 {run.resources.shield}</span><span>生命維持 {run.resources.lifeSupport}</span><span>證據 {run.evidence}</span></div><button className="primary-button" onClick={restart}>用不同策略重玩 <span>↻</span></button></section>}
    {sourceOpen && <aside className="source-drawer" aria-label="NASA 資料來源"><div className="drawer-head"><div><p className="eyebrow">TRACEABLE DATA</p><h2>NASA DONKI 快照</h2></div><button onClick={() => setSourceOpen(false)} aria-label="關閉資料來源">×</button></div><div className="source-block observed"><small>NASA 觀察</small><p>資料集紀錄 CME 的原始日期、儀器、位置與分析欄位。此任務使用 {cme.activityID} 的 {analysis.speed} km/s 分析值。</p></div><div className="source-block inferred"><small>遊戲推論</small><p>高速太空天氣事件是練習「先保護、再探索」的情境線索；它不代表你的虛構基地會遭遇特定結果。</p></div><div className="source-block model"><small>教育模型與未知</small><p>護盾、電力與生命維持點皆為兒童遊戲規則，不是劑量、預報、工程設計或 NASA 任務建議。</p></div><dl><dt>狀態</dt><dd>離線快照 · HTTP 200</dd><dt>取得 UTC</dt><dd>{source.retrievedAtUtc}</dd><dt>SHA-256</dt><dd className="hash">{source.sha256}</dd><dt>原始事件</dt><dd>{source.originalDate}</dd></dl><a href={source.challengeUrl} target="_blank" rel="noreferrer">2026 挑戰：Junior Astronaut Mission Trainer ↗</a><a href={source.officialUrl} target="_blank" rel="noreferrer">開啟 NASA DONKI 官方頁面 ↗</a><a href={cme.link} target="_blank" rel="noreferrer">開啟此 CME 的 DONKI 記錄 ↗</a><p className="request-url">請求：{source.requestUrl}</p></aside>}
  </main>
}
export default App
