import type { ReactNode } from 'react'
import Link from 'next/link'

export default function LegalPage({
  title,
  label,
  intro,
  children,
}: {
  title: string
  label: string
  intro: string
  children: ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#020c07] text-slate-200">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5 lg:px-8">
          <Link href="/" className="font-baloo2 text-3xl font-extrabold text-emerald-400">
            eehu!
          </Link>
          <nav aria-label="Legal pages" className="flex items-center gap-5 text-sm text-slate-400">
            <Link href="/privacy" className="transition hover:text-emerald-300">Privacy</Link>
            <Link href="/terms" className="transition hover:text-emerald-300">Terms</Link>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 pb-20 pt-14 lg:px-8 lg:pt-20">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">{label}</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{intro}</p>
        <p className="mt-5 text-sm text-slate-500">Last updated: 3 November 2026</p>

        <div className="mt-12 space-y-10 text-[15px] leading-7 text-slate-300 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_li+li]:mt-2 [&_p+p]:mt-3 [&_ul]:mt-3">
          {children}
        </div>

        <footer className="mt-16 border-t border-white/10 pt-6 text-sm text-slate-500">
          <p>
            Questions? Email{' '}
            <a className="text-emerald-400 hover:text-emerald-300" href="mailto:ituwaafrica@gmail.com">
              ituwaafrica@gmail.com
            </a>
            .
          </p>
        </footer>
      </article>
    </main>
  )
}
