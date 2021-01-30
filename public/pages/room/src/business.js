class Business {

    constructor({ room, media, view, socketBuilder, peerBuilder }){

        this.room = room;
        this.media = media;
        this.view = view;
        this.socketBuilder = socketBuilder;
                            
        this.peerBuilder = peerBuilder;

        this.currentStream = { };

        this.socket = { };

        this.currentPeer = { };

        this.peers = new Map();

        this.userRecordings = new Map();

    }   

    static initialize(deps){

        const instance = new Business(deps);

        return instance._init();

    }

    async _init(){

        this.view.configureRecordButton(this.onRecordPressed.bind(this));
        this.view.configureLeaveButton(this.onLeavePressed.bind(this));
        this.view.configureChatMessageForm(this.onChatMessageSubmitted.bind(this));

        this.currentStream = await this.media.getCamera(true);

        this.socket = this.socketBuilder
                                    .setOnJoinedRoom(this.onJoinedRoom())
                                    .setOnMessageSent(this.onChatMessageSent())
                                    .setOnNewChatMessage(this.onNewChatMessage())
                                    .setOnUserConnected(this.onUserConnected())
                                    .setOnUserDisconnected(this.onUserDisconnected())
                                    .build();


        this.currentPeer = await this.peerBuilder
                                    .setOnError(this.onPeerError())
                                    .setOnCallError(this.onPeerCallError())
                                    .setOnConnectionOpened(this.onConnectionOpened())
                                    .setOnCallReceived(this.onPeerCallReceived())
                                    .setOnCallClose(this.onPeerCallClose())
                                    .setOnPeerStreamReceived(this.onPeerStreamReceived())
                                    .build();

        this.addVideoStream(this.currentPeer.id);

    }

    addVideoStream(userId, stream = this.currentStream){

        const recorderInstance = new Recorder(userId, stream);

        this.userRecordings.set(recorderInstance.filename, recorderInstance);

        if(this.recordingEnabled){

            recorderInstance.startRecording();

        }

        const isCurrentId = userId == this.currentPeer.id;

        this.view.renderVideo({

            userId,
            stream,
            isCurrentId

        });

    }

    onJoinedRoom(){

        return ({ roomChat }) => {

            roomChat.forEach(
                roomChatMessage => {

                    roomChatMessage.when = new Date(roomChatMessage.when);

                    this.view.addMessageToChat(roomChatMessage);

                }
            );

            console.log('room chat!', roomChat);



        };

    }

    onUserConnected(){

        return ({ userId }) => {

            console.log('user connected!', userId);

            this.currentPeer.call(userId, this.currentStream);

        }

    }

    onUserDisconnected(){

        return userId => {

            console.log('user disconnected!', userId);

            if(this.peers.has(userId)){

                this.peers.get(userId).call.close();
                this.peers.delete(userId);

            }

            this.view.setParticipants(this.peers.size);
            this.stopRecording();
            this.view.removeVideoElement(userId);

        }

    }

    onPeerError(){

        return error => {

            console.error('error on peer!', error);

        };

    }


    onPeerCallReceived(){

        return call => {

            console.log('answering call', call);

            call.answer(this.currentStream);

        };

    }

    onPeerStreamReceived(){

        return (call, stream) => {

            const callerId = call.peer;


            if(!this.peers.has(callerId)){

                this.addVideoStream(callerId, stream);

            }

            this.peers.set(callerId, { call });



            this.view.setParticipants(this.peers.size);

        };
        

    }

    onConnectionOpened(){

        return (peer) => {

            const id = peer.id;

            console.log('peer!!', peer);

            this.socket.emit('join-room', this.room, id);

        }

    }


    onPeerCallError(){

        return (call, error) => {

            console.log('an call error occured!', error);

            this.view.removeVideoElement(call.peer);

        } 

    }
    
    onPeerCallClose(){

        return (call) => {

            console.log('call closed!', call);

        } 

    }

    onRecordPressed(recordingEnabled){

        this.recordingEnabled = recordingEnabled;

        console.log('pressed!!', recordingEnabled);

        for(const [key, value] of this.userRecordings){

            if(this.recordingEnabled){

                value.startRecording();

                continue;

            }

            this.stopRecording(key);

        }

    }

    onLeavePressed(){

        this.userRecordings.forEach((value, key) => value.download());

    }

    onChatMessageSubmitted(formData){

        const newMessageContent = formData.get("message");

        if(!!newMessageContent){

            const newMessage = { id: `${this.currentPeer.id}:${Date.now()}`, content: newMessageContent, when:new Date(), userId: this.currentPeer.id };

            this.view.addMessageToChat(newMessage, this.currentPeer.id, true);

            this.sendMessage(newMessage);

        }

        

    }

    onChatMessageSent(){

        return (messageId) => {

            console.log('message sent!', messageId);

            this.view.updateMessageSent(messageId);

        };

    }

    onNewChatMessage(){

        return (message) => {

            message.when = new Date(message.when);

            console.log('new chat message!', message);

            this.view.addMessageToChat(message);

        }

    }

    sendMessage(message){

        this.socket.emit('new-chat-message', message);

    }

    //If a user leaves and enter while recording, we need to stop its previous recordings
    async stopRecording(userId){

        const userRecordings = this.userRecordings;

        for(const [key, value] of userRecordings){

            const isContextUser = key.includes(userId);

            if(!isContextUser){

                continue;

            }

            const rec = value;

            const isRecordingActive = rec.recordingActive;  

            if(!isRecordingActive){

                continue;

            }


            await rec.stopRecording();

            this.playRecordings(key);

        }

    }

    playRecordings(userId){

        const user = this.userRecordings.get(userId);

        const videoURLS = user.getAllVideoURLS();

        videoURLS.map(url => {

            this.view.renderVideo({ url, userId });

        });

    }


}