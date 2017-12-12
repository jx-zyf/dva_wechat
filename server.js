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

app.use(express.static(__dirname + '/serverPublic'));

app.post('/user/:operation',function(req,res,next){
    var operation=req.params.operation;
    route(req,res,operation);
});
app.post('/chat/:operation',function(req,res,next){
    var operation=req.params.operation;
    route(req,res,operation);
});
app.get('/chat/getChatMsg', function(req,res,next){
    route(req,res,'getChatMsg')
});
app.get('/chat/getPrivateChatMsg', function(req,res,next){
    route(req,res,'getPrivateChatMsg')
});

var server = http.createServer(app);

var users = [];     // 保存所有在线的用户
var usocket = {};
var io = require('socket.io').listen(server);   // 引入socket.io模块并绑定到服务器

server.listen(8080);
console.log('server is running at 8080 port...');

io.on('connection', function(socket){
    // 监听登录
    socket.on('login', function(nickname){
        socket.userName = nickname;
        if(!users.includes(nickname)){
            usocket[nickname] = socket;
            users.push(nickname);
            // console.log("刚刚登录的是："+nickname, "在线的："+users)
            socket.emit('login_success', nickname);
            io.sockets.emit('system', nickname, users.length, 'login', users);    // 向所有连接到服务器的客户端发送当前登陆用户的昵称
        }
    });
    // 监听登出
    socket.on('logout', function(nickname){
        users = users.filter(item => item !== nickname);
        socket.broadcast.emit('system', nickname, users.length, 'loginout');     // 除自己外
    });
    socket.on('leave_room', function(nickname){
        users = users.filter(item => item !== nickname);
        // console.log("离开房间的是："+socket.userName, "在线的："+users)
        socket.broadcast.emit('system', nickname, users.length, 'loginout');     // 除自己外
    });
    socket.on('disconnect', () => {
        users = users.filter(item => item !== socket.userName);
        // console.log("断开连接的是："+socket.userName, "在线的："+users)
        socket.broadcast.emit('system', socket.userName, users.length, 'loginout');     // 除自己外
    });
    // 监听发消息
    socket.on('sendMsg', function(msg, color, type, toUser){
        if (!toUser) {
            // 将新消息发送给所有用户(包括自己)
            io.sockets.emit('newMsg', socket.userName, msg, color, type, 'all', socket.userName);
        } else {
            // 发给指定用户
            usocket[toUser].emit('newMsg', socket.userName, msg, color, type, toUser, socket.userName);
            usocket[socket.userName].emit('newMsg', socket.userName, msg, color, type, toUser, socket.userName);
        }
    })
    // 消息提示
    socket.on('notification', function(user, msg){
	 	io.emit('notification', user, msg);
	});
});