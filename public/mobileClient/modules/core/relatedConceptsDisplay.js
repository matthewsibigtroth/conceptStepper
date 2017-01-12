
function RelatedConceptsDisplay(brain, parent, relatedConcepts, color) {

	var self = this;
	var displayElement;
	var conceptDisplays = [];
	var selectedConceptDisplay = null;

	self.init = function() {
		displayElement = document.createElement('div');
		displayElement.classList.add('relatedConceptsDisplayElement');
		self.buildRelatedConceptsColumn();
		//self.reveal();
	};

	self.getDisplayElement = function() { return displayElement; }
	self.getSelectedConcept = function() { return selectedConceptDisplay.getConcept(); }

	self.onConceptDisplayClick = function(clickedConceptDisplay) {
		// If this concept is already selected
		if (clickedConceptDisplay == selectedConceptDisplay) {
			return;
		}

		// Store this concept as selected
		selectedConceptDisplay = clickedConceptDisplay;

		// Tell the parent about this selection
		parent.onConceptDisplaySelected(self);

		// Loop through all the concepts and select or deselect accordingly
		for (var i=0; i<conceptDisplays.length; i++) {
			var conceptDisplay = conceptDisplays[i];
			if (conceptDisplay == clickedConceptDisplay) {
				console.log('select', i);
				conceptDisplay.select();
			} else {
				console.log('deselect', i);
				conceptDisplay.deselect();
			}
		}
	};

	self.buildRelatedConceptsColumn = function() {
		for (var i=0; i<relatedConcepts.length; i++) {
			var relatedConcept = relatedConcepts[i];
			var conceptDisplay = new ConceptDisplay(brain, self, relatedConcept, color);
			displayElement.appendChild(conceptDisplay.getDisplayElement());
			conceptDisplays.push(conceptDisplay);
		}
	};

	self.populateConceptDisplayWithAnImage = function(imageSearchData, conceptDisplayIndex) {
		//console.log('populateConceptDisplayWithAnImage', imageSearchData, conceptDisplayIndex);
		
		if (imageSearchData.length <= 0) {
			return;
		}

		var numImages = imageSearchData.length;
		var randIndex = Math.floor(Math.random() * numImages);

		var imageUrl = imageSearchData[randIndex]['imageUrl'];
		var conceptDisplay = conceptDisplays[conceptDisplayIndex];
		conceptDisplay.populateImage(imageUrl);
	}

	self.reveal = function() {
		for (var i=0; i<conceptDisplays.length; i++) {
			TweenLite.fromTo(conceptDisplays[i].getDisplayElement(), .6, {
				x: -100, 
				opacity: 0
			},
			{
				'x': 0,
				'opacity': 1,
				ease: Quint.easeOut,
				delay: i * .1
			});
		}
	};

	self.init();
} 

