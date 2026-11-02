'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Bot,
  Check,
  CheckCheck,
  ChevronDown,
  Ellipsis,
  Headphones,
  MessageCircle,
  Minus,
  Paperclip,
  Send,
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
  { id: 3, text: 'Absolutely — I can help with that. What would you like to know?', sender: 'agent', time: '10:43 AM' },
]

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm ${small ? 'size-8' : 'size-11'}`}>
      <Sparkles className={small ? 'size-4' : 'size-5'} strokeWidth={2.2} />
    </span>
  )
}

function ChatHeader({ onClose }: { onClose: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200/80 bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <BrandMark />
          <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-emerald-500" aria-label="Online" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">Luma Support</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-600"><span className="size-1.5 rounded-full bg-emerald-500" /> We&apos;re online</p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-slate-400">
        <button type="button" className="rounded-lg p-2 transition hover:bg-slate-100 hover:text-slate-700" aria-label="More options"><Ellipsis className="size-4" /></button>
        <button type="button" onClick={onClose} className="rounded-lg p-2 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Minimize chat"><Minus className="size-4" /></button>
      </div>
    </header>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === 'user'
  return (
    <div className={`group flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${isUser ? 'rounded-br-md bg-violet-600 text-white shadow-sm shadow-violet-200' : 'rounded-bl-md bg-slate-100 text-slate-700'}`}>
          {message.text}
        </div>
        <div className={`mt-1.5 flex items-center gap-1.5 px-1 text-[10px] text-slate-400 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span>{message.time}</span>
          {message.status === 'read' && <CheckCheck className="size-3 text-violet-500" aria-label="Read" />}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3" aria-label="Luma is typing"><span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" /><span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" /><span className="size-1.5 animate-bounce rounded-full bg-slate-400" /></div>
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
      <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-500/10">
        <button type="button" className="mb-0.5 rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-violet-600" aria-label="Attach a file"><Paperclip className="size-4" /></button>
        <textarea ref={textareaRef} value={text} onChange={(event) => { setText(event.target.value); event.target.style.height = 'auto'; event.target.style.height = `${Math.min(event.target.scrollHeight, 96)}px` }} onKeyDown={onKeyDown} placeholder="Type a message..." rows={1} className="max-h-24 min-h-7 flex-1 resize-none bg-transparent py-1 text-[13px] text-slate-800 outline-none placeholder:text-slate-400" aria-label="Message" />
        <button type="button" onClick={submit} disabled={!text.trim() || disabled} className="mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400" aria-label="Send message"><Send className="size-3.5" /></button>
      </div>
      <p className="mt-2 text-center text-[10px] text-slate-400">Powered by <span className="font-medium text-slate-500">Luma</span></p>
    </footer>
  )
}

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(true)
  const [messages, setMessages] = useState(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const sendMessage = (text: string) => {
    setMessages((current) => [...current, { id: Date.now(), text, sender: 'user', time: 'Now', status: 'sent' }])
    setIsTyping(true)
    window.setTimeout(() => { setIsTyping(false); setMessages((current) => [...current, { id: Date.now() + 1, text: 'Thanks for reaching out! A specialist will be with you shortly.', sender: 'agent', time: 'Now' }]) }, 1200)
  }
  return (
    <>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.08),transparent_42%)]" />
      {isOpen && <section className="fixed bottom-24 right-5 z-20 flex h-[min(600px,calc(100vh-7.5rem))] w-[380px] max-w-[calc(100vw-2rem)] origin-bottom-right max-sm:inset-0 max-sm:h-[100dvh] max-sm:w-full max-sm:max-w-none max-sm:rounded-none animate-[chat-in_220ms_ease-out] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/15" aria-label="Chat with Luma Support"><ChatHeader onClose={() => setIsOpen(false)} /><MessageList messages={messages} isTyping={isTyping} /><MessageInput onSend={sendMessage} disabled={isTyping} /></section>}
      <button type="button" onClick={() => setIsOpen((open) => !open)} className="fixed bottom-5 right-5 z-30 flex size-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-xl shadow-violet-600/30 transition duration-200 hover:scale-105 hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-500/30" aria-label={isOpen ? 'Close chat' : 'Open chat'}>{isOpen ? <X className="size-5" /> : <MessageCircle className="size-6" />}<span className="absolute inset-0 -z-10 animate-ping rounded-full bg-violet-400/40" /></button>
    </>
  )
}

export default function Page() {
  return <main className="min-h-screen bg-[#f8f8fb]"><div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6"><div className="hidden text-center sm:block"><div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600"><Headphones className="size-5" /></div><p className="text-sm font-medium text-slate-500">A friendly support experience, everywhere.</p></div></div><ChatWidget /></main>
}
