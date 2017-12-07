const http = require('http');
const express = require('express');
const route = require('./servers/route.js');
var app = express();

app.all('*',function(req,res,next){
    if(/favicon/.test(req.url)){
        return;
    }
    res.setHeader('Access-Control-Allow-Origin','*');
	res.setHeader('Access-Control-Allow-Headers','Content-Type');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS,PUT');
    next();
});

app.post('/user/:operation',function(req,res,next){
    var operation=req.params.operation;
    route(req,res,operation);
});

var server = http.createServer(app);

var users = [];     // 保存所有在线的用户
var io = require('socket.io').listen(server);   // 引入socket.io模块并绑定到服务器

server.listen(8080);
console.log('server is running at 8080 port...');

io.on('connection', function(socket){
    // 监听登录
    socket.on('login', function(nickname){
        socket.userName = nickname;
        users.push(nickname);
        users = Array.from(new Set(users));
        users = users.filter((item) => item !== '');
        socket.emit('login_success');
        io.sockets.emit('system', nickname, users.length, 'login');    // 向所有连接到服务器的客户端发送当前登陆用户的昵称
    });
    // 监听登出
    socket.on('logout', function(nickname){
        users = users.filter(item => item !== nickname);
        socket.broadcast.emit('system', nickname, users.length, 'loginout');     // 除自己外
    });
    // 监听发消息
    socket.on('sendMsg', function(msg, color, type){
        // 将新消息发送给所有用户(包括自己)
        io.sockets.emit('newMsg', socket.userName, msg, color, type);
    })
});