const server = require('http').createServer((request, response) => {

    response.writeHead(204, {
       
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',

    });

    response.end('hey there!');


});

const roomChats = new Map();



const socketIo = require('socket.io');

const io = socketIo(server, {

    cors:{
        origin: '*',
        credentials: false
    }

});

io.on('connection', socket => {

    console.log('connection', socket.id);
    
    socket.on('join-room', (roomId, userId) => {

        if(!roomChats.has(roomId)){

            roomChats.set(roomId, []);

        }

        const roomChat = roomChats.get(roomId);

        //Add users in the same room
        socket.join(roomId);

        socket.emit('joined-room', { roomChat });

        socket.to(roomId).broadcast.emit('user-connected', { userId });

        socket.on('new-chat-message', (message) => {

            console.log(`new message on room ${roomId}`, message);


            roomChat.push(message);

            //Simulate a delay
            setTimeout(() => {

                socket.emit('message-sent', message.id);

                socket.to(roomId).broadcast.emit('new-chat-message', message);

            }, 500);


        });
        
        socket.on('disconnect', () => {

            console.log('disconnected', roomId, userId);

            socket.to(roomId).broadcast.emit('user-disconnected', userId);

        });


    });

});

const startServer = () => {

    const { address, port } = server.address();

    console.info(`app running at ${address}:${port}`);

};

server.listen(process.env.PORT || 3000, startServer);