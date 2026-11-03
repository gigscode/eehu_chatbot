import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Nunito, Baloo_2 } from 'next/font/google'
import './globals.css'
import PwaInstall from './components/PwaInstall'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
})

const baloo2 = Baloo_2({
  subsets: ['latin'],
  variable: '--font-baloo2',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'eehu!. Customer conversations, built into your website',
  description: 'eehu! is an enterprise-grade support chat layer for existing websites, helping businesses answer customers and convert more demand.',
  manifest: '/manifest.json',
  icons: {
    icon: '/Glossy Emerald Eehu Chat icon.png',
    apple: '/Glossy Emerald Eehu Chat icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#020c07',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${baloo2.variable}`}>
      <body className="antialiased font-nunito">
        {children}
        <PwaInstall />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
