import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'eehu! — Customer conversations, built into your website',
  description: 'eehu! is an enterprise-grade support chat layer for existing websites, helping businesses answer customers and convert more demand.',
  generator: 'v0.app',
  icons: {
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Glossy%20Emerald%20Eehu%20Chat%20Icon-zVY8dtZZH3jzLa1wAkGx7Wl4lWcHzW.png',
    apple: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Glossy%20Emerald%20Eehu%20Chat%20Icon-zVY8dtZZH3jzLa1wAkGx7Wl4lWcHzW.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
