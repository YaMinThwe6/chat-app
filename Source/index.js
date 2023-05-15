const Http = require('http');
const Express = require('express');
const path = require('path');
const SocketIO = require('socket.io');
const Filter = require('bad-words');
const {generateMessages} = require('./Utils/messages');
const {addUser, getUsersInRoom, getUser, removeUser} = require('./Utils/user');

const App = Express();
const Server = Http.createServer(App);
const Io = SocketIO(Server);

const Port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../Public' + '');

App.use(Express.json());
App.use(Express.static(publicDirectoryPath));

Io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.on('username', ({username, room}, callback) => {
        let {error, user} = addUser({id:socket.id, username, room});

        if (error) return callback(error);
        socket.join(user?.room)
        socket.emit('message', generateMessages('Welcome!', 'Admin'));

        socket.broadcast.to(user.room).emit('message', generateMessages(`${user.username} has joined!`, 'Admin'));

        Io.to(user.room).emit('roomInfo', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
    });

    socket.on('newMessage', (newMessage, callback) => {
        let {error, user}= getUser(socket.id);

        if (error) return callback(error);

        let filter = new Filter();

        if(filter.isProfane(newMessage)) {
            return callback('Profanity Is Not allowed!');
        }
        Io.to(user.room).emit('message', generateMessages(newMessage, user.username));
        callback('delivered!');
    });

    socket.on('sendLocation', (data, callback) => {
        let {error, user}= getUser(socket.id);

        if (error) return callback(error);

        Io.to(user.room).emit('locationSharing', generateMessages(`https://google.com/maps?q=${data.latitude},${data.longitude}`, user.username));
        callback();
    });

    socket.on('disconnect', () => {
        let user = removeUser(socket.id);
        if (user) Io.to(user.room).emit('message', generateMessages(`${user.username} has left the chat!`, 'Admin'));
        Io.to(user.room).emit('roomInfo', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
    });
});

Server.listen(Port, () => {
    console.log(`Server running on ${Port}`);
});
