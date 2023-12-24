function baseUiFunctionality () {
    document.getElementById("create-room-button").addEventListener("click", function() {
        document.getElementById("create-room-panel").style.display = "block";
        document.getElementById("join-room-panel").style.display = "none";
        document.getElementById("button-container").style.display = "none";
    });

    document.getElementById("join-room-button").addEventListener("click", function() {
        document.getElementById("join-room-panel").style.display = "block";
        document.getElementById("create-room-panel").style.display = "none";
        document.getElementById("button-container").style.display = "none";
    });

    document.getElementById("create-back-button").addEventListener("click", function() {
        document.getElementById("create-room-panel").style.display = "none";
        document.getElementById("join-room-panel").style.display = "none";
        document.getElementById("button-container").style.display = "flex";
    });

    document.getElementById("join-back-button").addEventListener("click", function() {
        document.getElementById("create-room-panel").style.display = "none";
        document.getElementById("join-room-panel").style.display = "none";
        document.getElementById("button-container").style.display = "flex";
    });
}

document.addEventListener('DOMContentLoaded', () => {
    baseUiFunctionality();
    const socket = io();

    const roomCreateInput = document.getElementById('room-create-input');
    const usernameCreateInput = document.getElementById('username-create-input');
    const roomJoinInput = document.getElementById('room-join-input');
    const usernameJoinInput = document.getElementById('username-join-input');
    const createButton = document.getElementById('create-button');
    const joinButton = document.getElementById('join-button');
    const createForm = document.getElementById('create-room');
    const joinForm = document.getElementById('join-room');


    let {room, username, gameMode} = {};

    createForm.addEventListener('submit', (event) => {
        event.preventDefault();
        room = roomCreateInput.value;
        username = usernameCreateInput.value;
        const gameModeInput = document.querySelector('input[name="gameMode"]:checked');
        gameMode = gameModeInput ? gameModeInput.value : 'WPM';

        if (room && username && gameMode) 
            socket.emit('create', room, gameMode, username);
    });

    joinForm.addEventListener('submit', (event) => {
        event.preventDefault();
        room = roomJoinInput.value;
        username = usernameJoinInput.value;
        console.log({room, username});

        if (room && username) 
            socket.emit('joining', room, username);
    });

    socket.on('joining room', (roomData)=> {
        window.location.href = `/debug/play?room=${roomData.room}&username=${roomData.username}`;
    });

    socket.on('error', (msg)=> {
        alert(msg);
    })
});
