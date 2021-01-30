class SocketBuilder {

    constructor({ socketUrl }){

        this.socketUrl = socketUrl;

        const defaultFunctionValue = () => {};

        this.onUserConnected = defaultFunctionValue;
        this.onUserDisconnected = defaultFunctionValue;
        this.onJoinedRoom = defaultFunctionValue;
        this.onMessageSent = defaultFunctionValue;
        this.onNewChatMessage = defaultFunctionValue;

    }

    setOnUserConnected(fn) {

        this.onUserConnected = fn;

        return this;

    }

    setOnUserDisconnected(fn) {

        this.onUserDisconnected = fn;

        return this;

    }

    setOnJoinedRoom(fn) {

        this.onJoinedRoom = fn;

        return this;

    }

    setOnMessageSent(fn){

        this.onMessageSent = fn;

        return this;

    }

    setOnNewChatMessage(fn){

        this.onNewChatMessage = fn;

        return this;

    }

    build(){

        const socket = io.connect(this.socketUrl, {
            
            withCredentials: false

        });

        socket.on('user-connected', this.onUserConnected);

        socket.on('user-disconnected', this.onUserDisconnected);

        socket.on('joined-room', this.onJoinedRoom);

        socket.on('message-sent', this.onMessageSent);

        socket.on('new-chat-message', this.onNewChatMessage);

        return socket;

    }

}