"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Users, Crown, Zap } from "lucide-react"
import type { GameMode } from "./chess-game"

interface ModeSelectionProps {
  onModeSelect: (mode: GameMode) => void
}

export default function ModeSelection({ onModeSelect }: ModeSelectionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center mb-12">
        <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-6">
          Royal Chess
        </h1>
        <p className="text-slate-300 text-xl mb-4">Experience chess with enhanced variant rules</p>
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Crown className="w-5 h-5" />
          <span>Custom Turn Sequence</span>
          <Zap className="w-5 h-5 ml-4" />
          <span>Enhanced Strategy</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Solo Mode */}
        <Card className="bg-slate-800 border-slate-700 hover:border-amber-500 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20 cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl text-slate-100 group-hover:text-amber-400 transition-colors">
              Solo Mode
            </CardTitle>
            <CardDescription className="text-slate-300">Player vs Bot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>You play as White</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Bot plays as Black</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Random bot moves</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Perfect for learning</span>
              </div>
            </div>
            <Button
              onClick={() => onModeSelect("solo")}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200"
            >
              Start Solo Game
            </Button>
          </CardContent>
        </Card>

        {/* Two Player Mode */}
        <Card className="bg-slate-800 border-slate-700 hover:border-amber-500 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20 cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl text-slate-100 group-hover:text-amber-400 transition-colors">
              Two-Player Mode
            </CardTitle>
            <CardDescription className="text-slate-300">Local Multiplayer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Player 1 as White</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Player 2 as Black</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Same device play</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Face-to-face fun</span>
              </div>
            </div>
            <Button
              onClick={() => onModeSelect("two-player")}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200"
            >
              Start Two-Player Game
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Rules Summary */}
      <Card className="mt-12 bg-slate-800 border-slate-700 max-w-4xl w-full">
        <CardHeader>
          <CardTitle className="text-xl text-slate-100 text-center">Variant Rules Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <h4 className="font-semibold text-amber-400 mb-2">Turn Sequence</h4>
              <ul className="text-slate-300 space-y-1">
                <li>White: 1 move</li>
                <li>Black: 2 moves</li>
                <li>White: 2 moves</li>
                <li>Pattern continues</li>
              </ul>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-amber-400 mb-2">Movement Rules</h4>
              <ul className="text-slate-300 space-y-1">
                <li>No same piece twice</li>
                <li>Standard chess moves</li>
                <li>Castling allowed</li>
                <li>En passant supported</li>
              </ul>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-amber-400 mb-2">Check Resolution</h4>
              <ul className="text-slate-300 space-y-1">
                <li>Must resolve with 1 move</li>
                <li>Checker gets 2 moves after</li>
                <li>Standard checkmate</li>
                <li>Enhanced strategy</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
