function ConceptsDisplayer(brain) {
	
	var self = this;
	var conceptsDisplayElement;
	var conceptDisplays = [];
	var conceptTextInput;
	var relatedConceptsDisplays = [];
	var RELATED_CONCEPT_DISPLAY_COLORS = [
		'#880E4F',
		'#AD1457',
		'#C2185B',
		'#D81B60',
		'#E91E63',
		'#EC407A',
		'#F06292',
		'#F48FB1',
		'#F8BBD0'
	];

	self.init = function() {
		conceptTextInput = document.querySelector('#conceptTextInput');
		conceptTextInput.addEventListener('change', self.onConceptTextInputChange);
		conceptsDisplayElement = document.querySelector('#conceptsDisplayElement');
	};

	self.onConceptTextInputChange = function(event) {
		self.clearDisplay();
		var concept = conceptTextInput.value.trim().toLowerCase();
		self.findRelatedConceptsToGivenConcept(concept);
	};

	self.onConceptDisplaySelected = function(relatedConceptsDisplayWithSelectedConcept) {
		// Find the relatedConceptsDisplay with the concept that was selected
		// and remove all subsequent relatedConceptsDisplays
		for (var i=(relatedConceptsDisplays.length-1); i>=0; i--) {
			var relatedConceptsDisplay = relatedConceptsDisplays[i];
			if (relatedConceptsDisplay != relatedConceptsDisplayWithSelectedConcept) {
				self.removeRelatedConceptDisplay(relatedConceptsDisplay);
			} else {
				break;
			}
		}

		var selectedConcept = relatedConceptsDisplayWithSelectedConcept.getSelectedConcept();
		self.findRelatedConceptsToGivenConcept(selectedConcept);
	};

	self.clearDisplay = function() {
		for (var i=(relatedConceptsDisplays.length-1); i>=0; i--) {
			var relatedConceptsDisplay = relatedConceptsDisplays[i];
			self.removeRelatedConceptDisplay(relatedConceptsDisplay);
		}
	};

	self.findRelatedConceptsToGivenConcept = function(concept) {
		console.log('findRelatedConceptsToGivenConcept', concept);
		brain.getSocketer().sendFindConceptsRelatedToGivenConceptMessageToServer(concept);
	};

	self.handleReceivedRelatedConceptData = function(requestingConcept, relatedConceptData) {
		console.log('handleReceivedRelatedConceptData', requestingConcept, relatedConceptData);
		// Create the column display of related concepts
		var color = RELATED_CONCEPT_DISPLAY_COLORS[relatedConceptsDisplays.length];
		var relatedConcepts = Object.keys(relatedConceptData);
		var relatedConceptsDisplay = new RelatedConceptsDisplay(brain, self, relatedConcepts, color);
		conceptsDisplayElement.appendChild(relatedConceptsDisplay.getDisplayElement());
		relatedConceptsDisplays.push(relatedConceptsDisplay);
		// Find images for these concepts
		for (var i=0; i<relatedConcepts.length; i++) {
			var relatedConcept = relatedConcepts[i];
			var relatedConceptsDisplayIndex = relatedConceptsDisplays.length - 1;
			var conceptDisplayIndex = i;
			self.findImagesForGivenSearchQuery(relatedConcept, relatedConceptsDisplayIndex, conceptDisplayIndex);
		}
	};

	self.findImagesForGivenSearchQuery = function(searchQuery, relatedConceptsDisplayIndex, conceptDisplayIndex) {
		console.log('findImagesForGivenSearchQuery', searchQuery, relatedConceptsDisplayIndex, conceptDisplayIndex);
		brain.getSocketer().sendFindImagesForGivenSearchQueryMessageToServer(searchQuery, relatedConceptsDisplayIndex, conceptDisplayIndex);
	};

	self.removeRelatedConceptDisplay = function(relatedConceptsDisplay) {
		// Remove it from the stored list
		var indexOfRelatedConceptDisplay = relatedConceptsDisplays.indexOf(relatedConceptsDisplay);
		relatedConceptsDisplays.splice(indexOfRelatedConceptDisplay, 1);
		// Remove it from the dom
		conceptsDisplayElement.removeChild(relatedConceptsDisplay.getDisplayElement());
	};

	self.handleReceivedImageSearchData = function(searchQuery, imageSearchData, relatedConceptsDisplayIndex, conceptDisplayIndex) {
		//console.log('handleReceivedImageSearchData', searchQuery, imageSearchData, relatedConceptsDisplayIndex, conceptDisplayIndex);
		var relatedConceptsDisplay = relatedConceptsDisplays[relatedConceptsDisplayIndex];
		relatedConceptsDisplay.populateConceptDisplayWithAnImage(imageSearchData, conceptDisplayIndex);
	}

	self.init();
}