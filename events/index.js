const GLB = require('../global/constant');
const socketHandler = async (io) => {
    const roomData = {};
    function getUsersInRoom(roomName) {
        const room = io.sockets.adapter.rooms[roomName];
        if (room) {
            return Object.keys(room.sockets).map(socketId => io.sockets.connected[socketId].username);
        } else {
            return [];
        }
    }

    const gameTimer = (room, timer) => {
        try{
            let roomComplete = true;
            Object.values(roomData[room]['users']).forEach((user) => { 
                if(user.status == GLB.STATUS.INGAME) roomComplete = false;
            });
            if (roomComplete || timer == 0) {
                io.to(room).emit('end game', roomData[room]['users']);
                Object.values(roomData[room]['users']).forEach((user) => { 
                    user.status = GLB.STATUS.ACTIVE;
                });
                roomData[room]['status'] = GLB.STATUS.ACTIVE;
                return;
            }
            setTimeout(() => {
                gameTimer(room, timer-1)
            }, 1000);

        } catch(e) {
            console.log(e);
        }
    }

    const startGame = async (room) => {
        try {
            const {generate} = await import('random-words');
            Object.values(roomData[room]['users']).forEach((user) => { 
                user.status = GLB.STATUS.INGAME; 
            });
            roomData[room]['game_start_at'] = Math.round(Date.now()/1000);
            roomData[room]['status'] = GLB.STATUS.INGAME;
            
            console.log('Everyone ready in room', room, JSON.stringify(roomData));
            io.to(room).emit('message', `Everyone Ready!!! The Game is about to begin...`);
            const roomParagraph = generate({exactly: roomData[room]['maxWords'], join: " "});
            roomData[room]['paragraph'] = roomParagraph;
            io.to(room).emit('start game', {text: roomParagraph, timer: GLB.TIMER.ROOM});
            gameTimer(room, (GLB.TIMER.ROOM + GLB.TIMER.BUFFER));
        } catch (e) {
            console.log(e);
        }
    }

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('create', (room, gameMode, username)=> {
            try {
                if (roomData[room]) {
                    socket.emit('error', `Room name already in use!`);
                    return;
                }
                roomData[room] = {mode: gameMode, maxWords: GLB.GAMEPLAY.MAX_WORDS, users: {}, status: GLB.STATUS.ACTIVE};
                socket.emit('joining room', {room, gameMode, username});
            } catch (e) {
                console.log(e);
            }          
        });

        socket.on('joining', (room, username)=> {
            try {
                if(Object.keys(roomData).includes(room)) 
                socket.emit('joining room', {room, username});
                else socket.emit("error", `Room not found!`);
            } catch (e) {
                console.log(e);
            }
        });
    
        socket.on('join', (room, username) => {
            try {
                // Join a specific room
                if(Object.keys(roomData).includes(room)) {
                    socket.join(room);
                    roomData[room]['users'][username] = {score:0, status:GLB.STATUS.ACTIVE};
                    socket.emit('joining room', {room, username});
                    // Broadcast a welcome message to the room
                    io.to(room).emit('message', `${username} has joined the room.`);
                    io.to(room).emit('playerInRoom', Object.keys(roomData[room]['users']));
                } else {
                    socket.emit("error", `Room not found!`);
                }
        
                // Handle chat messages within the room
                socket.on('chat message', (msg) => {
                    try {
                        io.to(room).emit('message', `${username}: ${msg}`);
                    } catch (e) {
                        console.log(e);
                    }
                });

                // Handle player ready/unready state
                socket.on('player ready', (ready)=> {
                    try {
                        if (ready) {
                            let allReady = true;
                            roomData[room]['users'][username]['status'] = GLB.STATUS.READY;
                            io.to(room).emit('message', `${username} is Ready to Play!!!`);
                            Object.values(roomData[room]['users']).forEach((user) => { 
                                if (user.status != GLB.STATUS.READY) allReady = false 
                            });
                            // START GAME IF EVERYONE IN THE ROOM IS READY
                            if (allReady) startGame(room);
                        } else {
                            roomData[room]['users'][username]['status'] = GLB.STATUS.ACTIVE;
                            io.to(room).emit('message', `${username} is Not Ready!`);
                        } 
                    } catch (e) {
                        console.log(e);
                    }
                });

                socket.on('completed', (userInput)=> {
                    try {
                        if(userInput == roomData[room]['paragraph']) {
                            roomData[room]['users'][username]['status'] = GLB.STATUS.COMPLETED;
                            roomData[room]['users'][username]['score'] = Math.round(Date.now()/1000) - roomData[room]['game_start_at'] - GLB.TIMER.BUFFER;
                            io.to(room).emit('result', roomData[room]['users']);
                            io.to(room).emit('message', `${username} have Completed their typing.`);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                });
        
                // Notify the room when a user leaves
                socket.on('disconnect', () => {
                    try {
                        if(roomData[room]){
                            delete roomData[room]['users'][username];
                            io.to(room).emit('message', `${username} has left the room.`);
                            io.to(room).emit('playerInRoom', Object.keys(roomData[room]['users']));
                            if(Object.keys(roomData[room]['users']).length == 0) delete roomData[room];
                        } else socket.emit("room disbanded", `This room has been disbanded`);
                    } catch (e) {
                        console.log(e);
                    }
                });
            } catch (e) {
                console.log(e);
            }
        });
    });
}

module.exports = socketHandler;