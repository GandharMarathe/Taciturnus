import './globals.css'

export const metadata = {
  title: 'Collaborative AI Chat',
  description: 'Real-time chat with AI assistance',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}