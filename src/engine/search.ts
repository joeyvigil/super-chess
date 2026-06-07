import { Chess } from 'chess.js'
import { evaluate } from './evaluate'

const INF = 1e9

const PIECE_ORDER: Record<string, number> = {
  p: 1, n: 2, b: 3, r: 4, q: 5, k: 6,
  P: 1, N: 2, B: 3, R: 4, Q: 5, K: 6,
}

function orderMoves(chess: Chess): string[] {
  const moves = chess.moves({ verbose: true })
  const scored = moves.map((m) => {
    let s = 0
    if (m.captured) s += 10 * PIECE_ORDER[m.captured] - PIECE_ORDER[m.piece]
    if (m.promotion) s += 1000
    return { score: s, san: m.san }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.map((m) => m.san)
}

function quiesce(chess: Chess, alpha: number, beta: number, depth: number): number {
  const standPat = evaluate(chess)
  if (depth <= 0) return standPat
  if (standPat >= beta) return beta
  if (standPat > alpha) alpha = standPat

  for (const move of chess.moves({ verbose: true })) {
    if (!move.captured) continue
    chess.move(move.san)
    const score = -quiesce(chess, -beta, -alpha, depth - 1)
    chess.undo()
    if (score >= beta) return beta
    if (score > alpha) alpha = score
  }
  return alpha
}

function alphaBeta(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  qDepth: number,
): number {
  if (chess.isGameOver()) return evaluate(chess)
  if (depth === 0) return quiesce(chess, alpha, beta, qDepth)

  const moves = orderMoves(chess)
  let value = -INF
  for (const san of moves) {
    chess.move(san)
    value = Math.max(value, -alphaBeta(chess, depth - 1, -beta, -alpha, qDepth))
    chess.undo()
    if (value >= beta) return beta
    alpha = Math.max(alpha, value)
  }
  return value
}

export interface SearchResult {
  best: string | null
  score: number
}

export function searchBest(chess: Chess, maxDepth = 3, qDepth = 1): SearchResult {
  let bestMove: string | null = null
  let bestScore = -INF

  const moves = orderMoves(chess)
  for (const san of moves) {
    chess.move(san)
    const score = -alphaBeta(chess, maxDepth - 1, -INF, INF, qDepth)
    chess.undo()
    if (score > bestScore) {
      bestScore = score
      bestMove = san
    }
  }

  return { best: bestMove, score: bestScore }
}
