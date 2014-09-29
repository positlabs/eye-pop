import ui.View;
import ui.SpriteView
import device;
import animate;
from ui.filter import LinearAddFilter;

var Bubble = Class(ui.View, function (supr){

	this.init = function(opts){
		// console.log('Bubble.init', opts);

		supr(this, 'init', [opts]);

		this.eyeAnim = new ui.SpriteView({
			superview: this,
			width: opts.width,
			height: opts.height,
			url: 'resources/images/eyeballs/' + opts.type.charAt(opts.type.length - 1).toLowerCase(),
			frameRate: 18 + Math.round(Math.random() * 12),
			autoStart: true,
			delay: Math.random() * 20000 + 5000
		});

		this.type = opts.type;
		this.row = opts.row;
		this.col = opts.col;

		this.pop = bind(this, this.pop);
	};

	this.pop = function(){
		// console.log('Bubble.pop');
		var _this = this;
		var addFilter = new LinearAddFilter({r:255, g:255, b: 255, a:.7});
		this.eyeAnim.setFilter(addFilter);

		var bigSize = this.eyeAnim.style.width * 1.5;
		animate(this.eyeAnim)
			.now({
				width: bigSize,
				height: bigSize,
				x: -bigSize * .25,
				y: -bigSize * .25,
			}, 200, animate.easeOut)
			.then(function(){
				_this.eyeAnim.stopAnimation();
			});


		var explosion = new ui.SpriteView({
			superview: this,
			width: 64,
			height: 64,
			x: this.eyeAnim.style.width * .5 - 32,
			y: this.eyeAnim.style.height * .5 - 32,
			sheetData: {
				url: 'resources/images/explosion_anim.png',
				anims: {
					explode:  [
						[0, 0], [1, 0], [2, 0], [3, 0],
						[0, 1], [1, 1], [2, 1], [3, 1],
						[0, 2], [1, 2], [2, 2], [3, 2],
						[0, 3], [1, 3], [2, 3], [3, 3],
					],
				}
			}
		});

		var _this = this;
		setTimeout(function(){
			explosion.startAnimation('explode', {
				callback: function(){
					_this.emit(Bubble.POPPED);
					GC.app.emit(Bubble.POPPED);
				}
			});
		}, Math.random() * 300 + 100);

	};

	this.drop = function(){
		var _this = this;
		animate(this).now({y: this.style.y + Math.random() * 200}, 500, animate.easeIn).then(function(){
			_this.pop();
		});
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