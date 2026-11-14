import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import { resources, type CardDefinition, type CardDetailState, type Language, type MissionEvent, type ResourceKey, type RunState, type TutorialStep } from '../types'
import { buildNarratorBeat } from '../game/narrator'
import { makeDetailStripTexture, makeDialLabelTexture, makePillarLabelTexture, makeTutorialTexture, makeWorldPanelTexture } from './mosaicTextures'

export function Desk({ onInspect, inspectReady }: { onInspect: () => void; inspectReady: boolean }) {
  const inlay = useMemo(
    () =>
      Array.from({ length: 20 }, (_, index) => ({
        x: -4.05 + (index % 10) * 0.9,
        z: index < 10 ? -1.78 : 1.78,
      })),
    [],
  )
  return (
    <group
      onClick={(event) => {
        if (!inspectReady) return
        event.stopPropagation()
        onInspect()
      }}
    >
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[9.8, 0.56, 4.6]} />
        <meshStandardMaterial color="#1f1f1f" metalness={0.62} roughness={0.38} />
      </mesh>
      <mesh receiveShadow position={[0, 0.31, 0]}>
        <boxGeometry args={[9.44, 0.08, 4.19]} />
        <meshPhysicalMaterial color="#e6e6e6" roughness={0.5} clearcoat={0.18} />
      </mesh>
      <mesh position={[0, 0.38, -1.55]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[3.4, 0.08, 1.25]} />
        <meshPhysicalMaterial
          color="#d4d4d4"
          emissive={inspectReady ? '#ffffff' : '#888888'}
          emissiveIntensity={inspectReady ? 0.5 : 0.16}
          metalness={0.15}
          roughness={0.32}
          clearcoat={0.28}
        />
      </mesh>
      <mesh position={[0, 0.39, 0.02]}>
        <boxGeometry args={[6.8, 0.025, 0.04]} />
        <meshStandardMaterial color="#666666" metalness={0.65} roughness={0.3} />
      </mesh>
      {inlay.map((tile, index) => (
        <mesh key={index} position={[tile.x, 0.38, tile.z]}>
          <boxGeometry args={[0.48, 0.026, 0.06]} />
          <meshStandardMaterial
            color={index % 3 === 0 ? '#ffffff' : '#777777'}
            emissive={inspectReady && index % 3 === 0 ? '#ffffff' : '#000000'}
            emissiveIntensity={inspectReady ? 0.25 : 0}
          />
        </mesh>
      ))}
    </group>
  )
}

export function DetailPlaque3D({
  card,
  language,
  mission,
  detailState,
}: {
  card: CardDefinition
  language: Language
  mission: MissionEvent
  detailState: CardDetailState
}) {
  const { size } = useThree()
  const compact = size.width < 640
  const texture = useMemo(() => makeDetailStripTexture(card, language, mission), [card, language, mission])
  useEffect(() => () => texture.dispose(), [texture])
  const visible = detailState === 'moving' || detailState === 'expanded'
  return (
    <group
      visible={visible}
      position={compact ? [0.68, 1.85, 2.22] : [1.22, 1.56, 2.48]}
      rotation={[0, -0.06, 0]}
      scale={compact ? [0.46, 0.46, 0.46] : [0.82, 0.82, 0.82]}
    >
      <mesh castShadow>
        <boxGeometry args={[3.5, 2.52, 0.14]} />
        <meshPhysicalMaterial color="#141414" metalness={0.54} roughness={0.28} clearcoat={0.42} />
      </mesh>
      <mesh position={[0, 0, 0.085]}>
        <planeGeometry args={[3.32, 2.34]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function ReplayConsole3D({
  language,
  run,
  mission,
  onReplay,
  onNewEvent,
}: {
  language: Language
  run: RunState
  mission: MissionEvent
  onReplay: () => void
  onNewEvent: () => void
}) {
  const { size } = useThree()
  const compact = size.width < 640
  const reflection =
    run.outcome === 'success'
      ? run.evidence === 0
        ? language === 'zh'
          ? '反思：基地安全！但未收集科學證據，下次試試「觀測」與「CME 預報」提前預警。'
          : 'Reflect: Base safe! Next run, try Solar Window or CME Forecast to gather evidence.'
        : language === 'zh'
          ? '反思：完美工程取捨！你在有限電力下兼顧了護盾、維生與科學觀測。'
          : 'Reflect: Great trade-offs! You balanced Shield, Life Support & Science under power limits.'
      : run.resources.shield < mission.shieldTarget
        ? language === 'zh'
          ? `反思：此 NASA 風暴速度 ${mission.speed} km/s 需護盾 ${mission.shieldTarget} 格！下次先用儲能或水牆屏蔽。`
          : `Reflect: This ${mission.speed} km/s CME needed Shield ${mission.shieldTarget}! Try Reserve or Water Wall.`
        : run.resources.lifeSupport < mission.lifeTarget
          ? language === 'zh'
            ? `反思：本任務維生系統需 ≥${mission.lifeTarget} 格才算穩定！保護護盾時別忘了保留電力給氧氣與飲水。`
            : `Reflect: This mission needed Life Support ≥${mission.lifeTarget}! Save power for air and water.`
          : language === 'zh'
            ? '反思：護盾與維生已撐住，但還差科學證據或深空通訊目標！下次試試觀測窗或對準天線。'
            : 'Reflect: Base held, but Science Evidence or Comms target fell short! Try Solar Window or Antenna.'

  const heading =
    run.outcome === 'success'
      ? language === 'zh'
        ? '任務成功｜NASA 基地安全'
        : 'MISSION SUCCESS | BASE SAFE'
      : run.outcome === 'partial'
        ? language === 'zh'
          ? '部分達成｜仍需調整取捨'
          : 'PARTIAL | ADJUST TRADE-OFFS'
        : language === 'zh'
          ? '防護不足｜請檢視反思重試'
          : 'BREACH | REVIEW & RETRY'

  const texture = useMemo(
    () =>
      makeWorldPanelTexture(heading, [
        language === 'zh'
          ? `結果：護盾 ◇ ${run.resources.shield}/${mission.shieldTarget} · 維生 ◌ ${run.resources.lifeSupport}/${mission.lifeTarget} · 證據 ◈ ${run.evidence}/${mission.evidenceTarget}`
          : `Result: Shield ◇ ${run.resources.shield}/${mission.shieldTarget} · Life ◌ ${run.resources.lifeSupport}/${mission.lifeTarget} · Evid ◈ ${run.evidence}/${mission.evidenceTarget}`,
        reflection,
        language === 'zh'
          ? '左白鈕：同事件重抽牌組 ｜ 右灰鈕：切換下一筆 NASA 事件'
          : 'Left White: Replay & Reshuffle | Right Grey: Next NASA Event',
      ]),
    [heading, language, run, mission, reflection],
  )
  useEffect(() => () => texture.dispose(), [texture])
  const position: [number, number, number] = compact ? [0, 3.5, -1.4] : [0, 1.68, 1.15]
  return (
    <group position={position} scale={compact ? [0.62, 0.62, 0.62] : [0.96, 0.96, 0.96]}>
      <mesh>
        <boxGeometry args={[4.8, 3.0, 0.18]} />
        <meshStandardMaterial color="#141414" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.24, 0.11]}>
        <planeGeometry args={[4.45, 2.25]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <group
        position={[-1.08, -1.04, 0.16]}
        onClick={(event) => {
          event.stopPropagation()
          onReplay()
        }}
      >
        <mesh>
          <boxGeometry args={[1.7, 0.42, 0.18]} />
          <meshStandardMaterial color="#e0e0e0" emissive="#ffffff" emissiveIntensity={0.25} />
        </mesh>
      </group>
      <group
        position={[1.08, -1.04, 0.16]}
        onClick={(event) => {
          event.stopPropagation()
          onNewEvent()
        }}
      >
        <mesh>
          <boxGeometry args={[1.7, 0.42, 0.18]} />
          <meshStandardMaterial color="#666666" emissive="#999999" emissiveIntensity={0.25} />
        </mesh>
      </group>
    </group>
  )
}

export function ResourcePillars3D({ run, language }: { run: RunState; language: Language }) {
  const items = Object.keys(resources) as ResourceKey[]
  const labelTex = useMemo(() => makePillarLabelTexture(language), [language])
  useEffect(() => () => labelTex.dispose(), [labelTex])

  return (
    <group position={[6.5, 0.42, -2.9]} rotation={[0, -0.52, 0]}>
      {/* Distant round side-table at front-right across the observatory floor */}
      {/* Dedicated round side-table top + white rim + pedestal column + floor base */}
      <mesh receiveShadow castShadow position={[0, -0.06, 0]}>
        <cylinderGeometry args={[1.28, 1.34, 0.12, 36]} />
        <meshStandardMaterial color="#181818" metalness={0.58} roughness={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <torusGeometry args={[1.29, 0.03, 10, 48]} />
        <meshStandardMaterial color="#ffffff" metalness={0.4} roughness={0.25} />
      </mesh>
      <mesh castShadow position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.2, 0.28, 0.68, 24]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh receiveShadow position={[0, -0.72, 0]}>
        <cylinderGeometry args={[0.72, 0.78, 0.08, 32]} />
        <meshStandardMaterial color="#141414" metalness={0.62} roughness={0.35} />
      </mesh>

      {/* Angled front nameplate on the round table */}
      <mesh position={[0, 0.16, 0.84]} rotation={[-0.42, 0, 0]}>
        <planeGeometry args={[1.66, 0.34]} />
        <meshBasicMaterial map={labelTex} toneMapped={false} />
      </mesh>

      {/* Three resource pillars in vivid functional colors */}
      {items.map((key, index) => {
        const tone = key === 'power' ? '#ffd166' : key === 'lifeSupport' ? '#64dfdf' : '#ff7b61'
        return (
          <group key={key} position={[index * 0.56 - 0.56, 0.12, -0.08]}>
            {Array.from({ length: 6 }, (_, block) => {
              const active = block < run.resources[key]
              return (
                <mesh key={block} castShadow position={[0, block * 0.24, 0]}>
                  <boxGeometry args={[0.36, 0.2, 0.36]} />
                  <meshStandardMaterial
                    color={active ? tone : '#222222'}
                    emissive={active ? tone : '#000000'}
                    emissiveIntensity={active ? 0.52 : 0}
                    metalness={0.22}
                    roughness={0.36}
                  />
                </mesh>
              )
            })}
          </group>
        )
      })}
    </group>
  )
}

export function LanguageDial3D({
  language,
  onToggle,
  focused,
}: {
  language: Language
  onToggle: () => void
  focused: boolean
}) {
  const [pressed, setPressed] = useState(false)
  const dial = useRef<THREE.Group>(null)
  const label = useMemo(() => makeDialLabelTexture(language), [language])
  useEffect(() => () => label.dispose(), [label])

  useEffect(() => {
    if (!pressed) return
    const timer = window.setTimeout(() => setPressed(false), 180)
    return () => window.clearTimeout(timer)
  }, [pressed])

  useFrame(() => {
    if (dial.current) dial.current.position.y = THREE.MathUtils.lerp(dial.current.position.y, pressed ? 0.12 : 0.22, 0.26)
  })

  return (
    <group
      position={[4.05, 0.39, 1.52]}
      rotation={[0, -0.22, 0]}
      scale={[0.72, 0.72, 0.72]}
      onClick={(event) => {
        event.stopPropagation()
        setPressed(true)
        onToggle()
      }}
    >
      <mesh castShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.62, 0.7, 0.12, 20]} />
        <meshStandardMaterial color="#242424" metalness={0.68} roughness={0.3} />
      </mesh>
      <group ref={dial} position={[0, 0.22, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.46, 0.49, 0.18, 16]} />
          <meshPhysicalMaterial color="#d8d8d8" metalness={0.65} roughness={0.22} clearcoat={0.35} />
        </mesh>
        <mesh position={[language === 'en' ? -0.19 : 0.19, 0.11, 0]}>
          <boxGeometry args={[0.11, 0.04, 0.38]} />
          <meshStandardMaterial
            color="#111111"
            emissive="#ffffff"
            emissiveIntensity={focused || pressed ? 1.0 : 0.35}
          />
        </mesh>
      </group>
      <mesh position={[0, 0.72, -0.32]} rotation={[-0.24, 0, 0]}>
        <planeGeometry args={[1.48, 0.46]} />
        <meshBasicMaterial map={label} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.045, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.82, 20]} />
        <meshBasicMaterial color={focused ? '#ffffff' : '#111111'} transparent opacity={focused ? 0.35 : 0.22} />
      </mesh>
    </group>
  )
}

export function DeskViewArrow3D({
  direction,
  disabled = false,
  onTurn,
}: {
  direction: 'left' | 'right'
  disabled?: boolean
  onTurn: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const cap = useRef<THREE.Group>(null)
  const x = direction === 'left' ? -4.42 : 4.42

  useEffect(() => {
    if (!pressed) return
    const timer = window.setTimeout(() => setPressed(false), 160)
    return () => window.clearTimeout(timer)
  }, [pressed])

  useFrame(() => {
    if (cap.current) {
      cap.current.position.y = THREE.MathUtils.lerp(cap.current.position.y, pressed ? 0.05 : hovered ? 0.14 : 0.11, 0.25)
    }
  })

  return (
    <group
      position={[x, 0.41, 1.96]}
      rotation={[0, direction === 'left' ? 0.22 : -0.22, 0]}
      scale={[0.88, 0.88, 0.88]}
      onPointerOver={(event) => {
        event.stopPropagation()
        if (!disabled) setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(event) => {
        event.stopPropagation()
        if (disabled) return
        setPressed(true)
        onTurn()
      }}
    >
      <mesh castShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.14, 6]} />
        <meshStandardMaterial color="#1e1e1e" metalness={0.72} roughness={0.32} />
      </mesh>
      <group ref={cap} position={[0, 0.11, 0]}>
        <mesh position={[0, 0.02, 0]} rotation={[0, 0, direction === 'left' ? Math.PI / 2 : -Math.PI / 2]}>
          <coneGeometry args={[0.18, 0.32, 3]} />
          <meshStandardMaterial
            color={disabled ? '#4a4a4a' : hovered ? '#ffffff' : '#cccccc'}
            emissive={disabled ? '#000000' : '#ffffff'}
            emissiveIntensity={disabled ? 0 : hovered || pressed ? 0.95 : 0.45}
          />
        </mesh>
      </group>
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.36, 0.43, 6]} />
        <meshBasicMaterial
          color={hovered && !disabled ? '#ffffff' : '#888888'}
          transparent
          opacity={disabled ? 0.12 : hovered ? 0.65 : 0.25}
        />
      </mesh>
    </group>
  )
}

export function TutorialBeacon3D({
  language,
  step,
  mission,
  run,
  onInspectRoom,
  onSkip,
  onReplay,
}: {
  language: Language
  step: TutorialStep
  mission: MissionEvent
  run: RunState
  onInspectRoom: () => void
  onSkip: () => void
  onReplay: () => void
}) {
  const current = buildNarratorBeat(language, step, mission, run)
  const texture = useMemo(() => makeTutorialTexture(language, current.title, current.lines), [language, current.title, current.lines])
  useEffect(() => () => texture.dispose(), [texture])

  const handleMain = () => {
    if (step === 'complete' || step === 'skipped') onReplay()
    else onInspectRoom()
  }

  return (
    <group
      position={[-4.06, 0.78, 1.38]}
      rotation={[0, 0.24, 0]}
      scale={[0.26, 0.26, 0.26]}
      onClick={(event) => {
        event.stopPropagation()
        handleMain()
      }}
    >
      <mesh castShadow>
        <boxGeometry args={[4.42, 3.08, 0.2]} />
        <meshPhysicalMaterial color="#181818" metalness={0.58} roughness={0.26} clearcoat={0.45} />
      </mesh>
      <mesh position={[0, 0, 0.115]}>
        <planeGeometry args={[4.08, 2.7]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <group
        position={[1.48, -1.08, 0.21]}
        onClick={(event) => {
          event.stopPropagation()
          if (step === 'complete' || step === 'skipped') onReplay()
          else onSkip()
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.88, 0.32, 0.18]} />
          <meshStandardMaterial color="#ffffff" emissive="#cccccc" emissiveIntensity={0.22} />
        </mesh>
      </group>
    </group>
  )
}
