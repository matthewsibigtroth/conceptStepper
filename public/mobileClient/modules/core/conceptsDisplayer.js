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
		brain.findRelatedConceptsToGivenConcept(concept);
	};

	self.clearDisplay = function() {
		for (var i=(relatedConceptsDisplays.length-1); i>=0; i--) {
			var relatedConceptsDisplay = relatedConceptsDisplays[i];
			self.removeRelatedConceptDisplay(relatedConceptsDisplay);
		}
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
		brain.findRelatedConceptsToGivenConcept(selectedConcept);
	};

	self.handleReceivedRelatedConceptData = function(requestingConcept, relatedConceptData) {
		console.log('handleReceivedRelatedConceptData', requestingConcept, relatedConceptData);
		var color = RELATED_CONCEPT_DISPLAY_COLORS[relatedConceptsDisplays.length];
		var relatedConcepts = Object.keys(relatedConceptData);
		var relatedConceptsDisplay = new RelatedConceptsDisplay(brain, self, relatedConcepts, color);
		conceptsDisplayElement.appendChild(relatedConceptsDisplay.getDisplayElement());
		relatedConceptsDisplays.push(relatedConceptsDisplay);
	};

	self.removeRelatedConceptDisplay = function(relatedConceptsDisplay) {
		// Remove it from the stored list
		var indexOfRelatedConceptDisplay = relatedConceptsDisplays.indexOf(relatedConceptsDisplay);
		relatedConceptsDisplays.splice(indexOfRelatedConceptDisplay, 1);
		// Remove it from the dom
		conceptsDisplayElement.removeChild(relatedConceptsDisplay.getDisplayElement());

	};

	self.init();
}