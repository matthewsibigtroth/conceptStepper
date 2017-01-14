

function Brain() {
	var self = this;
	var imager;
	var concepter;
	var serverer;

	self.init = function() {
		serverer = new Serverer(self);
		imager = new Imager(self);
		concepter = new Concepter(self);
		console.log('READY!');
	};

	self.getImager = function() { return imager; }
	self.getConcepter = function() { return concepter; }
	self.getServerer = function() { return serverer; }

	self.init();
}

function Imager(brain) {
	
	var self = this;
	var request;
	var MS_IMAGE_SEARCH_API_KEY_1 = 'aeb6b973dd7a4a29847b5aa7e43c5ef9';
	var MS_IMAGE_SEARCH_API_KEY_2 = 'eafff0a322f343a88d3d5c046e555686';
	var MAX_NUM_IMAGE_RESULTS_PER_REQUEST = 25;
	var PIXABAY_API_KEY_FILENAME = 'pixabay_api_key.txt';
	var pixabayApiKey = null;

	self.init = function() {
		request = require('request');

		self.loadPixabayApiKey();
		//setTimeout(self.findImagesForGivenSearchQuery_viaPixabay, 2000, 'cat');
	};

	self.loadPixabayApiKey = function() {
		var fs = require('fs');
		fs.readFile(PIXABAY_API_KEY_FILENAME, 'utf8', function(err, data) {
  			if (err) throw err;
  			pixabayApiKey = data.toString();
		});
	};

	self.onImageSearchDataReturned_fromBing = function(searchQuery, imageSearchData, relatedConceptsDisplayIndex, conceptDisplayIndex, socket) {
		//console.log('onImageSearchDataReturned', searchQuery, imageSearchData);

		var imageSearchDataToSend = [];
		var imageResults = imageSearchData['value'];
		for (var i=0; i<imageResults.length; i++) {
			var imageResult = imageResults[i];
			var imageSearchDatum = {
				'imageUrl': imageResult['thumbnailUrl']
			};
			imageSearchDataToSend.push(imageSearchDatum)
		}

		brain.getServerer().sendImageSearchDataToMobileClient(searchQuery, imageSearchDataToSend, relatedConceptsDisplayIndex, conceptDisplayIndex, socket);
	};

	self.onImageSearchDataReturned_fromPixabay = function(searchQuery, imageSearchData, relatedConceptsDisplayIndex, conceptDisplayIndex, socket) {
		//console.log('onImageSearchDataReturned', searchQuery, imageSearchData);

		var imageSearchDataToSend = [];
		var imageResults = imageSearchData['hits'];
		for (var i=0; i<imageResults.length; i++) {
			var imageResult = imageResults[i];
			var imageSearchDatum = {
				'imageUrl': imageResult['previewURL']
			};
			imageSearchDataToSend.push(imageSearchDatum)
		}

		console.log(imageSearchDataToSend);

		brain.getServerer().sendImageSearchDataToMobileClient(searchQuery, imageSearchDataToSend, relatedConceptsDisplayIndex, conceptDisplayIndex, socket);
	};


	// Based on API at 
	// https://msdn.microsoft.com/en-us/library/dn760791.aspx
	self.findImagesForGivenSearchQuery_viaBing = function(searchQuery, relatedConceptsDisplayIndex, conceptDisplayIndex, socket) {
		console.log('findImagesForGivenSearchQuery_viaBing', searchQuery);

		/*
		var value = [ { thumbnailUrl: 'https://tse4.mm.bing.net/th?id=OIP.x-ER3WkOYbzDFlCxo-SD9wEsC7&pid=Api' }, 
			{ thumbnailUrl: 'https://tse4.mm.bing.net/th?id=OIP.Mc83636b31b8d0abff573b86efd63cb0dH0&pid=Api' },
			{ thumbnailUrl: 'https://tse2.mm.bing.net/th?id=OIP.M42428010d527fc1225757ada9d9a8bccH0&pid=Api' } ];
		var imageSearchData = {'value': value};
		self.onImageSearchDataReturned_fromBing(searchQuery, imageSearchData, relatedConceptsDisplayIndex, conceptDisplayIndex, socket);

		return;
		*/

		var baseUrl = 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?';
		var formattedSearchQuery = searchQuery.toLowerCase().trim().split(' ').join('+');
		var searchParam = 'q=' + formattedSearchQuery;
		var countParam = '&count=' + MAX_NUM_IMAGE_RESULTS_PER_REQUEST.toString();
		var marketParam = '&mkt=en-us';
		var requestUrl = baseUrl + searchParam + countParam + marketParam;

		var options = {
  			url: requestUrl,
  			headers: {
    			'Ocp-Apim-Subscription-Key': MS_IMAGE_SEARCH_API_KEY_1
  			}
		};

		request(options, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	console.log('got a response!');
		  	var imageSearchData = JSON.parse(body);
		  	self.onImageSearchDataReturned_fromBing(searchQuery, imageSearchData, relatedConceptsDisplayIndex, conceptDisplayIndex, socket);
		  }
		});
	};

	// Based on API at
	// https://pixabay.com/api/docs/
	self.findImagesForGivenSearchQuery_viaPixabay = function(searchQuery, relatedConceptsDisplayIndex, conceptDisplayIndex, socket) {
		console.log('findImagesForGivenSearchQuery_viaPixabay', searchQuery);

		//https://pixabay.com/api/?key=4252570-8ad9f863c24ae8759a7b50c7c&q=yellow+flowers&image_type=photo'

		var baseUrl = 'https://pixabay.com/api/?';
		var keyString = 'key=' + pixabayApiKey;
		var queryString = '&q=' + searchQuery.toLowerCase().trim().split(' ').join('+');
		var typeString = '&image_type=photo';
		var perPageString = '&per_page=' + MAX_NUM_IMAGE_RESULTS_PER_REQUEST.toString();
		var requestUrl = baseUrl + keyString + queryString + typeString + perPageString;

		var options = {
  			url: requestUrl,
		};

		request(options, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	console.log('got a response!');
		  	var imageSearchData = JSON.parse(body);
		  	//console.log(imageSearchData);
		  	self.onImageSearchDataReturned_fromPixabay(searchQuery, imageSearchData, relatedConceptsDisplayIndex, conceptDisplayIndex, socket);
		  }
		});
	};

	self.init();
}


function Concepter(brain) {

	var self = this;
	var request = require('request');
	var MICROSOFT_CONCEPT_GRAPH_API_KEY = 'SP3gDwtR0akoQIsqm2vFWs1EAZ3KUMbK';
	var MAX_NUM_CONCEPT_RESULTS_PER_REQUEST = 5;

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
		console.log('findConceptsRelatedToGivenConcept', concept);

		/*
		var relatedConceptData = { 'cat and mouse': 0.5435046539862404 };
		self.onRelatedConceptDataReturned(concept, relatedConceptData, socket);

		return;
		*/		

		var baseUrl = 'https://concept.research.microsoft.com/api/Concept/ScoreByProb?instance=';
		var suffixUrl = '&topK=' + MAX_NUM_CONCEPT_RESULTS_PER_REQUEST.toString() + '&api_key=';
		var requestUrl = baseUrl + concept + suffixUrl + MICROSOFT_CONCEPT_GRAPH_API_KEY;

		request(requestUrl, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	console.log('got a response!');
		  	var relatedConceptData = JSON.parse(body);
		    self.onRelatedConceptDataReturned(concept, relatedConceptData, socket);
		  }
		});
	}


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

			socket.on('findImagesForGivenSearchQuery', function(message) {
				self.handlFindImagesForGivenSearchQueryMessage(message, socket);
			});
		});
	};

	self.handleFindConceptsRelatedToGivenConceptMessage = function(message, socket) {
		var concept = message['concept'];
		brain.getConcepter().findConceptsRelatedToGivenConcept(concept, socket);
	};

	self.handlFindImagesForGivenSearchQueryMessage = function(message, socket) {
		var searchQuery = message['searchQuery'];
		var relatedConceptsDisplayIndex = message['relatedConceptsDisplayIndex'];
		var conceptDisplayIndex = message['conceptDisplayIndex'];
		//brain.getImager().findImagesForGivenSearchQuery_viaBing(searchQuery, relatedConceptsDisplayIndex, conceptDisplayIndex, socket);
		brain.getImager().findImagesForGivenSearchQuery_viaPixabay(searchQuery, relatedConceptsDisplayIndex, conceptDisplayIndex, socket);
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

	self.sendImageSearchDataToMobileClient = function(searchQuery, imageSearchData, relatedConceptsDisplayIndex, conceptDisplayIndex, socket) {
		console.log('sendImageSearchDataToMobileClient');

		var message = {
			'searchQuery': searchQuery,
			'imageSearchData': imageSearchData,
			'relatedConceptsDisplayIndex': relatedConceptsDisplayIndex,
			'conceptDisplayIndex': conceptDisplayIndex
		};

		if (socket != null) {
			socket.emit('imageSearchData', message);
		}
	};

	self.init();
}


var brain = new Brain();
