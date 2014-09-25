import ui.View;
import ui.ImageView;
import device;
import animate;
import src.Bubble as Bubble;
import src.Shooter as Shooter;
import math.array as math.array;
import math.geom.Point as Point;
import math.geom.Line as Line;



/*

	handles all the bubbles

	TODOs
	=========

	sound effects. make an audio controller module

*/

var A = Bubble.A,
 	B = Bubble.B,
 	C = Bubble.C,
 	D = Bubble.D;
var bubbleLayout = [

	[D, A, B, B, A, D, B, A],
	  [B, D, A, C, A, C, A],
	[0, D, C, D, B, 0, 0, B],

];

var BubbleBoard = Class(ui.ImageView, function (supr) {

	this.init = function(opts){

		opts = merge(opts, {
			image: 'resources/images/bg.jpg',
			width: device.width,
			height: device.height,
		});

		supr(this, 'init', [opts]); // note: need to call supr BEFORE adding children

		this._onShoot = bind(this, this._onShoot);

		var _this = this;

		this.bubbleSize = device.width / 8;
		this.halfBubbleSize = this.bubbleSize * .5;

		this.bubbles = [];
		bubbleLayout.forEach(function(row, rowNum){
			row.forEach(function(bubbleType, colNum){

				if(bubbleType != 0) {
					var isOddRow = Math.floor(rowNum * .5) != rowNum * .5;
					var rowOffset = isOddRow ? _this.bubbleSize * .5 : 0; // offset odd rows by half unit

					var bubble = new Bubble({
						superview: _this,
						type: bubbleType,
						width: _this.bubbleSize,
						height: _this.bubbleSize,
						x: colNum * _this.bubbleSize + rowOffset,
						y: rowNum * _this.bubbleSize,
					});

					_this.bubbles.push(bubble);
				}

			});
		});

		//TODO: refactor this to include bubble layout setup

		this.cells = []; // use for hit testing to determine where the bubble should stick
		var numCells = this.bubbleSize * 8 * device.height / this.bubbleSize;
		for(var i = 0; i < numCells; i++){
			var rowNum = Math.floor(i/8);
			var colNum = i%8;
			var isOddRow = Math.floor(rowNum * .5) != rowNum * .5;
			var rowOffset = isOddRow ? _this.bubbleSize * .5 : 0;
			var cell = new ui.View({
				superview: this,
				width: this.bubbleSize,
				height: this.bubbleSize,
				// backgroundColor: 'rgba(0,0,100,.2)',
				x: colNum * this.bubbleSize + rowOffset,
				y: rowNum * this.bubbleSize
			});
			this.cells.push(cell);
		}

		var shooter = new Shooter({
			superview: this,
			originPoint: new Point(device.width * .5, device.height - this.bubbleSize * 1.5)
		});
		shooter.on(Shooter.SHOOT, this._onShoot);

		// START THE GAME!
		this._loadNextBubble(); // fill the hopper
		this._loadNextBubble();

	}

	// "private" methods

	this.bubbleQueue = [];
	this._loadNextBubble = function(){

		// get a random bubble from types on the board
		var bubbleTypeSet = {};
		this.bubbles.forEach(function(bubble){
			bubbleTypeSet[bubble.type] = true;
		});
		var bubbleTypes = [];
		for(var type in bubbleTypeSet){
			bubbleTypes.push(type);
		}
		var bubbleType = math.array.shuffle(bubbleTypes)[0];

		this.bubbleQueue.push(
			new Bubble({
				superview: this,
				type: bubbleType,
				width: this.bubbleSize,
				height: this.bubbleSize,
				x: device.width * .5 - this.bubbleSize * .5,
				y: device.height,
			})
		);
		var _this = this;
		setTimeout(function(){
		// this.bubbleQueue[0].style.y = device.height - this.bubbleSize * 1.5;
		animate(_this.bubbleQueue[1]).now({y:device.height - _this.halfBubbleSize});
		animate(_this.bubbleQueue[0]).now({y:device.height - _this.bubbleSize * 1.5});
		}, 100);

		//TODO: animate in
	};

	var shooting = false;
	this._onShoot = function(vector){
		if(shooting) return; // only shoot one at a time
		console.log('onShoot', vector.x, vector.y);

		shooting = true;
		this.emit(BubbleBoard.SHOOT);

		var _this = this;
		var bubble = _this.bubbleQueue.shift();

		var shootUpdateHandler = function(){

			bubble.style.x += vector.x * 40;
			bubble.style.y += vector.y * 40;

			// bounce on the edges
			if(bubble.style.x <= 0 || (bubble.style.x + bubble.style.width) >= device.width){
				vector.x *= -1;
			}

			// hit test other bubbles
			var hitCeiling = bubble.style.y <= 0;
			var hitBubble = false;
			var bubbleCenterPoint = new Point(bubble.style.x + _this.halfBubbleSize, bubble.style.y + _this.halfBubbleSize);
			for(var i = _this.bubbles.length-1; i >= 0; i--){
				var testBubble = _this.bubbles[i];
				var distance = new Line(bubbleCenterPoint, new Point(testBubble.style.x + _this.halfBubbleSize, testBubble.style.y + _this.halfBubbleSize)).getLength();
				if(distance <= _this.bubbleSize){
					hitBubble = true;
					i = 0;
				}
			}

			if(hitCeiling || hitBubble){
				// TODO: hit test cells and position the bubble
				// TODO: add the bubble to the bubbles array
				_this.bubbles.push(bubble);
				GC.app.engine.removeListener('Tick', shootUpdateHandler);
				this.emit(BubbleBoard.HIT);
				shooting = false;
				_this._loadNextBubble();
			}

		}
		GC.app.engine.on('Tick', shootUpdateHandler);

	};

});

BubbleBoard.HIT = 'BubbleBoard.HIT';
BubbleBoard.SHOOT = 'BubbleBoard.SHOOT';

exports = BubbleBoard;
