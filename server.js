// Bring in required Modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialize Express
const app = express();

// Bring in Socket.io + Http module
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Define the databse url so we can connect to it
const dbUrl = "mongodb+srv://dbAdmin:56kofi65@simple-chat-cluster-aoppx.mongodb.net/test?retryWrites=true&w=majority";

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Make Public Folder Static
app.use(express.static(path.join(__dirname, 'public')));

// Message model
const Message = new mongoose.model('Message', { name: String, message: String, sent: Date });

// GET Request returns all messages
app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    });
});

// POST Request adds message
app.post('/messages', (req, res) => {
    let message = new Message(req.body);
    message.save((err) => {
        if (err)
            sendStatus(500);

        io.emit('message', req.body);
        res.json({ msg: 'success' });
    });
});

// DELETE Request deletes all messages
app.delete('/messages', (req, res) => {
    Message.deleteMany({}, (err) => {
        if (err)
            sendStatus(500);

        res.json({ msg: 'success' });
    })
});

// Socket.io Conection
io.on('connection', () => {
    console.log('a user is connected')
})

mongoose.connect(dbUrl, (err) => {

    if (err) throw err;

    console.log('mongodb connected');
});

const server = http.listen(5000, () => console.log(`Server running on port ${server.address().port}`));