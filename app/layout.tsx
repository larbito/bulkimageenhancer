import "./globals.css";

export const metadata = {
  title: 'Coloring Studio - AI-Powered Coloring Book Generator',
  description: 'Create beautiful, professional coloring books from any idea using AI. Choose your style, generate consistent pages, and export print-ready files.',
  keywords: 'coloring book, AI, generator, print, kids, art, creative',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}