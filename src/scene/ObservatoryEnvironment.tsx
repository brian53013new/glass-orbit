import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import type { PlanetName, ScreenFocusState, ScreenId } from '../types'

export const PLANET_LAYOUT: Record<
  PlanetName,
  { pos: [number, number, number]; cam: [number, number, number]; radius: number; tilt: number; texture: string; color: string; accent: string }
> = {
  EARTH: {
    pos: [-17.5, 3.0, 2.0],
    cam: [-9.2, 2.8, 1.2],
    radius: 2.1,
    tilt: 0.409, // 23.4° axial tilt
    texture: `${import.meta.env.BASE_URL}nasa/earth.jpg`,
    color: '#1b6ca8',
    accent: '#63d2ff',
  },
  MOON: {
    pos: [-15.0, 3.9, 5.6],
    cam: [-8.5, 3.4, 3.2],
    radius: 0.58,
    tilt: 0.116, // 6.7°
    texture: `${import.meta.env.BASE_URL}nasa/moon.jpg`,
    color: '#b8bec2',
    accent: '#e5ecea',
  },
  MARS: {
    pos: [4.5, 3.8, 21.0],
    cam: [2.4, 3.1, 10.5],
    radius: 1.15, // ~0.55x Earth
    tilt: 0.44, // 25.2° axial tilt
    texture: `${import.meta.env.BASE_URL}nasa/mars.jpg`,
    color: '#b85438',
    accent: '#ff9668',
  },
}

export function CameraRig({
  focus,
  reducedMotion,
  screenId,
  screenFocus,
  cardInspecting,
  previewMode,
  viewYaw,
  viewPitch,
}: {
  focus: PlanetName | null
  reducedMotion: boolean
  screenId: ScreenId | null
  screenFocus: ScreenFocusState
  cardInspecting: boolean
  previewMode?: boolean
  viewYaw: number
  viewPitch: number
}) {
  const { camera, pointer, size } = useThree()
  const aspect = size.width / Math.max(1, size.height)
  const narrowFactor = aspect < 1.25 ? (1.25 - aspect) * 4.2 : 0
  const target = useRef(new THREE.Vector3(0, 6.4, 17.5))
  const lookAt = useRef(new THREE.Vector3(0, 1.35, 0))
  const dampedYaw = useRef(0)
  const dampedPitch = useRef(0.18)

  useEffect(() => {
    camera.position.set(0, 6.4, 17.5)
    camera.lookAt(0, 1.35, 0)
  }, [camera])

  useFrame((state, delta) => {
    const screens: Record<ScreenId, [[number, number, number], [number, number, number]]> = {
      event: [[-2.38, 2.12, 0.96], [-3.25, 2.1, -1.48]],
      outpost: [[0, 2.57, 0.84], [0, 2.55, -2.06]],
      field: [[2.38, 2.12, 0.96], [3.25, 2.1, -1.48]],
    }

    dampedYaw.current = THREE.MathUtils.damp(dampedYaw.current, viewYaw, reducedMotion ? 18 : 7, delta)
    dampedPitch.current = THREE.MathUtils.damp(dampedPitch.current, viewPitch, reducedMotion ? 18 : 7, delta)

    if (previewMode) {
      const t = reducedMotion ? 0.35 : state.clock.elapsedTime * 0.14
      target.current.set(Math.sin(t) * 12.2, 4.3, Math.cos(t) * 12.2)
      lookAt.current.set(0, 1.45, 0)
    } else if (screenId && (screenFocus === 'dollyIn' || screenFocus === 'focused')) {
      target.current.set(...screens[screenId][0])
      lookAt.current.set(...screens[screenId][1])
    } else if (focus) {
      target.current.set(...PLANET_LAYOUT[focus].cam)
      lookAt.current.set(...PLANET_LAYOUT[focus].pos)
    } else if (cardInspecting) {
      target.current.set(0, size.width < 640 ? 1.82 : 1.72, (size.width < 640 ? 8.3 : 7.25) + narrowFactor * 0.45)
      lookAt.current.set(size.width < 640 ? 0 : -0.08, size.width < 640 ? 1.62 : 1.48, 2.48)
    } else {
      const parallaxYaw = reducedMotion ? 0 : pointer.x * 0.04
      const parallaxPitch = reducedMotion ? 0 : pointer.y * 0.03
      const yaw = dampedYaw.current + parallaxYaw
      const pitch = THREE.MathUtils.clamp(dampedPitch.current + parallaxPitch, -0.45, 0.92)
      const radius = 9.8 + narrowFactor
      const horiz = Math.cos(pitch) * radius
      target.current.set(
        Math.sin(yaw) * horiz,
        1.35 + Math.sin(pitch) * radius,
        Math.cos(yaw) * horiz,
      )
      lookAt.current.set(0, 1.35, 0)
    }

    camera.position.lerp(target.current, reducedMotion ? 0.3 : 0.12)
    camera.lookAt(lookAt.current)
  })
  return null
}

function makeSpaceSkyTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!

  const grad = ctx.createLinearGradient(0, 0, 0, 1024)
  grad.addColorStop(0, '#01030a')
  grad.addColorStop(0.45, '#030b1a')
  grad.addColorStop(0.55, '#051024')
  grad.addColorStop(1, '#01030a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 2048, 1024)

  // Milky Way galactic band + multi-tone nebulae
  for (let i = 0; i < 64; i += 1) {
    const x = (i * 173) % 2048
    const y = 300 + Math.sin(i * 0.32) * 185 + ((i * 47) % 85)
    const r = 130 + (i % 6) * 42
    const nebula = ctx.createRadialGradient(x, y, 6, x, y, r)
    nebula.addColorStop(
      0,
      i % 4 === 0
        ? 'rgba(56, 152, 196, 0.13)'
        : i % 4 === 1
          ? 'rgba(218, 174, 96, 0.08)'
          : i % 4 === 2
            ? 'rgba(130, 88, 178, 0.09)'
            : 'rgba(84, 180, 172, 0.09)',
    )
    nebula.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = nebula
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }

  for (let i = 0; i < 2400; i += 1) {
    const x = (i * 733) % 2048
    const y = (i * 419) % 1024
    const size = i % 37 === 0 ? 2.8 : i % 9 === 0 ? 1.7 : 0.9
    ctx.fillStyle = i % 13 === 0 ? '#ffe7b3' : i % 6 === 0 ? '#9be0f6' : i % 19 === 0 ? '#ffd0b8' : '#ffffff'
    ctx.globalAlpha = 0.4 + ((i * 17) % 60) / 100
    ctx.fillRect(x, y, size, size)
  }
  ctx.globalAlpha = 1

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function DeepSpaceSky() {
  const skyTexture = useMemo(() => makeSpaceSkyTexture(), [])
  const satRef = useRef<THREE.Group>(null)
  useEffect(() => () => skyTexture.dispose(), [skyTexture])

  useFrame((state) => {
    if (satRef.current) {
      const t = state.clock.elapsedTime * 0.08
      satRef.current.position.set(Math.cos(t) * 19.5, 5.2 + Math.sin(t * 1.4) * 1.1, Math.sin(t) * 19.5)
      satRef.current.rotation.y = -t + Math.PI / 2
    }
  })

  return (
    <group>
      <mesh>
        <sphereGeometry args={[62, 36, 24]} />
        <meshBasicMaterial map={skyTexture} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* Distant Sun (NASA DONKI CME source) with multi-layered solar corona */}
      <group position={[-11.5, 5.8, -24.0]}>
        <mesh>
          <sphereGeometry args={[2.5, 36, 24]} />
          <meshBasicMaterial color="#fff1b8" />
        </mesh>
        <mesh scale={[1.18, 1.18, 1.18]}>
          <sphereGeometry args={[2.5, 28, 20]} />
          <meshBasicMaterial color="#ffaa48" transparent opacity={0.32} depthWrite={false} />
        </mesh>
        <mesh scale={[1.48, 1.48, 1.48]}>
          <sphereGeometry args={[2.5, 24, 18]} />
          <meshBasicMaterial color="#ff6e2b" transparent opacity={0.14} depthWrite={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2.2, 0.15, 0]}>
          <ringGeometry args={[3.55, 3.8, 64]} />
          <meshBasicMaterial color="#ffd27a" side={THREE.DoubleSide} transparent opacity={0.26} />
        </mesh>
        <mesh rotation={[Math.PI / 2.6, -0.35, 0]}>
          <ringGeometry args={[4.1, 4.2, 64]} />
          <meshBasicMaterial color="#ff9f59" side={THREE.DoubleSide} transparent opacity={0.16} />
        </mesh>
      </group>

      {/* Distant Ringed Gas Giant in upper-right deep space */}
      <group position={[23.0, 10.2, -31.0]} rotation={[0.25, 0.4, -0.32]}>
        <mesh>
          <sphereGeometry args={[2.2, 32, 24]} />
          <meshStandardMaterial color="#c9a578" roughness={0.72} metalness={0.05} emissive="#5c4228" emissiveIntensity={0.22} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.9, 4.6, 64]} />
          <meshBasicMaterial color="#dfd0b0" side={THREE.DoubleSide} transparent opacity={0.34} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.75, 5.3, 64]} />
          <meshBasicMaterial color="#9ec8d8" side={THREE.DoubleSide} transparent opacity={0.2} />
        </mesh>
      </group>

      {/* Orbiting Space Weather / Solar Observatory Satellite */}
      <group ref={satRef} position={[19.5, 5.2, 0]}>
        <mesh>
          <boxGeometry args={[0.52, 0.44, 0.52]} />
          <meshStandardMaterial color="#e0b84c" metalness={0.85} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.28, 0.16, 16]} />
          <meshStandardMaterial color="#d8e4ec" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[-1.05, 0, 0]}>
          <boxGeometry args={[1.35, 0.48, 0.04]} />
          <meshStandardMaterial color="#2567a8" metalness={0.55} roughness={0.25} emissive="#154778" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[1.05, 0, 0]}>
          <boxGeometry args={[1.35, 0.48, 0.04]} />
          <meshStandardMaterial color="#2567a8" metalness={0.55} roughness={0.25} emissive="#154778" emissiveIntensity={0.35} />
        </mesh>
      </group>

      {/* Lunar Orbital Ring around Earth */}
      <mesh position={[-17.5, 3.0, 2.0]} rotation={[Math.PI / 2.35, -0.25, 0]}>
        <ringGeometry args={[4.4, 4.48, 64]} />
        <meshBasicMaterial color="#8dd2c8" side={THREE.DoubleSide} transparent opacity={0.24} />
      </mesh>
    </group>
  )
}

export function PixelStars() {
  const stars = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    if (!stars.current) return
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    const count = 480
    for (let index = 0; index < count; index += 1) {
      const phi = Math.acos(1 - (2 * (index + 0.5)) / count)
      const theta = Math.PI * (1 + Math.sqrt(5)) * index
      const r = 21 + (index % 8) * 2.5
      const size = index % 11 === 0 ? 0.14 : index % 4 === 0 ? 0.08 : 0.045
      dummy.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        1.4 + r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      )
      dummy.scale.setScalar(size)
      dummy.updateMatrix()
      stars.current.setMatrixAt(index, dummy.matrix)
      color.set(index % 7 === 0 ? '#ffd984' : index % 5 === 0 ? '#7ecbe0' : '#eef6fa')
      stars.current.setColorAt(index, color)
    }
    stars.current.instanceMatrix.needsUpdate = true
    if (stars.current.instanceColor) stars.current.instanceColor.needsUpdate = true
  }, [])

  useFrame((state) => {
    if (stars.current) stars.current.rotation.y = state.clock.elapsedTime * 0.004
  })

  return (
    <instancedMesh ref={stars} args={[undefined, undefined, 480]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial vertexColors />
    </instancedMesh>
  )
}

export function AsteroidBelt3D() {
  const group = useRef<THREE.Group>(null)
  const rocks = useMemo(
    () =>
      Array.from({ length: 48 }, (_, index) => {
        const angle = (index / 48) * Math.PI * 2 + (index % 3) * 0.12
        const r = 17.5 + (index % 6) * 1.35
        const y = ((index * 19) % 11) - 3.2
        const scale = 0.18 + (index % 5) * 0.09
        return {
          pos: [Math.cos(angle) * r, y, Math.sin(angle) * r] as [number, number, number],
          rot: [index * 0.6, index * 0.9, index * 0.4] as [number, number, number],
          scale,
          color: index % 4 === 0 ? '#8c7a6b' : index % 3 === 0 ? '#6e767d' : '#9c8e7c',
        }
      }),
    [],
  )

  useFrame((state) => {
    if (group.current) group.current.rotation.y = state.clock.elapsedTime * 0.012
  })

  return (
    <group ref={group}>
      {rocks.map((rock, index) => (
        <mesh key={index} position={rock.pos} rotation={rock.rot} scale={rock.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={rock.color} roughness={0.92} metalness={0.12} flatShading />
        </mesh>
      ))}
    </group>
  )
}

export function ObservatoryFloor() {
  return (
    <group position={[0, -0.32, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[13.2, 64]} />
        <meshPhysicalMaterial
          color="#0c0c0c"
          transparent
          opacity={0.78}
          metalness={0.5}
          roughness={0.22}
          clearcoat={0.4}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[5.4, 5.48, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.36} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[8.4, 8.48, 64]} />
        <meshBasicMaterial color="#888888" transparent opacity={0.28} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[12.85, 13.15, 64]} />
        <meshStandardMaterial color="#444444" metalness={0.75} roughness={0.25} />
      </mesh>
      <gridHelper args={[22, 28, '#444444', '#1f1f1f']} position={[0, 0.01, 0]} />
    </group>
  )
}

export function MuseumRoom({ protectedRoom }: { protectedRoom: boolean }) {
  const halo = useRef<THREE.Mesh>(null)
  const domeGeo = useMemo(() => new THREE.SphereGeometry(13.5, 28, 18), [])

  useEffect(() => () => domeGeo.dispose(), [domeGeo])

  useFrame((state) => {
    if (halo.current) halo.current.rotation.z = state.clock.elapsedTime * 0.25
  })

  return (
    <group position={[0, 1.4, 0]}>
      {/* Crystal-Clear 360° Transparent Glass 3D Projection Dome */}
      <mesh geometry={domeGeo}>
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.04}
          roughness={0.04}
          metalness={0.08}
          clearcoat={0.8}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Delicate Holographic Glass Projection Ribs */}
      <lineSegments>
        <edgesGeometry args={[domeGeo]} />
        <lineBasicMaterial color="#666666" transparent opacity={0.14} />
      </lineSegments>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1.65, 0]}>
        <torusGeometry args={[13.35, 0.09, 8, 64]} />
        <meshStandardMaterial color="#444444" metalness={0.78} roughness={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6.2, 0]}>
        <torusGeometry args={[11.8, 0.06, 8, 64]} />
        <meshBasicMaterial color="#cccccc" transparent opacity={0.38} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10.6, 0]}>
        <torusGeometry args={[8.2, 0.06, 8, 48]} />
        <meshBasicMaterial color="#888888" transparent opacity={0.38} />
      </mesh>

      {protectedRoom && (
        <mesh ref={halo} position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[11.2, 0.06, 8, 64]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  )
}

export function MosaicGlassTiles() {
  // Removed opaque wall tiles so the 360° transparent glass projection dome stays crystal clear.
  return null
}

function makePlanetSurfaceTexture(name: PlanetName) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  if (name === 'EARTH') {
    const ocean = ctx.createLinearGradient(0, 0, 0, 512)
    ocean.addColorStop(0, '#d8eef8')
    ocean.addColorStop(0.1, '#125488')
    ocean.addColorStop(0.5, '#1970b0')
    ocean.addColorStop(0.9, '#125488')
    ocean.addColorStop(1, '#d8eef8')
    ctx.fillStyle = ocean
    ctx.fillRect(0, 0, 1024, 512)

    // Continents
    const landmasses = [
      [180, 150, 120, 75, '#3b8b5c'],
      [250, 260, 75, 110, '#4a9659'],
      [480, 130, 160, 80, '#448f5a'],
      [510, 235, 95, 125, '#689d58'],
      [690, 155, 175, 95, '#468a57'],
      [780, 310, 85, 65, '#9d8952'],
    ] as const
    for (const [cx, cy, rx, ry, col] of landmasses) {
      ctx.fillStyle = col
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0.25, 0, Math.PI * 2)
      ctx.fill()
    }
    // Cloud bands
    ctx.fillStyle = 'rgba(255, 255, 255, 0.26)'
    for (let i = 0; i < 28; i += 1) {
      ctx.beginPath()
      ctx.ellipse((i * 137) % 1024, 65 + ((i * 67) % 380), 85, 16, 0.1, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (name === 'MOON') {
    ctx.fillStyle = '#aeb5b8'
    ctx.fillRect(0, 0, 1024, 512)
    // Lunar maria (dark basalt plains)
    for (let i = 0; i < 14; i += 1) {
      ctx.fillStyle = 'rgba(108, 116, 122, 0.45)'
      ctx.beginPath()
      ctx.ellipse((i * 173) % 1024, 95 + ((i * 89) % 320), 65 + (i % 4) * 24, 48 + (i % 3) * 18, 0.3, 0, Math.PI * 2)
      ctx.fill()
    }
    // Craters
    for (let i = 0; i < 95; i += 1) {
      const x = (i * 197) % 1024
      const y = 30 + ((i * 113) % 452)
      const r = 4 + (i % 6) * 4
      ctx.fillStyle = 'rgba(78, 84, 90, 0.45)'
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(230, 236, 238, 0.4)'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  } else {
    const marsGrad = ctx.createLinearGradient(0, 0, 0, 512)
    marsGrad.addColorStop(0, '#eef4f6')
    marsGrad.addColorStop(0.08, '#b85a3a')
    marsGrad.addColorStop(0.5, '#c9653f')
    marsGrad.addColorStop(0.92, '#a84b2f')
    marsGrad.addColorStop(1, '#eef4f6')
    ctx.fillStyle = marsGrad
    ctx.fillRect(0, 0, 1024, 512)
    // Dark volcanic basalt regions & Valles Marineris scar
    for (let i = 0; i < 18; i += 1) {
      ctx.fillStyle = 'rgba(116, 48, 30, 0.38)'
      ctx.beginPath()
      ctx.ellipse((i * 163) % 1024, 80 + ((i * 97) % 350), 70 + (i % 4) * 20, 34, 0.2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.strokeStyle = 'rgba(84, 30, 18, 0.65)'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(360, 250)
    ctx.quadraticCurveTo(490, 272, 620, 245)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function Planet({
  name,
  onFocus,
  scale = 1,
}: {
  name: PlanetName
  position?: [number, number, number]
  color?: string
  accent?: string
  scale?: number
  onFocus: (name: PlanetName) => void
}) {
  const ref = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const cfg = PLANET_LAYOUT[name]
  const map = useMemo(() => makePlanetSurfaceTexture(name), [name])

  useEffect(() => () => map.dispose(), [map])

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * (name === 'MOON' ? 0.04 : 0.08)
    if (cloudsRef.current) cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.115
  })

  return (
    <group
      position={cfg.pos}
      rotation={[0, 0, cfg.tilt]}
      scale={scale}
      onClick={(event) => {
        event.stopPropagation()
        onFocus(name)
      }}
    >
      <mesh ref={ref}>
        <sphereGeometry args={[cfg.radius, 48, 32]} />
        <meshStandardMaterial
          map={map}
          emissive={cfg.accent}
          emissiveIntensity={0.08}
          roughness={name === 'EARTH' ? 0.5 : 0.85}
          metalness={name === 'EARTH' ? 0.1 : 0.04}
        />
      </mesh>
      {name === 'EARTH' && (
        <mesh ref={cloudsRef} scale={[1.022, 1.022, 1.022]}>
          <sphereGeometry args={[cfg.radius, 36, 24]} />
          <meshStandardMaterial
            color="#e9f6ff"
            transparent
            opacity={0.14}
            roughness={0.9}
            depthWrite={false}
          />
        </mesh>
      )}
      {name !== 'MOON' && (
        <mesh scale={[1.075, 1.075, 1.075]}>
          <sphereGeometry args={[cfg.radius, 32, 24]} />
          <meshBasicMaterial
            color={cfg.accent}
            transparent
            opacity={name === 'EARTH' ? 0.2 : 0.13}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}
