"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface GameTimerProps {
  currentPlayer: "white" | "black" | null
  gameStatus: string
  onTimeUp: (player: "white" | "black") => void
}

export default function GameTimer({ currentPlayer, gameStatus, onTimeUp }: GameTimerProps) {
  const [whiteTime, setWhiteTime] = useState(600) // 10 minutes in seconds
  const [blackTime, setBlackTime] = useState(600)

  useEffect(() => {
    if (gameStatus !== "playing" && gameStatus !== "check") return

    const interval = setInterval(() => {
      if (currentPlayer === "white") {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            onTimeUp("white")
            return 0
          }
          return prev - 1
        })
      } else if (currentPlayer === "black") {
        setBlackTime((prev) => {
          if (prev <= 1) {
            onTimeUp("black")
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentPlayer, gameStatus, onTimeUp])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeColor = (time: number, isActive: boolean) => {
    if (time <= 30) return "text-red-400"
    if (time <= 60) return "text-yellow-400"
    return isActive ? "text-green-400" : "text-slate-400"
  }

  return (
    <div className="flex gap-4 justify-center">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border-2 transition-all ${
          currentPlayer === "white" ? "border-green-400 shadow-lg shadow-green-400/20" : "border-slate-600"
        }`}
      >
        <Clock className="w-4 h-4" />
        <span className={`font-mono text-lg font-bold ${getTimeColor(whiteTime, currentPlayer === "white")}`}>
          {formatTime(whiteTime)}
        </span>
        <span className="text-slate-300 text-sm">White</span>
      </div>

      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border-2 transition-all ${
          currentPlayer === "black" ? "border-green-400 shadow-lg shadow-green-400/20" : "border-slate-600"
        }`}
      >
        <Clock className="w-4 h-4" />
        <span className={`font-mono text-lg font-bold ${getTimeColor(blackTime, currentPlayer === "black")}`}>
          {formatTime(blackTime)}
        </span>
        <span className="text-slate-300 text-sm">Black</span>
      </div>
    </div>
  )
}
