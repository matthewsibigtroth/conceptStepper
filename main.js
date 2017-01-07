

function Brain() {
	var self = this;
	var concepter;
	var serverer;

	self.init = function() {
		
		serverer = new Serverer(self);
		concepter = new Concepter(self);
		console.log('READY!');
	};

	self.getConcepter = function() { return concepter; }
	self.getServerer = function() { return serverer; }

	self.init();
}


function Concepter(brain) {

	var self = this;
	var request = require('request');
	var MICROSOFT_CONCEPT_GRAPH_API_KEY = 'SP3gDwtR0akoQIsqm2vFWs1EAZ3KUMbK';

	self.init = function() {
		//self.findConceptsRelatedToGivenConcept('chicken');
	};

	self.onRelatedConceptDataReturned = function(requestingConcept, relatedConceptData, socket) {
		console.log('onRelatedConceptDataReturned', requestingConcept, relatedConceptData);
		//console.log(Object.keys(relatedConceptData));
		brain.getServerer().sendRelatedConceptDataToMobileClient(requestingConcept, relatedConceptData, socket);
	};

	// Find related concepts using Microsofts Concept Graph
	// https://concept.research.microsoft.com/Home/API
	self.findConceptsRelatedToGivenConcept = function(concept, socket) {
		
		
		//var body = '{"meat":0.23336869222609485,"animal":0.19290801636611607,"food":0.16729807546597969,"protein":0.092892862554932565,"ingredient":0.058342173056523713,"livestock":0.057432944385512955,"lean meat":0.052280648583118657,"poultry":0.050765267464767387,"item":0.048340657675405366,"dish":0.046370662221548717}';
		//var relatedConceptData = JSON.parse(body);
		//self.onRelatedConceptDataReturned(concept, relatedConceptData);
		

		console.log('requesting related concepts for', concept);

		var maxNumRelatedConceptsToFind = 10;

		var baseUrl = 'https://concept.research.microsoft.com/api/Concept/ScoreByProb?instance=';
		var suffixUrl = '&topK=' + maxNumRelatedConceptsToFind.toString() + '&api_key=';
		var requestUrl = baseUrl + concept + suffixUrl + MICROSOFT_CONCEPT_GRAPH_API_KEY;

		request(requestUrl, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	console.log('got a response!');
		  	var relatedConceptData = JSON.parse(body);
		    self.onRelatedConceptDataReturned(concept, relatedConceptData, socket);
		  }
		});
	}

	/*
	self.findConceptsRelatedToGivenConcept = function(concept) {
		//https://concept.research.microsoft.com/api/Concept/ScoreByProb?instance=chicken&topK=10&api_key=SP3gDwtR0akoQIsqm2vFWs1EAZ3KUMbK

		var baseUrl = 'https://concept.research.microsoft.com/api/Concept/ScoreByProb?instance=';
		var suffixUrl = '&topK=10&api_key=';
		var requestUrl = baseUrl + concept + suffixUrl + MICROSOFT_CONCEPT_GRAPH_API_KEY;

		var xhr = new XMLHttpRequest();
		xhr.open("GET", requestUrl, true);
		xhr.onload = function (e) {
		  	if (xhr.readyState === 4) {
		    	if (xhr.status === 200) {
		      	console.log(xhr.responseText);
		    	} else {
		      	console.error(xhr.statusText);
		    	}
		  	}
		};
		xhr.onerror = function (e) {
		  	console.error(xhr.statusText);
		};
		xhr.send(null);		
	}
	*/

	self.init();
}


function Serverer() {

	var self = this;
	var fs;
	var httpServer;
	var PUBLIC_FOLDER_PATH = '/public';

	var MOBILE_CLIENT_FOLDER_PATH = PUBLIC_FOLDER_PATH + '/mobileClient';
	var MOBILE_CLIENT_INDEX_PATH = MOBILE_CLIENT_FOLDER_PATH + '/index.html';
	var MOBILE_CLIENT_SOCKET_PORT = 2323;

	self.init = function() {
		console.log('creating serverer...');
		fs = require('fs');
		self.initHttpServer();
		self.initMobileClientSocketServer();
	};

	self.initHttpServer = function() {
		var http = require('http');
		express = require('express');
		app = express();
		
		app.use(express.static(__dirname + PUBLIC_FOLDER_PATH));
		app.get('/mobileClient', function(req, res){
			res.sendFile(MOBILE_CLIENT_INDEX_PATH, {'root': __dirname});
		});

		httpServer = http.createServer(app);
		httpServer.listen(MOBILE_CLIENT_SOCKET_PORT, function () {
		  console.log('socket.io server listening on port', MOBILE_CLIENT_SOCKET_PORT);
		});
	};

	self.initMobileClientSocketServer = function() {
		var io = require('socket.io')(httpServer);
		io.on('connection', function(socket) {
			console.log('socket connection opened', socket.id);

			socket.on('disconnect', function(event) {
				console.log('socket connection closed', socket.id);
			});

			socket.on('findConceptsRelatedToGivenConcept', function(message) {
				self.handleFindConceptsRelatedToGivenConceptMessage(message, socket);
			});
		});
	};

	self.handleFindConceptsRelatedToGivenConceptMessage = function(message, socket) {
		var concept = message['concept'];
		brain.getConcepter().findConceptsRelatedToGivenConcept(concept, socket);
	};

	self.sendRelatedConceptDataToMobileClient = function(requestingConcept, relatedConceptData, socket) {
		console.log('sendRelatedConceptDataToMobileClient');
		var message = {
			'requestingConcept': requestingConcept,
			'relatedConceptData': relatedConceptData
		};
		if (socket != null) {
			socket.emit('relatedConceptData', message);	
		}
		
	};

	self.init();
}


var brain = new Brain();
