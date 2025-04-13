# PrizePin Game

PrizePin is an interactive browser-based game where players guess a 6-digit PIN to win virtual prizes. Players can collect items, sell them in a marketplace, or buy items from other players.

## Features

- **PIN Guessing Game**: Guess the correct 6-digit PIN within a 30-second timer to win prizes
- **User Authentication**: Create an account with a username and 8-digit PIN
- **Virtual Inventory**: Store won prizes in your personal inventory
- **Marketplace**: Buy and sell items with other players
- **Dynamic Pricing**: Item prices fluctuate based on marketplace activity
- **Local Storage**: Game data is saved in your browser's local storage

## How to Play

1. **Create an Account or Login**:
   - Sign up with a username and an 8-digit PIN
   - Or log in with existing credentials

2. **Play the Game**:
   - You have 30 seconds to guess the correct 6-digit PIN
   - Each round features a different potential prize
   - If you guess correctly, you win the prize
   - If time runs out or you guess incorrectly, a new PIN and prize are generated

3. **Manage Your Prizes**:
   - When you win a prize, you can:
     - Keep it in your inventory
     - Sell it at the current market price
     - Set a custom price to sell in the marketplace

4. **Use the Marketplace**:
   - Buy items from other players
   - Sell items from your inventory
   - Take your listed items off sale if you change your mind

## Getting Started

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/PrizePinGame.git
   ```

2. Open `index.html` in your web browser

3. Create an account and start playing!

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Local Storage API

## Game Mechanics

- **PIN Generation**: A random 6-digit PIN is generated for each round
- **Timer**: Players have 30 seconds to guess the PIN
- **Prize Selection**: A random prize is selected from the available prizes list
- **Market Pricing**: Prices are calculated based on the average price of similar items in the marketplace
- **User Data**: All user data and marketplace listings are stored in the browser's local storage

## Secret Features

- There's a hidden admin mode for testing purposes

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- This game was created as a fun project to demonstrate web development skills
- Inspired by various online marketplace and guessing games