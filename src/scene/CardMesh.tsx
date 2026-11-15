import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { makeCardTexture } from './mosaicTextures'
import { MinecraftCardStatusParticles, SacredCardParticles } from './SacredCardParticles'
import type { CardDefinition, CardDetailState, Language } from '../types'

export function CardMesh({
  card,
  index,
  language,
  selected,
  detailState,
  hovered,
  disabled,
  playable = true,
  animState = 'idle',
  perfMode = false,
  onSelect,
  onHover,
}: {
  card: CardDefinition
  index: number
  language: Language
  selected: boolean
  detailState: CardDetailState
  hovered: boolean
  disabled: boolean
  playable?: boolean
  animState?: 'idle' | 'playing' | 'drawing'
  perfMode?: boolean
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}) {
  const ref = useRef<THREE.Group>(null)
  const animClock = useRef(0)
  const prevAnim = useRef(animState)
  const { size } = useThree()
  const compact = size.width < 640
  const tablet = size.width >= 640 && size.width < 1024
  const portraitTablet = tablet && size.width < size.height
  const targetPosition = useMemo(() => new THREE.Vector3(), [])
  const targetScaleVector = useMemo(() => new THREE.Vector3(), [])
  const texture = useMemo(() => makeCardTexture(card, language, selected, disabled), [card, language, selected, disabled])
  useEffect(() => () => texture.dispose(), [texture])

  const row = compact ? Math.floor(index / 3) : 0
  const x = compact ? (index % 3 - 1) * 0.9 : (index - 2.5) * 0.96
  const restingY = compact ? 1.04 + (1 - row) * 0.96 : 0.98
  const baseScale = compact ? 0.85 : 1.08

  useFrame((_, delta) => {
    if (!ref.current) return
    if (prevAnim.current !== animState) {
      prevAnim.current = animState
      animClock.current = 0
    }
    animClock.current += delta

    if (animState === 'playing') {
      const p = Math.min(animClock.current / 0.68, 1)
      targetPosition.set(x, restingY + 0.35 + p * 0.95, 0.95)
      ref.current.position.lerp(targetPosition, 0.28)
      targetScaleVector.setScalar(Math.max(0.001, baseScale * (1 - p * p)))
      ref.current.scale.lerp(targetScaleVector, 0.32)
      ref.current.rotation.y += delta * 5.2
      ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, 0, 0.25)
      return
    }

    if (animState === 'drawing') {
      const p = Math.min(animClock.current / 0.75, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      targetPosition.set(x, restingY + (1 - ease) * 1.15, 0.64)
      ref.current.position.lerp(targetPosition, 0.28)
      targetScaleVector.setScalar(baseScale * (0.28 + ease * 0.72))
      ref.current.scale.lerp(targetScaleVector, 0.28)
      ref.current.rotation.y = (1 - ease) * Math.PI
      ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, (index - 2.5) * 0.02, 0.2)
      return
    }

    const expanded = selected && detailState === 'expanded'
    const moving = selected && detailState === 'moving'
    const lifting = selected && detailState === 'lifting'

    if (expanded)
      targetPosition.set(
        compact || portraitTablet ? 0 : tablet ? -1.16 : -1.55,
        compact ? 2.95 : portraitTablet ? 2.78 : 1.56,
        compact ? 2.28 : 2.48,
      )
    else if (moving) targetPosition.set(x * 0.34, restingY + 0.76, 1.38)
    else if (lifting) targetPosition.set(x, restingY + 0.38, 0.76)
    else targetPosition.set(x, hovered ? restingY + 0.18 : restingY, 0.64)

    const targetScale = expanded
      ? baseScale * (compact ? 0.88 : portraitTablet ? 0.92 : tablet ? 1.02 : 1.24)
      : moving
        ? baseScale * 1.12
        : baseScale
    targetScaleVector.setScalar(targetScale)
    ref.current.position.lerp(targetPosition, expanded ? 0.16 : 0.18)
    ref.current.scale.lerp(targetScaleVector, 0.15)
    ref.current.rotation.z = THREE.MathUtils.lerp(
      ref.current.rotation.z,
      expanded ? 0 : hovered ? (index - 2.5) * 0.012 : (index - 2.5) * 0.02,
      0.14,
    )
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, expanded ? 0.06 : 0, 0.16)
  })

  return (
    <>
      {animState === 'playing' && <SacredCardParticles key={`out-${card.id}`} mode="out" origin={[x, restingY + 0.35, 0.85]} />}
      {animState === 'drawing' && <SacredCardParticles key={`in-${card.id}`} mode="in" origin={[x, restingY + 0.25, 0.7]} />}
      <group
        ref={ref}
        position={[x, restingY, 0.64]}
        scale={[baseScale, baseScale, baseScale]}
        rotation={[0, 0, (index - 2.5) * 0.02]}
        onPointerOver={(event) => {
          event.stopPropagation()
          onHover(card.id)
        }}
        onPointerOut={() => onHover(null)}
        onClick={(event) => {
          event.stopPropagation()
          if (!disabled && animState === 'idle') onSelect(card.id)
        }}
      >
        {animState === 'idle' && !perfMode && <MinecraftCardStatusParticles playable={playable && !disabled} />}
        <mesh castShadow>
          <boxGeometry args={[0.88, 1.2, 0.11]} />
          <meshStandardMaterial
            color={disabled ? '#2b2b2b' : '#181818'}
            emissive={animState !== 'idle' || selected ? '#ffffff' : hovered && !disabled ? '#666666' : '#000000'}
            emissiveIntensity={animState !== 'idle' ? 0.85 : selected ? 0.25 : hovered && !disabled ? 0.2 : 0}
            metalness={0.55}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, 0.59, 0]}>
          <boxGeometry args={[0.88, 0.03, 0.12]} />
          <meshStandardMaterial color={disabled ? '#555555' : '#ffffff'} metalness={0.4} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.064]}>
          <planeGeometry args={[0.78, 1.09]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.064]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.78, 1.09]} />
          <meshStandardMaterial color={disabled ? '#222222' : '#121212'} metalness={0.45} roughness={0.45} />
        </mesh>
      </group>
    </>
  )
}
