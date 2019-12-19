const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const records = require('./record.js');

// add online people count
let onlineCount = 0;
// if connected
io.on('connection', (socket) => {
    // add online count
    onlineCount++;
    // sent onlineCount to UI
    io.emit("online", onlineCount);
    socket.emit("maxRecord", records.getMax());
    socket.emit("chatRecord", records.get());

    // receive greet event from UI
    socket.on("greet", () => {
        socket.emit("greet", onlineCount);
    });

    // if disconnected
    socket.on('disconnect', () => {
        onlineCount = (onlineCount < 0) ? 0 : onlineCount-=1;
        io.emit('online', onlineCount);
    });

    // if send the msg
    socket.on('send', (msg) => {
      // if the length of msg less than 2, return
        if (Object.keys(msg).length < 2) return;
        records.push(msg);
    });
});

records.on("new_message", (msg)=>{
    io.emit("msg", msg);
})

server.listen(8080, () => {
    console.log("Server Started. http://localhost:8080");
});
// __dirname will return exeFile's absolute path, __filename=__dirname+exeFile
app.get('/', (req, res)=>{res.sendFile(__dirname + '/views/index.html');});