import { useState, useRef, useEffect } from 'react'
import { api, NOTTO_HELPLINE } from '../api'

const QUICK_PROMPTS = [
  'Can I donate blood if I have a tattoo?',
  'What is the NOTTO organ pledge process?',
  'How long does a donor heart remain viable?',
  'Can someone with diabetes or high BP donate?',
  'What are the eligibility requirements for blood?',
]

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your **LifeLink AI Health Assistant**. Ask me anything about blood donor eligibility, NOTTO organ pledge guidelines, or emergency donation preservation times!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [speechActive, setSpeechActive] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const speak = (text) => {
    if (!speechActive || typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const clean = text.replace(/[*_#]/g, '')
    const utt = new SpeechSynthesisUtterance(clean)
    utt.rate = 1.0
    utt.pitch = 1.05
    window.speechSynthesis.speak(utt)
  }

  const handleSend = async (queryText) => {
    const textToSend = queryText || input
    if (!textToSend.trim() || loading) return

    const userMsg = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/ai/chat', { message: textToSend })
      const aiMsg = {
        sender: 'ai',
        text: res.reply,
        source: res.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])
      speak(res.reply)
    } catch {
      // Offline fallback
      let fallback =
        'To donate blood in India, you must be 18–65 years old, weigh at least 45 kg, and have normal vitals. For organ pledge, visit NOTTO at https://notto.mohfw.gov.in/donor-pledge. For emergency support, call NOTTO helpline 1800-11-4770.'
      if (textToSend.toLowerCase().includes('tattoo')) {
        fallback = 'In India (NBTC guidelines), there is a mandatory 6-month waiting period after getting a tattoo or body piercing before you can safely donate blood.'
      } else if (textToSend.toLowerCase().includes('heart') || textToSend.toLowerCase().includes('time')) {
        fallback = 'A donor heart must be transplanted within 4 to 6 hours after retrieval. Kidneys last 24–36 hours, and liver 8–12 hours.'
      }
      const aiMsg = {
        sender: 'ai',
        text: fallback,
        source: 'LifeLink Clinical AI',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])
      speak(fallback)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-3.5 text-white shadow-2xl transition hover:scale-105 hover:shadow-red-500/40"
          title="Open LifeLink AI Assistant"
        >
          <span className="text-xl">🤖</span>
          <span className="hidden font-bold text-xs sm:inline-block pr-1">
            LifeLink AI Guide
          </span>
          {/* Pulsing indicator */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber-500" />
          </span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="flex h-[520px] w-[350px] sm:w-[400px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-950 to-red-950 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-red-600/30 text-lg border border-red-500/40">
                🤖
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">LifeLink AI Assistant</h3>
                <span className="flex items-center gap-1.5 text-[10px] text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  Active • NOTTO & NBTC Medical Knowledge
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSpeechActive(!speechActive)}
                className={`rounded-lg p-1.5 text-xs transition ${speechActive ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                title={speechActive ? 'Mute AI voice' : 'Enable AI voice'}
              >
                {speechActive ? '🔊' : '🔇'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white"
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed shadow-sm ${m.sender === 'user'
                      ? 'bg-red-600 text-white font-medium rounded-br-none'
                      : 'border border-slate-200 bg-white text-slate-800 rounded-bl-none'
                    }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
                <span className="mt-1 px-1 text-[9px] text-slate-400">{m.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-500 max-w-[70%]">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                <span>LifeLink AI is analyzing medical criteria…</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="border-t border-slate-200 bg-white px-3 py-2">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Popular Questions:
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about blood or organ donation…"
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700 disabled:opacity-40"
            >
              Send
            </button>
          </form>

          {/* Bottom helpline note */}
          <div className="bg-slate-100 px-3 py-1 text-center text-[10px] text-slate-500 border-t border-slate-200">
            Emergency? Dial <strong>108</strong> • NOTTO Helpline: <strong>{NOTTO_HELPLINE}</strong>
          </div>
        </div>
      )}
    </div>
  )
}
