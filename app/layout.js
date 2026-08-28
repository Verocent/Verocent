import './globals.css'

export const metadata = {
  title: 'Verocent Pure Essence ERP',
  description: 'Manufacturing ERP System — Verocent Global Limited, Kaduna Nigeria',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}