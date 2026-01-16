import "./globals.css"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-nunito",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Daily Fortune Draw",
  description: "Yu-Gi-Oh! inspired one-a-day fortune draw.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body>{children}</body>
    </html>
  )
}
