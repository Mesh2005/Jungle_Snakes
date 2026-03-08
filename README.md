# Jungle Snake: Heart Hunt 🐍

A React + Vite + TypeScript web game where classic Snake meets math puzzles.

## Features
- **Round-based Gameplay**: Solve the image puzzle from the Heart API to find the correct number.
- **Jungle Theme**: Custom Tailwind CSS theme with neon accents and animations.
- **Firebase Integration**: Auth and Firestore for saving stats (Score, Streak).
- **Responsive**: Works on Desktop (Keyboard) and provides mobile-friendly UI.

## Local Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Create specific `.env` file (copy `.env.example`)
   - Add your Firebase project configuration keys.

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   ...
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   - http://localhost:5173

## Game Rules
- **Objective**: Eat the food item that matches the solution to the image puzzle.
- **Controls**: Arrow Keys or WASD.
- **Scoring**: Correct answer adds to streak and score. Wrong answer resets streak.
- **Timer**: Each round has a time limit.

## Tech Stack
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Firebase v9
- React Router DOM
- Icons: Lucide React

## Deployment
Build for production:
```bash
npm run build
```
Deploy `dist/` folder to any static host (Netlify, Vercel, Firebase Hosting).
