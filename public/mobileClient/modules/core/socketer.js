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
	}

	self.handleReceivedRelatedConceptData = function(message) {
		var requestingConcept = message['requestingConcept'];
		var relatedConceptData = message['relatedConceptData'];
		brain.getConceptsDisplayer().handleReceivedRelatedConceptData(requestingConcept, relatedConceptData);
	};

	
	self.sendFindConceptsRelatedToGivenConceptMessageToServer = function(concept) {
		var message = {
			'concept': concept
		};
		self.sendMessageToServer('findConceptsRelatedToGivenConcept', message);
	};


	// Send the given message object of the given messageType to the server.
	self.sendMessageToServer = function(messageType, message) {
		var json = JSON.stringify(message);
		console.log("sending message to server of type: " + messageType + " and content: " + json);
		socket.emit(messageType, message);
	};

	self.init();
}