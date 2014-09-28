// import ui.View;
import ui.ImageView;
import ui.SpriteView
import device;

var Bubble = Class(ui.SpriteView, function (supr){

	this.init = function(opts){
		// console.log('Bubble.init', opts);

		opts = merge(opts, {
			url: 'resources/images/eyeballs/' + opts.type.charAt(opts.type.length-1).toLowerCase(),
			frameRate: 18 + Math.round(Math.random() * 12),
			autoStart: true,
			delay: Math.random() * 20000 + 5000
		});

		supr(this, 'init', [opts]);

		this.type = opts.type;
		this.row = opts.row;
		this.col = opts.col;

		this.pop = bind(this, this.pop);
	};

	this.pop = function(){
		console.log('Bubble.pop');
		//TODO: play explosion animation

		this.emit(Bubble.POPPED);
	};

	this.equals = function(otherBubble){
		var isTypeMatch = otherBubble.type == otherBubble.type;
		var isPositionMatch = otherBubble.style.x == this.style.x && otherBubble.style.y == this.style.y;
		return isTypeMatch && isPositionMatch;
	};

	this.isInArray = function(bubbleArray){
		for(var i = bubbleArray.length - 1; i >= 0; i--){
			if(this.equals(bubbleArray[i])){
				return true
				i = 0;
			}
		}

	};

});

Bubble.POPPED = 'Bubble.POPPED';

Bubble.A = 'Bubble.A'; // red
Bubble.B = 'Bubble.B'; // green
Bubble.C = 'Bubble.C'; // blue
Bubble.D = 'Bubble.D'; // yellow

exports = Bubble;