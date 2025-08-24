interface ChessPieceProps {
  type: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king" | null
  color: "white" | "black" | null
  size?: "sm" | "md" | "lg"
  isDragging?: boolean
}

export default function ChessPiece({ type, color, size = "md", isDragging = false }: ChessPieceProps) {
  if (!type || !color) return null

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-5xl",
  }

  const pieces = {
    white: {
      king: "♔",
      queen: "♕",
      rook: "♖",
      bishop: "♗",
      knight: "♘",
      pawn: "♙",
    },
    black: {
      king: "♚",
      queen: "♛",
      rook: "♜",
      bishop: "♝",
      knight: "♞",
      pawn: "♟",
    },
  }

  const pieceSymbol = pieces[color][type]

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        select-none cursor-pointer transition-all duration-200
        ${isDragging ? "scale-110 rotate-3 opacity-80" : "hover:scale-105"}
        ${color === "white" ? "text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" : "text-slate-800 drop-shadow-[0_2px_4px_rgba(255,255,255,0.3)]"}
        flex items-center justify-center w-full h-full
      `}
      style={{
        textShadow:
          color === "white"
            ? "0 0 8px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.8)"
            : "0 0 8px rgba(0,0,0,0.5), 0 2px 4px rgba(255,255,255,0.3)",
      }}
    >
      {pieceSymbol}
    </div>
  )
}
