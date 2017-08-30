//保存所有在线用户
var users = [];

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);//将socke模块与服务器进行绑定


app.use('/', express.static(__dirname + '/www'));
server.listen(process.env.PORT || 3000);

//socket
io.on('connection', function(socket) {
    //设置picknamae
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login'); //向所有连接到服务器的客户发送当前登录的用户
        }
    });
    //用户离开
    socket.on('disconnect', function() {
        users.splice(socket.userIndex, 1);
        //通知其他人
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
    //接收消息
    socket.on('postMsg', function(msg) {
        //显示
        socket.broadcast.emit('newMsg', socket.nickname, msg);
    });
    //接收图片
    socket.on('img', function(imgData) {
        socket.broadcast.emit('newImg', socket.nickname, imgData);
    });
}); 


