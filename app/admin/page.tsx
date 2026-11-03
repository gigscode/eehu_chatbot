'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
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
  lead_name: string | null
  lead_contact: string | null
  lead_service: string | null
  status: 'new' | 'contacted' | 'quote_sent' | 'won' | 'lost'
  deal_value: number
  notes: string
  follow_up_date: string | null
  next_action: string | null
  updated_at: string
  created_at: string
  messages: Message[]
}

const eehuLogoUrl = '/Glossy Emerald Eehu Chat icon.png'

const STATUS_LABELS: Record<Conversation['status'], string> = {
  new: 'New',
  contacted: 'Contacted',
  quote_sent: 'Quote sent',
  won: 'Won',
  lost: 'Lost',
}

const STATUS_COLORS: Record<Conversation['status'], string> = {
  new: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  contacted: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  quote_sent: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  won: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  lost: 'bg-red-500/20 text-red-300 border-red-500/30',
}

type QueueTab = 'needs_action' | 'active' | 'won' | 'all'

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getDueDateStatus(dueDateStr: string | null): { label: string; isOverdue: boolean; isToday: boolean } | null {
  if (!dueDateStr) return null
  const due = new Date(dueDateStr)
  if (isNaN(due.getTime())) return null

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const todayEnd = todayStart + 24 * 60 * 60 * 1000 - 1
  const dueTime = due.getTime()

  if (dueTime < todayStart) {
    return { label: 'Overdue', isOverdue: true, isToday: false }
  }
  if (dueTime <= todayEnd) {
    return { label: 'Due today', isOverdue: false, isToday: true }
  }
  const diffDays = Math.ceil((dueTime - todayEnd) / (24 * 60 * 60 * 1000))
  if (diffDays === 1) {
    return { label: 'Due tomorrow', isOverdue: false, isToday: false }
  }
  return { label: `Due in ${diffDays}d`, isOverdue: false, isToday: false }
}

function toLocalDateInput(isoStr: string | null): string {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return ''
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

function fromLocalDateInput(dateInput: string): string | null {
  if (!dateInput) return null
  const parts = dateInput.split('-')
  if (parts.length !== 3) return null
  const [year, month, day] = parts.map(Number)
  // Store as 12:00 local time on that day
  const d = new Date(year, month - 1, day, 12, 0, 0)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

function PipelineCard({
  conv,
  adminSecret,
  onUpdate,
}: {
  conv: Conversation
  adminSecret: string
  onUpdate: (sessionId: string, patch: Partial<Conversation>) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<Conversation['status']>(conv.status)
  const [dealValue, setDealValue] = useState(String(conv.deal_value || ''))
  const [notes, setNotes] = useState(conv.notes || '')
  const [nextAction, setNextAction] = useState(conv.next_action || '')
  const [followUpDateInput, setFollowUpDateInput] = useState(toLocalDateInput(conv.follow_up_date))
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isNew = conv.status === 'new'
  const ageMs = Date.now() - new Date(conv.created_at).getTime()
  const unattendedNew = isNew && ageMs > 2 * 60 * 60 * 1000

  const dueStatus = getDueDateStatus(conv.follow_up_date)
  const firstUserMsg = conv.messages.find((m) => m.role === 'user')
  const hasEscalation = conv.messages.some((m) => m.text.toLowerCase().includes('whatsapp'))

  const saveChanges = useCallback(
    async (patch: {
      status?: string
      dealValue?: number
      notes?: string
      nextAction?: string
      followUpDate?: string | null
    }) => {
      setSaving(true)
      try {
        const body: Record<string, unknown> = {}
        if (patch.status !== undefined) body.status = patch.status
        if (patch.dealValue !== undefined) body.dealValue = patch.dealValue
        if (patch.notes !== undefined) body.notes = patch.notes
        if (patch.nextAction !== undefined) body.nextAction = patch.nextAction
        if (patch.followUpDate !== undefined) body.followUpDate = patch.followUpDate

        await fetch(`/api/admin/conversations/${conv.session_id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': adminSecret,
          },
          body: JSON.stringify(body),
        })
        setSaved(true)
        onUpdate(conv.session_id, {
          status: (patch.status as Conversation['status']) ?? conv.status,
          deal_value: patch.dealValue ?? conv.deal_value,
          notes: patch.notes ?? conv.notes,
          next_action: patch.nextAction !== undefined ? patch.nextAction : conv.next_action,
          follow_up_date:
            patch.followUpDate !== undefined ? patch.followUpDate : conv.follow_up_date,
        })
        if (saveTimer.current) clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => setSaved(false), 2500)
      } catch {
        // Silent fail: user can retry
      } finally {
        setSaving(false)
      }
    },
    [
      conv.session_id,
      conv.status,
      conv.deal_value,
      conv.notes,
      conv.next_action,
      conv.follow_up_date,
      adminSecret,
      onUpdate,
    ]
  )

  const handleStatusChange = (newStatus: Conversation['status']) => {
    setStatus(newStatus)
    saveChanges({
      status: newStatus,
      dealValue: Number(dealValue) || 0,
      notes,
      nextAction,
      followUpDate: fromLocalDateInput(followUpDateInput),
    })
  }

  const handleSaveFieldBlur = () => {
    saveChanges({
      status,
      dealValue: Number(dealValue) || 0,
      notes,
      nextAction,
      followUpDate: fromLocalDateInput(followUpDateInput),
    })
  }

  const setQuickDate = (daysAhead: number | null) => {
    if (daysAhead === null) {
      setFollowUpDateInput('')
      saveChanges({
        status,
        dealValue: Number(dealValue) || 0,
        notes,
        nextAction,
        followUpDate: null,
      })
      return
    }
    const target = new Date()
    target.setDate(target.getDate() + daysAhead)
    const formatted = toLocalDateInput(target.toISOString())
    setFollowUpDateInput(formatted)
    saveChanges({
      status,
      dealValue: Number(dealValue) || 0,
      notes,
      nextAction,
      followUpDate: fromLocalDateInput(formatted),
    })
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden">
      {/* Card header row */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-start justify-between px-5 py-4 text-left transition hover:bg-white/4"
      >
        <div className="min-w-0 flex-1">
          {/* Lead identity */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {conv.lead_name ? (
              <span className="text-sm font-bold text-white">{conv.lead_name}</span>
            ) : (
              <span className="text-xs font-mono text-slate-500">{conv.session_id.slice(0, 8)}...</span>
            )}
            {conv.lead_contact && (
              <span className="text-xs text-slate-400">{conv.lead_contact}</span>
            )}
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[status]}`}
            >
              {STATUS_LABELS[status]}
            </span>
            {hasEscalation && (
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                WhatsApp
              </span>
            )}
            {unattendedNew && (
              <span className="rounded-full bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                Not followed up
              </span>
            )}
            {dueStatus && (
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 ${
                  dueStatus.isOverdue
                    ? 'bg-red-500/20 border-red-500/30 text-red-300'
                    : dueStatus.isToday
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                    : 'bg-white/10 border-white/15 text-slate-300'
                }`}
              >
                <Calendar className="size-2.5" />
                {dueStatus.label}
              </span>
            )}
          </div>

          {/* Next action preview if present */}
          {conv.next_action && (
            <p className="text-xs text-emerald-400 font-medium truncate max-w-md">
              Next: {conv.next_action}
            </p>
          )}

          {/* Service / first message */}
          {conv.lead_service ? (
            <p className="text-sm text-slate-300 truncate max-w-sm">{conv.lead_service}</p>
          ) : firstUserMsg ? (
            <p className="text-sm text-slate-400 truncate max-w-sm">{firstUserMsg.text}</p>
          ) : (
            <p className="text-xs text-slate-500 italic">No messages</p>
          )}

          <p className="mt-1 text-[11px] text-slate-500">{timeAgo(conv.created_at)}</p>
        </div>

        <div className="flex items-center gap-3 ml-4 shrink-0 pt-0.5">
          {saved && !saving && (
            <span className="text-[10px] font-semibold text-emerald-400">Saved</span>
          )}
          {saving && (
            <span className="text-[10px] text-slate-400">Saving...</span>
          )}
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
        <div className="border-t border-white/5 bg-black/20">
          {/* Pipeline & Follow-up controls */}
          <div className="px-5 py-4 space-y-4 border-b border-white/5">
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_LABELS) as Conversation['status'][]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                      status === s
                        ? STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-offset-black ring-current'
                        : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Action & Follow-up Date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Next Action
                </label>
                <input
                  type="text"
                  maxLength={500}
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  onBlur={handleSaveFieldBlur}
                  placeholder="e.g. Send formal quote, Call back regarding budget"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Follow-up Date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={followUpDateInput}
                    onChange={(e) => setFollowUpDateInput(e.target.value)}
                    onBlur={handleSaveFieldBlur}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setQuickDate(0)}
                    className="rounded-lg border border-white/10 px-2.5 py-2 text-xs font-medium text-slate-300 hover:border-white/20 hover:text-white"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(1)}
                    className="rounded-lg border border-white/10 px-2.5 py-2 text-xs font-medium text-slate-300 hover:border-white/20 hover:text-white"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(null)}
                    className="rounded-lg border border-white/10 px-2 py-2 text-xs font-medium text-slate-400 hover:text-red-400"
                    title="Clear date"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {status === 'won' && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Deal value (your currency)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  onBlur={handleSaveFieldBlur}
                  placeholder="e.g. 150000"
                  className="w-full max-w-xs rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            )}

            {conv.lead_service && (
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">What they need</p>
                <p className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-slate-300">{conv.lead_service}</p>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Team notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveFieldBlur}
                rows={2}
                maxLength={2000}
                placeholder="Internal notes (not shown to the visitor)"
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Transcript */}
          <div className="px-5 py-4 space-y-3">
            {conv.messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [secret, setSecret] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<QueueTab>('needs_action')

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

  const handleSignOut = useCallback(() => {
    setAuthed(false)
    setSecret('')
    setConversations([])
    router.push('/')
  }, [router])

  // 30-minute idle session timeout
  useEffect(() => {
    if (!authed) return
    const timer = setTimeout(() => {
      handleSignOut()
    }, 30 * 60 * 1000)
    return () => clearTimeout(timer)
  }, [authed, conversations, handleSignOut])

  const handleUpdate = useCallback(
    (sessionId: string, patch: Partial<Conversation>) => {
      setConversations((prev) =>
        prev.map((c) => (c.session_id === sessionId ? { ...c, ...patch } : c))
      )
    },
    []
  )

  // Derived stats
  const totalEnquiries = conversations.length
  const whatsappRequests = conversations.filter((c) =>
    c.messages.some((m) => m.text.toLowerCase().includes('whatsapp'))
  ).length
  const dealsWon = conversations.filter((c) => c.status === 'won').length
  const revenueTracked = conversations
    .filter((c) => c.status === 'won')
    .reduce((acc, c) => acc + (c.deal_value || 0), 0)

  // Queue categorization
  const isNeedsAction = useCallback((c: Conversation): boolean => {
    if (c.status === 'won' || c.status === 'lost') return false
    if (c.status === 'new') return true
    if (c.follow_up_date) {
      const due = getDueDateStatus(c.follow_up_date)
      if (due && (due.isOverdue || due.isToday)) return true
    }
    return false
  }, [])

  const needsActionCount = useMemo(
    () => conversations.filter(isNeedsAction).length,
    [conversations, isNeedsAction]
  )

  const activePipelineCount = useMemo(
    () => conversations.filter((c) => c.status === 'contacted' || c.status === 'quote_sent').length,
    [conversations]
  )

  const wonCount = useMemo(
    () => conversations.filter((c) => c.status === 'won').length,
    [conversations]
  )

  const filteredConversations = useMemo(() => {
    switch (activeTab) {
      case 'needs_action':
        return conversations.filter(isNeedsAction)
      case 'active':
        return conversations.filter((c) => c.status === 'contacted' || c.status === 'quote_sent')
      case 'won':
        return conversations.filter((c) => c.status === 'won')
      case 'all':
      default:
        return conversations
    }
  }, [conversations, activeTab, isNeedsAction])

  if (!authed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#020c07] px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8"
        >
          <div className="flex items-center gap-2.5 mb-6">
            <Image
              src={eehuLogoUrl}
              alt="eehu!"
              width={36}
              height={36}
              priority
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
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              Back to site
            </Link>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020c07] text-white">
      {/* Admin header */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-[#020c07]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Image
              src={eehuLogoUrl}
              alt="eehu!"
              width={28}
              height={28}
              priority
              className="size-7 object-contain shrink-0"
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
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              <ArrowLeft className="size-3.5" />
              Site
            </Link>
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
        {/* Pipeline stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          {[
            { label: 'Total enquiries', value: totalEnquiries },
            { label: 'WhatsApp requests', value: whatsappRequests },
            { label: 'Deals won', value: dealsWon },
            {
              label: 'Revenue tracked',
              value: revenueTracked > 0 ? revenueTracked.toLocaleString() : '0',
            },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-white/5 bg-white/5 p-5">
              <p className="text-2xl font-extrabold text-emerald-400">{value}</p>
              <p className="mt-1 text-xs font-medium text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Follow-up Queue Tabs */}
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('needs_action')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
              activeTab === 'needs_action'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <Clock className="size-3.5" />
            Needs Action Today
            {needsActionCount > 0 && (
              <span className="rounded-full bg-amber-500/30 px-2 py-0.5 text-[10px] font-extrabold text-amber-200">
                {needsActionCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
              activeTab === 'active'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            Active Pipeline
            {activePipelineCount > 0 && (
              <span className="rounded-full bg-blue-500/30 px-2 py-0.5 text-[10px] font-extrabold text-blue-200">
                {activePipelineCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('won')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
              activeTab === 'won'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            Won Deals
            {wonCount > 0 && (
              <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-[10px] font-extrabold text-emerald-200">
                {wonCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            All Enquiries ({totalEnquiries})
          </button>
        </div>

        {filteredConversations.length === 0 && !loading && (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center">
            <p className="text-slate-400 text-sm">
              {activeTab === 'needs_action'
                ? 'Great job! No pending enquiries need immediate action right now.'
                : 'No enquiries in this view.'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {filteredConversations.map((conv) => (
            <PipelineCard
              key={conv.id}
              conv={conv}
              adminSecret={secret}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
