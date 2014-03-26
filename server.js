/**
 * Created by Simon on 3/25/14.
 */
var PeerServer = require('peer').PeerServer;
var server = new PeerServer({port: 9001, path: '/'});