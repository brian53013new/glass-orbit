import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { makeScreenTexture } from './mosaicTextures'
import type { MicroCourse } from '../data/micro-courses'
import type { Language, MissionEvent, RunState, ScreenFocusState, ScreenId } from '../types'

export function WorldScreen3D({
  id,
  language,
  run,
  mission,
  course,
  focusState,
  activeId,
  onFocus,
}: {
  id: ScreenId
  language: Language
  run: RunState
  mission: MissionEvent
  course: MicroCourse
  focusState: ScreenFocusState
  activeId: ScreenId | null
  onFocus: (id: ScreenId) => void
}) {
  const config =
    id === 'event'
      ? {
          position: [-3.25, 2.1, -1.48] as [number, number, number],
          rotation: [0, 0.34, 0] as [number, number, number],
          scale: 0.52,
          accent: '#80b4c8',
          icon: '◉',
          title: language === 'zh' ? '地球／通訊' : 'EARTH / COMMS',
          summary:
            language === 'zh'
              ? [`通訊 ${run.comms} · 證據 ${run.evidence}`, '點擊查看任務線索。']
              : [`COMMS ${run.comms} · EVIDENCE ${run.evidence}`, 'Tap for the mission clue.'],
          detail:
            language === 'zh'
              ? [
                  course.clue.zh,
                  `記錄來源：${course.sourceRefs[0]}`,
                  `選擇：${course.choices[0].label.zh} 或 ${course.choices[1].label.zh}`,
                  '資源點是教育模型。',
                ]
              : [
                  course.clue.en,
                  `SOURCE: ${course.sourceRefs[0]}`,
                  `CHOICE: ${course.choices[0].label.en} / ${course.choices[1].label.en}`,
                  'Resource values are a learning model.',
                ],
        }
      : id === 'outpost'
        ? {
            position: [0, 2.55, -2.06] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: 0.58,
            accent: '#5aa7a4',
            icon: '⌂',
            title: language === 'zh' ? '月球／目前任務' : 'MOON / MISSION',
            summary:
              language === 'zh'
                ? [mission.title.zh, `${mission.speed} km/s · 護盾≥${mission.shieldTarget} 維生≥${mission.lifeTarget}`]
                : [mission.title.en, `${mission.speed} km/s · SHD≥${mission.shieldTarget} LIFE≥${mission.lifeTarget}`],
            detail:
              language === 'zh'
                ? [
                    mission.purpose.zh,
                    `DONKI CME · ${mission.record.startTime}（${mission.speed} km/s）`,
                    `目標：護盾 ${run.resources.shield}/${mission.shieldTarget} · 維生 ${run.resources.lifeSupport}/${mission.lifeTarget}`,
                    `證據 ${run.evidence}/${mission.evidenceTarget} · 通訊 ${run.comms}/${mission.commsTarget}`,
                  ]
                : [
                    mission.purpose.en,
                    `DONKI CME · ${mission.record.startTime} (${mission.speed} km/s)`,
                    `Goal: Shield ${run.resources.shield}/${mission.shieldTarget} · Life ${run.resources.lifeSupport}/${mission.lifeTarget}`,
                    `Evid ${run.evidence}/${mission.evidenceTarget} · Comms ${run.comms}/${mission.commsTarget}`,
                  ],
          }
        : {
            position: [3.25, 2.1, -1.48] as [number, number, number],
            rotation: [0, -0.34, 0] as [number, number, number],
            scale: 0.52,
            accent: '#c86e5c',
            icon: '◇',
            title: language === 'zh' ? '火星／思考課程' : 'MARS / THINK LAB',
            summary:
              language === 'zh'
                ? [course.learningGoal.zh, '點擊看兩個可重玩的選擇。']
                : [course.learningGoal.en, 'Tap for two replayable choices.'],
            detail:
              language === 'zh'
                ? [
                    `${course.choices[0].label.zh}：${course.choices[0].effect.zh}`,
                    `${course.choices[1].label.zh}：${course.choices[1].effect.zh}`,
                    `反思：${course.reflectionPrompt.zh}`,
                    `已出牌 ${run.played.length}/12 張卡`,
                  ]
                : [
                    `${course.choices[0].label.en}: ${course.choices[0].effect.en}`,
                    `${course.choices[1].label.en}: ${course.choices[1].effect.en}`,
                    `REFLECT: ${course.reflectionPrompt.en}`,
                    `ARCHIVED ${run.played.length}/8 CARDS`,
                  ],
          }

  const focused = focusState === 'focused' && activeId === id
  const targeting = activeId === id && focusState !== 'overview'
  const contentKey = `${config.title}\u0000${config.icon}\u0000${config.summary.join('\u0000')}\u0000${config.detail.join('\u0000')}\u0000${focused}\u0000${config.accent}`

  const texture = useMemo(
    () => makeScreenTexture(config.title, config.icon, config.summary, config.detail, focused, config.accent),
    [contentKey],
  )
  useEffect(() => () => texture.dispose(), [texture])

  const nasaImagePath = id === 'event' ? '/nasa/earth.jpg' : id === 'outpost' ? '/nasa/cme.jpg' : '/nasa/mars.jpg'
  const [nasaPhoto, setNasaPhoto] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    let active = true
    const loader = new THREE.TextureLoader()
    loader.load(nasaImagePath, (tex) => {
      if (!active) {
        tex.dispose()
        return
      }
      tex.colorSpace = THREE.SRGBColorSpace
      setNasaPhoto(tex)
    })
    return () => {
      active = false
    }
  }, [nasaImagePath])
  useEffect(() => () => nasaPhoto?.dispose(), [nasaPhoto])

  const floorLocalY = (-0.32 - config.position[1]) / config.scale
  const standTopY = -1.55
  const standHeight = standTopY - floorLocalY

  return (
    <group
      position={config.position}
      rotation={config.rotation}
      scale={[config.scale, config.scale, config.scale]}
      onClick={(event) => {
        event.stopPropagation()
        onFocus(id)
      }}
    >
      {/* Sleek monochrome aerospace monitor chassis */}
      <mesh castShadow receiveShadow position={[0, 0, -0.1]}>
        <boxGeometry args={[4.26, 3.22, 0.22]} />
        <meshPhysicalMaterial
          color="#161616"
          metalness={0.68}
          roughness={0.28}
          clearcoat={0.45}
          clearcoatRoughness={0.18}
          emissive={targeting ? '#ffffff' : '#080808'}
          emissiveIntensity={targeting ? 0.16 : 0.05}
        />
      </mesh>
      {/* Inner recessed dark bezel */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[4.02, 2.98, 0.06]} />
        <meshStandardMaterial color="#090909" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Top & bottom monochrome accent strips */}
      <mesh position={[0, 1.54, 0.03]}>
        <boxGeometry args={[3.9, 0.045, 0.06]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={targeting ? 0.85 : 0.35} />
      </mesh>
      <mesh position={[0, -1.54, 0.03]}>
        <boxGeometry args={[3.9, 0.045, 0.06]} />
        <meshStandardMaterial color="#999999" emissive="#666666" emissiveIntensity={0.25} />
      </mesh>
      {/* Top sensor / camera module */}
      <mesh position={[0, 1.66, -0.02]}>
        <boxGeometry args={[0.72, 0.14, 0.18]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[3.78, 2.82]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {nasaPhoto && (
        <group position={[1.14, -0.06, 0.085]}>
          <mesh position={[0, 0, -0.004]}>
            <planeGeometry args={[1.18, 1.18]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh>
            <planeGeometry args={[1.1, 1.1]} />
            <meshBasicMaterial map={nasaPhoto} toneMapped={false} />
          </mesh>
        </group>
      )}
      <mesh position={[0, 0, 0.095]}>
        <planeGeometry args={[3.8, 2.84]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.03} roughness={0.08} metalness={0.25} />
      </mesh>

      {/* Rear VESA mount neck + grounded dual-strut column reaching all the way to the floor */}
      <mesh castShadow position={[0, -1.2, -0.24]}>
        <boxGeometry args={[0.72, 0.9, 0.18]} />
        <meshStandardMaterial color="#1f1f1f" metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh castShadow position={[-0.22, floorLocalY + standHeight / 2, -0.26]}>
        <boxGeometry args={[0.16, standHeight, 0.18]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh castShadow position={[0.22, floorLocalY + standHeight / 2, -0.26]}>
        <boxGeometry args={[0.16, standHeight, 0.18]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh receiveShadow castShadow position={[0, floorLocalY + 0.06, -0.18]}>
        <boxGeometry args={[2.1, 0.12, 1.1]} />
        <meshStandardMaterial color="#181818" metalness={0.7} roughness={0.34} />
      </mesh>
      <mesh position={[0, -1.54, 0.06]}>
        <boxGeometry args={[0.22, 0.08, 0.08]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={targeting ? 0.9 : 0.4}
        />
      </mesh>
    </group>
  )
}
