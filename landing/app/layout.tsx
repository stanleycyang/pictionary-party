import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DoodleMania - The Ultimate Party Drawing Game',
  description: 'Draw, guess, and win! The #1 party drawing game for friends and family. Play online multiplayer or local party mode. Free to download!',
  keywords: 'drawing game, party game, multiplayer, pictionary, doodle, guess, friends, family, fun',
  openGraph: {
    title: 'DoodleMania - Draw. Guess. Win!',
    description: 'The ultimate party drawing game for friends and family. Play online or locally!',
    type: 'website',
    url: 'https://doodlemania.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DoodleMania - The Ultimate Party Drawing Game',
    description: 'Draw, guess, and win! Free party game for everyone.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
