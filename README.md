# super-chess

A chess bot that runs entirely in the browser — no backend needed.

Built with React, TypeScript, chess.js, and a custom alpha-beta search engine.

## Structure

```
src/engine/
├── tables.ts     # Piece-square tables
├── evaluate.ts   # Position evaluation
├── search.ts     # Alpha-beta search with quiescence
└── index.ts
```

## Run

```bash
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`) and drag pieces to play.

## GH pages

link: (here)
