const socket = io();

let message = document.querySelector('#message');
let messageInput = message.querySelector('input');
let messageButton = message.querySelector('button');
let locationButton = document.querySelector('#location');
let messages = document.querySelector('#messages');

/*------------------------------------------------------------------------------------------------------------*/

let messageTemplate = document.querySelector('#message-template').innerHTML;
let locationTemplate = document.querySelector('#location-template').innerHTML;
let roomInfoTemplate = document.querySelector('#users_list').innerHTML;

/*------------------------------------------------------------------------------------------------------------*/

let {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

/*------------------------------------------------------------------------------------------------------------*/

let autoScroll = () => {
    //get the last or new message
    // let newMessage = messages.lastElementChild;
    //
    // //get the margin or styles of the new message
    // let newMessageMargin = parseInt(getComputedStyle(newMessage).marginBottom);
    //
    // //get the height of the new message - offsetHeight doesn't include margin.
    // let newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    messages.scrollTop = messages.scrollHeight

};

socket.on('message', (message) => {
    let html = Mustache.render(messageTemplate, {
        message: message.text,
        time: moment(message.time).format('hh:mm a'),
        username: message.username
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomInfo', ({room, users}) => {

    let html = Mustache.render(roomInfoTemplate,{
        room,users
    });

    document.querySelector('#room_info').innerHTML = html;
})

socket.on('locationSharing', (location) => {
    let html = Mustache.render(locationTemplate, {
        url: location.text,
        time: moment(location.time).format('hh:mm a'),
        username: location.username
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

message.addEventListener('submit', (e) => {
    e.preventDefault();

    messageButton.setAttribute('disabled', 'disabled');


    socket.emit('newMessage', e.target.elements.messages.value, (message) => {

        messageButton.removeAttribute('disabled', 'disabled');
        messageInput.value = '';
        messageInput.focus();
    });
})

locationButton.addEventListener('click', () => {
    if (!navigator?.geolocation) return alert('Not supported yet by your browser.');

    locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            locationButton.removeAttribute('disabled', 'disabled');
        })
    })
})

socket.emit('username', {username, room}, (error) => {
    if(error) {
        alert(error);
        location.href = '/'
    }
});
