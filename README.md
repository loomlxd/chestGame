Chest Game

Overview
This project is a small game prototype created as part of a JS Game Developer practical exam.
The game includes a Play button and 6 chests with randomized outcomes: Lose, Win, or Bonus.

Game Flow

- Initial state:
  - Play button is enabled
  - All chests are disabled

- Press Play:
  - Play button becomes disabled
  - All chests become clickable

- Click a chest:
  - All other elements are disabled
  - Chest result is randomly determined:
    - Lose
    - Regular Win
    - Bonus Win
  - Chest opens with the corresponding animation

- After opening:
  - Regular Win adds value to total
  - Bonus Win opens a bonus screen with animation and win amount, then returns to main screen
  - After all chests are opened, total result is shown and the game can be restarted

Tech Stack

- TypeScript
- PIXI.js (Canvas rendering)
- @pixi/sound (audio)

Architecture Notes

- Scene-based structure (MainScene controls game flow)
- Encapsulated objects and UI components
- Event-driven communication between game elements
- All animations driven by PIXI Ticker

How to Run
Requirements:

- Node.js >= 16

Install dependencies:
npm install

Run development server:
npm run dev

Open in browser:
http://localhost:5173

Live Demo: https://my-chest-game.netlify.app

Author
Lomaka Bohdan
