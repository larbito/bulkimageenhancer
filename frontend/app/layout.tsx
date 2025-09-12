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
      <body className="min-h-screen text-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {children}
        </div>
      </body>
    </html>
  )
}
