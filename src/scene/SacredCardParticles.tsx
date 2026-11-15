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
