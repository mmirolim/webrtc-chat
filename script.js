// namespace Chat
var Chat = {};

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

// User own credential
Chat.stunConfig = [
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
    {url:'stun:stun.xten.com'},
    {
        url: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com'
    },
    {
        url: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
    },
    {
        url: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
    }]

Chat.peerConfig = { host: '127.0.0.1', port: '9001', debug: 3, config: {'iceServers' : Chat.stunConfig} }

Chat.getRoom = function() {
    Chat.room = document.getElementById('room').value;
    document.getElementById('current-room').textContent = 'You have created a new "' + Chat.room + '" room';
}

Chat.createPeer = function() {
    Chat.peer = new Peer( Chat.room, Chat.peerConfig );
    Chat.peer.on('open', function(id) {
        console.log('My peer ID is: ' + id);
    });
    Chat.peer.on('connection', function(conn){
        Chat.connection = conn;
        Chat.connection.on('open', function() {
            // Receive messages
            Chat.connection.on('data', function(data) {
                document.getElementById('received-data').textContent = data;
                Chat.saveMsg(data, 'Another guy' );
            });
        });
    });
    Chat.videoAnswer();
}

Chat.startConnection = function() {
    Chat.peer = new Peer( Chat.peerConfig );
    Chat.peer.on('open', function(id) {
        console.log('My peer ID is: ' + id);
    });
    Chat.connection = Chat.peer.connect(Chat.room);
    Chat.connection.on('open', function() {
        // Receive messages
        Chat.connection.on('data', function(data) {
            document.getElementById('received-data').textContent = data;
            Chat.saveMsg(data, 'Another guy' );
        });
    });
    Chat.videoAnswer();
}

Chat.send = function() {
    var el = document.getElementById('text-to-send');
    var msg = el.value;
    if ( Chat.cacheMsg !== msg ) {
        Chat.connection.send(msg);
        Chat.saveMsg(msg, 'You');
    }
    el.value = '';
}

Chat.dynamicMessage = function() {
    var msg = document.getElementById('text-to-send').value;
    if ( Chat.cacheMsg == msg ) { return }
    Chat.cacheMsg = msg;
    Chat.connection.send(msg);
}

Chat.saveMsg = function(msg, who) {
    var $wrapper = document.createElement('div');
    var $who = document.createElement('span');
    var $msg = document.createElement('span');
    var $time = document.createElement('span');
    $wrapper.setAttribute('class','old-msg-wrapper');
    $who.setAttribute('class','from-user label success');
    $msg.setAttribute('class','msg-body');
    $time.setAttribute('class','timestamp label secondary')
    $who.textContent = who;
    $msg.textContent = msg;
    $time.textContent = new Date();
    $wrapper.appendChild($who);
    $wrapper.appendChild($msg);
    $wrapper.appendChild($time);
    document.getElementById('old-messages').appendChild($wrapper);
}

Chat.videoCall = function() {
    navigator.getUserMedia({video: true, audio: true}, function(stream) {
        var call = Chat.peer.call(Chat.room, stream);
        call.on('stream', function(remoteStream) {
            // Show stream in some video/canvas element.
            document.getElementById('their-video').src = window.URL.createObjectURL(remoteStream);
            console.log(window.URL.createObjectURL(remoteStream));
        });
    }, function(err) {
        console.log('Failed to get local stream' ,err);
    });
}

Chat.videoAnswer = function() {
    Chat.peer.on('call', function(call) {
        navigator.getUserMedia({video: true, audio: true}, function(stream) {
            call.answer(stream); // Answer the call with an A/V stream.
            call.on('stream', function(remoteStream) {
                // Show stream in some video/canvas element.
                document.getElementById('their-video').src = window.URL.createObjectURL(remoteStream);
            });
        }, function(err) {
            console.log('Failed to get local stream' ,err);
        });
    });
}

document.addEventListener("DOMContentLoaded", function(event) {
    console.log('>>DOMContentLoaded<<');
    document.getElementById('start').addEventListener('click', Chat.getRoom);
    document.getElementById('start').addEventListener('click', Chat.createPeer);
    document.getElementById('enter').addEventListener('click', Chat.getRoom);
    document.getElementById('enter').addEventListener('click', Chat.startConnection);
    document.getElementById('send').addEventListener('click', Chat.send);
    document.getElementById('video-call').addEventListener('click', Chat.videoCall);

    /*document.getElementById('dynamic-text').addEventListener('click', function(e) {
        if ( e.target.checked == true ) {
            Chat.intervalId = setInterval(Chat.dynamicMessage, 100);
        } else {
            clearInterval(Chat.intervalId);
        }
    });
    */

});
