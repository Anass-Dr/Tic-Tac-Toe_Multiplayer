# Tic-Tac-Toe Multiplayer Game 🎮

A real-time multiplayer Tic-Tac-Toe game built with Node.js, Express, MongoDB, and Socket.io.

## 📋 Description

This game allows two players to play Tic-Tac-Toe against each other in real-time over the web. The game supports multiple simultaneous sessions and uses WebSockets for fast, interactive communication.

## 🌐 Live Demo

Play the game live at: http://13.60.169.142

## 🚀 Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Anass-Dr/Tic-Tac-Toe_Multiplayer.git
    cd Tic-Tac-Toe_Multiplayer
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Set environment variables:**

   Create a `.env` file in the root directory and add your MongoDB URI and server port:

    ```bash
    MONGODB_URI=your_mongo_connection_string
    ```

4. **Start the server:**

    ```bash
    node server.js
    ```

5. **Access the game:**

   Open your browser and navigate to `http://localhost:3000`.

## 🎮 Game Rules

- The game is played on a 20x20 grid.
- Two players take turns marking their symbol (`X` or `O`).
- The first player to get 5 symbols in a row (vertically, horizontally, or diagonally) wins.
- If all cells are filled and no player has three in a row, the game is a draw.

## ✨ Features

- Real-time multiplayer gameplay with **Socket.io**.
- Persistent data storage with **MongoDB**.
- **Responsive design** for desktop and mobile.
- Player authentication with usernames.

## 🛠️ Technologies Used

- **Node.js**: Backend JavaScript runtime.
- **Express**: Web framework for handling routes and requests.
- **Socket.io**: Real-time communication between clients and server.
- **MongoDB**: NoSQL database for storing game and player data.
- **HTML/CSS/JavaScript**: Frontend technologies for game interface.

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/YourFeature`).
6. Open a Pull Request.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Feel free to reach out if you have any questions or feedback!
