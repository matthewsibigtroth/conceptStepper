function ConceptDisplay(brain, parent, concept, color) {

	var self = this;
	var displayElement;
	var position = {};

	self.init = function() {
		displayElement = document.createElement('div');
		displayElement.classList.add('conceptDisplayElement');
		
		displayElement.style.backgroundColor = color;

		var conceptText = document.createElement('div');
		conceptText.textContent = concept;
		displayElement.appendChild(conceptText);

		displayElement.addEventListener('click', self.onClick);
	};

	self.getDisplayElement = function() { return displayElement; }
	self.getConcept = function() { return concept; }

	self.onClick = function(event) {
		parent.onConceptDisplayClick(self);
	}

	self.select = function() {
		TweenLite.to(displayElement, .1, {
			backgroundColor: '#cccccc',
			scale: .9,
			ease: Quint.easeout,
			onComplete: function() {
				TweenLite.to(displayElement, .1, {
					scale:1,
					ease: Quint.easeOut
				});
			}
		});
	};

	self.deselect = function() {
		TweenLite.to(displayElement, .6, {
			backgroundColor: color,
			ease: Quint.easeOut
		});
	};


	self.init();
};