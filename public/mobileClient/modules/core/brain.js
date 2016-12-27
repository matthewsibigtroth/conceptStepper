function Brain() {

	var self = this;
	var conceptsDisplayer;
	var socketer;

	self.init = function() {
		conceptsDisplayer = new ConceptsDisplayer(self);
		socketer = new Socketer(self);
	};

	self.getConceptsDisplayer = function() { return conceptsDisplayer; }
	self.getSocketer = function() { return socketer; }

	self.findRelatedConceptsToGivenConcept = function(concept) {
		console.log('findRelatedConceptsToGivenConcept', concept);
		socketer.sendFindConceptsRelatedToGivenConceptMessageToServer(concept);
	};

	self.init();
}



