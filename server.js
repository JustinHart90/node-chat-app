const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const Filter = require('bad-words');
const filter = new Filter();

require('dotenv').config({silent:true});

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// mongoose.Promise is deprecated
mongoose.Promise = Promise;

// database connection
const dbUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_DOMAIN}.hfdxv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

// data model
const Message = mongoose.model('Message', {
    name: String,
    message: String
});

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages)
    });
});

app.get('/messages/:user', (req, res) => {
    var user = req.params.user;
    Message.find({name: user}, (err, messages) => {
        res.send(messages)
    });
});

app.get('/message/:id', (req, res) => {
    var id = req.params.id;
    Message.findById(id, (err, message) => {
        res.send(message)
    });
});

app.post('/message', async (req, res) => {
    try {
        const message = new Message(req.body);
    
        // check if message contains profane language
        if (filter.isProfane(message.message)) {
            console.log(`Message censored: "${message.message}"`);
            return res.sendStatus(451); // error: unavailable for legal reasons
        }
    
        // save message
        var savedMessage = await message.save();
        io.emit('message', req.body);
        return res.sendStatus(200);

    } catch(error) {
        // internal server error
        res.sendStatus(500);
        return console.error(error);

    } finally {
        console.log('message post called');
    }
});

app.delete('/message/:id', (req, res) => {
    var id = req.params.id;
    Message.findByIdAndDelete(id, (err, message) => {
        res.sendStatus(200);
    });
});

app.delete('/messages/all', (req, res) => {
    Message.deleteMany({}, () => {
        res.sendStatus(200);
    });
});

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