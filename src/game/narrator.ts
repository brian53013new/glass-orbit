import type { Language, MissionEvent, RunState, TutorialStep } from '../types'

export type NarratorBeat = {
  title: string
  lines: string[]
  hudLine: string
}

const CARD_REACTIONS: Record<string, { zh: string[]; en: string[] }> = {
  'power-route': {
    zh: [
      '「先存好能量再出手。」電池槽亮起，接下來同時開護盾跟維生才不會捉襟見肘。',
      '儲能完成。太陽活動從不照表操課，手裡留點餘裕總是比較穩。',
    ],
    en: [
      '"Build a power buffer before spending big." Batteries are charged for the turns ahead.',
      'Reserve locked in. Solar weather never follows a schedule—keeping margin pays off.',
    ],
  },
  'life-support': {
    zh: [
      '氧氣循環與淨水閥門重新運轉——護盾再強，裡面的組員也需要穩定的呼吸空間。',
      '生命維持數值回升。前哨站的空氣與水循環穩定下來了。',
    ],
    en: [
      'Air scrubbers and water loops hum back up—even the strongest shield needs a livable cabin.',
      'Life support climbing. Cabin oxygen and water reserves are stabilizing.',
    ],
  },
  'radiation-shield': {
    zh: [
      '外層磁暴護盾展開！時速破千的質子流在穹頂邊界被偏轉，室內依然安靜平穩。',
      '護盾撐起來了。這道防線正直接擋住 NASA 觀測到的高速電漿雲。',
    ],
    en: [
      'Magnetic shield online. High-energy protons deflect along the dome boundary while the cabin stays calm.',
      'Shields raised—your direct barrier against the incoming NASA-tracked plasma front.',
    ],
  },
  antenna: {
    zh: [
      '深空天線鎖定地球軌道！訊號對準後，「CME 預報」與遠距中繼就能發揮全力。',
      '通訊連線建立。在深空裡保持聯絡暢通，往往和物理護盾一樣關鍵。',
    ],
    en: [
      'Deep-space dish aligned with Earth. With Comms active, CME Forecast can trigger its bonus.',
      'Signal locked. In deep space, a reliable link matters just as much as armor.',
    ],
  },
  observation: {
    zh: [
      '你沒有急著硬扛，而是先打開觀測窗記錄波形——先掌握證據，再做工程決策。',
      '取得 1 枚科學證據。這筆實測紀錄能幫地球端更準確預判下一波 CME 的抵達時間。',
    ],
    en: [
      'Instead of guessing, you opened the Solar Window first—evidence before reaction.',
      '+1 Science Evidence logged. Measurements like this refine arrival forecasts back on Earth.',
    ],
  },
  'supply-trade': {
    zh: [
      '「拆一點外層防護換取緊急維生。」在資源受限的軌道上，工程從來都是取捨。',
      '物資調度完成。沒有完美的方案，只有當下最能撐過風暴的選擇。',
    ],
    en: [
      '"Trading outer margin for urgent life support." Out in orbit, engineering is always a trade-off.',
      'Supply swap complete—choosing what keeps the crew viable right now.',
    ],
  },
  'cme-forecast': {
    zh: [
      '預報模型開始演算軌跡。只要天線已經對準，這張牌就能同時搶回電力與護盾。',
      '把 NASA 觀測數據轉化為戰術餘裕——這就是資料判讀真正派上用場的時刻。',
    ],
    en: [
      'Forecast model running. When paired with an aligned antenna, power and shields surge together.',
      'Turning raw NASA telemetry into tactical breathing room—data-driven defense in action.',
    ],
  },
  'safe-standby': {
    zh: [
      '全艙降載進入靜默模式，保留電力並微幅加固護盾——有時候以靜制動反而最有效。',
      '安全待機啟動。暫時省下不必要的消耗，替下一回合留住選擇空間。',
    ],
    en: [
      'Non-essential systems dimmed for quiet standby and +1 shield. Holding steady can be the smartest move.',
      'Safe standby engaged—conserving power to keep next turn’s options open.',
    ],
  },
  'solar-wing': {
    zh: [
      '零消耗展開備用太陽能翼！抓準日照空檔補滿電力，往往能改變整局的節奏。',
      '太陽能翼展開完畢，主匯流排瞬間多了兩格可用電力。',
    ],
    en: [
      'Backup solar wings unfurl at zero cost—catching a clean sunlight window shifts the whole run.',
      'Solar wings deployed! +2 Power flows straight into the main bus.',
    ],
  },
  'water-wall': {
    zh: [
      '把飲用水循環導進外牆夾層——這是 NASA 真實研究過的「水牆輻射屏蔽」，護盾與維生一次到位。',
      '含氫的水分子是天然的輻射屏障，既能擋高能粒子，也能維持基地生命線。',
    ],
    en: [
      'Routing drinking water into the outer hull—NASA’s real Water-Wall concept boosts Shield and Life together.',
      'Hydrogen-rich water shields against cosmic radiation while sustaining the crew.',
    ],
  },
  'repair-circuit': {
    zh: [
      '備援電路跳接成功！撐起護盾的同時，還把原本溢散的電力導回系統。',
      '電路修復完成。這種兼顧防禦與回電的操作，在極端風暴裡特別吃香。',
    ],
    en: [
      'Auxiliary circuit bridged—raising shields while recovering stray watts back to the bus.',
      'Circuit repaired! Simultaneous defense and power recovery for intense storms.',
    ],
  },
  'deep-scan': {
    zh: [
      '深空遙測啟動：一邊記錄粒子證據，一邊收集微弱光能補電，效率剛剛好。',
      '觀測與補電同步完成，在五回合的限制裡節省了寶貴的一步。',
    ],
    en: [
      'Deep telemetry active—logging particle evidence while harvesting stray solar power.',
      'Science and power in a single turn, saving precious time inside the 5-turn window.',
    ],
  },
}

export function buildMissionGoalSummary(language: Language, mission: MissionEvent, run: RunState): string {
  const parts: string[] = []
  if (language === 'zh') {
    parts.push(`護盾 ◇ ${run.resources.shield}/${mission.shieldTarget}`)
    parts.push(`維生 ◌ ${run.resources.lifeSupport}/${mission.lifeTarget}`)
    if (mission.evidenceTarget > 0) parts.push(`證據 ◈ ${run.evidence}/${mission.evidenceTarget}`)
    if (mission.commsTarget > 0) parts.push(`通訊 ⌁ ${run.comms}/${mission.commsTarget}`)
    parts.push(`回合 ${run.turns}/5`)
    return parts.join(' · ')
  }
  parts.push(`Shield ◇ ${run.resources.shield}/${mission.shieldTarget}`)
  parts.push(`Life ◌ ${run.resources.lifeSupport}/${mission.lifeTarget}`)
  if (mission.evidenceTarget > 0) parts.push(`Evid ◈ ${run.evidence}/${mission.evidenceTarget}`)
  if (mission.commsTarget > 0) parts.push(`Comms ⌁ ${run.comms}/${mission.commsTarget}`)
  parts.push(`Turn ${run.turns}/5`)
  return parts.join(' · ')
}

export function buildNarratorBeat(
  language: Language,
  step: TutorialStep,
  mission: MissionEvent,
  run: RunState,
): NarratorBeat {
  const zh = language === 'zh'

  // 1. Interactive Tutorial Steps (grounded, natural, slightly conversational—never goofy)
  if (step === 'room') {
    return {
      title: zh ? 'NOVA 旁白｜序章 1/6' : 'NOVA NARRATOR | PROLOGUE 1/6',
      lines: zh
        ? [
            `警報響了——NASA DONKI 剛記錄到時速 ${mission.speed} km/s 的太陽風暴正朝我們推進。`,
            '這 8 場事件都在模擬真實的太空抉擇：有限電力下，你要先儲電、先保維生、撐護盾，還是先蒐集觀測證據？',
            '點一下這塊旁白板，或直接點發亮的桌面，我們開始吧。',
          ]
        : [
            `Alert—NASA DONKI just logged a ${mission.speed} km/s solar storm heading our way.`,
            'Each of these 8 events tests a real orbital trade-off: reserve power, life support, shields, or science evidence.',
            'Tap this narrator board or the glowing desk to begin.',
          ],
      hudLine: zh
        ? `旁白 1/6：NASA 偵測 ${mission.speed} km/s 太陽風暴，點右側箭頭看完整任務說明`
        : `Narrator 1/6: ${mission.speed} km/s NASA storm incoming — expand for brief`,
    }
  }

  if (step === 'look') {
    return {
      title: zh ? 'NOVA 旁白｜環視太空 2/6' : 'NOVA NARRATOR | 360° VIEW 2/6',
      lines: zh
        ? [
            '你正坐在 360° 全透明玻璃觀測艙中央，窗外就是太陽、地球、月球與火星的即時相對位置。',
            '用滑鼠拖曳，或按 ← → / WASD 環顧四周；右前方遠處那張小圓桌上的三根彩色能量柱，會即時反映基地狀態。',
          ]
        : [
            'You are seated inside a 360° glass observatory surrounded by the Sun, Earth, Moon, and Mars.',
            'Drag or press ← → / WASD to look around—notice the distant round table at front-right with 3 colored resource pillars.',
          ],
      hudLine: zh
        ? '旁白 2/6：拖曳或按 WASD 環視 360° 太空與右前方彩色能量柱'
        : 'Narrator 2/6: Drag or WASD to inspect 360° space & distant pillars',
    }
  }

  if (step === 'language') {
    return {
      title: zh ? 'NOVA 旁白｜雙語切換 3/6' : 'NOVA NARRATOR | BILINGUAL 3/6',
      lines: zh
        ? [
            '太空任務講求跨國協作，所有儀表與指令都必須讓不同語言的組員零誤差判讀。',
            '試著按桌角右前方的「EN ⇄ 繁中」實體旋鈕，整個觀測艙的文字會同步切換。',
          ]
        : [
            'Space missions rely on international crews reading the exact same telemetry without ambiguity.',
            'Press the front-right EN ⇄ 繁中 dial to switch the entire observatory live.',
          ],
      hudLine: zh
        ? '旁白 3/6：按右前方「EN ⇄ 繁中」實體旋鈕，整座玻璃艙同步切換語言'
        : 'Narrator 3/6: Press the front-right EN ⇄ 繁中 dial to switch room language',
    }
  }

  if (step === 'screen') {
    return {
      title: zh ? 'NOVA 旁白｜解讀 NASA 4/6' : 'NOVA NARRATOR | NASA CLUES 4/6',
      lines: zh
        ? [
            '前方三台終端機各有分工：左邊是地球通訊與線索、中間顯示 NASA 風暴快照、右邊整理戰術反思。',
            '點一下中央「月球／目前任務」螢幕——風暴速度越快，這局要求的護盾目標就越高。',
          ]
        : [
            'Each terminal has a job: Earth Comms on the left, live NASA snapshot center, Think Lab on the right.',
            'Tap the center terminal—higher CME speeds demand stronger Shield targets.',
          ],
      hudLine: zh
        ? '旁白 4/6：點中央終端機看 NASA 風暴數據——速度決定本局護盾目標'
        : 'Narrator 4/6: Tap center screen to read NASA CME speed & targets',
    }
  }

  if (step === 'card') {
    return {
      title: zh ? 'NOVA 旁白｜手牌與特技 5/6' : 'NOVA NARRATOR | CARDS & SKILLS 5/6',
      lines: zh
        ? [
            '桌上 6 張手牌是你的行動指令，部分卡牌帶有「★ 特技」（像是零消耗補電或水牆雙補），關鍵回合很好用。',
            '點任一張卡，鏡頭會自動回正並將卡牌與詳情左右並排展開；點空白處或按 Esc 就能退回原本視角。',
          ]
        : [
            'Your 6-card hand holds mission actions—watch for ★ SKILL cards with free boosts or dual effects.',
            'Tap any card to auto-center & inspect Card + Details side-by-side; tap empty space or Esc to return.',
          ],
      hudLine: zh
        ? '旁白 5/6：點任一張牌並排查看詳情與 ★ 特技，點空白處退回原視角'
        : 'Narrator 5/6: Tap a card to inspect Card + Details side-by-side',
    }
  }

  if (step === 'play') {
    return {
      title: zh ? 'NOVA 旁白｜出牌抽卡 6/6' : 'NOVA NARRATOR | PLAY & DRAW 6/6',
      lines: zh
        ? [
            '對放大中的卡牌再點一下就會出牌，並從牌庫抽補一張新卡進手牌。',
            '出牌後抬頭看右前方遠處的小圓桌——三根彩色能量柱會立刻隨你的選擇升降。',
          ]
        : [
            'Tap the zoomed card again to play it and draw a replacement from the deck.',
            'Watch the 3 colored pillars on the distant round table shift with every move.',
          ],
      hudLine: zh
        ? '旁白 6/6：再點一次卡牌出牌並抽補新牌，觀察遠處彩色能量柱變化'
        : 'Narrator 6/6: Tap card again to play & draw—watch the colored pillars',
    }
  }

  // 2. Post-Mission Debrief Narration
  if (run.outcome !== 'playing') {
    if (run.outcome === 'success') {
      return {
        title: zh ? 'NOVA 旁白｜任務達成' : 'NOVA NARRATOR | MISSION CLEARED',
        lines: zh
          ? [
              '太陽風暴安全掠過玻璃穹頂，護盾、維生與任務指標全數守住。',
              '這證明你在有限電力下做出了穩健的取捨。透過右方結算台或上方「換事件」，可以接著挑戰下一筆 NASA 事件。',
            ]
          : [
              'The solar storm swept safely past the dome with every mission objective intact.',
              'Solid engineering under tight power limits. Use the console or Next Event to tackle another NASA record.',
            ],
        hudLine: zh
          ? '旁白：任務達成！所有目標守住，可重玩或切換下一筆 NASA 事件'
          : 'Narrator: Mission cleared! Replay or jump to the next NASA event',
      }
    }
    if (run.outcome === 'partial') {
      return {
        title: zh ? 'NOVA 旁白｜部分達標' : 'NOVA NARRATOR | PARTIAL CLEAR',
        lines: zh
          ? [
              '基地撐住了主要衝擊，但還差一項目標沒達標。在太空任務裡，小缺口往往會影響後續階段。',
              '看看結算台的反思提示，按左邊白鈕重抽牌組再試一次全目標通關吧。',
            ]
          : [
              'The outpost held through the main impact, though one objective fell short.',
              'Review the debrief reflection and press the left white button to reshuffle and retry.',
            ],
        hudLine: zh
          ? '旁白：部分達標！看看結算台反思提示，按左白鈕重抽再挑戰'
          : 'Narrator: Partial clear—check debrief note and retry on console',
      }
    }
    return {
      title: zh ? 'NOVA 旁白｜防護不足' : 'NOVA NARRATOR | DOME BREACH',
      lines: zh
        ? [
            '電力分配過於分散，風暴前緣突破了外層防線。',
            '模擬訓練的價值就是先看見風險——記得「先儲電、再撐盾與維生」，按左白鈕重新開局。',
          ]
        : [
            'Power spread too thin and the storm front breached the outer line.',
            'That is what training is for—store power first, then raise shields. Press the left white button to retry.',
          ],
      hudLine: zh
        ? '旁白：防護不足！先儲電再撐盾，按結算台左白鈕重新挑戰'
        : 'Narrator: Dome breach—store power first, then shield up',
    }
  }

  // 3. Live Companion Narration during Gameplay
  const lastCardId = run.played[run.played.length - 1]
  if (run.turns === 0 || !lastCardId) {
    return {
      title: zh ? 'NOVA 旁白｜實戰指揮' : 'NOVA NARRATOR | LIVE MISSION',
      lines: zh
        ? [
            `【${mission.title.zh.replace(/^事件 \d+｜|^訓練情境 \d+｜/, '')}】已鎖定。`,
            mission.purpose.zh,
            '先看一眼右前方彩色能量柱，再決定第一張要打什麼牌。',
          ]
        : [
            `[${mission.title.en.replace(/^EVENT \d+ \| |^TRAINING \d+ \| /, '')}] locked in.`,
            mission.purpose.en,
            'Check the distant colored pillars and choose your opening move.',
          ],
      hudLine: zh
        ? `旁白：${mission.title.zh} — 點右側箭頭看完整任務目的`
        : `Narrator: ${mission.title.en} — expand for mission brief`,
    }
  }

  const reaction = CARD_REACTIONS[lastCardId]
  const turnWarningZh =
    run.turns >= 4
      ? '⚠ 最後一回合：風暴前緣已經逼近玻璃穹頂，確認還缺哪一項目標。'
      : run.resources.power <= 1
        ? '⚡ 電力偏低：下一手可找「儲能分配」或免費的「太陽能翼」補電。'
        : `目前進度：${buildMissionGoalSummary('zh', mission, run)}`
  const turnWarningEn =
    run.turns >= 4
      ? '⚠ Final turn: the storm front is at the dome—verify any remaining target.'
      : run.resources.power <= 1
        ? '⚡ Low power: look for Power Reserve or free Solar Wing next.'
        : `Progress: ${buildMissionGoalSummary('en', mission, run)}`

  return {
    title: zh ? `NOVA 旁白｜第 ${run.turns} 回合` : `NOVA NARRATOR | TURN ${run.turns}`,
    lines: zh
      ? [reaction?.zh[run.turns % 2] ?? '指令執行完畢，繼續觀察遠方的能量柱變化。', turnWarningZh]
      : [reaction?.en[run.turns % 2] ?? 'Action executed. Keep watching the distant pillars.', turnWarningEn],
    hudLine: zh
      ? `旁白：${reaction?.zh[0] ?? ''}`
      : `Narrator: ${reaction?.en[0] ?? ''}`,
  }
}
