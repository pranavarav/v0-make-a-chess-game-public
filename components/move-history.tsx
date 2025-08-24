"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Move {
  notation: string
  player: "white" | "black"
  moveNumber: number
}

interface MoveHistoryProps {
  moves: Move[]
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
  const groupedMoves = []
  for (let i = 0; i < moves.length; i += 2) {
    groupedMoves.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i]?.notation || "",
      black: moves[i + 1]?.notation || "",
    })
  }

  return (
    <Card className="w-full max-w-sm bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-slate-100 flex items-center gap-2">📜 Move History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-1">
            {groupedMoves.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No moves yet</p>
            ) : (
              groupedMoves.map((move) => (
                <div
                  key={move.moveNumber}
                  className="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-slate-700 transition-colors"
                >
                  <span className="text-slate-400 w-6 text-right">{move.moveNumber}.</span>
                  <span className="text-slate-100 w-16">{move.white}</span>
                  <span className="text-slate-300 w-16">{move.black}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
