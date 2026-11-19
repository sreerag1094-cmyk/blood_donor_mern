import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { NOTTO_OFFICIAL_URL } from '../api'

const SCENES = [
  {
    id: 'intro',
    title: 'The Race Against Time',
    subtitle: 'Why Every Second Matters in Blood & Organ Donation',
    duration: 8,
    badge: 'Introduction',
    accent: 'from-red-600 to-rose-700',
    organ: 'System Overview',
    timeLimit: 'Critical Golden Hours',
    narration:
      'Every two seconds in India, someone urgently requires blood. And every single year, over five hundred thousand individuals fight for their lives awaiting an organ transplant. Time is the ultimate difference between life and death.',
    facts: [
      { label: 'Blood Need', val: '1 Unit Every 2 Seconds' },
      { label: 'Transplant Waitlist', val: '500,000+ in India' },
      { label: 'Potential Lives Saved', val: '8 by One Deceased Donor' },
    ],
  },
  {
    id: 'heart-lungs',
    title: 'Heart & Lungs: The 4 to 6 Hour Window',
    subtitle: 'Cold Ischemic Preservation — The Race on Green Corridors',
    duration: 9,
    badge: 'Heart & Lungs',
    accent: 'from-rose-600 to-red-800',
    organ: 'Thoracic Organs',
    timeLimit: '4 – 6 Hours Only',
    narration:
      'The human heart and lungs are the most time-sensitive organs in all of medicine. Once retrieved from a brain-dead donor, a donor heart must be preserved at four degrees Celsius and begin beating inside the recipient within four to six hours.',
    facts: [
      { label: 'Preservation Window', val: '4 – 6 Hours' },
      { label: 'Storage Temperature', val: '4°C Hypothermic' },
      { label: 'Transport', val: 'Police Green Corridors' },
    ],
  },
  {
    id: 'liver-pancreas',
    title: 'Liver & Pancreas: 8 to 15 Hours',
    subtitle: 'Regeneration & Dual-Recipient Split Transplants',
    duration: 8,
    badge: 'Liver & Pancreas',
    accent: 'from-amber-600 to-orange-700',
    organ: 'Abdominal Organs',
    timeLimit: '8 – 12 Hours (Up to 15h)',
    narration:
      'A donor liver remains viable for eight to twelve hours in specialized preservation solution. Remarkable for its ability to regenerate, a single deceased donor liver can often be split by surgeons to save both an adult and an infant.',
    facts: [
      { label: 'Liver Viability', val: '8 – 12 Hours' },
      { label: 'Pancreas Viability', val: '12 – 18 Hours' },
      { label: 'Split Transplant', val: 'Saves 2 Patients at Once' },
    ],
  },
  {
    id: 'kidneys',
    title: 'Kidneys: 24 to 36 Hours',
    subtitle: 'Liberating Patients from Lifetime Dialysis',
    duration: 8,
    badge: 'Kidneys',
    accent: 'from-emerald-600 to-teal-800',
    organ: 'Renal System',
    timeLimit: '24 – 36 Hours (Up to 48h)',
    narration:
      'Kidneys possess the longest preservation window among solid organs, lasting twenty-four to thirty-six hours, and up to forty-eight hours with modern machine perfusion. One donor gives two kidneys, completely freeing two patients from lifelong dialysis.',
    facts: [
      { label: 'Static Cold Storage', val: '24 – 36 Hours' },
      { label: 'Pulsatile Perfusion', val: 'Up to 48 Hours' },
      { label: 'Dialysis Freedom', val: '2 Recipients per Donor' },
    ],
  },
  {
    id: 'corneas-tissues',
    title: 'Corneas & Tissues: Sight & Healing',
    subtitle: 'Donation Possible After Natural Cardiac Death',
    duration: 8,
    badge: 'Corneas & Tissues',
    accent: 'from-cyan-600 to-sky-800',
    organ: 'Ocular & Musculoskeletal',
    timeLimit: 'Retrieve within 6 hrs (Stored 14d – 5yr)',
    narration:
      'Unlike solid organs which require brain death, corneas and skin tissues can be donated after natural cardiac death within six hours. A cornea donation restores sight to two blind people, while tissue and bone grafts heal over fifty burn and trauma patients.',
    facts: [
      { label: 'Retrieval Deadline', val: 'Within 6 Hours of Death' },
      { label: 'Cornea Storage', val: 'Up to 14 Days' },
      { label: 'Skin & Tissue Banking', val: 'Up to 5 Years Frozen' },
    ],
  },
  {
    id: 'blood-platelets',
    title: 'Blood Components: The 5-Day Perishable Lifeline',
    subtitle: 'Platelets Expire in 5 Days — The Urgency Never Stops',
    duration: 8,
    badge: 'Blood & Platelets',
    accent: 'from-red-700 to-rose-900',
    organ: 'Hemic System',
    timeLimit: 'Platelets: 5 Days | RBC: 42 Days',
    narration:
      'Blood cannot be manufactured in a laboratory. While red blood cells survive up to forty-two days, life-saving platelets expire in just five days. Cancer and dengue patients constantly rely on voluntary blood donors to survive each week.',
    facts: [
      { label: 'Platelet Shelf Life', val: 'Only 5 Days!' },
      { label: 'Red Blood Cells', val: '35 – 42 Days' },
      { label: 'Frozen Plasma', val: 'Up to 1 Year' },
    ],
  },
  {
    id: 'pledge-finale',
    title: '1 Donor = 8 Lives Saved + 75 Healed',
    subtitle: 'Pledge with NOTTO (Government of India) & Give the Gift of Life',
    duration: 10,
    badge: 'The Ultimate Gift',
    accent: 'from-indigo-700 to-purple-900',
    organ: 'National Registry',
    timeLimit: 'Leave a Legacy that Outlives You',
    narration:
      'By pledging your organs with the National Organ and Tissue Transplant Organization, NOTTO, and regularly donating blood, you leave a legacy of boundless compassion. Be a hero today. Save a life tomorrow.',
    facts: [
      { label: 'Solid Organs', val: '8 Lives Saved' },
      { label: 'Tissues & Eyes', val: '75+ Healed' },
      { label: 'NOTTO Helpline', val: '1800-11-4770 (24x7)' },
    ],
  },
]

export default function DonationImportanceVideo() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const playerRef = useRef(null)
  const scene = SCENES[currentIdx]

  // Handle SpeechSynthesis Voiceover
  const speakScene = (idx) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const text = SCENES[idx].narration
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.98
    utterance.pitch = 1.05
    window.speechSynthesis.speak(utterance)
  }

  // Toggle narration sound
  const toggleVoice = () => {
    if (!voiceEnabled) {
      setVoiceEnabled(true)
      speakScene(currentIdx)
    } else {
      setVoiceEnabled(false)
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }

  // Auto-play progress loop
  useEffect(() => {
    if (!isPlaying) return
    const stepMs = 50
    const totalMs = scene.duration * 1000
    const stepIncrement = (stepMs / totalMs) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + stepIncrement >= 100) {
          // Advance to next scene
          setCurrentIdx((c) => {
            const next = (c + 1) % SCENES.length
            speakScene(next)
            return next
          })
          return 0
        }
        return prev + stepIncrement
      })
    }, stepMs)

    return () => clearInterval(timer)
  }, [isPlaying, currentIdx, scene.duration, voiceEnabled])

  const goToScene = (idx) => {
    setCurrentIdx(idx)
    setProgress(0)
    speakScene(idx)
  }

  const toggleFullscreen = () => {
    if (!playerRef.current) return
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(() => { })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => { })
      setIsFullscreen(false)
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-2xl">
      {/* Glow aura */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

      <div ref={playerRef} className="relative flex flex-col justify-between p-6 sm:p-10">
        {/* Top Video Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-red-600/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-400">
              <span className="h-2 w-2 animate-ping rounded-full bg-red-500" />
              Interactive Video Showcase
            </span>
            <span className="text-xs text-slate-400">
              Preservation Golden Hours & Impact
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Narration button */}
            <button
              onClick={toggleVoice}
              title={voiceEnabled ? 'Mute AI Narration' : 'Enable AI Voice Narration'}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition ${voiceEnabled
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/40'
                  : 'border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
            >
              {voiceEnabled ? (
                <>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  Narration Audio: ON
                </>
              ) : (
                <>🔇 Voice Narration (Click to Listen)</>
              )}
            </button>

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}
            </button>
          </div>
        </div>

        {/* Cinematic Video Stage / Canvas */}
        <div className="relative my-8 grid min-h-[380px] place-content-center items-center gap-8 lg:grid-cols-12">
          {/* Left Column: Visual Scene Graphic / Simulation */}
          <div className="flex flex-col items-center justify-center lg:col-span-5">
            <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-4 border-slate-800 bg-slate-900/90 shadow-inner">
              {/* Animated pulsating orbit */}
              <div
                className={`absolute inset-0 -m-3 animate-pulse rounded-full border-2 border-dashed opacity-50 ${currentIdx === 0
                    ? 'border-red-500'
                    : currentIdx === 1
                      ? 'border-rose-500'
                      : currentIdx === 2
                        ? 'border-amber-500'
                        : currentIdx === 3
                          ? 'border-emerald-500'
                          : currentIdx === 4
                            ? 'border-cyan-500'
                            : currentIdx === 5
                              ? 'border-red-600'
                              : 'border-indigo-500'
                  }`}
              />

              {/* Central Graphic based on Scene */}
              {currentIdx === 0 && (
                <div className="text-center">
                  <div className="text-6xl animate-bounce">⏱️</div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-widest text-red-400">
                    The Golden Hours
                  </div>
                  <div className="text-2xl font-black text-white">RACE AGAINST TIME</div>
                </div>
              )}

              {currentIdx === 1 && (
                <div className="text-center">
                  <div className="text-6xl animate-pulse">🫀</div>
                  <div className="mt-1 text-xs font-bold uppercase text-rose-400">
                    Heart & Lungs
                  </div>
                  <div className="text-3xl font-black text-white">4 – 6 HRS</div>
                  <div className="text-[11px] text-slate-400">Strict Cold Ischemia</div>
                </div>
              )}

              {currentIdx === 2 && (
                <div className="text-center">
                  <div className="text-6xl animate-pulse">🧬</div>
                  <div className="mt-1 text-xs font-bold uppercase text-amber-400">
                    Liver & Pancreas
                  </div>
                  <div className="text-3xl font-black text-white">8 – 15 HRS</div>
                  <div className="text-[11px] text-slate-400">Split Graft Capability</div>
                </div>
              )}

              {currentIdx === 3 && (
                <div className="text-center">
                  <div className="text-6xl animate-pulse">🩺</div>
                  <div className="mt-1 text-xs font-bold uppercase text-emerald-400">
                    Kidneys
                  </div>
                  <div className="text-3xl font-black text-white">24 – 36 HRS</div>
                  <div className="text-[11px] text-slate-400">Up to 48h with Perfusion</div>
                </div>
              )}

              {currentIdx === 4 && (
                <div className="text-center">
                  <div className="text-6xl animate-pulse">👁️</div>
                  <div className="mt-1 text-xs font-bold uppercase text-cyan-400">
                    Corneas & Tissues
                  </div>
                  <div className="text-3xl font-black text-white">&lt; 6 HOURS</div>
                  <div className="text-[11px] text-slate-400">Stored up to 14d / 5yr</div>
                </div>
              )}

              {currentIdx === 5 && (
                <div className="text-center">
                  <div className="text-6xl animate-pulse">🩸</div>
                  <div className="mt-1 text-xs font-bold uppercase text-red-400">
                    Platelets & Blood
                  </div>
                  <div className="text-3xl font-black text-rose-300">5 DAYS ONLY</div>
                  <div className="text-[11px] text-slate-400">Platelets Perish Fast</div>
                </div>
              )}

              {currentIdx === 6 && (
                <div className="text-center">
                  <div className="text-6xl animate-pulse">🇮🇳</div>
                  <div className="mt-1 text-xs font-bold uppercase text-indigo-400">
                    NOTTO Pledge
                  </div>
                  <div className="text-3xl font-black text-white">1 DONOR = 8</div>
                  <div className="text-[11px] text-slate-300">Govt of India Portal</div>
                </div>
              )}
            </div>

            {/* Time window ticker */}
            <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-1.5 text-xs text-slate-300">
              <span className="font-semibold text-white">Preservation Limit:</span>
              <span className="font-mono text-red-400">{scene.timeLimit}</span>
            </div>
          </div>

          {/* Right Column: Narrative, Medical Explainer & Dynamic Cards */}
          <div className="flex flex-col justify-center space-y-4 lg:col-span-7">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full bg-gradient-to-r px-3 py-0.5 text-xs font-semibold text-white ${scene.accent}`}
              >
                {scene.badge}
              </span>
              <span className="text-xs text-slate-400">
                Chapter {currentIdx + 1} of {SCENES.length}
              </span>
            </div>

            <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
              {scene.title}
            </h3>

            <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
              {scene.narration}
            </p>

            {/* Key Vital Facts Grid */}
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              {scene.facts.map((f, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm transition hover:border-slate-700"
                >
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">{f.label}</p>
                  <p className="mt-1 text-sm font-bold text-white">{f.val}</p>
                </div>
              ))}
            </div>

            {/* Action buttons inside video */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/organ-donation"
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700"
              >
                Pledge Organ Donation
              </Link>
              <a
                href={NOTTO_OFFICIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20"
              >
                <span>🏛️ Official NOTTO Portal</span>
                <span className="text-xs">↗</span>
              </a>
              <Link
                to="/donors"
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                Find Blood Donors
              </Link>
            </div>
          </div>
        </div>

        {/* Video Scrubber & Playback Controls */}
        <div className="border-t border-slate-800/80 pt-4">
          {/* Progress bar */}
          <div
            className="group relative h-2 w-full cursor-pointer rounded-full bg-slate-800"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const clickPercent = ((e.clientX - rect.left) / rect.width) * 100
              setProgress(clickPercent)
            }}
          >
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-75 ${scene.accent}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* Prev Scene */}
              <button
                onClick={() => goToScene((currentIdx - 1 + SCENES.length) % SCENES.length)}
                className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white"
                title="Previous Scene"
              >
                ⏮
              </button>

              {/* Play / Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-bold text-slate-950 transition hover:bg-slate-200"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>

              {/* Next Scene */}
              <button
                onClick={() => goToScene((currentIdx + 1) % SCENES.length)}
                className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white"
                title="Next Scene"
              >
                ⏭
              </button>

              {/* Reset */}
              <button
                onClick={() => goToScene(0)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-2 text-xs text-slate-400 hover:text-white"
                title="Replay Video from Start"
              >
                🔄 Replay
              </button>
            </div>

            {/* Scene Selector Tabs / Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              {SCENES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => goToScene(idx)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${currentIdx === idx
                      ? 'bg-red-600 text-white'
                      : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  {s.badge}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
