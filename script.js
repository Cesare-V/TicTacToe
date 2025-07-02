// 1. Factory Function per creare un giocatore
const createPlayer = (name, symbol) => {
    return { name, symbol };
};

// ---

// 2. Modulo per la gestione del tabellone di gioco (Game Board Module)
const gameBoard = (() => {
    // Il nostro tabellone è un array di 9 elementi.
    // Ogni elemento rappresenta una cella e può essere '', 'X', o '0'.
    let board = ["", "", "", "", "", "", "", "", ""];

    // Restituisce una copia del tabellone corrente.
    // Usiamo una copia per evitare modifiche dirette esterne.
    const getBoard = () => [...board];

    // Tenta di fare una mossa in una data casella con un dato simbolo.
    const makeMove = (index, playerSymbol) => {
        // Controlla se l'indice è valido e la casella è vuota.
        if (index >= 0 && index < 9 && board[index] === "") {
            board[index] = playerSymbol; // Posiziona il simbolo
            return true; // Mossa valida
        }
        return false; // Mossa non valida (casella già occupata o indice fuori limite)
    };

    // Resetta il tabellone, rendendo tutte le caselle vuote.
    const resetBoard = () => {
        board = ["", "", "", "", "", "", "", "", ""];
    };

    // Espone le funzioni pubbliche del modulo
    return { getBoard, makeMove, resetBoard };
})();

// ---

// 3. Modulo per la logica del gioco (Game Controller Module)
const gameController = (() => {
    // Creazione dei giocatori usando la Factory Function
    const playerX = createPlayer("Giocatore 1", "X");
    const playerO = createPlayer("Giocatore 2", "O");

    let currentPlayer = playerX; // Il gioco inizia con il Giocatore 1 (X)
    let isGameOver = false;      // Flag per indicare se la partita è finita

    // Cambia il giocatore corrente tra X e O
    const switchPlayer = () => {
        currentPlayer = currentPlayer === playerX ? playerO : playerX;
    };

    // Restituisce il giocatore corrente
    const getCurrentPlayer = () => currentPlayer;

    // Controlla se c'è un vincitore
    const checkWinner = () => {
        const board = gameBoard.getBoard(); // Ottieni lo stato attuale del tabellone

        // Tutte le possibili combinazioni vincenti (righe, colonne, diagonali)
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Righe
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonne
            [0, 4, 8], [2, 4, 6]             // Diagonali
        ];

        // Itera su ogni combinazione vincente
        for (const combination of winningCombinations) {
            const [a, b, c] = combination; // Estrai gli indici della combinazione

            // Controlla se le tre caselle non sono vuote E se sono tutte uguali
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a]; // Restituisce il simbolo del vincitore ('X' o 'O')
            }
        }
        return null; // Nessun vincitore per ora
    };

    // Controlla se la partita è un pareggio
    const checkTie = () => {
        const board = gameBoard.getBoard(); // Ottieni lo stato attuale del tabellone
        // Se tutte le caselle non sono vuote E non c'è un vincitore, è un pareggio.
        return board.every(cell => cell !== "") && !checkWinner();
    };

    // Gestisce un singolo turno di gioco
    const playRound = (index) => {
        if (isGameOver) return; // Se la partita è finita, non consentire altre mosse

        // Tenta di fare la mossa sul tabellone
        if (gameBoard.makeMove(index, currentPlayer.symbol)) {
            // Se la mossa è valida, controlla lo stato del gioco
            const winner = checkWinner();
            if (winner) {
                isGameOver = true;
                return "win"; // Indica che c'è un vincitore
            } else if (checkTie()) {
                isGameOver = true;
                return "tie"; // Indica un pareggio
            } else {
                switchPlayer(); // Se la partita continua, cambia il turno al prossimo giocatore
                return "continue"; // Indica che il gioco continua
            }
        } else {
            return "invalid"; // Mossa non valida (casella già occupata)
        }
    };

    // Resetta lo stato del gioco per una nuova partita
    const resetGame = () => {
        gameBoard.resetBoard(); // Resetta il tabellone
        currentPlayer = playerX; // Reimposta il giocatore iniziale
        isGameOver = false;      // Resetta il flag di fine partita
    };

    // Espone le funzioni e le proprietà pubbliche del modulo
    return { playRound, getCurrentPlayer, getBoard: gameBoard.getBoard, resetGame };
})();

// ---

// 4. Modulo per la gestione dell'interfaccia utente (Display Controller Module)
const displayController = (() => {
    // Seleziona tutti gli elementi delle celle e il messaggio/bottone dal DOM
    const cells = document.querySelectorAll(".cell");
    const messageElement = document.getElementById("message");
    const resetButton = document.getElementById("resetButton");

    // Funzione per aggiornare la visualizzazione del tabellone e del messaggio
    const updateDisplay = () => {
        const board = gameController.getBoard(); // Ottieni il tabellone dal gameController

        // Aggiorna il testo di ogni cella HTML con il simbolo corrispondente dall'array del tabellone
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
        });

        // Aggiorna il messaggio del turno/risultato
        const winnerSymbol = gameController.playRound(null); // Non facciamo una mossa, solo per ottenere lo stato
        // Chiamiamo checkWinner direttamente da gameController per evitare di fare una mossa fittizia
        const currentWinner = gameController.checkWinner();
        const currentTie = gameController.checkTie();


        if (currentWinner) {
            messageElement.textContent = `${currentWinner} ha vinto!`;
        } else if (currentTie) {
            messageElement.textContent = "È un pareggio!";
        } else {
            messageElement.textContent = `È il turno di ${gameController.getCurrentPlayer().name} (${gameController.getCurrentPlayer().symbol})`;
        }
    };

    // Funzione che gestisce il click su una cella
    const handleClick = (e) => {
        // Ottiene l'indice della cella cliccata dall'attributo data-index
        const clickedCellIndex = parseInt(e.target.dataset.index);

        // Chiama playRound del gameController e ottiene lo stato del gioco
        const gameStatus = gameController.playRound(clickedCellIndex);

        // Aggiorna la visualizzazione in base allo stato del gioco
        if (gameStatus === "win") {
            updateDisplay(); // Mostra il simbolo vincente sul tabellone
            messageElement.textContent = `${gameController.getCurrentPlayer().name} (${gameController.getCurrentPlayer().symbol}) ha vinto!`;
            // Disabilita ulteriori click sulle celle
            cells.forEach(cell => cell.removeEventListener("click", handleClick));
        } else if (gameStatus === "tie") {
            updateDisplay(); // Mostra lo stato finale del tabellone
            messageElement.textContent = "È un pareggio!";
            // Disabilita ulteriori click sulle celle
            cells.forEach(cell => cell.removeEventListener("click", handleClick));
        } else if (gameStatus === "continue") {
            updateDisplay(); // Aggiorna il tabellone e il messaggio del turno
        } else if (gameStatus === "invalid") {
            // Mossa invalida, non fare nulla sulla UI se non vuoi mostrare un messaggio specifico
            // Il gameController già stampa un messaggio in console per debug
            messageElement.textContent = `Casella già occupata! È il turno di ${gameController.getCurrentPlayer().name} (${gameController.getCurrentPlayer().symbol})`;
        }
    };

    // Aggiungi un event listener a ogni cella per i click
    cells.forEach(cell => {
        cell.addEventListener("click", handleClick);
    });

    // Aggiungi un event listener per il pulsante di reset
    resetButton.addEventListener("click", () => {
        gameController.resetGame(); // Resetta la logica del gioco
        updateDisplay();            // Aggiorna la visualizzazione
        // Riabilita i click sulle celle per la nuova partita
        cells.forEach(cell => cell.addEventListener("click", handleClick));
        // Reset del messaggio iniziale
        messageElement.textContent = `È il turno di ${gameController.getCurrentPlayer().name} (${gameController.getCurrentPlayer().symbol})`;
    });

    // Inizializza il display all'avvio della pagina
    updateDisplay();

    // In questo caso, non abbiamo bisogno di esporre funzioni pubbliche dal displayController
    // perché le sue interazioni sono gestite internamente tramite event listeners.
    return {};
})();