import * as THREE from 'three'
import { resources, text, type CardDefinition, type Language, type MissionEvent, type ResourceKey } from '../types'

const DISPLAY_FONT = '"Space Grotesk", "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", system-ui, sans-serif'
const MONO_FONT = '"IBM Plex Mono", "JetBrains Mono", "Cascadia Code", "Noto Sans TC", monospace'

export function wrapCanvasText(ctx: CanvasRenderingContext2D, value: string, maxWidth: number): string[] {
  const lines: string[] = []
  let current = ''
  const tokens = value.match(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]|\S+\s*|\s+/g) ?? [value]
  for (const token of tokens) {
    const candidate = current + token
    if (ctx.measureText(candidate.trimEnd()).width > maxWidth && current.trim().length > 0) {
      lines.push(current.trimEnd())
      current = token.trimStart()
    } else {
      current = candidate
    }
  }
  if (current.trim().length > 0) lines.push(current.trimEnd())
  return lines.length ? lines : [value]
}

/**
 * Draws a chunky mosaic stained-glass / pixel-tile backdrop on a high-DPI canvas,
 * keeping the mosaic tiles crisp and geometric while allowing sharp, readable text on top.
 */
export function drawMosaicBackdrop(
  ctx: CanvasRenderingContext2D,
  logicalW: number,
  logicalH: number,
  _accent: string,
  tile = 18,
) {
  ctx.fillStyle = '#0c0c0c'
  ctx.fillRect(0, 0, logicalW, logicalH)
  const tones = ['#141414', '#1b1b1b', '#101010', '#222222']
  for (let y = 0; y < logicalH; y += tile) {
    for (let x = 0; x < logicalW; x += tile) {
      const idx = ((x / tile) * 3 + (y / tile) * 5) % 13
      ctx.fillStyle = idx === 0 ? 'rgba(255,255,255,0.12)' : idx === 7 ? 'rgba(200,200,200,0.08)' : tones[idx % tones.length]
      ctx.fillRect(x + 1.5, y + 1.5, tile - 3, tile - 3)
      ctx.fillStyle = 'rgba(255,255,255,0.035)'
      ctx.fillRect(x + 1.5, y + 1.5, tile - 3, 2)
    }
  }
  ctx.fillStyle = 'rgba(12, 12, 12, 0.78)'
  ctx.fillRect(14, 16, logicalW - 28, logicalH - 32)
}

export function makeCrispMosaicTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.generateMipmaps = true
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

export function makeScreenTexture(
  title: string,
  icon: string,
  summary: string[],
  detail: string[],
  focused: boolean,
  accent: string,
) {
  const w = 520
  const h = 340
  const canvas = document.createElement('canvas')
  canvas.width = w * 3
  canvas.height = h * 3
  const ctx = canvas.getContext('2d')!
  ctx.scale(3, 3)

  drawMosaicBackdrop(ctx, w, h, accent, 18)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, 12)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 5
  ctx.strokeRect(2.5, 2.5, w - 5, h - 5)

  ctx.fillStyle = '#ffffff'
  ctx.font = `700 ${focused ? 29 : 25}px ${DISPLAY_FONT}`
  ctx.fillText(`${icon}  ${title}`, 24, 52)

  ctx.fillStyle = '#b5b5b5'
  ctx.font = `700 ${focused ? 14 : 13}px ${MONO_FONT}`
  ctx.fillText(focused ? 'FOCUSED RECORD' : 'TAP TO FOCUS', 24, 78)

  const values = focused ? detail : summary
  ctx.fillStyle = '#e5e5e5'
  ctx.font = `600 ${focused ? 20 : 17}px ${DISPLAY_FONT}`
  let y = focused ? 116 : 112
  values
    .flatMap((value) => wrapCanvasText(ctx, value, w - 205))
    .slice(0, focused ? 6 : 7)
    .forEach((line) => {
      ctx.fillText(line, 24, y)
      y += focused ? 29 : 25
    })

  ctx.fillStyle = '#a0a0a0'
  ctx.font = `700 ${focused ? 13 : 12}px ${MONO_FONT}`
  ctx.fillText(focused ? 'ESC / TAP EMPTY SPACE TO RETURN' : 'OBSERVATORY TERMINAL · READY', 24, h - 22)
  return makeCrispMosaicTexture(canvas)
}

export function makeWorldPanelTexture(title: string, lines: string[]) {
  const w = 520
  const h = 360
  const canvas = document.createElement('canvas')
  canvas.width = w * 3
  canvas.height = h * 3
  const ctx = canvas.getContext('2d')!
  ctx.scale(3, 3)

  drawMosaicBackdrop(ctx, w, h, '#ffffff', 18)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 5
  ctx.strokeRect(3, 3, w - 6, h - 6)
  ctx.fillStyle = '#181818'
  ctx.fillRect(18, 20, w - 36, 40)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.strokeRect(18, 20, w - 36, 40)
  ctx.fillStyle = '#ffffff'
  ctx.font = `800 22px ${DISPLAY_FONT}`
  ctx.fillText(title, 30, 47)

  ctx.fillStyle = '#ffffff'
  ctx.font = `700 18px ${DISPLAY_FONT}`
  let y = 92
  lines
    .flatMap((line) => wrapCanvasText(ctx, line, w - 56))
    .slice(0, 8)
    .forEach((line) => {
      ctx.fillText(line, 28, y)
      y += 27
    })

  ctx.fillStyle = '#ffffff'
  ctx.font = `700 13px ${MONO_FONT}`
  ctx.fillText('ESC / TAP EMPTY SPACE TO RETURN', 28, h - 22)
  return makeCrispMosaicTexture(canvas)
}

export function makeButtonLabelTexture(label: string, bg = '#181818', fg = '#ffffff') {
  const w = 340
  const h = 84
  const canvas = document.createElement('canvas')
  canvas.width = w * 2
  canvas.height = h * 2
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 4
  ctx.strokeRect(2, 2, w - 4, h - 4)
  ctx.fillStyle = fg
  ctx.font = `800 26px ${DISPLAY_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, w / 2, h / 2 + 1)
  return makeCrispMosaicTexture(canvas)
}

export function makeDetailStripTexture(card: CardDefinition, language: Language, mission: MissionEvent) {
  const w = 560
  const h = 440
  const canvas = document.createElement('canvas')
  canvas.width = w * 2
  canvas.height = h * 2
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)

  drawMosaicBackdrop(ctx, w, h, '#ffffff', 18)

  const title = text(card.title, language)
  const cost =
    (Object.entries(card.cost) as [ResourceKey, number][])
      .map(([key, value]) => `${resources[key].label[language]} -${value}`)
      .join(' · ') || (language === 'zh' ? '免費啟動（無消耗）' : 'FREE (NO COST)')
  const gainParts = (Object.entries(card.effects) as [ResourceKey, number][]).map(
    ([key, value]) => `${resources[key].label[language]} ${value > 0 ? `+${value}` : value}`,
  )
  if (card.id === 'cme-forecast') {
    gainParts.push(language === 'zh' ? '若通訊 ≥1：電力 +1 · 護盾 +1' : 'If Comms ≥1: Power +1 · Shield +1')
  }
  const gain = gainParts.join(' · ') || (language === 'zh' ? '無額外數值' : 'None')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, 8)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 4
  ctx.strokeRect(2, 2, w - 4, h - 4)

  ctx.fillStyle = '#ffffff'
  ctx.font = `800 24px ${DISPLAY_FONT}`
  ctx.fillText(language === 'zh' ? `卡牌詳情｜${title}` : `CARD BRIEF | ${title}`, 22, 42)

  let y = 70
  if (card.specialSkill) {
    ctx.fillStyle = '#242424'
    ctx.fillRect(22, 54, w - 44, 28)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.strokeRect(22, 54, w - 44, 28)
    ctx.fillStyle = '#ffffff'
    ctx.font = `700 15px ${DISPLAY_FONT}`
    ctx.fillText(text(card.specialSkill, language), 32, 73)
    y = 104
  }

  ctx.fillStyle = '#ffffff'
  ctx.font = `600 16px ${DISPLAY_FONT}`
  const detailLines = wrapCanvasText(ctx, text(card.detail, language), w - 44)
  detailLines.slice(0, 3).forEach((line, i) => ctx.fillText(line, 22, y + i * 22))
  y += Math.min(detailLines.length, 3) * 22 + 10

  ctx.fillStyle = '#1f1f1f'
  ctx.fillRect(22, y - 16, w - 44, 34)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(22, y - 16, 6, 34)
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 15px ${DISPLAY_FONT}`
  ctx.fillText(`★ ${text(card.lesson, language)}`, 36, y + 6)
  y += 36

  const rows = [
    { label: language === 'zh' ? '消耗 COST' : 'COST', value: cost },
    { label: language === 'zh' ? '獲得 GAIN' : 'GAIN', value: gain },
    { label: language === 'zh' ? 'NASA 來源' : 'NASA SOURCE', value: `DONKI ${mission.record.activityID} (${mission.speed} km/s)` },
    { label: language === 'zh' ? '科學限制' : 'LIMITATION', value: text(card.limitations, language) },
  ]
  rows.forEach((row) => {
    ctx.fillStyle = '#d0d0d0'
    ctx.font = `700 13px ${MONO_FONT}`
    ctx.fillText(row.label, 22, y)
    ctx.fillStyle = '#ffffff'
    ctx.font = `700 14.5px ${DISPLAY_FONT}`
    const rLines = wrapCanvasText(ctx, row.value, w - 150)
    rLines.slice(0, 2).forEach((line, li) => ctx.fillText(line, 132, y + li * 18))
    y += Math.max(24, Math.min(rLines.length, 2) * 18 + 8)
  })

  ctx.fillStyle = '#ffffff'
  ctx.font = `700 13px ${MONO_FONT}`
  ctx.fillText(
    language === 'zh'
      ? '再點一次左方卡牌出牌 · 點空白處或 ESC 退回原視角'
      : 'TAP CARD AGAIN TO PLAY · EMPTY SPACE / ESC TO RESTORE',
    22,
    h - 16,
  )
  return makeCrispMosaicTexture(canvas)
}

export function makeDialLabelTexture(language: Language) {
  const w = 360
  const h = 112
  const canvas = document.createElement('canvas')
  canvas.width = w * 3
  canvas.height = h * 3
  const ctx = canvas.getContext('2d')!
  ctx.scale(3, 3)

  drawMosaicBackdrop(ctx, w, h, '#ffffff', 14)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 5
  ctx.strokeRect(2.5, 2.5, w - 5, h - 5)

  ctx.fillStyle = language === 'en' ? '#ffffff' : '#777777'
  ctx.font = `800 44px ${DISPLAY_FONT}`
  ctx.fillText('EN', 36, 72)

  ctx.fillStyle = '#cccccc'
  ctx.font = `800 40px ${DISPLAY_FONT}`
  ctx.fillText('⇄', 148, 70)

  ctx.fillStyle = language === 'zh' ? '#ffffff' : '#777777'
  ctx.font = `800 42px ${DISPLAY_FONT}`
  ctx.fillText('繁中', 232, 72)
  return makeCrispMosaicTexture(canvas)
}

export function makePillarLabelTexture(language: Language) {
  const w = 420
  const h = 84
  const canvas = document.createElement('canvas')
  canvas.width = w * 3
  canvas.height = h * 3
  const ctx = canvas.getContext('2d')!
  ctx.scale(3, 3)
  ctx.fillStyle = '#111111'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 4
  ctx.strokeRect(2, 2, w - 4, h - 4)

  const cols =
    language === 'zh'
      ? [
          { label: '⚡ 電力', color: '#ffffff' },
          { label: '◌ 維生', color: '#cccccc' },
          { label: '◇ 護盾', color: '#999999' },
        ]
      : [
          { label: '⚡ PWR', color: '#ffffff' },
          { label: '◌ LIFE', color: '#cccccc' },
          { label: '◇ SHD', color: '#999999' },
        ]
  cols.forEach((col, i) => {
    ctx.fillStyle = col.color
    ctx.font = `800 28px ${DISPLAY_FONT}`
    ctx.fillText(col.label, 22 + i * 136, 52)
  })
  return makeCrispMosaicTexture(canvas)
}

export function makeTutorialTexture(language: Language, title: string, lines: string[]) {
  const w = 420
  const h = 270
  const canvas = document.createElement('canvas')
  canvas.width = w * 3
  canvas.height = h * 3
  const ctx = canvas.getContext('2d')!
  ctx.scale(3, 3)

  drawMosaicBackdrop(ctx, w, h, '#ffffff', 16)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 5
  ctx.strokeRect(3, 3, w - 6, h - 6)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(16, 18, w - 32, 40)

  ctx.fillStyle = '#000000'
  ctx.font = `800 22px ${DISPLAY_FONT}`
  ctx.fillText(title, 26, 46)

  ctx.fillStyle = '#f0f0f0'
  ctx.font = `700 21px ${DISPLAY_FONT}`
  let y = 104
  lines
    .flatMap((line) => wrapCanvasText(ctx, line, w - 56))
    .slice(0, 3)
    .forEach((line) => {
      ctx.fillText(line, 26, y)
      y += 34
    })

  ctx.fillStyle = '#d5b261'
  ctx.font = `700 15px ${MONO_FONT}`
  ctx.fillText(language === 'zh' ? '點此板子下一步 · 金塊跳過' : 'TAP BOARD: NEXT · GOLD: SKIP', 26, 242)
  return makeCrispMosaicTexture(canvas)
}

export function drawPixelIcon(ctx: CanvasRenderingContext2D, symbol: string, color: string) {
  const bx = 28
  const by = 78
  const bw = 324
  const bh = 112
  ctx.fillStyle = '#171717'
  ctx.fillRect(bx, by, bw, bh)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.lineWidth = 2
  ctx.strokeRect(bx, by, bw, bh)

  // Subtle monochrome grid inside emblem bay
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  for (let gx = bx + 24; gx < bx + bw; gx += 24) {
    ctx.beginPath()
    ctx.moveTo(gx, by)
    ctx.lineTo(gx, by + bh)
    ctx.stroke()
  }
  for (let gy = by + 24; gy < by + bh; gy += 24) {
    ctx.beginPath()
    ctx.moveTo(bx, gy)
    ctx.lineTo(bx + bw, gy)
    ctx.stroke()
  }

  const cell = 16
  const ox = 150
  const oy = 94
  const pattern =
    symbol === '⚡'
      ? [[3, 0], [2, 1], [3, 1], [1, 2], [2, 2], [3, 2], [4, 2], [2, 3], [1, 4]]
      : symbol === '◇'
        ? [[2, 0], [1, 1], [3, 1], [0, 2], [2, 2], [4, 2], [1, 3], [3, 3], [2, 4]]
        : symbol === '◉'
          ? [[1, 0], [2, 0], [3, 0], [0, 1], [4, 1], [0, 2], [2, 2], [4, 2], [0, 3], [4, 3], [1, 4], [2, 4], [3, 4]]
          : symbol === '⌁'
            ? [[4, 0], [2, 1], [3, 1], [1, 2], [3, 2], [0, 3], [2, 3], [0, 4]]
            : symbol === '↔'
              ? [[1, 1], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [1, 3], [3, 3]]
              : [[2, 0], [2, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [2, 3], [2, 4]]
  ctx.fillStyle = color
  pattern.forEach(([x, y]) => ctx.fillRect(ox + x * cell, oy + y * cell, cell - 2, cell - 2))
}

export function makeCardTexture(
  card: CardDefinition,
  language: Language,
  selected: boolean,
  unavailable: boolean,
) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 768
  const ctx = canvas.getContext('2d')!
  ctx.scale(512 / 380, 768 / 530)

  const palette = unavailable ? '#777777' : '#ffffff'

  // Monochrome tactical card chassis
  ctx.fillStyle = unavailable ? '#262626' : '#111111'
  ctx.fillRect(0, 0, 380, 530)

  // Top header bar
  ctx.fillStyle = unavailable ? '#555555' : '#ffffff'
  ctx.fillRect(0, 0, 380, 16)

  // Outer & inner angular border
  ctx.strokeStyle = selected ? '#ffffff' : unavailable ? '#555555' : '#cfcfcf'
  ctx.lineWidth = selected ? 10 : 5
  ctx.strokeRect(5, 5, 370, 520)

  // Corner L-brackets
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 3
  const corners: [number, number, number, number][] = [
    [14, 26, 1, 1],
    [366, 26, -1, 1],
    [14, 514, 1, -1],
    [366, 514, -1, -1],
  ]
  for (const [cx, cy, dx, dy] of corners) {
    ctx.beginPath()
    ctx.moveTo(cx + dx * 16, cy)
    ctx.lineTo(cx, cy)
    ctx.lineTo(cx, cy + dy * 16)
    ctx.stroke()
  }

  // Category tag
  ctx.fillStyle = unavailable ? '#8c8c8c' : '#b5b5b5'
  ctx.font = `700 17px ${MONO_FONT}`
  ctx.fillText(text(card.category, language).toUpperCase(), 28, 56)

  if (card.specialSkill) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(256, 34, 96, 28)
    ctx.fillStyle = '#000000'
    ctx.font = `800 14px ${MONO_FONT}`
    ctx.fillText(language === 'zh' ? '★ 特技' : '★ SKILL', 268, 53)
  }

  // Framed 5x5 mosaic emblem bay
  drawPixelIcon(ctx, card.symbol, palette)

  // Card title
  ctx.fillStyle = unavailable ? '#a8a8a8' : '#ffffff'
  ctx.font = `700 32px ${DISPLAY_FONT}`
  ctx.fillText(text(card.title, language), 28, 232)

  // Short effect description
  ctx.fillStyle = unavailable ? '#888888' : '#d0d0d0'
  ctx.font = `600 19px ${DISPLAY_FONT}`
  const lines = wrapCanvasText(ctx, text(card.shortEffect, language), 324)
  lines.slice(0, 2).forEach((line, index) => ctx.fillText(line, 28, 272 + index * 27))

  // Resource cost & effect pills row (monochrome black/grey/white)
  const badges: { label: string; bg: string; fg: string }[] = []
  ;(Object.entries(card.cost) as [ResourceKey, number][]).forEach(([key, val]) => {
    if (val) badges.push({ label: `${resources[key].icon} -${val}`, bg: '#222222', fg: '#d4d4d4' })
  })
  if (card.effects.power) badges.push({ label: `⚡ +${card.effects.power}`, bg: '#ffffff', fg: '#000000' })
  if (card.effects.lifeSupport) badges.push({ label: `◌ +${card.effects.lifeSupport}`, bg: '#e0e0e0', fg: '#000000' })
  if (card.effects.shield) badges.push({ label: `◇ +${card.effects.shield}`, bg: '#ffffff', fg: '#000000' })
  if (card.effects.comms) badges.push({ label: `⌁ +${card.effects.comms}`, bg: '#cccccc', fg: '#000000' })
  if (card.effects.evidence) badges.push({ label: `◈ +${card.effects.evidence}`, bg: '#e5e5e5', fg: '#000000' })

  let px = 28
  badges.slice(0, 4).forEach((badge) => {
    const bw = 74
    ctx.fillStyle = badge.bg
    ctx.fillRect(px, 326, bw, 30)
    ctx.strokeStyle = '#888888'
    ctx.lineWidth = 1.5
    ctx.strokeRect(px, 326, bw, 30)
    ctx.fillStyle = badge.fg
    ctx.font = `800 15px ${MONO_FONT}`
    ctx.fillText(badge.label, px + 10, 346)
    px += bw + 8
  })

  // NASA lesson strip
  ctx.fillStyle = '#1b1b1b'
  ctx.fillRect(28, 372, 324, 62)
  ctx.fillStyle = unavailable ? '#666666' : '#ffffff'
  ctx.fillRect(28, 372, 7, 62)
  ctx.fillStyle = unavailable ? '#999999' : '#e8e8e8'
  ctx.font = `600 15px ${DISPLAY_FONT}`
  const lessonLines = wrapCanvasText(ctx, `★ ${text(card.lesson, language)}`, 298)
  lessonLines.slice(0, 2).forEach((line, index) => ctx.fillText(line, 44, 396 + index * 22))

  // Footer divider & status
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.fillRect(28, 452, 324, 2)
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 16px ${MONO_FONT}`
  ctx.fillText(card.symbol, 28, 492)

  ctx.fillStyle = unavailable ? '#777777' : '#ffffff'
  ctx.font = `700 16px ${DISPLAY_FONT}`
  ctx.fillText(
    unavailable ? (language === 'zh' ? '已執行' : 'EXECUTED') : language === 'zh' ? '點擊查看 / 出牌 ▸' : 'INSPECT / PLAY ▸',
    182,
    492,
  )

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.generateMipmaps = false
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
}
