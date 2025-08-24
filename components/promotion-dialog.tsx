"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ChessPiece from "./chess-piece"

interface PromotionDialogProps {
  isOpen: boolean
  color: "white" | "black"
  onSelect: (piece: "queen" | "rook" | "bishop" | "knight") => void
}

export default function PromotionDialog({ isOpen, color, onSelect }: PromotionDialogProps) {
  const pieces: ("queen" | "rook" | "bishop" | "knight")[] = ["queen", "rook", "bishop", "knight"]

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Choose Promotion Piece</DialogTitle>
          <DialogDescription className="text-slate-300">
            Select which piece you'd like to promote your pawn to:
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 py-4">
          {pieces.map((piece) => (
            <button
              key={piece}
              onClick={() => onSelect(piece)}
              className="aspect-square bg-slate-700 hover:bg-slate-600 rounded-lg border-2 border-slate-600 hover:border-amber-400 transition-all duration-200 flex items-center justify-center"
            >
              <ChessPiece type={piece} color={color} size="lg" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
