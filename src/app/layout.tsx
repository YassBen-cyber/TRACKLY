import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Trackly — The coaching platform for every sport',
  description: 'Centralisez la gestion de vos athlètes, suivez leurs performances et gérez votre activité — sur une seule plateforme.',
  icons: {
    icon: '/TRACKLY_LOGO.webp',
    apple: '/TRACKLY_LOGO.webp',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={dmSans.variable} suppressHydrationWarning>
      <body className="font-sans tracking-tight antialiased bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
