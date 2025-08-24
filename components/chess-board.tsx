"use client"

import { useState, useEffect, useCallback } from "react"
import ChessPiece from "./chess-piece"
import GameControls from "./game-controls"
import GameRules from "./game-rules"
import GameTimer from "./game-timer"
import MoveHistory from "./move-history"
import PromotionDialog from "./promotion-dialog"
import { RandomBot } from "./random-bot"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bot, Users } from "lucide-react"
import type { GameMode } from "./chess-game"

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

interface Move {
  notation: string
  player: "white" | "black"
  moveNumber: number
}

interface ChessBoardProps {
  gameMode: GameMode
  onReturnToMenu: () => void
}

export default function ChessBoard({ gameMode, onReturnToMenu }: ChessBoardProps) {
  const [board, setBoard] = useState<Square[][]>([])
  const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number } | null>(null)
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white")
  const [movesRemaining, setMovesRemaining] = useState<number>(1) // White starts with 1 move
  const [piecesMovedThisTurn, setPiecesMovedThisTurn] = useState<{ row: number; col: number }[]>([])
  const [turnNumber, setTurnNumber] = useState<number>(1)
  const [capturedPieces, setCapturedPieces] = useState<{ white: Piece[]; black: Piece[] }>({
    white: [],
    black: [],
  })
  const [gameStatus, setGameStatus] = useState<"playing" | "check" | "checkmate" | "stalemate" | "timeout">("playing")
  const [moveHistory, setMoveHistory] = useState<any[]>([])
  const [inCheck, setInCheck] = useState<PieceColor | null>(null)
  const [winner, setWinner] = useState<PieceColor | null>(null)
  const [draggedPiece, setDraggedPiece] = useState<{ row: number; col: number } | null>(null)
  const [moveNotationHistory, setMoveNotationHistory] = useState<Move[]>([])
  const [promotionDialog, setPromotionDialog] = useState<{
    isOpen: boolean
    color: PieceColor
    position: { row: number; col: number } | null
  }>({ isOpen: false, color: null, position: null })
  const [lastMove, setLastMove] = useState<{
    from: { row: number; col: number }
    to: { row: number; col: number }
  } | null>(null)
  const [checkingPlayerRetainsMoves, setCheckingPlayerRetainsMoves] = useState<boolean>(false)
  const [botThinking, setBotThinking] = useState<boolean>(false)

  // Initialize the board
  useEffect(() => {
    initializeBoard()
  }, [])

  // Bot move logic
  useEffect(() => {
    if (
      gameMode === "solo" &&
      currentPlayer === "black" &&
      gameStatus === "playing" &&
      !promotionDialog.isOpen &&
      movesRemaining > 0
    ) {
      setBotThinking(true)
      const timer = setTimeout(() => {
        makeBotMove()
        setBotThinking(false)
      }, 1000) // 1 second delay to show bot is "thinking"

      return () => clearTimeout(timer)
    }
  }, [currentPlayer, gameMode, gameStatus, movesRemaining, promotionDialog.isOpen])

  // Play sound effect
  const playSound = useCallback((type: "move" | "capture" | "check" | "checkmate") => {
    console.log(`Playing ${type} sound`)
  }, [])

  const initializeBoard = () => {
    const newBoard: Square[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null))

    // Set up the board with initial positions
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const position = `${String.fromCharCode(97 + col)}${8 - row}`
        newBoard[row][col] = { piece: null, position }
      }
    }

    // Set up pawns
    for (let col = 0; col < 8; col++) {
      newBoard[1][col].piece = { type: "pawn", color: "black" }
      newBoard[6][col].piece = { type: "pawn", color: "white" }
    }

    // Set up other pieces
    const backRankSetup = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"] as const

    for (let col = 0; col < 8; col++) {
      newBoard[0][col].piece = { type: backRankSetup[col], color: "black", hasMoved: false }
      newBoard[7][col].piece = { type: backRankSetup[col], color: "white", hasMoved: false }
    }

    setBoard(newBoard)
  }

  const makeBotMove = () => {
    const bot = new RandomBot(board, piecesMovedThisTurn)
    const botMove = bot.getRandomMove()

    if (botMove) {
      movePiece(botMove.from.row, botMove.from.col, botMove.to.row, botMove.to.col)
    }
  }

  const handleTimeUp = useCallback((player: "white" | "black") => {
    setGameStatus("timeout")
    setWinner(player === "white" ? "black" : "white")
  }, [])

  const handleSquareClick = (row: number, col: number) => {
    if (gameStatus === "checkmate" || gameStatus === "timeout") return
    if (gameMode === "solo" && currentPlayer === "black") return // Prevent manual moves for bot
    if (botThinking) return // Prevent moves while bot is thinking

    if (selectedPiece === null && board[row][col].piece && board[row][col].piece?.color === currentPlayer) {
      const alreadyMoved = piecesMovedThisTurn.some((piece) => piece.row === row && piece.col === col)
      if (alreadyMoved) return

      setSelectedPiece({ row, col })
      const moves = getValidMoves(row, col)
      setValidMoves(moves)
    } else if (selectedPiece !== null) {
      const isValidMove = validMoves.some((move) => move.row === row && move.col === col)
      if (isValidMove) {
        movePiece(selectedPiece.row, selectedPiece.col, row, col)
      }
      setSelectedPiece(null)
      setValidMoves([])
    }
  }

  const handleDragStart = (row: number, col: number) => {
    if (gameStatus === "checkmate" || gameStatus === "timeout") return
    if (gameMode === "solo" && currentPlayer === "black") return
    if (botThinking) return
    if (!board[row][col].piece || board[row][col].piece?.color !== currentPlayer) return

    const alreadyMoved = piecesMovedThisTurn.some((piece) => piece.row === row && piece.col === col)
    if (alreadyMoved) return

    setDraggedPiece({ row, col })
    setSelectedPiece({ row, col })
    const moves = getValidMoves(row, col)
    setValidMoves(moves)
  }

  const handleDragEnd = () => {
    setDraggedPiece(null)
    setSelectedPiece(null)
    setValidMoves([])
  }

  const handleDrop = (row: number, col: number) => {
    if (!draggedPiece) return

    const isValidMove = validMoves.some((move) => move.row === row && move.col === col)
    if (isValidMove) {
      movePiece(draggedPiece.row, draggedPiece.col, row, col)
    }

    handleDragEnd()
  }

  const getValidMoves = (row: number, col: number): { row: number; col: number }[] => {
    const piece = board[row][col].piece
    if (!piece) return []

    const moves: { row: number; col: number }[] = []

    switch (piece.type) {
      case "pawn":
        getPawnMoves(row, col, piece.color, moves)
        break
      case "rook":
        getRookMoves(row, col, piece.color, moves)
        break
      case "knight":
        getKnightMoves(row, col, moves)
        break
      case "bishop":
        getBishopMoves(row, col, piece.color, moves)
        break
      case "queen":
        getRookMoves(row, col, piece.color, moves)
        getBishopMoves(row, col, piece.color, moves)
        break
      case "king":
        getKingMoves(row, col, piece.color, moves)
        break
    }

    return filterMovesForCheck(row, col, moves)
  }

  const filterMovesForCheck = (
    row: number,
    col: number,
    moves: { row: number; col: number }[],
  ): { row: number; col: number }[] => {
    const piece = board[row][col].piece
    if (!piece) return []

    const validMoves = []

    for (const move of moves) {
      const tempBoard = JSON.parse(JSON.stringify(board))
      tempBoard[move.row][move.col].piece = tempBoard[row][col].piece
      tempBoard[row][col].piece = null

      const kingInCheck = isKingInCheck(tempBoard, piece.color)
      if (!kingInCheck) {
        validMoves.push(move)
      }
    }

    return validMoves
  }

  const isKingInCheck = (boardState: Square[][], kingColor: PieceColor): boolean => {
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
          const moves = getValidMovesForPiece(row, col, boardState, false)
          if (moves.some((move) => move.row === kingPosition!.row && move.col === kingPosition!.col)) {
            return true
          }
        }
      }
    }

    return false
  }

  const getPawnMoves = (row: number, col: number, color: PieceColor, moves: { row: number; col: number }[]) => {
    const direction = color === "white" ? -1 : 1

    // Forward move
    if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col].piece) {
      moves.push({ row: row + direction, col })

      // Double move from starting position
      const startRow = color === "white" ? 6 : 1
      if (row === startRow && !board[row + 2 * direction][col].piece) {
        moves.push({ row: row + 2 * direction, col })
      }
    }

    // Capture moves
    for (const colOffset of [-1, 1]) {
      const newCol = col + colOffset
      if (
        newCol >= 0 &&
        newCol < 8 &&
        row + direction >= 0 &&
        row + direction < 8 &&
        board[row + direction][newCol].piece &&
        board[row + direction][newCol].piece?.color !== color
      ) {
        moves.push({ row: row + direction, col: newCol })
      }
    }

    // En passant
    if (lastMove && Math.abs(lastMove.from.row - lastMove.to.row) === 2) {
      const lastMovePiece = board[lastMove.to.row][lastMove.to.col].piece
      if (lastMovePiece?.type === "pawn" && lastMovePiece.color !== color) {
        if (row === lastMove.to.row && Math.abs(col - lastMove.to.col) === 1) {
          moves.push({ row: row + direction, col: lastMove.to.col })
        }
      }
    }
  }

  const getRookMoves = (row: number, col: number, color: PieceColor, moves: { row: number; col: number }[]) => {
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
        if (!board[newRow][newCol].piece) {
          moves.push({ row: newRow, col: newCol })
        } else {
          if (board[newRow][newCol].piece?.color !== color) {
            moves.push({ row: newRow, col: newCol })
          }
          break
        }
        newRow += rowOffset
        newCol += colOffset
      }
    }
  }

  const getKnightMoves = (row: number, col: number, moves: { row: number; col: number }[]) => {
    const color = board[row][col].piece?.color
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
        (board[newRow][newCol].piece === null || board[newRow][newCol].piece?.color !== color)
      ) {
        moves.push({ row: newRow, col: newCol })
      }
    }
  }

  const getBishopMoves = (row: number, col: number, color: PieceColor, moves: { row: number; col: number }[]) => {
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
        if (!board[newRow][newCol].piece) {
          moves.push({ row: newRow, col: newCol })
        } else {
          if (board[newRow][newCol].piece?.color !== color) {
            moves.push({ row: newRow, col: newCol })
          }
          break
        }
        newRow += rowOffset
        newCol += colOffset
      }
    }
  }

  const getKingMoves = (row: number, col: number, color: PieceColor, moves: { row: number; col: number }[]) => {
    // Regular king moves
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
          (board[newRow][newCol].piece === null || board[newRow][newCol].piece?.color !== color)
        ) {
          moves.push({ row: newRow, col: newCol })
        }
      }
    }

    // Castling
    const king = board[row][col].piece
    if (king && !king.hasMoved && !isKingInCheck(board, color)) {
      // Kingside castling
      const kingsideRook = board[row][7].piece
      if (kingsideRook && !kingsideRook.hasMoved && !board[row][5].piece && !board[row][6].piece) {
        const tempBoard1 = JSON.parse(JSON.stringify(board))
        tempBoard1[row][5].piece = tempBoard1[row][4].piece
        tempBoard1[row][4].piece = null

        const tempBoard2 = JSON.parse(JSON.stringify(board))
        tempBoard2[row][6].piece = tempBoard2[row][4].piece
        tempBoard2[row][4].piece = null

        if (!isKingInCheck(tempBoard1, color) && !isKingInCheck(tempBoard2, color)) {
          moves.push({ row, col: 6 })
        }
      }

      // Queenside castling
      const queensideRook = board[row][0].piece
      if (
        queensideRook &&
        !queensideRook.hasMoved &&
        !board[row][1].piece &&
        !board[row][2].piece &&
        !board[row][3].piece
      ) {
        const tempBoard1 = JSON.parse(JSON.stringify(board))
        tempBoard1[row][3].piece = tempBoard1[row][4].piece
        tempBoard1[row][4].piece = null

        const tempBoard2 = JSON.parse(JSON.stringify(board))
        tempBoard2[row][2].piece = tempBoard2[row][4].piece
        tempBoard2[row][4].piece = null

        if (!isKingInCheck(tempBoard1, color) && !isKingInCheck(tempBoard2, color)) {
          moves.push({ row, col: 2 })
        }
      }
    }
  }

  const generateMoveNotation = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    piece: Piece,
    captured: boolean,
    isCheck: boolean,
    isCheckmate: boolean,
  ): string => {
    const files = "abcdefgh"
    const fromSquare = `${files[fromCol]}${8 - fromRow}`
    const toSquare = `${files[toCol]}${8 - toRow}`

    let notation = ""

    if (piece.type === "king" && Math.abs(fromCol - toCol) === 2) {
      notation = toCol > fromCol ? "O-O" : "O-O-O"
    } else if (piece.type === "pawn") {
      if (captured) {
        notation = `${files[fromCol]}x${toSquare}`
      } else {
        notation = toSquare
      }
    } else {
      const pieceSymbol = piece.type === "knight" ? "N" : piece.type!.charAt(0).toUpperCase()
      notation = `${pieceSymbol}${captured ? "x" : ""}${toSquare}`
    }

    if (isCheckmate) {
      notation += "#"
    } else if (isCheck) {
      notation += "+"
    }

    return notation
  }

  const movePiece = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const newBoard = [...board.map((row) => [...row])]
    const movingPiece = newBoard[fromRow][fromCol].piece!
    const capturedPiece = newBoard[toRow][toCol].piece
    const wasCaptured = !!capturedPiece

    // Handle en passant capture
    let enPassantCapture = false
    if (movingPiece.type === "pawn" && !capturedPiece && fromCol !== toCol) {
      enPassantCapture = true
      newBoard[fromRow][toCol].piece = null
    }

    // Handle castling
    if (movingPiece.type === "king" && Math.abs(fromCol - toCol) === 2) {
      const isKingside = toCol > fromCol
      const rookFromCol = isKingside ? 7 : 0
      const rookToCol = isKingside ? 5 : 3

      newBoard[fromRow][rookToCol].piece = newBoard[fromRow][rookFromCol].piece
      newBoard[fromRow][rookFromCol].piece = null
      if (newBoard[fromRow][rookToCol].piece) {
        newBoard[fromRow][rookToCol].piece.hasMoved = true
      }
    }

    // Save move history
    const moveRecord = {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: movingPiece,
      captured: capturedPiece,
      board: JSON.parse(JSON.stringify(board)),
      inCheck: inCheck,
      currentPlayer: currentPlayer,
      movesRemaining: movesRemaining,
      piecesMovedThisTurn: [...piecesMovedThisTurn],
      turnNumber: turnNumber,
      gameStatus: gameStatus,
      winner: winner,
      checkingPlayerRetainsMoves: checkingPlayerRetainsMoves,
    }

    setMoveHistory([...moveHistory, moveRecord])

    // Handle captures
    if (capturedPiece || enPassantCapture) {
      const pieceToCapture = capturedPiece || (enPassantCapture ? newBoard[fromRow][toCol].piece : null)
      if (pieceToCapture) {
        setCapturedPieces((prev) => {
          const newCaptured = { ...prev }
          const colorKey = pieceToCapture.color === "white" ? "white" : "black"
          newCaptured[colorKey] = [...newCaptured[colorKey], pieceToCapture]

          // Sort alphabetically by piece type
          newCaptured[colorKey].sort((a, b) => {
            const order = ["bishop", "king", "knight", "pawn", "queen", "rook"]
            return order.indexOf(a.type!) - order.indexOf(b.type!)
          })

          return newCaptured
        })
      }
      playSound("capture")
    } else {
      playSound("move")
    }

    // Move the piece
    newBoard[toRow][toCol].piece = { ...movingPiece, hasMoved: true }
    newBoard[fromRow][fromCol].piece = null

    // Handle pawn promotion
    if (movingPiece.type === "pawn" && (toRow === 0 || toRow === 7)) {
      setPromotionDialog({
        isOpen: true,
        color: movingPiece.color,
        position: { row: toRow, col: toCol },
      })
      setBoard(newBoard)
      return
    }

    setBoard(newBoard)
    setLastMove({ from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } })

    // Add the piece to the list of pieces moved this turn
    setPiecesMovedThisTurn([...piecesMovedThisTurn, { row: toRow, col: toCol }])

    // Decrement moves remaining
    const newMovesRemaining = movesRemaining - 1
    setMovesRemaining(newMovesRemaining)

    // Check if the turn is over
    if (newMovesRemaining === 0) {
      const opponentColor = currentPlayer === "white" ? "black" : "white"
      const { isInCheck, isCheckmate } = checkGameStatus(newBoard, opponentColor)

      // Generate move notation
      const notation = generateMoveNotation(
        fromRow,
        fromCol,
        toRow,
        toCol,
        movingPiece,
        wasCaptured || enPassantCapture,
        isInCheck,
        isCheckmate,
      )
      const moveNumber = Math.floor(moveNotationHistory.length / 2) + 1
      setMoveNotationHistory([...moveNotationHistory, { notation, player: currentPlayer!, moveNumber }])

      if (isCheckmate) {
        playSound("checkmate")
        return
      } else if (isInCheck) {
        playSound("check")
      }

      // Switch player and handle turn logic according to variant rules
      setCurrentPlayer(opponentColor)
      setPiecesMovedThisTurn([])

      // Variant Rules Implementation:
      if (isInCheck) {
        // If first move results in check, opponent MUST resolve check with their first move
        // Checking player retains full two moves after check is resolved
        setMovesRemaining(1)
        setCheckingPlayerRetainsMoves(true)
      } else if (checkingPlayerRetainsMoves && inCheck === opponentColor) {
        // After check is resolved, checking player gets their full 2 moves
        setMovesRemaining(2)
        setCheckingPlayerRetainsMoves(false)
      } else {
        // Normal turn sequence: White starts with 1, then everyone gets 2
        if (turnNumber === 1 && currentPlayer === "white") {
          // White's first turn (1 move) is complete, Black gets 2 moves
          setMovesRemaining(2)
          setTurnNumber(2)
        } else {
          // Everyone else gets 2 moves
          setMovesRemaining(2)
          setTurnNumber(turnNumber + 1)
        }
      }
    }
  }

  const handlePromotion = (pieceType: "queen" | "rook" | "bishop" | "knight") => {
    if (!promotionDialog.position) return

    const newBoard = [...board.map((row) => [...row])]
    newBoard[promotionDialog.position.row][promotionDialog.position.col].piece = {
      type: pieceType,
      color: promotionDialog.color,
      hasMoved: true,
    }

    setBoard(newBoard)
    setPromotionDialog({ isOpen: false, color: null, position: null })

    // Continue with turn logic
    const newMovesRemaining = movesRemaining - 1
    setMovesRemaining(newMovesRemaining)

    if (newMovesRemaining === 0) {
      const opponentColor = currentPlayer === "white" ? "black" : "white"
      const { isInCheck, isCheckmate } = checkGameStatus(newBoard, opponentColor)

      if (isCheckmate) {
        playSound("checkmate")
        return
      } else if (isInCheck) {
        playSound("check")
      }

      setCurrentPlayer(opponentColor)
      setPiecesMovedThisTurn([])

      // Apply variant rules for turn sequence
      if (isInCheck) {
        setMovesRemaining(1)
        setCheckingPlayerRetainsMoves(true)
      } else if (checkingPlayerRetainsMoves && inCheck === opponentColor) {
        setMovesRemaining(2)
        setCheckingPlayerRetainsMoves(false)
      } else {
        if (turnNumber === 1 && currentPlayer === "white") {
          setMovesRemaining(2)
          setTurnNumber(2)
        } else {
          setMovesRemaining(2)
          setTurnNumber(turnNumber + 1)
        }
      }
    }
  }

  const checkGameStatus = (boardState: Square[][], playerColor: PieceColor) => {
    let kingPosition: { row: number; col: number } | null = null
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col].piece
        if (piece && piece.type === "king" && piece.color === playerColor) {
          kingPosition = { row, col }
          break
        }
      }
      if (kingPosition) break
    }

    if (!kingPosition) return { isInCheck: false, isCheckmate: false }

    const opponentColor = playerColor === "white" ? "black" : "white"
    let isInCheck = false

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col].piece
        if (piece && piece.color === opponentColor) {
          const moves = getValidMovesForPiece(row, col, boardState, false)
          if (moves.some((move) => move.row === kingPosition!.row && move.col === kingPosition!.col)) {
            isInCheck = true
            break
          }
        }
      }
      if (isInCheck) break
    }

    let isCheckmate = false
    if (isInCheck) {
      isCheckmate = isCheckmateForPlayer(boardState, playerColor)

      if (isCheckmate) {
        setGameStatus("checkmate")
        setWinner(opponentColor)
      } else {
        setInCheck(playerColor)
        setGameStatus("check")
      }
    } else {
      if (inCheck === playerColor) {
        setInCheck(null)
        setGameStatus("playing")
      }
    }

    return { isInCheck, isCheckmate }
  }

  const isCheckmateForPlayer = (boardState: Square[][], playerColor: PieceColor): boolean => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col].piece
        if (piece && piece.color === playerColor) {
          const moves = getValidMovesForPiece(row, col, boardState, true)
          if (moves.length > 0) {
            return false
          }
        }
      }
    }
    return true
  }

  const getValidMovesForPiece = (row: number, col: number, boardState: Square[][], checkForSafety = true) => {
    const piece = boardState[row][col].piece
    if (!piece) return []

    const moves: { row: number; col: number }[] = []

    switch (piece.type) {
      case "pawn":
        getPawnMovesForCheck(row, col, piece.color, moves, boardState)
        break
      case "rook":
        getRookMovesForCheck(row, col, piece.color, moves, boardState)
        break
      case "knight":
        getKnightMovesForCheck(row, col, moves, boardState)
        break
      case "bishop":
        getBishopMovesForCheck(row, col, piece.color, moves, boardState)
        break
      case "queen":
        getRookMovesForCheck(row, col, piece.color, moves, boardState)
        getBishopMovesForCheck(row, col, piece.color, moves, boardState)
        break
      case "king":
        getKingMovesForCheck(row, col, piece.color, moves, boardState)
        break
    }

    if (checkForSafety) {
      return moves.filter((move) => {
        const tempBoard = JSON.parse(JSON.stringify(boardState))
        tempBoard[move.row][move.col].piece = tempBoard[row][col].piece
        tempBoard[row][col].piece = null
        return !isKingInCheck(tempBoard, piece.color)
      })
    }

    return moves
  }

  // Helper functions for check detection
  const getPawnMovesForCheck = (
    row: number,
    col: number,
    color: PieceColor,
    moves: { row: number; col: number }[],
    boardState: Square[][],
  ) => {
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

  const getRookMovesForCheck = (
    row: number,
    col: number,
    color: PieceColor,
    moves: { row: number; col: number }[],
    boardState: Square[][],
  ) => {
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

  const getKnightMovesForCheck = (
    row: number,
    col: number,
    moves: { row: number; col: number }[],
    boardState: Square[][],
  ) => {
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

  const getBishopMovesForCheck = (
    row: number,
    col: number,
    color: PieceColor,
    moves: { row: number; col: number }[],
    boardState: Square[][],
  ) => {
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

  const getKingMovesForCheck = (
    row: number,
    col: number,
    color: PieceColor,
    moves: { row: number; col: number }[],
    boardState: Square[][],
  ) => {
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

  const undoMove = () => {
    if (moveHistory.length === 0) return

    const lastMove = moveHistory[moveHistory.length - 1]
    setBoard(lastMove.board)
    setInCheck(lastMove.inCheck)
    setCurrentPlayer(lastMove.currentPlayer)
    setMovesRemaining(lastMove.movesRemaining)
    setPiecesMovedThisTurn(lastMove.piecesMovedThisTurn || [])
    setTurnNumber(lastMove.turnNumber || 1)
    setGameStatus(lastMove.gameStatus || "playing")
    setWinner(lastMove.winner || null)
    setCheckingPlayerRetainsMoves(lastMove.checkingPlayerRetainsMoves || false)
    setMoveHistory(moveHistory.slice(0, -1))
    setMoveNotationHistory(moveNotationHistory.slice(0, -1))
  }

  const resetGame = () => {
    initializeBoard()
    setSelectedPiece(null)
    setValidMoves([])
    setCurrentPlayer("white")
    setMovesRemaining(1) // White starts with 1 move
    setPiecesMovedThisTurn([])
    setTurnNumber(1)
    setCapturedPieces({ white: [], black: [] })
    setGameStatus("playing")
    setMoveHistory([])
    setInCheck(null)
    setWinner(null)
    setDraggedPiece(null)
    setMoveNotationHistory([])
    setLastMove(null)
    setCheckingPlayerRetainsMoves(false)
    setBotThinking(false)
  }

  const getStatusMessage = () => {
    if (botThinking) {
      return "🤖 Bot is thinking..."
    }

    switch (gameStatus) {
      case "check":
        if (checkingPlayerRetainsMoves) {
          return `${inCheck === "white" ? "White" : "Black"} is in check! Must resolve with 1 move, then ${currentPlayer === "white" ? "Black" : "White"} gets 2 moves.`
        }
        return `${inCheck === "white" ? "White" : "Black"} is in check! ${movesRemaining} move${movesRemaining !== 1 ? "s" : ""} to resolve.`
      case "checkmate":
        return `Checkmate! ${winner === "white" ? "White" : "Black"} wins! 🎉`
      case "timeout":
        return `Time's up! ${winner === "white" ? "White" : "Black"} wins! ⏰`
      case "stalemate":
        return "Stalemate! It's a draw! 🤝"
      default:
        const playerName =
          gameMode === "solo" && currentPlayer === "black" ? "Bot" : currentPlayer === "white" ? "White" : "Black"
        return `${playerName}'s turn - ${movesRemaining} move${movesRemaining !== 1 ? "s" : ""} remaining (Turn ${turnNumber})`
    }
  }

  // Sort captured pieces alphabetically
  const sortedCapturedPieces = {
    white: [...capturedPieces.white].sort((a, b) => {
      const order = ["bishop", "king", "knight", "pawn", "queen", "rook"]
      return order.indexOf(a.type!) - order.indexOf(b.type!)
    }),
    black: [...capturedPieces.black].sort((a, b) => {
      const order = ["bishop", "king", "knight", "pawn", "queen", "rook"]
      return order.indexOf(a.type!) - order.indexOf(b.type!)
    }),
  }

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <div className="w-full bg-slate-800 border-b border-slate-700 p-4 mb-8">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <Button
            onClick={onReturnToMenu}
            variant="outline"
            className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-100 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Menu
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Royal Chess
            </h1>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-slate-700 rounded-lg border border-slate-600">
            {gameMode === "solo" ? (
              <>
                <Bot className="w-5 h-5 text-blue-400" />
                <span className="text-slate-100 font-semibold">Solo Mode</span>
              </>
            ) : (
              <>
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-slate-100 font-semibold">Two-Player Mode</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Game Content */}
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Left sidebar - Move History */}
          <div className="order-2 lg:order-1">
            <MoveHistory moves={moveNotationHistory} />
          </div>

          {/* Main game area */}
          <div className="flex flex-col items-center order-1 lg:order-2">
            {/* Game Timer */}
            <div className="mb-6">
              <GameTimer currentPlayer={currentPlayer} gameStatus={gameStatus} onTimeUp={handleTimeUp} />
            </div>

            {/* Game Status */}
            <Card className="mb-6 bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-100 mb-2">{getStatusMessage()}</div>
                  <div className="flex gap-2 justify-center">
                    <GameRules />
                    <GameControls onUndo={undoMove} onReset={resetGame} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chess Board */}
            <div className="relative">
              <div className="border-4 border-amber-600 rounded-xl shadow-2xl overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200">
                {/* Top coordinate labels */}
                <div className="flex bg-slate-700">
                  <div className="w-8 h-6"></div> {/* Corner space */}
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="w-16 h-6 flex items-center justify-center font-bold text-slate-300 text-sm">
                      {String.fromCharCode(97 + i)}
                    </div>
                  ))}
                  <div className="w-8 h-6"></div> {/* Corner space */}
                </div>

                {board.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex">
                    {/* Left row label */}
                    <div className="w-8 h-16 flex items-center justify-center font-bold bg-slate-700 text-slate-300 text-sm">
                      {8 - rowIndex}
                    </div>

                    {row.map((square, colIndex) => {
                      const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex
                      const isValidMove = validMoves.some((move) => move.row === rowIndex && move.col === colIndex)
                      const isLight = (rowIndex + colIndex) % 2 === 0
                      const isLastMoveSquare =
                        lastMove &&
                        ((lastMove.from.row === rowIndex && lastMove.from.col === colIndex) ||
                          (lastMove.to.row === rowIndex && lastMove.to.col === colIndex))
                      const isDraggedOver = draggedPiece && isValidMove
                      const isPieceMovedThisTurn = piecesMovedThisTurn.some(
                        (piece) => piece.row === rowIndex && piece.col === colIndex,
                      )

                      return (
                        <div
                          key={colIndex}
                          className={`
                w-16 h-16 flex items-center justify-center relative transition-all duration-300 cursor-pointer
                ${
                  isLight
                    ? "bg-gradient-to-br from-amber-100 to-amber-200"
                    : "bg-gradient-to-br from-amber-700 to-amber-800"
                }
                ${isSelected ? "ring-4 ring-blue-400 ring-opacity-80 shadow-lg shadow-blue-400/50" : ""}
                ${isLastMoveSquare ? "bg-gradient-to-br from-yellow-300 to-yellow-400" : ""}
                ${isDraggedOver ? "bg-gradient-to-br from-green-300 to-green-400 scale-105" : ""}
                ${isPieceMovedThisTurn ? "bg-gradient-to-br from-purple-300 to-purple-400" : ""}
                ${isValidMove ? "hover:brightness-110" : ""}
                ${botThinking && gameMode === "solo" && currentPlayer === "black" ? "opacity-70" : ""}
              `}
                          onClick={() => handleSquareClick(rowIndex, colIndex)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDrop(rowIndex, colIndex)}
                        >
                          {square.piece && (
                            <div
                              className={`w-full h-full ${isSelected ? "scale-110 transition-transform" : ""} ${
                                isPieceMovedThisTurn ? "opacity-70" : ""
                              }`}
                              draggable={!botThinking}
                              onDragStart={() => handleDragStart(rowIndex, colIndex)}
                              onDragEnd={handleDragEnd}
                            >
                              <ChessPiece
                                type={square.piece.type}
                                color={square.piece.color}
                                isDragging={draggedPiece?.row === rowIndex && draggedPiece?.col === colIndex}
                              />
                            </div>
                          )}

                          {isValidMove && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              {!square.piece ? (
                                <div className="w-4 h-4 rounded-full bg-slate-600 bg-opacity-60 animate-pulse shadow-lg"></div>
                              ) : (
                                <div className="absolute inset-0 bg-red-500 bg-opacity-30 rounded-full animate-pulse"></div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Right row label */}
                    <div className="w-8 h-16 flex items-center justify-center font-bold bg-slate-700 text-slate-300 text-sm">
                      {8 - rowIndex}
                    </div>
                  </div>
                ))}

                {/* Bottom coordinate labels */}
                <div className="flex bg-slate-700">
                  <div className="w-8 h-6"></div> {/* Corner space */}
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="w-16 h-6 flex items-center justify-center font-bold text-slate-300 text-sm">
                      {String.fromCharCode(97 + i)}
                    </div>
                  ))}
                  <div className="w-8 h-6"></div> {/* Corner space */}
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar - Captured Pieces */}
          <div className="order-3 lg:order-3 flex flex-col gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 text-center text-slate-100">Captured Pieces</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-slate-300 mb-2">White Pieces (Alphabetical)</h4>
                    <div className="flex flex-wrap gap-1 min-h-12 p-2 bg-slate-700 rounded justify-center items-center">
                      {sortedCapturedPieces.white.length === 0 ? (
                        <span className="text-slate-500 text-xs">None</span>
                      ) : (
                        sortedCapturedPieces.white.map((piece, index) => (
                          <div key={index} className="w-8 h-8">
                            <ChessPiece type={piece.type} color={piece.color} size="sm" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm text-slate-300 mb-2">Black Pieces (Alphabetical)</h4>
                    <div className="flex flex-wrap gap-1 min-h-12 p-2 bg-slate-700 rounded justify-center items-center">
                      {sortedCapturedPieces.black.length === 0 ? (
                        <span className="text-slate-500 text-xs">None</span>
                      ) : (
                        sortedCapturedPieces.black.map((piece, index) => (
                          <div key={index} className="w-8 h-8">
                            <ChessPiece type={piece.type} color={piece.color} size="sm" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <PromotionDialog isOpen={promotionDialog.isOpen} color={promotionDialog.color!} onSelect={handlePromotion} />
        </div>
      </div>
    </div>
  )
}
