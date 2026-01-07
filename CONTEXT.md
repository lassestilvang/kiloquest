# KiloQuest: KiloGuess Edition

## Overview
A browser-based estimation game built with Next.js 15. Players embark on an AI-generated adventure, starting with exactly 1,000 Steps. Progressing through the story requires solving KiloGuess challenges—estimation questions that cost fewer steps for correct answers and more for incorrect ones.

## Purpose
Test players' intuition about scale and estimation in an engaging, game-like experience. The game demonstrates how well people can estimate quantities, time, distance, and sizes.

## Key Features
- **Genre Selection**: Choose from Fantasy, Sci-Fi, Mystery, or Post-Apocalyptic themes
- **KiloGuess Challenges**: Multiple-choice estimation questions tied to story context
- **Step System**: 
  - Correct answer: -10 steps
  - Close answer: -25 steps
  - Wrong answer: -50 steps
- **Player Archetypes**: Based on performance, players receive titles like "The Clever Strategist" or "The Bold Guesser"
- **Responsive Design**: Works on mobile and desktop devices

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **React**: 19.1.0
- **Styling**: Tailwind CSS v4
- **TypeScript**: Fully typed
- **Package Manager**: Bun

### Project Structure
```
src/
├── app/
│   ├── globals.css      # Global styles with Tailwind
│   ├── layout.tsx       # Root layout with metadata
│   └── page.tsx         # Main entry point
└── components/
    └── KiloQuestGame.tsx # Main game component (client-side)
```

### Game Flow
1. **Start Screen**: Genre selection and game initialization
2. **Game Screen**: Story panel + KiloGuess challenge
3. **Resolution Screen**: Answer feedback and step deduction
4. **Ending Screen**: Final summary and player archetype

## Game Logic

### State Management
- `steps`: Starts at 1000, decrements based on answer accuracy
- `round`: Current round number
- `genre`: Selected story genre
- `totalStepsUsed`: Cumulative steps spent (for archetype calculation)

### Content System
- Pre-generated story content for each genre
- Estimation challenges with varying difficulty
- Dynamic endings based on performance

## Changes & Updates

### Version 1.0.0 (Initial Build)
- Created main game component with all screens
- Implemented 4 genres with unique story content
- Added 5 core KiloGuess challenges (cycling for rounds 6+)
- Added player archetypes based on total steps used
- Styled with Tailwind CSS for a modern, game-like feel
- Responsive design for mobile and desktop

## Conventions
- Client-side state management using React hooks
- Single-page application feel with conditional rendering
- No backend or authentication required
- No persistence between page reloads
