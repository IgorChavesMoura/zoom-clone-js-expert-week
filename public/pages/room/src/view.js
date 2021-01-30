class View {

    constructor(){
        
        this.recorderBtn = document.getElementById('record');
        this.leaveBtn = document.getElementById('leave');

        this.chatMessageForm = document.getElementById('chat_message');
        

    }

    createVideoElement({ muted = true, src, srcObject }){

        const video = document.createElement('video');

        video.muted = muted;
        video.src = src;
        video.srcObject = srcObject;

        if(!!src){

            video.controls = true;
            video.loop = true;

            Util.sleep(200).then(_ => video.play());

        }

        if(!!srcObject){

            video.addEventListener('loadedmetadata', _ => video.play());

        }

        return video;

    }

    renderVideo({ userId, stream = null, url = null, isCurrentId = false }){

        const video = this.createVideoElement({ muted: isCurrentId, src: url, srcObject: stream });

        this.appendToHTMLTree(userId, video, isCurrentId);

    }

    appendToHTMLTree(userId, video, isCurrentId){

        const div = document.createElement('div');

        div.id = userId;
        div.classList.add('wrapper');

        div.append(video);

        const div2 = document.createElement('div');

        div2.innerText = isCurrentId ? '' : userId;

        div.append(div2);

        const videoGrid = document.getElementById('video-grid');

        videoGrid.append(div);



    }

    setParticipants(count){

        const myself = 1;

        const participants = document.getElementById('participants');

        participants.innerHTML = (count + myself);

    }

    removeVideoElement(id){

        const element = document.getElementById(id);

        element.remove();

    }
    
    toggleRecordingButtonColor(isActive = true){

        this.recorderBtn.style.color = isActive ? 'red' : 'white';

    }

    onRecordClick(command) {
           
        this.recordingEnabled = false
       
        return () => {
       
            const isActive = this.recordingEnabled = !this.recordingEnabled;
       
            command(this.recordingEnabled);

            this.toggleRecordingButtonColor(isActive);
       
        }
      
    }

    onLeaveClick(command) {

        return async () => {

            command();

            await Util.sleep(2000);

            window.location = '/pages/home';

        };

    }

    onChatMessageSubmit(command){

        return (event) => {

            event.preventDefault();

            const formData = new FormData(this.chatMessageForm);

            command(formData);

            this.chatMessageForm.reset();

        };

    }


    addMessageToChat(message, currentUserId, pending = false){

        const messageList = document.getElementById('messages');

        const newMessageElement = document.createElement('li');

        newMessageElement.id = message.id;
        
        newMessageElement.innerHTML = `<h6>${message.userId}</h6>
                                       <p>${message.content}</p>
                                       <span>${message.when.getHours()}:${message.when.getMinutes() < 10 ? `0${message.when.getMinutes()}` : message.when.getMinutes()}</span>`;

        newMessageElement.classList.add("message");

        if(message.userId == currentUserId){

            newMessageElement.classList.add("current-user-message");

        }

        if(pending){

            newMessageElement.classList.add("pending");

        }

        messageList.append(newMessageElement);


    }

    updateMessageSent(messageId){

        const messageElement = document.getElementById(messageId);

        if(!!messageElement){

            messageElement.classList.remove('pending');

        }

    }

    configureRecordButton(command){

        this.recorderBtn.addEventListener('click', this.onRecordClick(command));

    }

    configureLeaveButton(command){

        this.leaveBtn.addEventListener('click', this.onLeaveClick(command));

    }

    configureChatMessageForm(command){

        this.chatMessageForm.addEventListener('submit', this.onChatMessageSubmit(command));

    }


}