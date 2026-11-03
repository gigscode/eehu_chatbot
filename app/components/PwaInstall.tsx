'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'eehu-pwa-dismissed'

export default function PwaInstall() {
  const [visible, setVisible] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    let cleanupServiceWorker = () => {}

    if ('serviceWorker' in navigator) {
      const hadController = Boolean(navigator.serviceWorker.controller)
      let reloaded = false
      let updateTimer: number | undefined
      let registration: ServiceWorkerRegistration | undefined

      const onControllerChange = () => {
        if (hadController && !reloaded) {
          reloaded = true
          window.location.reload()
        }
      }

      const updateServiceWorker = async () => {
        try {
          registration = await navigator.serviceWorker.register(
            `/sw.js?v=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_VERSION ?? 'development')}`,
            { updateViaCache: 'none' }
          )
          await registration.update()
        } catch (error) {
          console.error('Unable to check for app updates:', error)
        }
      }

      const checkForUpdates = () => {
        if (document.visibilityState === 'visible' && registration) {
          registration.update().catch((error) => {
            console.error('Unable to check for app updates:', error)
          })
        }
      }

      navigator.serviceWorker.addEventListener(
        'controllerchange',
        onControllerChange
      )
      void updateServiceWorker()
      window.addEventListener('focus', checkForUpdates)
      document.addEventListener('visibilitychange', checkForUpdates)
      updateTimer = window.setInterval(checkForUpdates, 60 * 60 * 1000)

      cleanupServiceWorker = () => {
        navigator.serviceWorker.removeEventListener(
          'controllerchange',
          onControllerChange
        )
        window.removeEventListener('focus', checkForUpdates)
        document.removeEventListener('visibilitychange', checkForUpdates)
        if (updateTimer !== undefined) {
          window.clearInterval(updateTimer)
        }
      }
    }

    let installPromptHandler: ((event: Event) => void) | undefined
    if (
      localStorage.getItem(DISMISSED_KEY) !== '1' &&
      !window.matchMedia('(display-mode: standalone)').matches
    ) {
      installPromptHandler = (event: Event) => {
        event.preventDefault()
        deferredPrompt.current = event as BeforeInstallPromptEvent
        setVisible(true)
      }
      window.addEventListener('beforeinstallprompt', installPromptHandler)
    }

    return () => {
      cleanupServiceWorker()
      if (installPromptHandler) {
        window.removeEventListener('beforeinstallprompt', installPromptHandler)
      }
    }
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  async function install() {
    const prompt = deferredPrompt.current
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      deferredPrompt.current = null
    }
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Add eehu! to your home screen"
      className="fixed bottom-24 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-emerald-800/40 bg-[#020c07] px-4 py-3 shadow-2xl shadow-black/60 sm:left-auto sm:right-6 sm:translate-x-0"
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-emerald-900/40 hover:text-slate-200 transition-colors"
      >
        <X size={16} />
      </button>

      <div className="flex items-center gap-3">
        <Image
          src="/Glossy Emerald Eehu Chat icon.png"
          alt="eehu! logo"
          width={44}
          height={44}
          className="rounded-xl"
          priority
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-tight">
            Add eehu! to your home screen
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Quick access, works offline
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={install}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-900/40 hover:bg-emerald-500 active:scale-95 transition-all"
        >
          <Download size={14} />
          Add to home screen
        </button>
        <button
          onClick={dismiss}
          className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:bg-emerald-900/30 hover:text-slate-200 transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  )
}
