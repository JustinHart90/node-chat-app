const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const mongoose = require('mongoose')

require('dotenv').config({silent:true})

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

const dbUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_DOMAIN}.hfdxv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

const Message = mongoose.model('Message', {
    name: String,
    message: String
})

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages)
    })
})

app.post('/messages', (req, res) => {
    const message = new Message(req.body)

    message.save((err) => {
        if (err) sendStatus(500)
        
        io.emit('message', req.body)
        res.sendStatus(200)
    })
    
})

io.on('connection', (socket) => {
    console.log('a user connected')
})

const mongooseOptions = { useNewUrlParser: true, useUnifiedTopology: true }

mongoose.connect(dbUrl, mongooseOptions, (err) => {
    console.log('mongo db connection');
    if (err) console.log('error:', err);
})

var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
})