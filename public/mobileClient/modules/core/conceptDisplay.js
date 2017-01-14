function ConceptDisplay(brain, parent, concept, color) {

	var self = this;
	var displayElement;
	var conceptImage;
	var conceptImageBox;
	var conceptText;
	var position = {};
	var SELECTED_OPACITY = 1;
	var DESELECTED_OPACITY = .3;

	self.init = function() {
		displayElement = document.createElement('div');
		displayElement.classList.add('conceptDisplayElement');
		displayElement.style.opacity = 0;

		conceptImageBox = document.createElement('div');
		conceptImageBox.classList.add('conceptImageBox');
		conceptImageBox.style.borderColor = color;
		
		conceptImage = document.createElement('img');
		//conceptImage.style.maxHeight = '100%';
		conceptImage.classList.add('conceptImage');
		
		conceptImage.addEventListener('load', self.onConceptImageLoad);
		conceptImageBox.appendChild(conceptImage);
		displayElement.appendChild(conceptImageBox);

		conceptText = document.createElement('div');
		conceptText.style.marginTop = '10px';
		conceptText.textContent = concept;
		displayElement.appendChild(conceptText);		

		displayElement.addEventListener('click', self.onClick);
	};


	self.getDisplayElement = function() { return displayElement; }
	self.getConcept = function() { return concept; }


	self.onConceptImageLoad = function(event) {
		var imageWidth = conceptImage.naturalWidth;
		var imageHeight = conceptImage.naturalHeight;

		console.log(conceptText.innerText, imageWidth, imageHeight);

		TweenLite.fromTo(displayElement, .6, 
		{
			opacity: 0,
			x: -100,
		},
		{
			opacity: 1,
			x: 0,
			ease: Quint.easeOut
		});
	};

	self.onClick = function(event) {
		parent.onConceptDisplayClick(self);
	};


	self.select = function() {
		TweenLite.to(displayElement, .6, {
			opacity: SELECTED_OPACITY,
			ease: Quint.easeOut
		});
		TweenLite.to(conceptImageBox, .6, {
			borderWidth: 10,
			ease: Quint.easeOut
		});
	};
	
	self.deselect = function() {
		TweenLite.to(displayElement, .6, {
			opacity: DESELECTED_OPACITY,
			ease: Quint.easeOut
		});
		TweenLite.to(conceptImageBox, .6, {
			borderWidth: 0,
			ease: Quint.easeOut
		});
	};
	

	self.populateImage = function(imageUrl) {
		//console.log('populateImage', imageUrl);
		conceptImage.src = imageUrl;
	};


	self.init();
};