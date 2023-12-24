express = require('express');
path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app); // Create an HTTP server using Express
const io = socketIo(server); // Attach Socket.io to the HTTP server

app.use(express.static(path.join(__dirname+'/public')));

const routes = require('./routes')(app); 
const events = require('./events')(io); 

server.listen(3000, () => {
    console.log('Server is Up');
});