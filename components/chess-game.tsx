"use client"

import { useState } from "react"
import ModeSelection from "./mode-selection"
import ChessBoard from "./chess-board"

export type GameMode = "menu" | "solo" | "two-player"

export default function ChessGame() {
  const [gameMode, setGameMode] = useState<GameMode>("menu")

  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode)
  }

  const handleReturnToMenu = () => {
    setGameMode("menu")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto max-w-7xl p-4">
        {gameMode === "menu" && <ModeSelection onModeSelect={handleModeSelect} />}
        {(gameMode === "solo" || gameMode === "two-player") && (
          <ChessBoard gameMode={gameMode} onReturnToMenu={handleReturnToMenu} />
        )}
      </div>
    </div>
  )
}
