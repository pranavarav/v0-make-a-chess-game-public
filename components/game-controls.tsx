"use client"

import { RotateCcw, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GameControlsProps {
  onUndo: () => void
  onReset: () => void
}

export default function GameControls({ onUndo, onReset }: GameControlsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onUndo}
        title="Undo last move"
        className="bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
      >
        <RotateCcw className="h-4 w-4 mr-1" />
        Undo
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        title="Reset game"
        className="bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        Reset
      </Button>
    </div>
  )
}
