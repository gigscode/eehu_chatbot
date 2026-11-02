'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CheckCheck,
  ChevronDown,
  Code2,
  Ellipsis,
  Headphones,
  MessageCircle,
  Minus,
  Paperclip,
  Send,
  ShieldCheck,
  Sparkles,
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
        <div className="relative">
          <BrandMark />
          <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-emerald-500" aria-label="Online" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">eehu! Support</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-600"><span className="size-1.5 rounded-full bg-emerald-500" /> We&apos;re online</p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-slate-400">
        <button type="button" onClick={() => setIsMenuOpen((open) => !open)} className="rounded-lg p-2 transition hover:bg-slate-100 hover:text-slate-700" aria-label="More options" aria-expanded={isMenuOpen} aria-haspopup="menu"><Ellipsis className="size-4" /></button>
        <button type="button" onClick={onClose} className="rounded-lg p-2 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Minimize chat"><Minus className="size-4" /></button>
        {isMenuOpen && <div role="menu" aria-label="Chat options" className="absolute right-5 top-14 z-30 w-44 rounded-xl border border-slate-200 bg-white p-1.5 text-sm shadow-xl shadow-slate-900/10">
          <button type="button" role="menuitem" onClick={() => { onReset(); setIsMenuOpen(false) }} className="w-full rounded-lg px-3 py-2 text-left font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700">Start a new chat</button>
          <button type="button" role="menuitem" onClick={copyChatLink} className="w-full rounded-lg px-3 py-2 text-left font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700">Copy chat link</button>
        </div>}
      </div>
    </header>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === 'user'
  return (
    <div className={`group flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${isUser ? 'rounded-br-md bg-emerald-600 text-white shadow-sm shadow-emerald-200' : 'rounded-bl-md bg-slate-100 text-slate-700'}`}>
          {message.text}
        </div>
        <div className={`mt-1.5 flex items-center gap-1.5 px-1 text-[10px] text-slate-400 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span>{message.time}</span>
          {message.status === 'read' && <CheckCheck className="size-3 text-emerald-500" aria-label="Read" />}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3" aria-label="eehu! is typing"><span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" /><span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" /><span className="size-1.5 animate-bounce rounded-full bg-slate-400" /></div>
}

function MessageList({ messages, isTyping }: { messages: Message[]; isTyping: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#fcfcfd] px-5 py-5">
      <div className="mb-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400"><span className="h-px flex-1 bg-slate-200" /> Today <span className="h-px flex-1 bg-slate-200" /></div>
      <div className="space-y-4">{messages.map((message) => <MessageBubble key={message.id} message={message} />)}{isTyping && <div className="flex"><TypingIndicator /></div>}<div ref={bottomRef} /></div>
    </div>
  )
}

function MessageInput({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const submit = () => { const value = text.trim(); if (!value || disabled) return; onSend(value); setText(''); if (textareaRef.current) textareaRef.current.style.height = 'auto' }
  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); submit() } }
  return (
    <footer className="border-t border-slate-200/80 bg-white p-4">
      <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10">
        <button type="button" className="mb-0.5 rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-emerald-600" aria-label="Attach a file"><Paperclip className="size-4" /></button>
        <textarea ref={textareaRef} value={text} onChange={(event) => { setText(event.target.value); event.target.style.height = 'auto'; event.target.style.height = `${Math.min(event.target.scrollHeight, 96)}px` }} onKeyDown={onKeyDown} placeholder="Type a message..." rows={1} className="max-h-24 min-h-7 flex-1 resize-none bg-transparent py-1 text-[13px] text-slate-800 outline-none placeholder:text-slate-400" aria-label="Message" />
        <button type="button" onClick={submit} disabled={!text.trim() || disabled} className="mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400" aria-label="Send message"><Send className="size-3.5" /></button>
      </div>
      <p className="mt-2 text-center text-[10px] text-slate-400">Powered by <span className="font-medium text-emerald-700">eehu!</span></p>
    </footer>
  )
}

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(true)
  const [messages, setMessages] = useState(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const resetChat = () => {
    setMessages(initialMessages)
    setIsTyping(false)
  }
  const sendMessage = (text: string) => {
    setMessages((current) => [...current, { id: Date.now(), text, sender: 'user', time: 'Now', status: 'sent' }])
    setIsTyping(true)
    window.setTimeout(() => { setIsTyping(false); setMessages((current) => [...current, { id: Date.now() + 1, text: 'Thanks for reaching out! A specialist will be with you shortly.', sender: 'agent', time: 'Now' }]) }, 1200)
  }
  return (
    <>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.08),transparent_42%)]" />
      {isOpen && <section className="fixed bottom-24 right-5 z-20 flex h-[min(600px,calc(100vh-7.5rem))] w-[380px] max-w-[calc(100vw-2rem)] origin-bottom-right max-sm:inset-0 max-sm:h-[100dvh] max-sm:w-full max-sm:max-w-none max-sm:rounded-none animate-[chat-in_220ms_ease-out] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/15" aria-label="Chat with eehu! Support"><ChatHeader onClose={() => setIsOpen(false)} onReset={resetChat} /><MessageList messages={messages} isTyping={isTyping} /><MessageInput onSend={sendMessage} disabled={isTyping} /></section>}
      <button type="button" onClick={() => setIsOpen((open) => !open)} className={`fixed bottom-5 right-5 z-30 flex size-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 transition duration-200 hover:scale-105 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 ${isOpen ? 'max-sm:hidden' : ''}`} aria-label={isOpen ? 'Close chat' : 'Open chat'}>{isOpen ? <X className="size-5" /> : <MessageCircle className="size-6" />}<span className="absolute inset-0 -z-10 animate-ping rounded-full bg-emerald-400/40" /></button>
    </>
  )
}

function FeatureCard({ index, title, children }: { index: string; title: string; children: string }) {
  return (
    <article className="rounded-[1.35rem] border border-slate-200/80 bg-white p-7 shadow-sm shadow-slate-900/[0.04] transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/[0.08]">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">{index}</p>
      <h3 className="mt-8 text-xl font-bold tracking-[-0.035em] text-slate-950">{title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-slate-500">{children}</p>
    </article>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f8fb] text-slate-900">
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-2.5"><BrandMark small /><span className="text-lg font-bold tracking-[-0.04em]">eehu!</span></div>
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex"><a href="#features" className="transition hover:text-emerald-600">Features</a><a href="#benefits" className="transition hover:text-emerald-600">For businesses</a><a href="#install" className="transition hover:text-emerald-600">Install</a></div>
        <button type="button" onClick={() => document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Message"]')?.focus()} className="hidden items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 sm:flex">Try the demo <ArrowRight className="size-4" /></button>
      </nav>

      <section className="relative mx-auto grid max-w-6xl gap-14 px-6 pb-24 pt-12 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-8 lg:pb-32 lg:pt-20">
        <div className="absolute -left-32 top-0 size-96 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm"><span className="size-1.5 rounded-full bg-emerald-500" /> Support that feels human</div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.065em] text-slate-950 sm:text-6xl lg:text-7xl">Turn every website visit into a <span className="text-emerald-600">conversation.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500">When a customer gets stuck, eehu! gives them a clear next step before they leave. Add helpful support to your existing site without rebuilding pages or creating another inbox for your team.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3"><button type="button" onClick={() => document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Message"]')?.focus()} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-600/25 transition hover:bg-emerald-700">See eehu! in action <ArrowRight className="size-4" /></button><a href="#benefits" className="rounded-full px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900">Why businesses use it</a></div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-400"><span className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> Installs in minutes</span><span className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> Works with any site</span><span className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> No code required</span></div>
        </div>
        <div className="relative min-h-[410px] rounded-[2rem] border border-white/80 bg-gradient-to-br from-emerald-100 via-white to-green-100 p-5 shadow-2xl shadow-emerald-900/10 sm:p-8"><div className="absolute inset-6 rounded-[1.5rem] border border-white/80 bg-white/50" /><div className="relative flex h-full min-h-[360px] flex-col justify-between rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-sm sm:p-7"><div><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-semibold text-slate-400"><span className="size-2 rounded-full bg-emerald-400" /> YOUR WEBSITE</div><div className="flex gap-1.5"><span className="size-2 rounded-full bg-slate-200" /><span className="size-2 rounded-full bg-slate-200" /><span className="size-2 rounded-full bg-slate-200" /></div></div><div className="mt-12 max-w-xs"><div className="h-2 w-16 rounded-full bg-emerald-200" /><div className="mt-4 h-5 w-4/5 rounded-full bg-slate-200" /><div className="mt-3 h-3 w-3/5 rounded-full bg-slate-100" /></div></div><div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-emerald-900/10"><div className="flex items-center gap-3"><BrandMark small /><div><p className="text-xs font-semibold text-slate-900">eehu! Support</p><p className="text-[10px] text-emerald-600">Online now</p></div><span className="ml-auto flex size-7 items-center justify-center rounded-full bg-emerald-600 text-white"><MessageCircle className="size-3.5" /></span></div><p className="mt-4 rounded-xl rounded-bl-sm bg-slate-100 px-3 py-2.5 text-xs leading-5 text-slate-600">Hi! Need help choosing the right plan?</p><div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400"><span className="size-1.5 rounded-full bg-slate-300" /><span className="size-1.5 rounded-full bg-slate-300" /><span className="size-1.5 rounded-full bg-slate-300" /></div></div></div></div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 pb-24 lg:px-8"><div className="mb-10 max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">One small widget. A bigger business.</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">Your customers get answers. Your team gets time back.</h2></div><div className="grid gap-4 md:grid-cols-3"><FeatureCard index="01 / The rescue" title="Catch the moment someone almost leaves">When a visitor pauses on pricing or setup, eehu! gives them a useful next step instead of another dead end.</FeatureCard><FeatureCard index="02 / The memory" title="Make every handoff feel informed">Your team sees what the customer tried, where they got stuck, and what they need, so nobody asks them to start over.</FeatureCard><FeatureCard index="03 / The signal" title="Turn repeated friction into decisions">Spot the questions your website keeps failing to answer, then fix the page, offer, or process behind them.</FeatureCard></div></section>

      <section id="benefits" className="border-y border-slate-200/70 bg-white/70"><div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Made for the web you already have</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">A smarter layer on top of your existing website.</h2><p className="mt-5 max-w-md leading-7 text-slate-500">No migration, no redesign, no months-long implementation. Add eehu! to the places your customers already trust.</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-emerald-50 p-5"><Code2 className="size-5 text-emerald-600" /><h3 className="mt-5 font-semibold">Drop-in setup</h3><p className="mt-2 text-sm leading-6 text-slate-500">One lightweight snippet works across your marketing site, store, or customer portal.</p></div><div className="rounded-2xl bg-green-50 p-5"><ShieldCheck className="size-5 text-green-600" /><h3 className="mt-5 font-semibold">A trusted experience</h3><p className="mt-2 text-sm leading-6 text-slate-500">Keep your brand, your voice, and your customer conversations in one calm place.</p></div><div className="rounded-2xl bg-amber-50 p-5"><Headphones className="size-5 text-amber-600" /><h3 className="mt-5 font-semibold">Always available</h3><p className="mt-2 text-sm leading-6 text-slate-500">Help does not stop when your team signs off. eehu! is ready around the clock.</p></div><div className="rounded-2xl bg-emerald-50 p-5"><BarChart3 className="size-5 text-emerald-600" /><h3 className="mt-5 font-semibold">Built to learn</h3><p className="mt-2 text-sm leading-6 text-slate-500">See what customers ask most and turn real conversations into better decisions.</p></div></div></div></section>

      <section id="install" className="mx-auto max-w-6xl px-6 py-20 text-center lg:px-8"><div className="mx-auto max-w-2xl rounded-[2rem] bg-slate-950 px-6 py-14 text-white shadow-2xl shadow-slate-900/15 sm:px-12"><Sparkles className="mx-auto size-6 text-emerald-300" /><h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Give your website a better way to help.</h2><p className="mx-auto mt-4 max-w-lg leading-7 text-slate-300">Try the live chat in the corner, then imagine it working across every page of your business.</p><button type="button" onClick={() => document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Message"]')?.focus()} className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100">Start a conversation <ArrowRight className="size-4" /></button></div></section>
      <ChatWidget />
    </main>
  )
}
