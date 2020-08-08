
var socket = io();
socket.on('connect', () => {
    console.log('connect to the Server');
    socket.emit('join', {
        params : $.deparam(window.location.search)
    })
});

socket.on('disconnect', () => {
    console.log('disconnect from the Server');
});

socket.on('newMessage', (message) =>{
    var template = $('#message-template').html();
    var html = Mustache.render(template,{
        text : message.text,
        from: message.from,
        createAt : moment(message.createAt).format('h:mm a')
    })
    $('#messages').append(html);
});

socket.on('newLocationMessage', (message) =>{
    var template = $('#location-message-template').html();
    var html = Mustache.render(template,{
        url : message.url,
        from: message.from,
        createAt : moment(message.createAt).format('h:mm a')
    })
    $('#messages').append(html);
});

// socket.emit('createMessage', {
//     from :'Hoang',
//     text: 'No, i dont care'
// }, (data) =>{
//   console.log('success', data);  
// });

socket.on('usersInRoom',(message) => {
    var users = message.usersInRoom;
    console.log(users);
    var ol = $('<ol></ol>');
    users.forEach(user =>{
        var li = $('<li></li>');
        li.text(user.name);
        ol.append(li);
    })
    $('#users').html(ol);
});

$('#message-form').on('submit', (event) =>{
    event.preventDefault();
    socket.emit('createMessage',{
        from : $.deparam(window.location.search).name,
        text : $('[name="message"]').val()
    }, (data) => {
        console.log('Success' , data);
    })
});

$('#send-location').on('click', () =>{
    if(!navigator.geolocation){
        return alert('Geolocation not supported by old browser');
    }else {
        navigator.geolocation.getCurrentPosition(position => {
            socket.emit('createLocationMessage', {
                from: $.deparam(window.location.search).name,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            })
        },() =>{
            swal('Unable to fetch location');
        })
    }
})