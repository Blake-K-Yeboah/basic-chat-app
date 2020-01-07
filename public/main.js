// Get Messages
getMessages();

// Define Variables
let send = document.querySelector('#send');
let name = document.querySelector('#name');
let msg = document.querySelector('#message');

// Send message when send button is pressed and fetch them again
send.addEventListener('click', () => {
    sendMessage({
        name: name.value,
        message: msg.value,
        sent: new Date()
    });

    name.value = '';
    msg.value = '';
});

let clear = document.querySelector('#clear-msgs');

clear.addEventListener('click', () => {
    clearMessages();
});

const socket = io();

socket.on('message', addMessages);

// Send Message Function
function sendMessage(message) {
    fetch("http://localhost:5000/messages",
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(message)
        })
        .then(res => res.json())
        .then(data => {
            console.log(data.msg);
        })
        .catch(err => console.log(err));
}

// Insert Message Into Dom Function
function addMessages(message) {

    // Remove No Todos Item if it exists
    let noneText = document.querySelector('#none');

    if (noneText) {
        document.querySelector('#messages').removeChild(noneText);
    }

    // Implement Bad Word Filter
    let messageText = message.message.split(' ');
    let badWords = ['fuck', 'bitch', 'nigger', 'cunt', 'asshole', 'faggot', 'fuckface', 'dipshit'];
    badWords.forEach(word => {
        messageText.forEach((message, index) => {
            if (message.toLowerCase() === word || message.toLowerCase() === `${word}s`) {
                messageText[index] = '*'.repeat(word.length);
            }
        });

    });

    // Insert Message Into Dom
    let item = document.createElement('li');
    item.classList.add('collection-item', 'avatar');
    item.innerHTML = `
     <img src=${message.name === "Tracey" ? "https://www.w3schools.com/howto/img_avatar2.png" : "https://www.w3schools.com/howto/img_avatar.png"} alt="user-icon" class="circle">
     <span class="title" style="font-weight: bold;">${message.name}</span>
     <p><span class="left">${messageText.join(' ')}</span><span class="right grey-text">Sent ${time_ago(message.sent).toString() == "0 seconds ago" ? "now" : time_ago(message.sent)}</span></p>
     `
    document.querySelector('#messages').appendChild(item);
}

//. Function to generate time since

function time_ago(time) {

    switch (typeof time) {
        case 'number':
            break;
        case 'string':
            time = +new Date(time);
            break;
        case 'object':
            if (time.constructor === Date) time = time.getTime();
            break;
        default:
            time = +new Date();
    }
    var time_formats = [
        [60, 'seconds', 1], // 60
        [120, '1 minute ago', '1 minute from now'], // 60*2
        [3600, 'minutes', 60], // 60*60, 60
        [7200, '1 hour ago', '1 hour from now'], // 60*60*2
        [86400, 'hours', 3600], // 60*60*24, 60*60
        [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
        [604800, 'days', 86400], // 60*60*24*7, 60*60*24
        [1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
        [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
        [4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
        [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
        [58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
        [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
        [5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
        [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
    ];
    var seconds = (+new Date() - time) / 1000,
        token = 'ago',
        list_choice = 1;

    if (seconds == 0) {
        return 'Just now'
    }
    if (seconds < 0) {
        seconds = Math.abs(seconds);
        token = 'from now';
        list_choice = 2;
    }
    var i = 0,
        format;
    while (format = time_formats[i++])
        if (seconds < format[0]) {
            if (typeof format[2] == 'string')
                return format[list_choice];
            else
                return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
        }
    return time;
}

// Get All Messages Function
function getMessages() {
    fetch('http://localhost:5000/messages')
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                data.forEach(addMessages);
            } else {
                insertNoMsg();
            }
        }).catch(err => console.log(err));
}

// Clear all messages function
function clearMessages() {
    fetch("http://localhost:5000/messages",
        {
            headers: {
                'Accept': 'application/json'
            },
            method: "DELETE"
        })
        .then(res => res.json())
        .then(data => {
            console.log(data.msg);

            // Remove All Collection items except header
            let items = Array.from(document.querySelectorAll('.collection-item'));
            items.forEach(item => item.remove());

            insertNoMsg();
        })
        .catch(err => console.log(err));
}

function insertNoMsg() {
    // Insert No msgs item
    let item = document.createElement('li');
    item.classList.add('collection-item');
    item.innerHTML = 'There Are Currently No Messages'
    document.querySelector('#messages').appendChild(item);
    item.setAttribute('id', 'none');
}