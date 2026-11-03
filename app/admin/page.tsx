'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
} from 'lucide-react'

type Message = {
  session_id: string
  role: 'user' | 'agent'
  text: string
  created_at: string
}

type Conversation = {
  id: string
  session_id: string
  created_at: string
  messages: Message[]
}

const eehuLogoUrl = '/Glossy Emerald Eehu Chat icon.png'

export default function AdminPage() {
  const router = useRouter()
  const [secret, setSecret] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchData = async (key: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/conversations', {
        headers: { 'x-admin-secret': key },
      })
      if (res.status === 401) {
        setError('Wrong password.')
        setAuthed(false)
        return
      }
      if (!res.ok) {
        setError('Failed to load conversations.')
        return
      }
      const data = await res.json()
      setConversations(data.conversations ?? [])
      setAuthed(true)
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData(secret)
  }

  const handleSignOut = () => {
    setAuthed(false)
    setSecret('')
    setConversations([])
    router.push('/')
  }

  const totalMessages = conversations.reduce((acc, c) => acc + c.messages.length, 0)
  const userMessages = conversations.reduce(
    (acc, c) => acc + c.messages.filter((m) => m.role === 'user').length,
    0
  )
  const escalations = conversations.filter((c) =>
    c.messages.some((m) => m.text.includes('WhatsApp'))
  ).length

  if (!authed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#020c07] px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8"
        >
          <div className="flex items-center gap-2.5 mb-6">
            <img
              src={eehuLogoUrl}
              alt="eehu!"
              className="size-9 object-contain shrink-0 drop-shadow-[0_8px_14px_rgba(0,120,40,0.2)]"
            />
            <span
              className="text-2xl font-extrabold text-emerald-400"
              style={{ fontFamily: 'var(--font-baloo2)' }}
            >
              eehu! Admin
            </span>
          </div>

          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Admin password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your admin secret"
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-4 pr-11 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Sign in'}
          </button>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-emerald-400"
            >
              <ArrowLeft className="size-3.5" /> Return to home
            </Link>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020c07] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-white/[0.02] px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src={eehuLogoUrl}
              alt="eehu!"
              className="size-8 object-contain shrink-0 drop-shadow-[0_8px_14px_rgba(0,120,40,0.2)]"
            />
            <span
              className="text-lg font-extrabold text-emerald-400"
              style={{ fontFamily: 'var(--font-baloo2)' }}
            >
              eehu! Admin
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchData(secret)}
              disabled={loading}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-400 disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-500/40 hover:text-red-400"
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          {[
            { label: 'Total sessions', value: conversations.length },
            { label: 'Total messages', value: totalMessages },
            { label: 'Visitor messages', value: userMessages },
            { label: 'WhatsApp requests', value: escalations },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-white/5 p-5">
              <p className="text-2xl font-extrabold text-emerald-400">{value}</p>
              <p className="mt-1 text-xs font-medium text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Conversations */}
        <h2 className="text-lg font-extrabold text-white mb-4">Conversations</h2>

        {conversations.length === 0 && !loading && (
          <p className="text-slate-400 text-sm">
            No conversations yet. They will appear here once visitors start chatting.
          </p>
        )}

        <div className="space-y-3">
          {conversations.map((conv) => {
            const isOpen = expanded === conv.session_id
            const firstUserMsg = conv.messages.find((m) => m.role === 'user')
            const date = new Date(conv.created_at).toLocaleString()
            const hasEscalation = conv.messages.some((m) => m.text.includes('WhatsApp'))

            return (
              <div
                key={conv.id}
                className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : conv.session_id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-white/[0.04]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-500">
                        {conv.session_id.slice(0, 8)}…
                      </span>
                      <span className="text-xs text-slate-500">{date}</span>
                      {hasEscalation && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          WhatsApp requested
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-300 truncate max-w-lg">
                      {firstUserMsg?.text ?? 'No messages'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className="text-xs text-slate-500">
                      {conv.messages.length} msg{conv.messages.length !== 1 ? 's' : ''}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="size-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="size-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-white/5 px-5 py-4 space-y-3 bg-black/20">
                    {conv.messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'rounded-br-md bg-emerald-600/80 text-white'
                              : 'rounded-bl-md bg-white/10 text-slate-300'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className="mt-1 text-[10px] opacity-60">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
