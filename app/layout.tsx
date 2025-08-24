import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Royal Chess",
  description: "A chess variant that is fun and exciting",
  generator: "Ikshit Gupta",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full min-h-screen bg-background">
        <Suspense fallback={<div>Loading...</div>}>
          <div className="min-h-screen bg-background">{children}</div>
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
