import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="fr">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
