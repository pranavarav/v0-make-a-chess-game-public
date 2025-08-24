"use client"

// Chess piece types
type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king" | null
type PieceColor = "white" | "black" | null

interface Piece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
}

interface Square {
  piece: Piece | null
  position: string
}

interface BotMove {
  from: { row: number; col: number }
  to: { row: number; col: number }
}

export class RandomBot {
  private board: Square[][]
  private piecesMovedThisTurn: { row: number; col: number }[]

  constructor(board: Square[][], piecesMovedThisTurn: { row: number; col: number }[]) {
    this.board = board
    this.piecesMovedThisTurn = piecesMovedThisTurn
  }

  // Get a random valid move for the bot
  getRandomMove(): BotMove | null {
    const allPossibleMoves: BotMove[] = []

    // Find all black pieces that haven't moved this turn
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col].piece
        if (piece && piece.color === "black") {
          // Check if this piece has already moved this turn
          const alreadyMoved = this.piecesMovedThisTurn.some((p) => p.row === row && p.col === col)
          if (!alreadyMoved) {
            const validMoves = this.getValidMovesForPiece(row, col)
            for (const move of validMoves) {
              allPossibleMoves.push({
                from: { row, col },
                to: { row: move.row, col: move.col },
              })
            }
          }
        }
      }
    }

    if (allPossibleMoves.length === 0) {
      return null
    }

    // Return a random move
    const randomIndex = Math.floor(Math.random() * allPossibleMoves.length)
    return allPossibleMoves[randomIndex]
  }

  private getValidMovesForPiece(row: number, col: number): { row: number; col: number }[] {
    const piece = this.board[row][col].piece
    if (!piece) return []

    const moves: { row: number; col: number }[] = []

    switch (piece.type) {
      case "pawn":
        this.getPawnMoves(row, col, piece.color, moves)
        break
      case "rook":
        this.getRookMoves(row, col, piece.color, moves)
        break
      case "knight":
        this.getKnightMoves(row, col, moves)
        break
      case "bishop":
        this.getBishopMoves(row, col, piece.color, moves)
        break
      case "queen":
        this.getRookMoves(row, col, piece.color, moves)
        this.getBishopMoves(row, col, piece.color, moves)
        break
      case "king":
        this.getKingMoves(row, col, piece.color, moves)
        break
    }

    // Filter out moves that would leave the king in check
    return this.filterMovesForCheck(row, col, moves)
  }

  private filterMovesForCheck(
    row: number,
    col: number,
    moves: { row: number; col: number }[],
  ): { row: number; col: number }[] {
    const piece = this.board[row][col].piece
    if (!piece) return []

    const validMoves = []

    for (const move of moves) {
      const tempBoard = JSON.parse(JSON.stringify(this.board))
      tempBoard[move.row][move.col].piece = tempBoard[row][col].piece
      tempBoard[row][col].piece = null

      const kingInCheck = this.isKingInCheck(tempBoard, piece.color)
      if (!kingInCheck) {
        validMoves.push(move)
      }
    }

    return validMoves
  }

  private isKingInCheck(boardState: Square[][], kingColor: PieceColor): boolean {
    let kingPosition: { row: number; col: number } | null = null
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col].piece
        if (piece && piece.type === "king" && piece.color === kingColor) {
          kingPosition = { row, col }
          break
        }
      }
      if (kingPosition) break
    }

    if (!kingPosition) return false

    const opponentColor = kingColor === "white" ? "black" : "white"

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col].piece
        if (piece && piece.color === opponentColor) {
          const moves = this.getValidMovesForPieceSimple(row, col, boardState)
          if (moves.some((move) => move.row === kingPosition!.row && move.col === kingPosition!.col)) {
            return true
          }
        }
      }
    }

    return false
  }

  private getValidMovesForPieceSimple(row: number, col: number, boardState: Square[][]) {
    const piece = boardState[row][col].piece
    if (!piece) return []

    const moves: { row: number; col: number }[] = []

    switch (piece.type) {
      case "pawn":
        this.getPawnMovesForCheck(row, col, piece.color, moves, boardState)
        break
      case "rook":
        this.getRookMovesForCheck(row, col, piece.color, moves, boardState)
        break
      case "knight":
        this.getKnightMovesForCheck(row, col, moves, boardState)
        break
      case "bishop":
        this.getBishopMovesForCheck(row, col, piece.color, moves, boardState)
        break
      case "queen":
        this.getRookMovesForCheck(row, col, piece.color, moves, boardState)
        this.getBishopMovesForCheck(row, col, piece.color, moves, boardState)
        break
      case "king":
        this.getKingMovesForCheck(row, col, piece.color, moves, boardState)
        break
    }

    return moves
  }

  // Movement methods (simplified versions of the main game logic)
  private getPawnMoves(row: number, col: number, color: PieceColor, moves: { row: number; col: number }[]) {
    const direction = color === "white" ? -1 : 1

    if (row + direction >= 0 && row + direction < 8 && !this.board[row + direction][col].piece) {
      moves.push({ row: row + direction, col })

      const startRow = color === "white" ? 6 : 1
      if (row === startRow && !this.board[row + 2 * direction][col].piece) {
        moves.push({ row: row + 2 * direction, col })
      }
    }

    for (const colOffset of [-1, 1]) {
      const newCol = col + colOffset
      if (
        newCol >= 0 &&
        newCol < 8 &&
        row + direction >= 0 &&
        row + direction < 8 &&
        this.board[row + direction][newCol].piece &&
        this.board[row + direction][newCol].piece?.color !== color
      ) {
        moves.push({ row: row + direction, col: newCol })
      }
    }
  }

  private getRookMoves(row: number, col: number, color: PieceColor, moves: { row: number; col: number }[]) {
    const directions = [
      { rowOffset: -1, colOffset: 0 },
      { rowOffset: 0, colOffset: 1 },
      { rowOffset: 1, colOffset: 0 },
      { rowOffset: 0, colOffset: -1 },
    ]

    for (const { rowOffset, colOffset } of directions) {
      let newRow = row + rowOffset
      let newCol = col + colOffset

      while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (!this.board[newRow][newCol].piece) {
          moves.push({ row: newRow, col: newCol })
        } else {
          if (this.board[newRow][newCol].piece?.color !== color) {
            moves.push({ row: newRow, col: newCol })
          }
          break
        }
        newRow += rowOffset
        newCol += colOffset
      }
    }
  }

  private getKnightMoves(row: number, col: number, moves: { row: number; col: number }[]) {
    const color = this.board[row][col].piece?.color
    const knightMoves = [
      { rowOffset: -2, colOffset: -1 },
      { rowOffset: -2, colOffset: 1 },
      { rowOffset: -1, colOffset: -2 },
      { rowOffset: -1, colOffset: 2 },
      { rowOffset: 1, colOffset: -2 },
      { rowOffset: 1, colOffset: 2 },
      { rowOffset: 2, colOffset: -1 },
      { rowOffset: 2, colOffset: 1 },
    ]

    for (const { rowOffset, colOffset } of knightMoves) {
      const newRow = row + rowOffset
      const newCol = col + colOffset

      if (
        newRow >= 0 &&
        newRow < 8 &&
        newCol >= 0 &&
        newCol < 8 &&
        (this.board[newRow][newCol].piece === null || this.board[newRow][newCol].piece?.color !== color)
      ) {
        moves.push({ row: newRow, col: newCol })
      }
    }
  }

  private getBishopMoves(row: number, col: number, color: PieceColor, moves: { row: number; col: number }[]) {
    const directions = [
      { rowOffset: -1, colOffset: -1 },
      { rowOffset: -1, colOffset: 1 },
      { rowOffset: 1, colOffset: -1 },
      { rowOffset: 1, colOffset: 1 },
    ]

    for (const { rowOffset, colOffset } of directions) {
      let newRow = row + rowOffset
      let newCol = col + colOffset

      while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (!this.board[newRow][newCol].piece) {
          moves.push({ row: newRow, col: newCol })
        } else {
          if (this.board[newRow][newCol].piece?.color !== color) {
            moves.push({ row: newRow, col: newCol })
          }
          break
        }
        newRow += rowOffset
        newCol += colOffset
      }
    }
  }

  private getKingMoves(row: number, col: number, color: PieceColor, moves: { row: number; col: number }[]) {
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let colOffset = -1; colOffset <= 1; colOffset++) {
        if (rowOffset === 0 && colOffset === 0) continue

        const newRow = row + rowOffset
        const newCol = col + colOffset

        if (
          newRow >= 0 &&
          newRow < 8 &&
          newCol >= 0 &&
          newCol < 8 &&
          (this.board[newRow][newCol].piece === null || this.board[newRow][newCol].piece?.color !== color)
        ) {
          moves.push({ row: newRow, col: newCol })
        }
      }
    }
  }

  // Helper methods for check detection
  private getPawnMovesForCheck(
    row: number,
    col: number,
    color: PieceColor,
    moves: { row: number; col: number }[],
    boardState: Square[][],
  ) {
    const direction = color === "white" ? -1 : 1

    if (row + direction >= 0 && row + direction < 8 && !boardState[row + direction][col].piece) {
      moves.push({ row: row + direction, col })

      const startRow = color === "white" ? 6 : 1
      if (row === startRow && !boardState[row + 2 * direction][col].piece) {
        moves.push({ row: row + 2 * direction, col })
      }
    }

    for (const colOffset of [-1, 1]) {
      const newCol = col + colOffset
      if (
        newCol >= 0 &&
        newCol < 8 &&
        row + direction >= 0 &&
        row + direction < 8 &&
        boardState[row + direction][newCol].piece &&
        boardState[row + direction][newCol].piece?.color !== color
      ) {
        moves.push({ row: row + direction, col: newCol })
      }
    }
  }

  private getRookMovesForCheck(
    row: number,
    col: number,
    color: PieceColor,
    moves: { row: number; col: number }[],
    boardState: Square[][],
  ) {
    const directions = [
      { rowOffset: -1, colOffset: 0 },
      { rowOffset: 0, colOffset: 1 },
      { rowOffset: 1, colOffset: 0 },
      { rowOffset: 0, colOffset: -1 },
    ]

    for (const { rowOffset, colOffset } of directions) {
      let newRow = row + rowOffset
      let newCol = col + colOffset

      while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (!boardState[newRow][newCol].piece) {
          moves.push({ row: newRow, col: newCol })
        } else {
          if (boardState[newRow][newCol].piece?.color !== color) {
            moves.push({ row: newRow, col: newCol })
          }
          break
        }
        newRow += rowOffset
        newCol += colOffset
      }
    }
  }

  private getKnightMovesForCheck(
    row: number,
    col: number,
    moves: { row: number; col: number }[],
    boardState: Square[][],
  ) {
    const color = boardState[row][col].piece?.color
    const knightMoves = [
      { rowOffset: -2, colOffset: -1 },
      { rowOffset: -2, colOffset: 1 },
      { rowOffset: -1, colOffset: -2 },
      { rowOffset: -1, colOffset: 2 },
      { rowOffset: 1, colOffset: -2 },
      { rowOffset: 1, colOffset: 2 },
      { rowOffset: 2, colOffset: -1 },
      { rowOffset: 2, colOffset: 1 },
    ]

    for (const { rowOffset, colOffset } of knightMoves) {
      const newRow = row + rowOffset
      const newCol = col + colOffset

      if (
        newRow >= 0 &&
        newRow < 8 &&
        newCol >= 0 &&
        newCol < 8 &&
        (boardState[newRow][newCol].piece === null || boardState[newRow][newCol].piece?.color !== color)
      ) {
        moves.push({ row: newRow, col: newCol })
      }
    }
  }

  private getBishopMovesForCheck(
    row: number,
    col: number,
    color: PieceColor,
    moves: { row: number; col: number }[],
    boardState: Square[][],
  ) {
    const directions = [
      { rowOffset: -1, colOffset: -1 },
      { rowOffset: -1, colOffset: 1 },
      { rowOffset: 1, colOffset: -1 },
      { rowOffset: 1, colOffset: 1 },
    ]

    for (const { rowOffset, colOffset } of directions) {
      let newRow = row + rowOffset
      let newCol = col + colOffset

      while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (!boardState[newRow][newCol].piece) {
          moves.push({ row: newRow, col: newCol })
        } else {
          if (boardState[newRow][newCol].piece?.color !== color) {
            moves.push({ row: newRow, col: newCol })
          }
          break
        }
        newRow += rowOffset
        newCol += colOffset
      }
    }
  }

  private getKingMovesForCheck(
    row: number,
    col: number,
    color: PieceColor,
    moves: { row: number; col: number }[],
    boardState: Square[][],
  ) {
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let colOffset = -1; colOffset <= 1; colOffset++) {
        if (rowOffset === 0 && colOffset === 0) continue

        const newRow = row + rowOffset
        const newCol = col + colOffset

        if (
          newRow >= 0 &&
          newRow < 8 &&
          newCol >= 0 &&
          newCol < 8 &&
          (boardState[newRow][newCol].piece === null || boardState[newRow][newCol].piece?.color !== color)
        ) {
          moves.push({ row: newRow, col: newCol })
        }
      }
    }
  }
}
