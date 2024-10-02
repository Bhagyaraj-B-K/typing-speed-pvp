 function startCountdown(countdownDuration, callback) {
    const countdownElement = document.getElementById('countdown');
    countdownElement.style.display = 'block';
    let countdown = countdownDuration;

    const countdownInterval = setInterval(() => {
        countdownElement.textContent = `The game starts in ${countdown}`;

        if (countdown === 0) {
            // Hide countdown, show result, and clear interval
            countdownElement.style.display = 'none';
            callback();
            clearInterval(countdownInterval);
        }

        countdown--;
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const urlParams = new URLSearchParams(window.location.search);

    const room = urlParams.get('room');
    const username = urlParams.get('username');

    socket.emit('join', room, username);

    const roomNameDisplay = document.getElementById('roomname-display');
    const messages = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const activePlayerList = document.getElementById('active-players');
    const resultScreen = document.getElementById('result');
    const resultList = document.getElementById('result-list');
    const readyButton = document.getElementById('ready-button');
    const unreadyButton = document.getElementById('unready-button');
    const closeResult = document.getElementById("result-close");
    const inputField = document.getElementById("input-field");
    const typingBoard = document.getElementById("placeholder");
    const gameTimerDiv = document.getElementById('gameTimer');
    let userInput, gameTimerInterval;


    roomNameDisplay.textContent = `Players in Room [${room}]`;
    // message handling
    messageInput.addEventListener('keyup', (event) => {if (event.key === 'Enter') sendButton.click()});

    sendButton.addEventListener('click', () => {
        const message = messageInput.value;
        if (message) {
            socket.emit('chat message', message);
            messageInput.value = '';
        }
    });

    socket.on('message', (msg) => {
        const messageItem = document.createElement('li');
        console.log('message', msg);
        messageItem.textContent = msg;
        messages.appendChild(messageItem);
    });

    socket.on('playerInRoom', (users) => {
        const activePlayers = document.getElementsByClassName("active-player");
        const playersArray = Array.from(activePlayers);
        playersArray.forEach(player => player.remove());
        users.forEach(user => {
            const activePlayer = document.createElement('li');
            activePlayer.textContent = user;
            activePlayer.className = "active-player";
            activePlayerList.appendChild(activePlayer);
        });
    });

    socket.on('error', (msg) => {
        if(msg == 'Room not found!') {
            window.location.href = '/debug';
        } else {
            alert(`ERROR! ${msg}`);
        }
    });

    readyButton.addEventListener('click', () => {
        socket.emit('player ready', true);
        readyButton.style.display = 'none';
        unreadyButton.style.display = 'block';
    });

    unreadyButton.addEventListener('click', () => {
        socket.emit('player ready', false);
        unreadyButton.style.display = 'none';
        readyButton.style.display = 'block';
    });

    closeResult.addEventListener('click', () => {
        closeResult.style.display = 'none';
        resultScreen.style.display = 'none';
        readyButton.style.display = 'block';
    });

    
    inputField.addEventListener('paste', function(event) {
        event.preventDefault();
    });

    inputField.addEventListener('input', (e) => {
        const inputValue = inputField.value.replace(/\n/g, ' ').trim();
        const msgValue = userInput.trim();

        if (inputValue === msgValue) {
            socket.emit('completed', msgValue);
        }
    });

    socket.on('start game', async (data) => {
        userInput = data.text;

        unreadyButton.style.display = 'none';
        readyButton.style.display = 'none';
        startCountdown(5, ()=>{
            typingBoard.style.display = 'block';
            typingBoard.setAttribute('data-placeholder', data.text);
            gameTimerDiv.style.display = 'block';
            inputField.focus();

            let gameTimer = data.timer;
            gameTimerDiv.textContent = `⏱️ ${gameTimer--} Sec`;
            gameTimerInterval = setInterval(()=> {
                gameTimerDiv.textContent = `⏱️ ${gameTimer} Sec`;
                if(gameTimer == 0) {
                    clearInterval(gameTimerInterval);
                }
                gameTimer--;
            }, 1000);
        });
    });
    
    socket.on('result', (result)=> {
        const completedStatus = 4;
        if(result[username]['status'] == completedStatus){
            typingBoard.style.display = 'none';
            clearInterval(gameTimerInterval);
            gameTimerDiv.style.display = 'none';
            resultScreen.style.display = 'block';
            const playerResult = document.getElementsByClassName("player-result");
            const playersArray = Array.from(playerResult);
            playersArray.forEach(player => player.remove());
            Object.keys(result).forEach(username => {
                const playerData = document.createElement('li');
                playerData.textContent =  result[username]['status'] == completedStatus ? `${username}: ${result[username]['score']} Seconds` : `${username}: Typing...`;
                playerData.className = "player-result";
                resultList.appendChild(playerData);
            });
        }
    });

    socket.on('end game', (result) => {
        console.log("Game ended");
        typingBoard.style.display = 'none';
        clearInterval(gameTimerInterval);
        gameTimerDiv.style.display = 'none';
        resultScreen.style.display = 'block';
        const playerResult = document.getElementsByClassName("player-result");
        const playersArray = Array.from(playerResult);
        playersArray.forEach(player => player.remove());
        Object.keys(result).forEach(username => {
            const completedStatus = 4;
            const playerData = document.createElement('li');
            playerData.textContent =  result[username]['status'] == completedStatus ? `${username}: ${result[username]['score']} Seconds` : `${username}: Incomplete`;
            playerData.className = "player-result";
            resultList.appendChild(playerData);
        });
        closeResult.style.display = 'inline';
        inputField.value = "";
    });

});