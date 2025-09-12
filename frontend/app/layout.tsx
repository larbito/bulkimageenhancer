export const metadata = {
  title: 'Coloring Book Studio',
  description: 'Generate full coloring books from your idea',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
          {children}
        </div>
      </body>
    </html>
  )
}
