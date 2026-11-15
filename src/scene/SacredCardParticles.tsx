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
 * Fine Minecraft-style multi-tone pixel motes floating around each card:
 * delicate emerald shimmer when playable, fine redstone dust when unplayable.
 */
export function MinecraftCardStatusParticles({ playable }: { playable: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const clock = useRef(0)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const color = useMemo(() => new THREE.Color(), [])

  const cubes = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => {
        const side = i % 4 // 0: left edge, 1: right edge, 2: top edge, 3: bottom/corner shimmer
        const baseX =
          side === 0
            ? -0.45 - (i % 3) * 0.03
            : side === 1
              ? 0.45 + (i % 3) * 0.03
              : ((i % 7) - 3) * 0.14
        return {
          side,
          baseX,
          phase: (i / 34) * 1.0,
          speed: 0.28 + (i % 5) * 0.09,
          size: 0.015 + (i % 4) * 0.0045,
          z: 0.04 + (i % 4) * 0.028,
          wobble: (i % 2 === 0 ? 1 : -1) * (0.018 + (i % 3) * 0.008),
          driftOut: (side === 0 ? -1 : side === 1 ? 1 : ((i % 3) - 1) * 0.5) * 0.05,
          tone: i % 4,
          spin: (i % 3) * 0.7,
        }
      }),
    [],
  )

  useFrame((_, delta) => {
    if (!meshRef.current) return
    clock.current += delta
    const palette = playable
      ? ['#2ee87c', '#7bffb3', '#b8ffd6', '#18c964']
      : ['#ff384c', '#ff7a85', '#ffb3ba', '#d92136']

    for (let i = 0; i < cubes.length; i += 1) {
      const c = cubes[i]
      const t = (clock.current * c.speed + c.phase) % 1
      const fade = Math.pow(Math.sin(t * Math.PI), 1.3)
      const px = c.baseX + Math.sin(clock.current * 2.1 + i * 1.3) * c.wobble + t * c.driftOut
      const py =
        c.side === 2
          ? 0.61 + t * 0.42
          : c.side === 3
            ? -0.58 + t * 0.48
            : -0.52 + t * 1.24
      dummy.position.set(px, py, c.z + Math.cos(clock.current * 1.8 + i) * 0.015)
      dummy.rotation.set(c.spin * t, c.spin * 0.5, 0)
      dummy.scale.setScalar(Math.max(0.001, c.size * (0.25 + fade * 1.05)))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)

      color.set(palette[c.tone])
      meshRef.current.setColorAt(i, color)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 34]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial vertexColors transparent opacity={0.88} toneMapped={false} />
    </instancedMesh>
  )
}
