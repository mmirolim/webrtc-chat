// get UserMedia
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

// namespace Chat
var Chat = {
    peer: {},
    conn: {},
    // TODO use only tasix TURN servers
    peerConfig: { 
        host: '192.168.1.101', 
        port: '9001', 
        debug: 3, 
        config: {
            'iceServers' : 
            [
        {url:'stun:stun01.sipphone.com'},
        {url:'stun:stun.ekiga.net'},
        {url:'stun:stun.fwdnet.net'},
        {url:'stun:stun.ideasip.com'},
        {url:'stun:stun.iptel.org'},
        {url:'stun:stun.rixtelecom.se'},
        {url:'stun:stun.schlund.de'},
        {url:'stun:stun.l.google.com:19302'},
        {url:'stun:stun1.l.google.com:19302'},
        {url:'stun:stun2.l.google.com:19302'},
        {url:'stun:stun3.l.google.com:19302'},
        {url:'stun:stun4.l.google.com:19302'},
        {url:'stun:stunserver.org'},
        {url:'stun:stun.softjoys.com'},
        {url:'stun:stun.voiparound.com'},
        {url:'stun:stun.voipbuster.com'},
        {url:'stun:stun.voipstunt.com'},
        {url:'stun:stun.voxgratia.org'},
        {url:'stun:stun.xten.com'}]      
        } 
    },
    error: function (str, err) {
        console.log(str, err);
    },
    // id of container element where msg should be rendered
    renderMsgBlock: '',
    renderMsg: function(who, data) {
        // html to show message
        if (this.renderMsgBlock === '') {
            console.log('Received data:', data);
        } else {
            var msgBlock = document.getElementById(this.renderMsgBlock);
            var $wrapper = document.createElement('div');
            var $who = document.createElement('span');
            var $msg = document.createElement('span');
            var $time = document.createElement('span');
            $wrapper.setAttribute('class','old-msg-wrapper');
            $who.setAttribute('class','from-user label success');
            $msg.setAttribute('class','msg-body');
            $time.setAttribute('class','timestamp label secondary');
            $who.textContent = who;
            $msg.textContent = data;
            $time.textContent = new Date();
            $wrapper.appendChild($who);
            $wrapper.appendChild($msg);
            $wrapper.appendChild($time);
            document.getElementById('old-messages').appendChild($wrapper);
        }
    },
    createRoom: function(id) {
        // creates peer with room id
        this.peer = new Peer(id, this.peerConfig);
    },
    createPeer: function() {
        this.peer = new Peer(this.peerConfig);
    },
    startConnection: function(peerId) {
    // Add label to identify users
        this.conn = this.peer.connect(peerId, { label: this.peer.id });
        this.registerConnectionEvents(this.conn);
    },
    receiveConnection: function() {
        this.peer.on('connection', function(conn) {
            Chat.conn = conn;
            Chat.registerConnectionEvents(conn);
        });
    },
    registerConnectionEvents: function(conn) {    

        conn.on('open', function() {
            console.log('Connection is Open');
        });
        conn.on('close', function() {
            console.log('Connection is Closed');
        });
        // Receive messages
        conn.on('data', function(data) {
            Chat.renderMsg(Chat.conn.label, data);
        });
        conn.on('error', function(err) {
            alert(err);
        });

    },
    sendMessage: function(str) {
        this.conn.send(str);
        this.renderMsg('You', str);
    },
    videoCall: function(peerId, yourVideoId, theirVideoId) {
        navigator.getUserMedia({video: true, audio: false}, function(stream) {
            var call = Chat.peer.call(peerId, stream);
            document.getElementById(yourVideoId).src = window.URL.createObjectURL(stream);
            call.on('stream', function(remoteStream) {
                // Show stream in some video/canvas element.
                document.getElementById(theirVideoId).src = window.URL.createObjectURL(remoteStream);
                console.log(window.URL.createObjectURL(remoteStream));
            });
        }, function(err) {
            console.log('Failed to get local stream' ,err);
        });
    },
    videoAnswer: function(yourVideoId, theirVideoId) {
        this.peer.on('call', function(call) {
            navigator.getUserMedia({video: true, audio: false}, function(stream) {
                call.answer(stream); // Answer the call with an A/V stream.
                document.getElementById(yourVideoId).src = window.URL.createObjectURL(stream);
                call.on('stream', function(remoteStream) {
                    // Show stream in some video/canvas element.
                    document.getElementById(theirVideoId).src = window.URL.createObjectURL(remoteStream);
                });
            }, function(err) {
                console.log('Failed to get local stream' ,err);
            });
        });
    },

};

Chat.renderMsgBlock = 'old-messages';

document.addEventListener("DOMContentLoaded", function(event) {
    document.getElementById('start').addEventListener('click', function() {
        Chat.createRoom(document.getElementById('room').value);
        Chat.receiveConnection();
        Chat.videoAnswer('my-video', 'their-video');
    });
    document.getElementById('enter').addEventListener('click', function() {
        Chat.createPeer();
        Chat.startConnection(document.getElementById('room').value);
        Chat.videoAnswer('my-video', 'their-video');
    });
    document.getElementById('send').addEventListener('click', function() {
        Chat.sendMessage(document.getElementById('text-to-send').value);
        document.getElementById('text-to-send').value = '';
    });
    document.getElementById('video-call').addEventListener('click', function() {
        Chat.videoCall(document.getElementById('room').value, 'my-video', 'their-video');
    });
});

