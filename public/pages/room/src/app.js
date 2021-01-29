

const recordClick = function (recorderBtn) {
  this.recordingEnabled = false
  return () => {
    this.recordingEnabled = !this.recordingEnabled
    recorderBtn.style.color = this.recordingEnabled ? 'red' : 'white'
  }
}

const onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const room = urlParams.get('room');
  console.log('this is the room', room)

  // const recorderBtn = document.getElementById('record')
  // recorderBtn.addEventListener('click', recordClick(recorderBtn))

  const socketUrl = 'http://localhost:3000';
  
  //const socketUrl = 'https://blooming-depths-43310.herokuapp.com';
  const socketBuilder = new SocketBuilder({ socketUrl });

  const peerConfig = Object.values({

    id: undefined,
    config: {
      //host: 'infinite-chamber-78884.herokuapp.com',
      //secure: true,
      port: 9000,
      host: 'localhost',
      path: '/'
    },
    debug: 3

  });
  

  const peerBuilder = new PeerBuilder({ peerConfig });

  const view = new View();
  const media = new Media();

  const deps = {

    view,
    media,
    room,
    socketBuilder,
    peerBuilder

  };
  
  Business.initialize(deps);

  // view.renderVideo({ userId: 'test01', url: 'https://media.giphy.com/media/D8a1alYj7qcU5cbovj/giphy.mp4' });
  // view.renderVideo({ userId: 'test01', isCurrentId: true, url: 'https://media.giphy.com/media/D8a1alYj7qcU5cbovj/giphy.mp4' });
  // view.renderVideo({ userId: 'test02', url: 'https://media.giphy.com/media/D8a1alYj7qcU5cbovj/giphy.mp4' });


}

window.onload = onload;