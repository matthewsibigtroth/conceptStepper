function Socketer(brain) {

	var self = this;
	var socket;


	self.init = function() {
		self.createSocket();
	};

	self.createSocket = function() {
		socket = io();
		socket.on('connect', function() {
			console.log('onConnectionWithServer');
		});
		socket.on('connect_failed', function() {
			console.log('onConnectionFailedWithServer');
		});
		socket.on('disconnect', function() {
			console.log('onDisonnectionFromServer');
		});

		socket.on('relatedConceptData', self.handleReceivedRelatedConceptData);
		socket.on('imageSearchData', self.handleReceivedImageSearchData);
	}

	self.handleReceivedRelatedConceptData = function(message) {
		var requestingConcept = message['requestingConcept'];
		var relatedConceptData = message['relatedConceptData'];
		brain.getConceptsDisplayer().handleReceivedRelatedConceptData(requestingConcept, relatedConceptData);
	};

	self.handleReceivedImageSearchData = function(message) {
		var searchQuery = message['searchQuery'];
		var imageSearchData = message['imageSearchData'];
		var relatedConceptsDisplayIndex = message['relatedConceptsDisplayIndex'];
		var conceptDisplayIndex = message['conceptDisplayIndex'];
		brain.getConceptsDisplayer().handleReceivedImageSearchData(searchQuery, imageSearchData, relatedConceptsDisplayIndex, conceptDisplayIndex);
	};
	
	self.sendFindConceptsRelatedToGivenConceptMessageToServer = function(concept) {
		var message = {
			'concept': concept
		};
		self.sendMessageToServer('findConceptsRelatedToGivenConcept', message);
	};

	self.sendFindImagesForGivenSearchQueryMessageToServer = function(searchQuery, relatedConceptsDisplayIndex, conceptDisplayIndex) {
		var message = {
			'searchQuery': searchQuery,
			'relatedConceptsDisplayIndex': relatedConceptsDisplayIndex,
			'conceptDisplayIndex': conceptDisplayIndex
		};
		self.sendMessageToServer('findImagesForGivenSearchQuery', message);
	};


	// Send the given message object of the given messageType to the server.
	self.sendMessageToServer = function(messageType, message) {
		var json = JSON.stringify(message);
		console.log("sending message to server of type: " + messageType + " and content: " + json);
		socket.emit(messageType, message);
	};

	self.init();
}