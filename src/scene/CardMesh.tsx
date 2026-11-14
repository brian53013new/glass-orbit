import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { makeCardTexture } from './mosaicTextures'
import type { CardDefinition, CardDetailState, Language } from '../types'

export function CardMesh({
  card,
  index,
  language,
  selected,
  detailState,
  hovered,
  disabled,
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
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}) {
  const ref = useRef<THREE.Group>(null)
  const { size } = useThree()
  const compact = size.width < 640
  const targetPosition = useMemo(() => new THREE.Vector3(), [])
  const targetScaleVector = useMemo(() => new THREE.Vector3(), [])
  const texture = useMemo(() => makeCardTexture(card, language, selected, disabled), [card, language, selected, disabled])
  useEffect(() => () => texture.dispose(), [texture])

  const row = compact ? Math.floor(index / 3) : 0
  const x = compact ? (index % 3 - 1) * 0.9 : (index - 2.5) * 0.96
  const restingY = compact ? 1.04 + (1 - row) * 0.96 : 0.98
  const baseScale = compact ? 0.85 : 1.08

  useFrame(() => {
    if (!ref.current) return
    const expanded = selected && detailState === 'expanded'
    const moving = selected && detailState === 'moving'
    const lifting = selected && detailState === 'lifting'

    if (expanded) targetPosition.set(compact ? -0.68 : -1.55, compact ? 1.85 : 1.56, compact ? 2.2 : 2.48)
    else if (moving) targetPosition.set(x * 0.34, restingY + 0.76, 1.38)
    else if (lifting) targetPosition.set(x, restingY + 0.38, 0.76)
    else targetPosition.set(x, hovered ? restingY + 0.18 : restingY, 0.64)

    const targetScale = expanded ? baseScale * (compact ? 1.12 : 1.24) : moving ? baseScale * 1.12 : baseScale
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
        if (!disabled) onSelect(card.id)
      }}
    >
      <mesh castShadow>
        <boxGeometry args={[0.88, 1.2, 0.11]} />
        <meshStandardMaterial
          color={disabled ? '#2b2b2b' : '#181818'}
          emissive={selected ? '#ffffff' : hovered && !disabled ? '#666666' : '#000000'}
          emissiveIntensity={selected ? 0.25 : hovered && !disabled ? 0.2 : 0}
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
  )
}
