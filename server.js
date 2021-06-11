const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessages = require('./utils/messages')
const {userJoin , getCurrentUser , userLeave , getRoomUsers} = require('./utils/users')


const app = express()
const botName = 'ChatBook Bot'

app.use(express.static(path.join(__dirname , 'public')))
const server = http.createServer(app)
const io = socketio(server)

io.on('connection' , socket =>{
   socket.on('joinRoom' , ({username , room})=>{
const user = userJoin(socket.id , username , room)

    socket.join(user.room)

    socket.emit('message' , formatMessages(botName,'Welcome to chatbook' ))


    socket.broadcast.to(user.room).emit('message' , formatMessages(botName,`${user.username} has joined`))

    io.to(user.room).emit('roomUsers', {
        room : user.room,
        users : getRoomUsers(user.room)
    })
   })

   
    socket.on('chatMessage', msg=>{
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message' ,formatMessages(user.username , msg))
    })

    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id)
        if(user){
            io.to(user.room).emit('message',formatMessages(botName ,`${user.username} has disconnected`))

            
    io.to(user.room).emit('roomUsers', {
        room : user.room,
        users : getRoomUsers(user.room)
    })

        }
      
    })
})



server.listen(3000 , ()=>{
    console.log('server connected')
})