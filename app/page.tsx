'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Check,
  CheckCheck,
  Ellipsis,
  MessageCircle,
  Paperclip,
  Send,
  X,
} from 'lucide-react'

type Message = {
  id: number
  text: string
  sender: 'agent' | 'user'
  time: string
  status?: 'sent' | 'read'
}

const initialMessages: Message[] = [
  { id: 1, text: 'Hi there! How can we help you today?', sender: 'agent', time: '10:42 AM' },
  { id: 2, text: 'I have a question about getting started.', sender: 'user', time: '10:43 AM', status: 'read' },
  { id: 3, text: 'Absolutely. I can help with that. What would you like to know?', sender: 'agent', time: '10:43 AM' },
]

const eehuLogoUrl = '/Glossy Emerald Eehu Chat icon.png'

function BrandMark({ small = false }: { small?: boolean }) {
  return <img src={eehuLogoUrl} alt="eehu!" className={`shrink-0 object-contain drop-shadow-[0_8px_14px_rgba(0,120,40,0.2)] ${small ? 'size-9' : 'size-12'}`} />
}

function ChatHeader({ onClose, onReset }: { onClose: () => void; onReset: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const copyChatLink = async () => {
    await navigator.clipboard?.writeText(window.location.href)
    setIsMenuOpen(false)
  }
  return (
    <header className="relative flex items-center justify-between border-b border-slate-200/80 bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <BrandMark />
        </div>
        <div>
          <h2 className="font-baloo2 text-3xl font-extrabold text-emerald-500">eehu!</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600"><span className="size-1.5 rounded-full bg-emerald-500" /> We&apos;re online</p>
        </div>
      </div>
      <div className="relative flex items-center gap-1 text-slate-400">
        <button type="button" onClick={() => setIsMenuOpen((o) => !o)} className="rounded-lg p-2 transition hover:bg-slate-100 hover:text-slate-700" aria-label="More options" aria-expanded={isMenuOpen} aria-haspopup="menu"><Ellipsis className="size-5" /></button>
        <button type="button" onClick={onClose} className="rounded-lg p-2 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close chat"><X className="size-5" /></button>
        {isMenuOpen && (
          <div role="menu" aria-label="Chat options" className="absolute right-0 top-10 z-30 w-44 rounded-xl border border-slate-200 bg-white p-1.5 text-sm shadow-xl shadow-slate-900/10">
            <button type="button" role="menuitem" onClick={() => { onReset(); setIsMenuOpen(false) }} className="w-full rounded-lg px-3 py-2 text-left font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700">Start a new chat</button>
            <button type="button" role="menuitem" onClick={copyChatLink} className="w-full rounded-lg px-3 py-2 text-left font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700">Copy chat link</button>
          </div>
        )}
      </div>
    </header>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === 'user'
  return (
    <div className={`group flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-[15px] font-medium leading-relaxed ${isUser ? 'rounded-br-md bg-emerald-600 text-white shadow-sm shadow-emerald-200' : 'rounded-bl-md bg-slate-100 text-slate-700'}`}>
          {message.text}
        </div>
        <div className={`mt-1.5 flex items-center gap-1.5 px-1 text-xs font-medium text-slate-400 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span>{message.time}</span>
          {message.status === 'read' && <CheckCheck className="size-3 text-emerald-500" aria-label="Read" />}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3.5" aria-label="eehu! is typing">
      <span className="size-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
      <span className="size-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
      <span className="size-2 animate-bounce rounded-full bg-slate-400" />
    </div>
  )
}

function MessageList({ messages, isTyping }: { messages: Message[]; isTyping: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#fcfcfd] px-5 py-5">
      <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> Today <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="space-y-4">
        {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
        {isTyping && <div className="flex"><TypingIndicator /></div>}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function MessageInput({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const submit = () => {
    const value = text.trim()
    if (!value || disabled) return
    onSend(value)
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault()
      submit()
    }
  }
  return (
    <footer className="border-t border-slate-200/80 bg-white p-4">
      <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10">
        <button type="button" className="mb-0.5 rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-emerald-600" aria-label="Attach a file"><Paperclip className="size-4" /></button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => { setText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px` }}
          onKeyDown={onKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="max-h-24 min-h-7 flex-1 resize-none bg-transparent py-1 text-[15px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
          aria-label="Message"
        />
        <button type="button" onClick={submit} disabled={!text.trim() || disabled} className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400" aria-label="Send message">
          <Send className="size-4" />
        </button>
      </div>
      <p className="mt-2 text-center text-xs font-medium text-slate-400">Powered by <span className="font-baloo2 text-2xl font-extrabold text-emerald-500">eehu!</span></p>
    </footer>
  )
}

function ChatWidget({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const [messages, setMessages] = useState(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const resetChat = () => { setMessages(initialMessages); setIsTyping(false) }
  const sendMessage = (text: string) => {
    setMessages((c) => [...c, { id: Date.now(), text, sender: 'user', time: 'Now', status: 'sent' }])
    setIsTyping(true)
    window.setTimeout(() => {
      setIsTyping(false)
      setMessages((c) => [...c, { id: Date.now() + 1, text: 'Thanks for reaching out! A specialist will be with you shortly.', sender: 'agent', time: 'Now' }])
    }, 1200)
  }
  return (
    <>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.08),transparent_42%)]" />
      {isOpen && (
        <section className="fixed bottom-24 right-5 z-20 flex h-[min(660px,calc(100vh-7.5rem))] w-[420px] max-w-[calc(100vw-2rem)] origin-bottom-right max-sm:inset-0 max-sm:z-[60] max-sm:h-[100dvh] max-sm:w-full max-sm:max-w-none max-sm:rounded-none animate-[chat-in_220ms_ease-out] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/15" aria-label="Chat with eehu! Support">
          <ChatHeader onClose={() => setIsOpen(false)} onReset={resetChat} />
          <MessageList messages={messages} isTyping={isTyping} />
          <MessageInput onSend={sendMessage} disabled={isTyping} />
        </section>
      )}
      <button type="button" onClick={() => setIsOpen((o) => !o)} className={`fixed bottom-5 right-5 z-30 flex size-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 transition duration-200 hover:scale-105 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 ${isOpen ? 'max-sm:hidden' : ''}`} aria-label={isOpen ? 'Close chat' : 'Open chat'}>
        {isOpen ? <X className="size-5" /> : <MessageCircle className="size-6" />}
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-emerald-400/40" />
      </button>
    </>
  )
}

function Nav({ chatOpen }: { chatOpen: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${chatOpen ? 'max-sm:hidden' : ''} ${scrolled ? 'border-b border-white/[0.08] bg-[#020c07]/80 backdrop-blur-md' : ''}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-1.5">
          <BrandMark />
          <span className="font-baloo2 text-3xl font-extrabold text-emerald-400">eehu!</span>
        </div>
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
          <a href="#features" className="transition hover:text-emerald-400">Features</a>
          <a href="#benefits" className="transition hover:text-emerald-400">For businesses</a>
          <a href="#install" className="transition hover:text-emerald-400">Install</a>
        </div>
        <button type="button" onClick={() => document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Message"]')?.focus()} className="hidden items-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 sm:flex">
          Try the demo <ArrowRight className="size-4" />
        </button>
      </div>
    </nav>
  )
}

function HeroMock() {
  const [phase, setPhase] = useState<'idle' | 'typing' | 'replied'>('idle')
  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('typing'), 2200)
    const t2 = window.setTimeout(() => setPhase('replied'), 3800)
    return () => { window.clearTimeout(t1); window.clearTimeout(t2) }
  }, [])
  return (
    <div
      className="relative min-h-[410px] rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8"
      style={{ animation: 'slide-in-right 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both, float 6s ease-in-out 1.2s infinite' }}
    >
      <div className="absolute inset-6 rounded-[1.5rem] border border-white/5 bg-white/5" />
      <div className="relative flex h-full min-h-[360px] flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-sm sm:p-7">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400"><span className="size-2 rounded-full bg-emerald-400" /> YOUR WEBSITE</div>
            <div className="flex gap-1.5"><span className="size-2 rounded-full bg-slate-700" /><span className="size-2 rounded-full bg-slate-700" /><span className="size-2 rounded-full bg-slate-700" /></div>
          </div>
          <div className="mt-12 max-w-xs">
            <div className="h-2 w-16 rounded-full bg-emerald-500/30" />
            <div className="mt-4 h-5 w-4/5 rounded-full bg-white/10" />
            <div className="mt-3 h-3 w-3/5 rounded-full bg-white/5" />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-800 p-4 shadow-lg shadow-black/20">
          <div className="flex items-center gap-3">
            <BrandMark small />
            <div>
              <p className="text-xs font-semibold text-white">eehu! Support</p>
              <p className="text-[10px] text-emerald-400">Online now</p>
            </div>
            <span className="ml-auto flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white"><MessageCircle className="size-3.5" /></span>
          </div>
          <p className="mt-4 rounded-xl rounded-bl-sm bg-slate-700/60 px-3 py-2.5 text-xs leading-5 text-slate-300" style={{ animation: 'msg-pop 0.4s ease-out 0.9s both' }}>
            Hi! Need help choosing the right plan?
          </p>
          {phase === 'typing' && (
            <div className="mt-2 flex justify-end" style={{ animation: 'msg-pop 0.3s ease-out both' }}>
              <p className="rounded-xl rounded-br-sm bg-emerald-600/80 px-3 py-2.5 text-xs leading-5 text-white">Yes, what plans do you offer?</p>
            </div>
          )}
          {phase === 'replied' && (
            <>
              <div className="mt-2 flex justify-end" style={{ animation: 'msg-pop 0.3s ease-out both' }}>
                <p className="rounded-xl rounded-br-sm bg-emerald-600/80 px-3 py-2.5 text-xs leading-5 text-white">Yes, what plans do you offer?</p>
              </div>
              <p className="mt-2 rounded-xl rounded-bl-sm bg-slate-700/60 px-3 py-2.5 text-xs leading-5 text-slate-300" style={{ animation: 'msg-pop 0.4s ease-out 0.15s both' }}>
                We have Starter, Growth, and Enterprise. Want a quick breakdown?
              </p>
            </>
          )}
          {phase === 'idle' && (
            <div className="mt-3 flex items-center gap-1.5" style={{ animation: 'fade-in 0.4s ease-out 1.2s both' }}>
              <span className="size-1.5 rounded-full bg-slate-600" />
              <span className="size-1.5 rounded-full bg-slate-600" />
              <span className="size-1.5 rounded-full bg-slate-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ index, title, children, className = '' }: { index: string; title: string; children: string; className?: string }) {
  return (
    <article className={`rounded-[1.35rem] border border-white/5 bg-white/5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-500/20 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-emerald-900/20 ${className}`}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">{index}</p>
      <h3 className="mt-8 font-extrabold tracking-[-0.035em] text-white">{title}</h3>
      <p className="mt-3 leading-7 text-slate-400">{children}</p>
    </article>
  )
}

export default function Page() {
  const [chatOpen, setChatOpen] = useState(true)
  return (
    <main className="bg-dot-grid min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(52,211,153,0.12),transparent_70%)]" />

      <Nav chatOpen={chatOpen} />

      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl gap-14 px-6 pb-24 pt-12 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-8 lg:pb-32 lg:pt-20">
        <div className="absolute -left-32 top-0 size-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative" style={{ animation: 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both' }}>
          <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.02] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
            Turn every website visit into a <span className="text-emerald-400">conversation.</span>
          </h1>
          <p className="mt-7 max-w-xl text-xl leading-9 text-slate-300" style={{ animation: 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.12s both' }}>
            When a customer gets stuck, eehu! gives them a clear next step before they leave. Add helpful support to your existing site without rebuilding pages or creating another inbox for your team.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3" style={{ animation: 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.22s both' }}>
            <button type="button" onClick={() => document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Message"]')?.focus()} className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-emerald-500/25 transition hover:bg-emerald-400">
              See eehu! in action <ArrowRight className="size-4" />
            </button>
            <a href="#benefits" className="rounded-full border border-white/10 px-6 py-3.5 text-base font-semibold text-slate-300 transition hover:border-white/20 hover:text-white">Why businesses use it</a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-500" style={{ animation: 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.32s both' }}>
            <span className="flex items-center gap-2"><Check className="size-4 text-emerald-400" /> Installs in minutes</span>
            <span className="flex items-center gap-2"><Check className="size-4 text-emerald-400" /> Works with any site</span>
            <span className="flex items-center gap-2"><Check className="size-4 text-emerald-400" /> No code required</span>
          </div>
        </div>
        <HeroMock />
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
        <div className="mb-12 max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-400">One small widget. A bigger business.</p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">Your customers get answers. Your team gets time back.</h2>
        </div>
        <div className="grid items-end gap-4 md:grid-cols-[1.4fr_1fr_1.2fr]">
          <FeatureCard index="01 / The rescue" title="Catch the moment someone almost leaves" className="p-9 text-lg min-h-[280px] md:min-h-[320px]">When a visitor pauses on pricing or setup, eehu! gives them a useful next step instead of another dead end.</FeatureCard>
          <FeatureCard index="02 / The memory" title="Make every handoff feel informed" className="p-6 text-sm min-h-[220px] md:-translate-y-10">Your team sees what the customer tried, where they got stuck, and what they need, so nobody asks them to start over.</FeatureCard>
          <FeatureCard index="03 / The signal" title="Turn repeated friction into decisions" className="p-8 text-base min-h-[250px] md:translate-y-6 md:min-h-[270px]">Spot the questions your website keeps failing to answer, then fix the page, offer, or process behind them.</FeatureCard>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="border-y border-white/5 bg-white/[0.03]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-400">Made for the web you already have</p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">A smarter layer on top of your existing website.</h2>
            <p className="mt-5 max-w-md text-lg leading-8 text-slate-400">No migration, no redesign, no months-long implementation. Add eehu! to the places your customers already trust.</p>
          </div>
          <div className="grid items-end gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-8 min-h-[220px] transition duration-200 hover:-translate-y-1 hover:border-emerald-500/20 hover:bg-white/[0.07]">
              <svg viewBox="0 0 80 80" className="size-14" aria-hidden="true">
                <path d="M40 8 C55 5, 72 18, 74 35 C76 52, 63 70, 46 73 C29 76, 10 65, 7 48 C4 31, 18 11, 40 8Z" fill="rgba(52,211,153,0.18)" />
                <path d="M40 8 C55 5, 72 18, 74 35 C76 52, 63 70, 46 73 C29 76, 10 65, 7 48 C4 31, 18 11, 40 8Z" fill="none" stroke="rgba(52,211,153,0.35)" strokeWidth="1.5" />
                <text x="40" y="46" textAnchor="middle" fontSize="22" fontWeight="800" fill="rgb(52,211,153)" fontFamily="sans-serif">01</text>
              </svg>
              <h3 className="mt-6 text-lg font-extrabold text-white">Drop-in setup</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">One lightweight snippet works across your marketing site, store, or customer portal.</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 min-h-[180px] sm:translate-y-4 transition duration-200 hover:-translate-y-1 hover:border-emerald-500/20 hover:bg-white/[0.07]">
              <svg viewBox="0 0 80 80" className="size-14" aria-hidden="true">
                <path d="M38 6 C56 2, 75 16, 76 36 C77 56, 60 74, 40 75 C20 76, 4 60, 5 40 C6 20, 20 10, 38 6Z" fill="rgba(16,185,129,0.15)" />
                <path d="M38 6 C56 2, 75 16, 76 36 C77 56, 60 74, 40 75 C20 76, 4 60, 5 40 C6 20, 20 10, 38 6Z" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" />
                <text x="40" y="46" textAnchor="middle" fontSize="22" fontWeight="800" fill="rgb(16,185,129)" fontFamily="sans-serif">02</text>
              </svg>
              <h3 className="mt-6 text-base font-extrabold text-white">A trusted experience</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">Keep your brand, your voice, and your customer conversations in one calm place.</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 min-h-[190px] sm:-translate-y-3 transition duration-200 hover:-translate-y-1 hover:border-emerald-500/20 hover:bg-white/[0.07]">
              <svg viewBox="0 0 80 80" className="size-14" aria-hidden="true">
                <path d="M42 5 C62 8, 77 24, 75 44 C73 64, 56 78, 36 76 C16 74, 3 57, 5 37 C7 17, 22 2, 42 5Z" fill="rgba(5,150,105,0.18)" />
                <path d="M42 5 C62 8, 77 24, 75 44 C73 64, 56 78, 36 76 C16 74, 3 57, 5 37 C7 17, 22 2, 42 5Z" fill="none" stroke="rgba(5,150,105,0.35)" strokeWidth="1.5" />
                <text x="40" y="46" textAnchor="middle" fontSize="22" fontWeight="800" fill="rgb(5,150,105)" fontFamily="sans-serif">03</text>
              </svg>
              <h3 className="mt-6 text-base font-extrabold text-white">Always available</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">Help does not stop when your team signs off. eehu! is ready around the clock.</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-9 min-h-[240px] transition duration-200 hover:-translate-y-1 hover:border-emerald-500/20 hover:bg-white/[0.07]">
              <svg viewBox="0 0 80 80" className="size-14" aria-hidden="true">
                <path d="M36 4 C58 0, 78 18, 77 40 C76 62, 58 79, 36 78 C14 77, -1 60, 3 38 C7 16, 14 8, 36 4Z" fill="rgba(52,211,153,0.12)" />
                <path d="M36 4 C58 0, 78 18, 77 40 C76 62, 58 79, 36 78 C14 77, -1 60, 3 38 C7 16, 14 8, 36 4Z" fill="none" stroke="rgba(52,211,153,0.28)" strokeWidth="1.5" />
                <text x="40" y="46" textAnchor="middle" fontSize="22" fontWeight="800" fill="rgb(52,211,153)" fontFamily="sans-serif">04</text>
              </svg>
              <h3 className="mt-6 text-xl font-extrabold text-white">Built to learn</h3>
              <p className="mt-2 text-base leading-7 text-slate-400">See what customers ask most and turn real conversations into better decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="install" className="mx-auto max-w-6xl px-6 py-20 text-center lg:px-8">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-emerald-500/20 bg-emerald-500/5 px-6 py-14 shadow-2xl shadow-emerald-900/20 sm:px-12">
          <h2 className="text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">Give your website a better way to help.</h2>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-slate-300">Try the live chat in the corner, then imagine it working across every page of your business.</p>
          <button type="button" onClick={() => document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Message"]')?.focus()} className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-emerald-500/25 transition hover:bg-emerald-400">
            Start a conversation <ArrowRight className="size-4" />
          </button>
        </div>
      </section>

      <ChatWidget isOpen={chatOpen} setIsOpen={setChatOpen} />
    </main>
  )
}
