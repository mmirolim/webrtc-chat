// get UserMedia
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

// namespace Chat
var Chat = {
    peer: {},
    // TODO use only tasix TURN servers
    stunConfig: [
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
        {url:'stun:stun.xten.com'}],        
    peerConfig: { host: '127.0.0.1', port: '9001', debug: 3, config: {'iceServers' : this.stunConfig} },
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
        var conn = this.peer.connect(peerId, { label: this.peer.id });
        this.registerConnectionEvents(conn);
    },
    receiveConnection: function() {
        this.peer.on('connection', function(conn) {
            this.registerConnectionEvents(conn);
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
            this.renderMsg(this.conn.label, data);
        });
        conn.on('error', function(err) {
            alert(err);
        });

    },
    sendMessage: function(str) {
        this.conn.send(str);
        this.renderMsg('You', str);
    },

};

Chat.renderMsgBlock = 'old-messages';

document.addEventListener("DOMContentLoaded", function(event) {
    document.getElementById('start').addEventListener('click', function() {
        Chat.createRoom(document.getElementById('room').value);
        Chat.receiveConnection();
    });
    document.getElementById('enter').addEventListener('click', function() {
        Chat.createPeer();
        Chat.startConnection(document.getElementById('room').value);
    });
    document.getElementById('send').addEventListener('click', function() {
        Chat.sendMessage(document.getElementById('text-to-send').value);
    });
});

