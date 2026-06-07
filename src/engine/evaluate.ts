import type { Chess } from 'chess.js'
import { PIECE_VALUES, PIECE_TABLES, mirrorSq } from './tables'

const INF = 1e9

export function evaluate(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -INF + chess.moveNumber() : INF - chess.moveNumber()
  }
  if (chess.isDraw()) return 0

  let score = 0
  const board = chess.board()

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (!piece) continue
      const sq = row * 8 + col
      const idx = piece.color === 'w' ? mirrorSq(sq) : sq
      const val = PIECE_VALUES[piece.type] + (PIECE_TABLES[piece.type]?.[idx] ?? 0)
      score += piece.color === 'w' ? val : -val
    }
  }

  return chess.turn() === 'w' ? score : -score
}
