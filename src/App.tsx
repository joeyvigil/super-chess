import { useState, useCallback, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { searchBest } from './engine'
import './App.css'

function App() {
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  const [gameOver, setGameOver] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastBotMove, setLastBotMove] = useState<string | null>(null)
  const chessRef = useRef(new Chess())

  const newGame = useCallback(() => {
    chessRef.current = new Chess()
    setFen(chessRef.current.fen())
    setGameOver(false)
    setResult(null)
    setLastBotMove(null)
  }, [])

  const onDrop = useCallback(
    (sourceSquare: string, targetSquare: string | null) => {
      if (!targetSquare || loading || gameOver) return false

      const chess = chessRef.current
      try {
        chess.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
      } catch {
        return false
      }
      setFen(chess.fen())

      if (chess.isGameOver()) {
        const r = chess.isCheckmate()
          ? (chess.turn() === 'b' ? '1-0' : '0-1')
          : '½-½'
        setGameOver(true)
        setResult(r)
        return true
      }

      setLoading(true)
      setTimeout(() => {
        const sr = searchBest(chess)
        if (sr.best) {
          chess.move(sr.best)
          setFen(chess.fen())
          setLastBotMove(sr.best)
          if (chess.isGameOver()) {
            const r = chess.isCheckmate()
              ? (chess.turn() === 'b' ? '1-0' : '0-1')
              : '½-½'
            setGameOver(true)
            setResult(r)
          }
        }
        setLoading(false)
      }, 50)

      return true
    },
    [loading, gameOver],
  )

  return (
    <div className="app">
      <h1>super-chess</h1>
      <div className="board-container">
        <Chessboard
          options={{
            position: fen,
            boardOrientation: 'white',
            onPieceDrop: ({ sourceSquare, targetSquare }) =>
              onDrop(sourceSquare, targetSquare),
            allowDragging: !loading && !gameOver,
          }}
        />
      </div>
      <div className="info">
        {loading && <p className="thinking">Bot is thinking…</p>}
        {lastBotMove && !loading && (
          <p>
            Bot played: <strong>{lastBotMove}</strong>
          </p>
        )}
        {gameOver && result && <p className="result">{result}</p>}
      </div>
      <button className="new-game" onClick={newGame}>
        New Game
      </button>
    </div>
  )
}

export default App
