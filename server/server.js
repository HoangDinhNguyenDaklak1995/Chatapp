const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const swal = require('sweetalert');
const http = require('http');
const publicPath = path.join(__dirname + "/../public");
const port = process.env.port || 5000;
const app = express();
const {generateMessage , generateLocationMessage} = require('./ultils/message');
const { Users } = require("./ultils/users");
var users = new Users();

var server = http.createServer(app);
var io = socketIO(server);
app.use(express.static(publicPath));

io.on("connection", (socket) => {
    socket.emit('newMessage', generateMessage('Admin','Welcome to the chat App'));
    socket.broadcast.emit('newMessage', generateMessage('Admin',"New User Joined"));

    socket.on('join', (join) =>{
        let {room, name} = join.params;
        socket.join(room);

        users.addUser(socket.id, name, room);
        //Emit sự kiện "usersInRoom" đến tất cả các client đang ở
        //cùng phòng chat mà user mới vừa được adđ vào
        io.to(room).emit('usersInRoom', {
            usersInRoom : users.getListUserOnRoom(room)
        })

        socket.emit('newMessage', generateMessage('Admin', `Welcome to the ${room} room`));
        socket.broadcast.to(room).emit('newMessage',generateMessage('Admin', `${name} joined`))
    });

    socket.on('createMessage', (message, callback) =>{
        var user = users.getUserById(socket.id);
        io.to(user.room).emit('newMessage', generateMessage(message.from, message.text));
        callback('The message has been sent');
    });

    socket.on('createLocationMessage', (message) =>{
        var user = users.getUserById(socket.id);
        io.to(user.room).emit('newLocationMessage',generateLocationMessage(message.from, 
           message.latitude, message.longitude))
    })
    socket.on("disconnect", () =>{
        var user = users.removeUser(socket.id);
        if(user) {
            io.to(user.room).emit('usersInRoom', {
                usersInRoom : users.getListUserOnRoom(user.room)
                //update lại danh sách user đang ở trong phòng
            })
            io.to(user.room).emit('newMessage', 
            generateMessage('Admin', `${user.name} has left the room`));
            //Gửi thông báo: đã có user nào đó rời khỏi phòng
        }
        console.log("User was disconnected");
    });
});

server.listen(port, () => {
    console.log(`Server running to port ${port}`);
})