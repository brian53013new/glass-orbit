import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { microCourses } from '../data/micro-courses'
import { buildMissionGoalSummary, buildNarratorBeat } from '../game/narrator'
import { cards, type CardDetailState, type Language, type MissionEvent, type PlanetName, type RunState, type ScreenFocusState, type ScreenId, type TutorialStep } from '../types'
import { AsteroidBelt3D, CameraRig, DeepSpaceSky, MosaicGlassTiles, MuseumRoom, ObservatoryFloor, PixelStars, Planet } from './ObservatoryEnvironment'
import { Desk, DeskViewArrow3D, DetailPlaque3D, LanguageDial3D, ReplayConsole3D, ResourcePillars3D, TutorialBeacon3D } from './DeskAndProps'
import { WorldScreen3D } from './WorldScreens'
import { CardMesh } from './CardMesh'

export function RoomScene({
  language,
  selected,
  detailState,
  screenId,
  screenFocus,
  viewYaw,
  hovered,
  played,
  protectedRoom,
  focus,
  run,
  mission,
  onFocus,
  onSelect,
  onCloseDetail,
  onFocusScreen,
  onCloseScreen,
  onHover,
  onToggleLanguage,
  reducedMotion,
  compact,
  onReplay,
  onNewEvent,
  onOpenSource,
  onOpenBrief,
  previewMode = false,
  musicOn = true,
  onToggleMusic,
  playingCardId = null,
  drawingCardId = null,
}: {
  language: Language
  selected: string | null
  detailState: CardDetailState
  screenId: ScreenId | null
  screenFocus: ScreenFocusState
  viewYaw: number
  hovered: string | null
  played: string[]
  protectedRoom: boolean
  focus: PlanetName | null
  run: RunState
  mission: MissionEvent
  onFocus: (name: PlanetName | null) => void
  onSelect: (id: string) => void
  onCloseDetail: () => void
  onFocusScreen: (id: ScreenId) => void
  onCloseScreen: () => void
  onHover: (id: string | null) => void
  onToggleLanguage: () => void
  reducedMotion: boolean
  compact: boolean
  onReplay: () => void
  onNewEvent: () => void
  onOpenSource: () => void
  onOpenBrief: () => void
  previewMode?: boolean
  musicOn?: boolean
  onToggleMusic?: () => void
  playingCardId?: string | null
  drawingCardId?: string | null
}) {
  const current = cards.find((item) => item.id === selected) ?? null
  const course = microCourses.find((item) => item.eventId === mission.record.activityID) ?? microCourses[0]
  const [tutorial, setTutorial] = useState<TutorialStep>(() =>
    localStorage.getItem('glass-orbit-onboarding-v2') === 'done' ? 'complete' : 'room',
  )
  const [localYaw, setLocalYaw] = useState(viewYaw)
  const [localPitch, setLocalPitch] = useState(0.18)
  const [languageFocused, setLanguageFocused] = useState(false)
  const [narratorExpanded, setNarratorExpanded] = useState(true)
  const [narratorPos, setNarratorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const narratorDragRef = useRef<{
    active: boolean
    startX: number
    startY: number
    originX: number
    originY: number
  }>({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 })
  const [typedChars, setTypedChars] = useState(0)
  const dragState = useRef<{ active: boolean; lastX: number; lastY: number; moved: boolean }>({
    active: false,
    lastX: 0,
    lastY: 0,
    moved: false,
  })
  const previousSelected = useRef<string | null>(selected)
  const previousPlayed = useRef(run.played.length)
  const savedAngleRef = useRef<{ yaw: number; pitch: number } | null>(null)
  const handCards = run.hand
    .map((id) => cards.find((item) => item.id === id))
    .filter((item): item is (typeof cards)[number] => Boolean(item))

  useEffect(() => {
    setLocalYaw(viewYaw)
  }, [viewYaw])

  const finishTutorial = (next: TutorialStep) => {
    setTutorial(next)
    if (next === 'complete' || next === 'skipped') localStorage.setItem('glass-orbit-onboarding-v2', 'done')
  }
  const inspectRoom = () => {
    if (tutorial === 'room') setTutorial('look')
    else nextTutorialStep()
  }
  const turn = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (screenId || selected || focus) return
    if (direction === 'left' || direction === 'right') {
      setLocalYaw((value) => value + (direction === 'left' ? -0.35 : 0.35))
    } else {
      setLocalPitch((value) => THREE.MathUtils.clamp(value + (direction === 'up' ? 0.16 : -0.16), -0.42, 0.88))
    }
    if (tutorial === 'look') setTutorial('language')
  }
  const resetView = () => {
    setLocalYaw(0)
    setLocalPitch(0.18)
  }
  const toggleLanguage = () => {
    onToggleLanguage()
    if (tutorial === 'language') setTutorial('screen')
  }
  const returnFromScreen = () => {
    onCloseScreen()
    if (tutorial === 'screen') window.setTimeout(() => setTutorial('card'), reducedMotion ? 0 : 650)
  }
  const skipTutorial = () => finishTutorial('skipped')
  const replayTutorial = () => {
    localStorage.removeItem('glass-orbit-onboarding-v1')
    localStorage.removeItem('glass-orbit-onboarding-v2')
    setTutorial('room')
    setNarratorExpanded(true)
    setNarratorPos({ x: 0, y: 0 })
    resetView()
  }
  const nextTutorialStep = () => {
    const order: TutorialStep[] = ['room', 'look', 'language', 'screen', 'card', 'play', 'complete']
    const idx = order.indexOf(tutorial)
    if (idx >= 0 && idx < order.length - 1) finishTutorial(order[idx + 1])
  }

  useEffect(() => {
    if (!previousSelected.current && selected) {
      savedAngleRef.current = { yaw: localYaw, pitch: localPitch }
    } else if (previousSelected.current && !selected && savedAngleRef.current) {
      setLocalYaw(savedAngleRef.current.yaw)
      setLocalPitch(savedAngleRef.current.pitch)
      savedAngleRef.current = null
    }
    if (tutorial === 'card' && previousSelected.current && !selected) setTutorial('play')
    previousSelected.current = selected
  }, [selected, tutorial, localYaw, localPitch])

  useEffect(() => {
    if (tutorial === 'play' && run.played.length > previousPlayed.current) finishTutorial('complete')
    previousPlayed.current = run.played.length
  }, [run.played.length, tutorial])

  const currentBeat = buildNarratorBeat(language, tutorial, mission, run)
  const fullNarratorText = currentBeat.lines.join('\n')
  const beatKey = `${language}|${tutorial}|${mission.record.activityID}|${run.turns}|${run.outcome}`

  useEffect(() => {
    if (previewMode) return
    if (reducedMotion) {
      setTypedChars(fullNarratorText.length)
      return
    }
    setTypedChars(0)
    const stepMs = language === 'zh' ? 28 : 18
    const id = window.setInterval(() => {
      setTypedChars((prev) => {
        if (prev >= fullNarratorText.length) {
          window.clearInterval(id)
          return prev
        }
        return prev + 1
      })
    }, stepMs)
    return () => window.clearInterval(id)
  }, [beatKey, fullNarratorText.length, language, previewMode, reducedMotion])

  const startNarratorDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    narratorDragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: narratorPos.x,
      originY: narratorPos.y,
    }
  }

  const moveNarratorDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!narratorDragRef.current.active) return
    const dx = event.clientX - narratorDragRef.current.startX
    const dy = event.clientY - narratorDragRef.current.startY
    const maxX = Math.max(120, window.innerWidth * 0.42)
    const maxY = Math.max(140, window.innerHeight * 0.65)
    setNarratorPos({
      x: THREE.MathUtils.clamp(narratorDragRef.current.originX + dx, -maxX, maxX),
      y: THREE.MathUtils.clamp(narratorDragRef.current.originY + dy, -36, maxY),
    })
  }

  const endNarratorDrag = () => {
    narratorDragRef.current.active = false
  }

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]') || screenId || selected || focus) return
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        event.preventDefault()
        turn('left')
      }
      if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        event.preventDefault()
        turn('right')
      }
      if (event.code === 'ArrowUp' || event.code === 'KeyW') {
        event.preventDefault()
        turn('up')
      }
      if (event.code === 'ArrowDown' || event.code === 'KeyS') {
        event.preventDefault()
        turn('down')
      }
      if (event.code === 'Home' || event.code === 'KeyR') {
        resetView()
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [screenId, selected, focus, tutorial])

  return (
    <div
      className="orbit-canvas"
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onPointerDown={(event) => {
        if (screenId || selected || focus) return
        dragState.current = { active: true, lastX: event.clientX, lastY: event.clientY, moved: false }
      }}
      onPointerMove={(event) => {
        if (!dragState.current.active || screenId || selected || focus) return
        const dx = event.clientX - dragState.current.lastX
        const dy = event.clientY - dragState.current.lastY
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) dragState.current.moved = true
        dragState.current.lastX = event.clientX
        dragState.current.lastY = event.clientY
        setLocalYaw((value) => value - dx * 0.0055)
        setLocalPitch((value) => THREE.MathUtils.clamp(value + dy * 0.0045, -0.42, 0.88))
        if (tutorial === 'look' && dragState.current.moved) setTutorial('language')
      }}
      onPointerUp={() => {
        dragState.current.active = false
      }}
      onPointerLeave={() => {
        dragState.current.active = false
      }}
    >
      <Canvas
        className="orbit-canvas"
        shadows
        dpr={compact ? 1.25 : 1.5}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 3.25, 10.2], fov: 43 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.08
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap
        }}
        onPointerMissed={() => {
          if (dragState.current.moved) return
          onFocus(null)
          if (tutorial === 'room') inspectRoom()
          else if (screenId) returnFromScreen()
          else if (current) onCloseDetail()
        }}
      >
        <color attach="background" args={['#020713']} />
        <fog attach="fog" args={['#020713', 24, 58]} />
        <ambientLight intensity={0.28} color="#d8e9e8" />
        <hemisphereLight args={['#6d88a2', '#5c4c36', 0.95]} />
        <directionalLight
          position={[-5, 7, 4]}
          intensity={1.9}
          color="#fff0cf"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
        />
        <pointLight position={[4, 3, 2]} intensity={16} distance={14} color="#4d8f9f" />
        <pointLight position={[-3, 2.2, 1.4]} intensity={5} distance={7} color="#d5b261" />
        <CameraRig
          focus={focus}
          reducedMotion={reducedMotion}
          screenId={screenId}
          screenFocus={screenFocus}
          cardInspecting={Boolean(selected)}
          previewMode={previewMode}
          viewYaw={localYaw}
          viewPitch={localPitch}
        />
        <DeepSpaceSky />
        <PixelStars />
        <AsteroidBelt3D />
        <ObservatoryFloor />
        <MuseumRoom protectedRoom={protectedRoom} />
        <MosaicGlassTiles />
        <Planet
          name="EARTH"
          position={compact ? [-2.8, 5.2, -14.5] : [-6.8, 3.2, -16.8]}
          color="#17628e"
          accent="#52b8b1"
          scale={compact ? 0.85 : 1.55}
          onFocus={onFocus}
        />
        <Planet
          name="MOON"
          position={compact ? [0, 5.6, -15.5] : [0, 4.4, -17.8]}
          color="#aab3b6"
          accent="#dce6e3"
          scale={compact ? 0.85 : 1.55}
          onFocus={onFocus}
        />
        <Planet
          name="MARS"
          position={compact ? [2.8, 5.2, -14.8] : [7.0, 3.2, -16.8]}
          color="#a84e38"
          accent="#d98558"
          scale={compact ? 0.85 : 1.55}
          onFocus={onFocus}
        />
        <Desk onInspect={inspectRoom} inspectReady={tutorial === 'room'} />
        <WorldScreen3D
          id="event"
          language={language}
          run={run}
          mission={mission}
          course={course}
          focusState={screenFocus}
          activeId={screenId}
          onFocus={onFocusScreen}
        />
        <WorldScreen3D
          id="outpost"
          language={language}
          run={run}
          mission={mission}
          course={course}
          focusState={screenFocus}
          activeId={screenId}
          onFocus={onFocusScreen}
        />
        <WorldScreen3D
          id="field"
          language={language}
          run={run}
          mission={mission}
          course={course}
          focusState={screenFocus}
          activeId={screenId}
          onFocus={onFocusScreen}
        />
        <ResourcePillars3D run={run} language={language} />
        <LanguageDial3D
          language={language}
          onToggle={toggleLanguage}
          focused={languageFocused || tutorial === 'language'}
        />
        <DeskViewArrow3D direction="left" onTurn={() => turn('left')} />
        <DeskViewArrow3D direction="right" onTurn={() => turn('right')} />
        <TutorialBeacon3D
          language={language}
          step={tutorial}
          mission={mission}
          run={run}
          onInspectRoom={inspectRoom}
          onSkip={skipTutorial}
          onReplay={replayTutorial}
        />
        {current && <DetailPlaque3D card={current} language={language} mission={mission} detailState={detailState} />}
        {run.outcome !== 'playing' && (
          <ReplayConsole3D language={language} run={run} mission={mission} onReplay={onReplay} onNewEvent={onNewEvent} />
        )}
        {handCards.map((item, index) => (
          <CardMesh
            key={item.id}
            card={item}
            index={index}
            language={language}
            selected={selected === item.id}
            detailState={detailState}
            hovered={hovered === item.id}
            disabled={played.includes(item.id)}
            animState={playingCardId === item.id ? 'playing' : drawingCardId === item.id ? 'drawing' : 'idle'}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </Canvas>
      {!previewMode && (() => {
        const beat = currentBeat
        const isTyping = typedChars < fullNarratorText.length
        const visibleText = fullNarratorText.slice(0, typedChars)
        const visibleLines = visibleText.split('\n')
        return (
      <>
      <div className="hud-narrator-wrap">
        <div className="hud-pill-bar" aria-label="Glass Orbit HUD">
          <span className="hud-pill-disclaimer">{buildMissionGoalSummary(language, mission, run)}</span>
          <button
            className={`hud-narrator-toggle ${!narratorExpanded ? 'is-collapsed' : ''}`}
            aria-expanded={narratorExpanded}
            aria-label={language === 'zh' ? '展開或收起旁白' : 'Toggle narrator details'}
            onClick={() => setNarratorExpanded((value) => !value)}
          >
            {narratorExpanded
              ? language === 'zh'
                ? 'NOVA 旁白 ▴'
                : 'NOVA Narrator ▴'
              : language === 'zh'
                ? 'NOVA 旁白 ▾'
                : 'NOVA Narrator ▾'}
          </button>
          {tutorial !== 'complete' && tutorial !== 'skipped' ? (
            <>
              <button onClick={nextTutorialStep}>{language === 'zh' ? '下一步' : 'Next'}</button>
              <button onClick={skipTutorial}>{language === 'zh' ? '跳過' : 'Skip'}</button>
            </>
          ) : (
            <button onClick={replayTutorial}>
              ↺ {language === 'zh' ? '重看教學' : 'Tutorial'}
            </button>
          )}
          <button onClick={onNewEvent}>{language === 'zh' ? '換事件' : 'Next Event'}</button>
          <button onClick={resetView}>{language === 'zh' ? '視角回正' : 'Reset View'}</button>
          {onToggleMusic && (
            <button onClick={onToggleMusic}>
              {musicOn ? (language === 'zh' ? '♪ 音樂 開' : '♪ BGM ON') : language === 'zh' ? '♪ 音樂 關' : '♪ BGM OFF'}
            </button>
          )}
          <button onClick={onOpenSource}>{language === 'zh' ? 'NASA 資料來源' : 'NASA Source'}</button>
          <button onClick={onOpenBrief}>{language === 'zh' ? '任務簡介' : 'Brief'}</button>
        </div>
      </div>

      {narratorExpanded && (
        <aside
          className="narrator-float-window"
          role="region"
          aria-label={beat.title}
          style={{
            transform: `translate3d(calc(-50% + ${narratorPos.x}px), ${narratorPos.y}px, 0)`,
          }}
        >
          <div
            className="narrator-drag-bar"
            onPointerDown={startNarratorDrag}
            onPointerMove={moveNarratorDrag}
            onPointerUp={endNarratorDrag}
            onPointerCancel={endNarratorDrag}
            title={language === 'zh' ? '按住拖曳移動旁白視窗' : 'Drag to move narrator window'}
          >
            <span className="narrator-drag-title">
              <span className="narrator-grip" aria-hidden="true">⋮⋮</span>
              <span>{beat.title}</span>
            </span>
            <div className="narrator-win-actions">
              {(narratorPos.x !== 0 || narratorPos.y !== 0) && (
                <button
                  type="button"
                  onClick={() => setNarratorPos({ x: 0, y: 0 })}
                  title={language === 'zh' ? '視窗歸位' : 'Reset position'}
                >
                  {language === 'zh' ? '歸位' : 'Center'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setNarratorExpanded(false)}
                aria-label={language === 'zh' ? '收起旁白' : 'Collapse narrator'}
              >
                {language === 'zh' ? '收起 —' : 'Hide —'}
              </button>
            </div>
          </div>

          <div
            className="narrator-body"
            onClick={() => {
              if (isTyping) setTypedChars(fullNarratorText.length)
            }}
          >
            <p className="hud-narrator-purpose">{mission.purpose[language]}</p>
            <div className="narrator-typewriter-box">
              {visibleLines.map((line, idx) => {
                const isLast = idx === visibleLines.length - 1
                return (
                  <p key={idx} className="hud-narrator-line">
                    {line}
                    {isLast && isTyping && <span className="narrator-cursor" aria-hidden="true">▋</span>}
                  </p>
                )
              })}
            </div>
            <div className="narrator-footer">
              <span className="narrator-how-hint">
                {language === 'zh'
                  ? '玩法：1. 點手牌看說明 → 2. 再點一次出牌 → 3. 5 回合內守住護盾與維生'
                  : 'Play: 1. Tap card to inspect → 2. Tap again to play → 3. Meet Shield & Life in 5 turns'}
              </span>
              <div className="narrator-footer-btns">
                {isTyping && (
                  <button type="button" onClick={() => setTypedChars(fullNarratorText.length)}>
                    {language === 'zh' ? '顯示全文' : 'Reveal all'}
                  </button>
                )}
                {tutorial !== 'complete' && tutorial !== 'skipped' && (
                  <button type="button" className="narrator-next-btn" onClick={nextTutorialStep}>
                    {language === 'zh' ? '下一步 →' : 'Next →'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>
      )}
      <div className="scene-a11y-controls" aria-label="Glass Orbit scene controls">
        <button onClick={() => turn('left')}>Look left</button>
        <button onClick={() => turn('right')}>Look right</button>
        <button onClick={() => turn('up')}>Look up</button>
        <button onClick={() => turn('down')}>Look down</button>
        <button onClick={resetView}>Reset view</button>
        <button
          onFocus={() => setLanguageFocused(true)}
          onBlur={() => setLanguageFocused(false)}
          onClick={toggleLanguage}
        >
          Toggle language
        </button>
        <button onClick={tutorial === 'complete' || tutorial === 'skipped' ? replayTutorial : skipTutorial}>
          {tutorial === 'complete' || tutorial === 'skipped' ? 'Replay tutorial' : 'Skip tutorial'}
        </button>
      </div>
      </>
        )
      })()}
    </div>
  )
}
