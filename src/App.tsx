import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { RoomScene } from './scene/RoomScene'
import { soundtrack } from './game/soundtrack'
import {
  cards,
  initialRun,
  missionEvents,
  resources,
  source,
  text,
  type CardDefinition,
  type CardDetailState,
  type GameEvent,
  type Language,
  type Outcome,
  type PlanetName,
  type ResourceKey,
  type RunState,
  type ScreenFocusState,
  type ScreenId,
} from './types'
import './App.css'
import './three-only.css'

function App() {
  const [language, setLanguage] = useState<Language>('en')
  const [started, setStarted] = useState(false)
  const [seed, setSeed] = useState(0)
  const event = missionEvents[seed]
  const [run, setRun] = useState<RunState>(() => initialRun(missionEvents[0]))
  const [previous, setPrevious] = useState<RunState | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailState, setDetailState] = useState<CardDetailState>('closed')
  const [screenId, setScreenId] = useState<ScreenId | null>(null)
  const [screenFocus, setScreenFocus] = useState<ScreenFocusState>('overview')
  const [viewYaw] = useState(0)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [sourceOpen, setSourceOpen] = useState(false)
  const [focus, setFocus] = useState<PlanetName | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [compact, setCompact] = useState(() => window.innerWidth < 640)
  const [musicOn, setMusicOn] = useState(true)
  const returnTimer = useRef<number | null>(null)
  const screenTimers = useRef<number[]>([])

  const closeDetail = () => {
    if (!selectedId) return
    if (returnTimer.current) window.clearTimeout(returnTimer.current)
    setDetailState('returning')
    returnTimer.current = window.setTimeout(() => {
      setSelectedId(null)
      setDetailState('closed')
    }, reducedMotion ? 0 : 460)
  }

  const clearScreenTimers = () => {
    screenTimers.current.forEach((timer) => window.clearTimeout(timer))
    screenTimers.current = []
  }

  const focusScreen = (id: ScreenId) => {
    if (screenFocus !== 'overview') return
    clearScreenTimers()
    setScreenId(id)
    setScreenFocus(reducedMotion ? 'focused' : 'targeting')
    if (reducedMotion) return
    const dolly = window.setTimeout(() => setScreenFocus('dollyIn'), 120)
    const focused = window.setTimeout(() => {
      setScreenFocus('focused')
      screenTimers.current = []
    }, 650)
    screenTimers.current = [dolly, focused]
  }

  const closeScreenFocus = () => {
    if (!screenId || screenFocus === 'returning') return
    clearScreenTimers()
    setScreenFocus('returning')
    const returned = window.setTimeout(() => {
      setScreenFocus('overview')
      setScreenId(null)
      screenTimers.current = []
    }, reducedMotion ? 0 : 620)
    screenTimers.current = [returned]
  }

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const sync = () => setCompact(window.innerWidth < 640)
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setDetailState('closed')
      return
    }
    if (returnTimer.current) window.clearTimeout(returnTimer.current)
    setDetailState(reducedMotion ? 'expanded' : 'lifting')
    if (reducedMotion) return
    const moving = window.setTimeout(() => setDetailState('moving'), 120)
    const expanded = window.setTimeout(() => setDetailState('expanded'), 430)
    return () => {
      window.clearTimeout(moving)
      window.clearTimeout(expanded)
    }
  }, [selectedId, reducedMotion])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
      if (event.key === 'Escape') {
        if (screenId) closeScreenFocus()
        else closeDetail()
        setFocus(null)
        setSourceOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, screenId, focus, reducedMotion])

  useEffect(() => {
    localStorage.setItem('glass-orbit-locale', language)
  }, [language])

  const T = (zh: string, en: string) => (language === 'zh' ? zh : en)
  const selected = cards.find((item) => item.id === selectedId) ?? null
  const missing = selected?.prerequisites.find((id) => !run.played.includes(id))
  const insufficient =
    selected && (Object.entries(selected.cost) as [ResourceKey, number][]).find(([key, value]) => run.resources[key] < value)
  const canPlay = Boolean(selected && !missing && !insufficient && run.outcome === 'playing')

  const finish = (next: RunState): RunState => {
    const protectedBase = next.resources.shield >= event.shieldTarget
    const sustained = next.resources.lifeSupport >= event.lifeTarget
    const scienceMet = next.evidence >= event.evidenceTarget
    const commsMet = next.comms >= event.commsTarget
    const allMet = protectedBase && sustained && scienceMet && commsMet
    const anyMajorMet = protectedBase || sustained
    const outcome: Outcome = allMet ? 'success' : anyMajorMet ? 'partial' : 'failed'
    return { ...next, outcome, events: [...next.events, { type: 'finish_run', outcome }] }
  }

  const playCard = (chosen: CardDefinition) => {
    setRun((current) => {
      const nextResources = { ...current.resources }
      for (const [key, value] of Object.entries(chosen.cost) as [ResourceKey, number][]) nextResources[key] -= value
      ;(['power', 'lifeSupport', 'shield'] as ResourceKey[]).forEach((key) => {
        nextResources[key] += chosen.effects[key] ?? 0
      })
      // Special skill: CME Arrival Forecast synergy when comms >= 1
      if (chosen.id === 'cme-forecast' && current.comms >= 1) {
        nextResources.power += 1
        nextResources.shield += 1
      }
      // Draw replacement card from remaining deck into the played hand slot
      const [drawn, ...restDeck] = current.deck
      const nextHand = drawn
        ? current.hand.map((id) => (id === chosen.id ? drawn : id))
        : current.hand.filter((id) => id !== chosen.id)

      const next: RunState = {
        ...current,
        resources: nextResources,
        evidence: current.evidence + (chosen.effects.evidence ?? 0),
        comms: current.comms + (chosen.effects.comms ?? 0),
        turns: current.turns + 1,
        played: [...current.played, chosen.id],
        hand: nextHand,
        deck: restDeck,
        events: [
          ...current.events,
          { type: 'play_card', cardId: chosen.id },
          { type: 'consume_cost', cost: chosen.cost },
          { type: 'update_resource', resources: nextResources },
          ...(chosen.effects.evidence ? [{ type: 'reveal_evidence' as const }] : []),
        ],
      }
      const allTargetsMet =
        nextResources.shield >= event.shieldTarget &&
        nextResources.lifeSupport >= event.lifeTarget &&
        next.evidence >= event.evidenceTarget &&
        next.comms >= event.commsTarget
      return allTargetsMet || next.turns >= 5 ? finish(next) : next
    })
    closeDetail()
    soundtrack.playCardChime()
  }

  const play = () => {
    if (selected && canPlay) playCard(selected)
  }

  const interactWithWorldObject = (objectId: string) => {
    const chosen = cards.find((item) => item.id === objectId)
    if (!chosen) return
    const missingPrerequisite = chosen.prerequisites.some((id) => !run.played.includes(id))
    const lacksCost = (Object.entries(chosen.cost) as [ResourceKey, number][]).some(
      ([key, value]) => run.resources[key] < value,
    )
    if (selectedId === objectId && detailState === 'expanded' && !missingPrerequisite && !lacksCost && run.outcome === 'playing') {
      playCard(chosen)
    } else if (selectedId !== objectId) {
      setSelectedId(objectId)
    }
  }

  const replay = (newEvent: boolean) => {
    const nextSeed = newEvent ? (seed + 1) % missionEvents.length : seed
    setPrevious(run)
    setSeed(nextSeed)
    setRun(initialRun(missionEvents[nextSeed]))
    setSelectedId(null)
    setDetailState('closed')
    setFocus(null)
    setSourceOpen(false)
    setStarted(true)
  }

  const eventSummary = T(
    `DONKI 於 ${event.record.startTime.replace('T', ' ')} 記錄一筆 CME；所選分析速度為 ${event.speed} km/s。`,
    `DONKI recorded a CME at ${event.record.startTime.replace('T', ' ')}; the selected analysis lists ${event.speed} km/s.`,
  )
  const nova = !selected
    ? T('先選一張桌上的展品卡：圖示、成本與短效果都已在卡面上。', 'Choose an exhibit card on the desk: its icon, cost, and short effect are already on its face.')
    : !canPlay
      ? T('這張卡還不能使用。看看詳情裡的前置條件或資源成本。', 'This card cannot be used yet. Check its prerequisites or resource cost in the detail.')
      : T('很好。詳情牌把資料、教育模型與限制放在同一個位置。', 'Great. The detail plaque keeps the data, education model, and limitations together.')

  const eventText = (item: GameEvent) => {
    if (item.type === 'draw_event') {
      return T(`抽到 DONKI 事件：護盾目標 ${item.event!.shieldTarget}。`, `DONKI event drawn: shield target ${item.event!.shieldTarget}.`)
    }
    if (item.type === 'play_card') {
      const title = text(cards.find((c) => c.id === item.cardId)!.title, language)
      return T(`打出「${title}」。`, `Played “${title}”.`)
    }
    if (item.type === 'consume_cost') {
      return T(
        `支付：${Object.entries(item.cost!).map(([key, value]) => `${text(resources[key as ResourceKey].label, language)} ${value}`).join('、') || '無'}`,
        `Paid: ${Object.entries(item.cost!).map(([key, value]) => `${text(resources[key as ResourceKey].label, language)} ${value}`).join(', ') || 'none'}`,
      )
    }
    if (item.type === 'update_resource') {
      return T(
        `資源更新：電力 ${item.resources!.power}、生命維持 ${item.resources!.lifeSupport}、護盾 ${item.resources!.shield}。`,
        `Resources: power ${item.resources!.power}, life support ${item.resources!.lifeSupport}, shield ${item.resources!.shield}.`,
      )
    }
    if (item.type === 'reveal_evidence') return T('獲得一枚科學證據標記。', 'Earned one science-evidence marker.')
    return item.outcome === 'success'
      ? T('任務完成：同時照顧了防護與生命維持。', 'Mission complete: protection and life support are both cared for.')
      : T('任務結算：比較這一局的選擇，再試一個新策略。', 'Mission complete: compare this run, then try a new strategy.')
  }

  return (
    <main className={`app-shell ${started ? 'in-mission' : 'at-launch'}`}>
      <header className="topbar">
        <button className="wordmark" onClick={() => setStarted(false)}>
          <span>GLASS</span> ORBIT <small>／玻璃軌道</small>
        </button>
        <div className="top-actions">
          <span className="mission-chip">THE NEXT FRONTIER</span>
          <button className="language-button" onClick={() => setLanguage((value) => (value === 'zh' ? 'en' : 'zh'))}>
            {language === 'zh' ? 'EN' : '中文'}
          </button>
          <button className="source-button" onClick={() => setSourceOpen((value) => !value)}>
            {T('NASA 資料來源', 'NASA data source')} ↗
          </button>
        </div>
      </header>

      <section className="mission-room">
        <RoomScene
          language={language}
          selected={selectedId}
          detailState={detailState}
          screenId={screenId}
          screenFocus={screenFocus}
          viewYaw={viewYaw}
          hovered={hoveredId}
          played={run.played}
          protectedRoom={run.resources.shield >= event.shieldTarget}
          focus={focus}
          run={run}
          mission={event}
          onFocus={setFocus}
          onSelect={interactWithWorldObject}
          onCloseDetail={closeDetail}
          onFocusScreen={focusScreen}
          onCloseScreen={closeScreenFocus}
          onHover={setHoveredId}
          onToggleLanguage={() => setLanguage((value) => (value === 'zh' ? 'en' : 'zh'))}
          reducedMotion={reducedMotion}
          compact={compact}
          onReplay={() => replay(false)}
          onNewEvent={() => replay(true)}
          onOpenSource={() => setSourceOpen((value) => !value)}
          onOpenBrief={() => setStarted(false)}
          previewMode={!started}
          musicOn={musicOn}
          onToggleMusic={() => {
            setMusicOn((prev) => {
              const next = !prev
              if (next) soundtrack.start()
              else soundtrack.stop()
              return next
            })
          }}
        />

        {!started && (
          <div className="cockpit-launch-overlay" role="dialog" aria-label="Glass Orbit Launch">
            <div className="cockpit-launch-card">
              <div className="cockpit-launch-top">
                <span className="cockpit-eyebrow">2026 NASA SPACE APPS // JUNIOR ASTRONAUT MISSION TRAINER</span>
                <button
                  className="cockpit-lang-btn"
                  onClick={() => setLanguage((value) => (value === 'zh' ? 'en' : 'zh'))}
                >
                  {language === 'zh' ? 'EN ⇄ 繁中' : '繁中 ⇄ EN'}
                </button>
              </div>
              <h1 className="cockpit-title">
                GLASS ORBIT <span>// {T('玻璃軌道：太空前哨戰術官', 'SPACE OUTPOST TACTICS')}</span>
              </h1>
              <p className="cockpit-subtitle">
                {T(
                  '真實 NASA DONKI 太陽風暴正衝向月球／火星前哨站。在 360° 玻璃觀測艙內運用 12 張戰術特技卡，平衡電力、維生與護盾。',
                  'A real NASA DONKI solar storm is heading for the lunar/Martian outpost. Balance power, life support, and shielding across 5 turns inside a 360° glass observatory.',
                )}
              </p>
              <div className="cockpit-steps">
                <div className="cockpit-step">
                  <b>01 · {T('讀取 NASA 風暴', 'READ NASA DATA')}</b>
                  <span>{T('點中央螢幕看 CME 速度，決定本局所需護盾格數', 'Check CME speed on the center terminal to see Shield goal')}</span>
                </div>
                <div className="cockpit-step">
                  <b>02 · {T('五回合抽牌取捨', 'PLAY & DRAW CARDS')}</b>
                  <span>{T('點牌放大檢視成本與 ★ 特技，出牌後隨機抽補新卡', 'Inspect card costs & ★ skills; every play draws a fresh card')}</span>
                </div>
                <div className="cockpit-step">
                  <b>03 · {T('能量柱與工程反思', 'PILLARS & DEBRIEF')}</b>
                  <span>{T('觀察右方圓桌三根能量柱，完成 5 回合進行科學反思', 'Watch the round-table pillars and review mission trade-offs')}</span>
                </div>
              </div>
              <div className="cockpit-actions">
                <button
                  className="primary-button cockpit-start-btn"
                  onClick={() => {
                    setStarted(true)
                    if (musicOn) soundtrack.start()
                  }}
                >
                  ▶ {T('進入太空艙開始任務', 'LAUNCH MISSION')}
                </button>
                <button className="cockpit-secondary-btn" onClick={() => setSourceOpen(true)}>
                  {T('NASA 資料來源', 'NASA DATA SOURCE')}
                </button>
              </div>
              <p className="cockpit-disclaimer">
                {T(
                  '非官方 NASA 教育原型（Non-official NASA education prototype），僅供 7–12 歲 STEM 教育與科學思考練習，非 NASA 官方認證或安全預測。',
                  'Non-official NASA education prototype for STEM learning (ages 7–12); not NASA-certified training or a real safety forecast.',
                )}
              </p>
            </div>
          </div>
        )}

        {started && (
          <>
            <div className="celestial-label earth-label">
              <b>EARTH</b>
              <span>{T('補給與通訊', 'supply + signal')}</span>
            </div>
            <div className="celestial-label moon-label">
              <b>MOON</b>
              <span>{T('近期前哨', 'near outpost')}</span>
            </div>
            <div className="celestial-label mars-label">
              <b>MARS</b>
              <span>{T('遠距離任務', 'long wait')}</span>
            </div>
            {focus && (
              <div className="planet-focus">
                <b>{focus}</b>
                <span>{T('這是一個可聚焦的展品；Escape 回到控制桌。', 'This exhibit can be focused; Escape returns to the desk.')}</span>
                <button onClick={() => setFocus(null)}>{T('回到控制桌', 'RETURN TO DESK')} · Esc</button>
              </div>
            )}
            <div className="event-card">
              <div className="event-head">
                <span className="event-dot" />
                NASA DONKI · {T('歷史快照', 'ARCHIVED SNAPSHOT')}
                <button onClick={() => setSourceOpen(true)}>{T('查來源', 'SOURCE')}</button>
              </div>
              <strong>{T('日冕物質拋射（CME）', 'Coronal Mass Ejection')}</strong>
              <p>{eventSummary}</p>
              <div className="event-tags">
                <span>{T('觀察：日期', 'OBSERVED: DATE')}</span>
                <span>{T('觀察：速度', 'OBSERVED: SPEED')}</span>
                <span>
                  {T('模型：護盾', 'MODEL: SHIELD')} ≥ {event.shieldTarget}
                </span>
              </div>
            </div>
            {selected && (
              <aside className="world-detail">
                <div className="plaque-kicker">
                  {T('控制桌展品詳情', 'CONTROL DESK PLAQUE')} <button onClick={() => setSelectedId(null)}>×</button>
                </div>
                <div className="plaque-title">
                  <i>{selected.symbol}</i>
                  <div>
                    <small>{text(selected.category, language)}</small>
                    <h2>{text(selected.title, language)}</h2>
                    <p>{text(selected.shortEffect, language)}</p>
                  </div>
                </div>
                <div className="plaque-grid">
                  <span>
                    <b>{T('教育重點', 'LEARNING POINT')}</b>
                    {text(selected.lesson, language)}
                  </span>
                  <span>
                    <b>{T('教育模型', 'EDUCATION MODEL')}</b>
                    {text(selected.detail, language)}
                  </span>
                  <span>
                    <b>{T('NASA 來源', 'NASA SOURCE')}</b>
                    {T('DONKI 歷史事件快照', 'NASA DONKI historical event snapshot')} · {event.record.startTime}
                  </span>
                  <span>
                    <b>{T('限制', 'LIMITATION')}</b>
                    {text(selected.limitations, language)}
                  </span>
                </div>
                <button className="plaque-close" onClick={() => setSelectedId(null)}>
                  {T('關閉詳情 · Esc', 'CLOSE DETAIL · Esc')}
                </button>
              </aside>
            )}
            <div className="nova">
              <span className="nova-mark">N</span>
              <p>
                <b>NOVA</b>
                {nova}
              </p>
            </div>
            <div className="resource-bar">
              {(Object.keys(resources) as ResourceKey[]).map((key) => (
                <div key={key} className={`resource-meter ${resources[key].tone}`}>
                  <span>{resources[key].icon}</span>
                  <label>{text(resources[key].label, language)}</label>
                  <strong>{run.resources[key]}</strong>
                  <i style={{ '--level': `${Math.min(run.resources[key], 6) * 16}%` } as CSSProperties} />
                </div>
              ))}
            </div>
            <div className="turn-meter">
              <span>{T('回合', 'TURN')}</span>
              <strong>
                {run.turns}
                <small>/5</small>
              </strong>
            </div>
          </>
          )}
          </section>

          {started && (
          <section className="control-deck">
            <div className="deck-heading">
              <p className="eyebrow">{T('控制桌 · 點 3D 卡牌或使用無障礙按鈕', 'CONTROL DESK · CLICK 3D CARDS OR USE ACCESSIBLE BUTTONS')}</p>
              <h2>
                {T('展品手牌', 'EXHIBIT HAND')}{' '}
                <span>
                  {run.played.length}/8 {T('已使用', 'ARCHIVED')}
                </span>
              </h2>
            </div>
            <div className="card-access-list">
              {cards.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  disabled={run.played.includes(item.id)}
                  className={selectedId === item.id ? 'active' : ''}
                >
                  <span>{item.symbol}</span>
                  <b>{text(item.title, language)}</b>
                  <small>{text(item.shortEffect, language)}</small>
                </button>
              ))}
            </div>
            <div className="preview-panel">
              {selected ? (
                <>
                  <p className="eyebrow">{T('出牌預覽', 'PLAY PREVIEW')}</p>
                  <h3>{text(selected.title, language)}</h3>
                  <p>{text(selected.detail, language)}</p>
                  <div className="cost-effect">
                    <div>
                      <small>{T('支付成本', 'PAY COST')}</small>
                      {Object.entries(selected.cost).length ? (
                        (Object.entries(selected.cost) as [ResourceKey, number][]).map(([key, value]) => (
                          <span key={key}>
                            {resources[key].icon} −{value}
                          </span>
                        ))
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <div>
                      <small>{T('立即後果', 'IMMEDIATE EFFECT')}</small>
                      {(['power', 'lifeSupport', 'shield'] as ResourceKey[])
                        .filter((key) => selected.effects[key])
                        .map((key) => (
                          <span key={key}>
                            {resources[key].icon} +{selected.effects[key]}
                          </span>
                        ))}
                      {selected.effects.evidence && <span>◉ +1</span>}
                      {selected.effects.comms && <span>⌁ +1</span>}
                    </div>
                  </div>
                  {missing && (
                    <p className="validation">
                      {T(
                        `需要先打出「${text(cards.find((item) => item.id === missing)!.title, language)}」。`,
                        `Play “${text(cards.find((item) => item.id === missing)!.title, language)}” first.`,
                      )}
                    </p>
                  )}
                  {insufficient && (
                    <p className="validation">
                      {T(
                        `${text(resources[insufficient[0]].label, language)}不足。`,
                        `Not enough ${text(resources[insufficient[0]].label, language)}.`,
                      )}
                    </p>
                  )}
                  <div className="preview-actions">
                    <button className="primary-button" disabled={!canPlay} onClick={play}>
                      {T('送入控制台', 'PLAY CARD')} <span>↗</span>
                    </button>
                    <button className="quiet-button" onClick={() => setSelectedId(null)}>
                      {T('取消', 'CANCEL')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-preview">
                  <span>✦</span>
                  <h3>{T('選一張展品卡', 'SELECT AN EXHIBIT CARD')}</h3>
                  <p>
                    {T(
                      '卡面先給你圖示、成本和短效果；靠近後再看完整資料。',
                      'The face gives an icon, cost, and short effect; open the plaque for the full record.',
                    )}
                  </p>
                </div>
              )}
            </div>
            <div className="run-log">
              <p className="eyebrow">MISSION TRACE</p>
              <h3>{T('可回放的任務紀錄', 'REPLAYABLE MISSION TRACE')}</h3>
              <ol>
                {run.events
                  .slice(-4)
                  .reverse()
                  .map((item, index) => (
                    <li key={`${item.type}-${index}`}>
                      <b>{item.type.replace('_', ' ')}</b>
                      {eventText(item)}
                    </li>
                  ))}
              </ol>
              {run.outcome === 'playing' && (
                <button className="quiet-button finish-button" onClick={() => setRun((current) => finish(current))}>
                  {T('現在結算', 'FINISH NOW')}
                </button>
              )}
            </div>
          </section>
          )}

      {run.outcome !== 'playing' && started && (
        <section className={`result-card ${run.outcome}`}>
          <p className="eyebrow">MISSION RESULT</p>
          <h2>
            {run.outcome === 'success'
              ? T('基地準備好了。', 'THE OUTPOST IS READY.')
              : run.outcome === 'partial'
                ? T('你保住了一部分基地。', 'YOU SAVED PART OF THE OUTPOST.')
                : T('這次基地還需要更多照顧。', 'THE OUTPOST NEEDS MORE CARE.')}
          </h2>
          <p>
            {T(
              `這局的 NASA 教育模型要求護盾至少 ${event.shieldTarget}；看看上一局的數字，再選擇同事件或新事件重玩。`,
              `This NASA education model asked for shield ${event.shieldTarget} or more. Compare the numbers, then replay this or a new event.`,
            )}
          </p>
          <div className="result-stats">
            <span>
              {T('護盾', 'Shield')} {run.resources.shield}
            </span>
            <span>
              {T('生命維持', 'Life')} {run.resources.lifeSupport}
            </span>
            <span>
              {T('證據', 'Evidence')} {run.evidence}
            </span>
            {previous && (
              <span>
                {T('上一局護盾', 'Previous shield')} {previous.resources.shield}
              </span>
            )}
          </div>
          <div className="result-actions">
            <button className="primary-button" onClick={() => replay(false)}>
              {T('自由重玩', 'FREE REPLAY')} <span>↻</span>
            </button>
            <button className="quiet-button" onClick={() => replay(true)}>
              {T('換一個 NASA 事件', 'NEW NASA EVENT')}
            </button>
          </div>
        </section>
      )}

      {sourceOpen && (
        <aside className="source-drawer">
          <div className="drawer-head">
            <div>
              <p className="eyebrow">TRACEABLE DATA</p>
              <h2>NASA DONKI</h2>
            </div>
            <button onClick={() => setSourceOpen(false)} aria-label="Close">
              ×
            </button>
          </div>
          <div className="source-block observed">
            <small>{T('NASA 觀察', 'NASA OBSERVATION')}</small>
            <p>
              {T(
                `原始記錄 ${event.record.activityID}；所選分析以 ${event.technique} 測得 ${event.speed} km/s。`,
                `Original record ${event.record.activityID}; the selected ${event.technique} analysis lists ${event.speed} km/s.`,
              )}
            </p>
          </div>
          <div className="source-block inferred">
            <small>{T('遊戲推論', 'GAME INFERENCE')}</small>
            <p>
              {T(
                '這筆資料讓玩家練習「先保護，再探索」的取捨；它不預測虛構基地的結果。',
                'This record invites a “protect before explore” trade-off; it does not predict the fictional outpost’s outcome.',
              )}
            </p>
          </div>
          <div className="source-block model">
            <small>{T('教育模型與未知', 'EDUCATION MODEL + UNKNOWN')}</small>
            <p>
              {T(
                `此事件的遊戲護盾目標為 ${event.shieldTarget}。所有資源點都不是劑量、預報、工程設計或 NASA 任務建議。`,
                `This event’s game shield target is ${event.shieldTarget}. Every resource point is not a dose, forecast, engineering design, or NASA mission recommendation.`,
              )}
            </p>
          </div>
          <dl>
            <dt>{T('狀態', 'STATUS')}</dt>
            <dd>{T('離線快照 · HTTP 200', 'Offline snapshot · HTTP 200')}</dd>
            <dt>{T('取得 UTC', 'RETRIEVED UTC')}</dt>
            <dd>{source.retrievedAtUtc}</dd>
            <dt>SHA-256</dt>
            <dd className="hash">{source.sha256}</dd>
            <dt>{T('原始事件', 'ORIGINAL EVENT')}</dt>
            <dd>{event.record.startTime}</dd>
          </dl>
          <a href={source.challengeUrl} target="_blank" rel="noreferrer">
            {T('2026 挑戰：Junior Astronaut Mission Trainer', '2026 challenge: Junior Astronaut Mission Trainer')} ↗
          </a>
          <a href={source.officialUrl} target="_blank" rel="noreferrer">
            NASA DONKI ↗
          </a>
          <a href={event.record.link} target="_blank" rel="noreferrer">
            {T('開啟本 CME 記錄', 'Open this CME record')} ↗
          </a>
        </aside>
      )}
    </main>
  )
}

export default App
