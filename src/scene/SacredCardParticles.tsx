import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'

type ParticleSeed = {
  angle: number
  radius: number
  height: number
  speed: number
  size: number
  gold: boolean
}

/**
 * Sacred crystalline light-mote burst for card play (dissolve upward)
 * and card draw (converge downward onto the desk slot).
 */
export function SacredCardParticles({
  mode,
  origin,
}: {
  mode: 'out' | 'in'
  origin: [number, number, number]
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const elapsed = useRef(0)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const seeds = useMemo<ParticleSeed[]>(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        angle: (i / 36) * Math.PI * 2 + (i % 3) * 0.2,
        radius: 0.35 + (i % 7) * 0.14,
        height: ((i % 9) - 4) * 0.16,
        speed: 1.4 + (i % 5) * 0.35,
        size: 0.028 + (i % 4) * 0.012,
        gold: i % 3 === 0,
      })),
    [],
  )

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const duration = mode === 'out' ? 0.68 : 0.75
    elapsed.current = Math.min(elapsed.current + delta, duration)
    const p = elapsed.current / duration

    const color = new THREE.Color()
    for (let i = 0; i < seeds.length; i += 1) {
      const s = seeds[i]
      // 'out': spiral outward & ascend; 'in': spiral inward & descend onto desk
      const radial = mode === 'out' ? s.radius * (0.3 + p * 1.45) : s.radius * (1.55 - p * 1.35)
      const spin = s.angle + p * s.speed * Math.PI * (mode === 'out' ? 1.3 : -1.3)
      const yOffset = mode === 'out' ? s.height * (1 - p * 0.4) + p * 1.15 : s.height + (1 - p) * 1.05
      const fade = Math.sin(p * Math.PI) // smooth 0 -> 1 -> 0 sacred pulse

      dummy.position.set(
        origin[0] + Math.cos(spin) * radial,
        origin[1] + yOffset,
        origin[2] + Math.sin(spin) * radial * 0.6,
      )
      dummy.rotation.set(spin, spin * 0.7, p * 3.0)
      dummy.scale.setScalar(Math.max(0.001, s.size * (0.4 + fade * 1.35)))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)

      color.set(s.gold ? '#fff0b8' : '#ffffff')
      meshRef.current.setColorAt(i, color)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 36]}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial vertexColors transparent opacity={0.92} toneMapped={false} />
    </instancedMesh>
  )
}

/**
 * Minecraft-style square pixel cubes floating around each card:
 * bright emerald green when playable, redstone red when blocked/unplayable.
 */
export function MinecraftCardStatusParticles({ playable }: { playable: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const clock = useRef(0)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const cubes = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        const side = i % 4 // 0: left, 1: right, 2: top, 3: front-lower
        const baseX =
          side === 0 ? -0.49 : side === 1 ? 0.49 : ((i % 5) - 2) * 0.21
        return {
          side,
          baseX,
          phase: (i / 20) * 1.0,
          speed: 0.45 + (i % 4) * 0.14,
          size: 0.042 + (i % 3) * 0.012,
          z: side === 3 ? 0.12 : 0.07 + (i % 3) * 0.035,
          wobble: (i % 2 === 0 ? 1 : -1) * 0.035,
        }
      }),
    [],
  )

  useFrame((_, delta) => {
    if (!meshRef.current) return
    clock.current += delta
    for (let i = 0; i < cubes.length; i += 1) {
      const c = cubes[i]
      const t = (clock.current * c.speed + c.phase) % 1
      const fade = Math.sin(t * Math.PI)
      const px = c.baseX + Math.sin(clock.current * 2.6 + i) * c.wobble
      const py = c.side === 2 ? 0.62 + t * 0.38 : -0.54 + t * 1.22
      dummy.position.set(px, py, c.z)
      dummy.rotation.set(0, 0, 0) // crisp axis-aligned Minecraft pixel cubes
      dummy.scale.setScalar(Math.max(0.001, c.size * (0.45 + fade * 0.9)))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 20]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color={playable ? '#3dff8b' : '#ff4757'}
        transparent
        opacity={0.92}
        toneMapped={false}
      />
    </instancedMesh>
  )
}
