import ui.View;
import ui.ImageView;
import device;
import animate;
import src.Bubble as Bubble;
import src.Shooter as Shooter;
import math.array as math.array;
import math.geom.Point as Point;
import math.geom.Rect as Rect;
import math.geom.Line as Line;
import math.geom.intersect as intersect;


/*

	handles all the bubbles

	TODOs
	=========

	sound effects. make an audio controller module
	redo eyeball sprites so they are trimmed and have feathered edges, 64px square

	display score

	trails behind thrown / falling eyeballs
	explode popped eyeballs

*/

var A = Bubble.A,
 	B = Bubble.B,
 	C = Bubble.C,
 	D = Bubble.D;
var bubbleLayout = [
	[D, A, B, B, A, D, B, A, A, A],
	  [B, D, B, C, A, C, A, B, C],
	[0, 0, C, D, B, 0, 0, B, B, 0],
	  [0, 0, B, 0, 0, 0, 0, B, 0],
];
var numCols = bubbleLayout[0].length;

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

		this.bubbleSize = device.width / numCols;
		this.halfBubbleSize = this.bubbleSize * .5;

		this.bubbles = [];
		this.cells = []; // use for hit testing to determine where the bubble should stick
		var numCells = this.bubbleSize * numCols * device.height / this.bubbleSize;
		for(var i = 0; i < numCells; i++){

			var rowNum = Math.floor(i / numCols);
			var colNum = i % numCols;
			var isOddRow = Math.floor(rowNum * .5) != rowNum * .5;
			var isLastColumn = colNum == (numCols-1);

			if(isOddRow && isLastColumn){
				// skip last cell on odd rows
			} else {

				var rowOffset = isOddRow ? _this.bubbleSize * .5 : 0;
				var cell = new ui.View({
					superview: this,
					width: this.bubbleSize,
					height: this.bubbleSize,
					x: colNum * this.bubbleSize + rowOffset,
					y: rowNum * this.bubbleSize
				});
				this.cells.push(cell);

				// bubbles!
				var bubbleRow = bubbleLayout[rowNum];
				if(bubbleRow){
					var bubbleType = bubbleRow[colNum];
					if(bubbleType){
						var bubble = new Bubble({
							superview: _this,
							type: bubbleType,
							width: _this.bubbleSize,
							height: _this.bubbleSize,
							x: colNum * _this.bubbleSize + rowOffset,
							y: rowNum * _this.bubbleSize,
							row: rowNum,
							col: colNum
						});

						_this.bubbles.push(bubble);
					}
				}

			}

		}

		// animate bubbles in
		this.bubbles.forEach(function(bubble){
			var origX = bubble.style.x,
			 	origY = bubble.style.y;
				randX = Math.random() > .5 ? -_this.bubbleSize : device.width;
			animate(bubble)
				.now({x: randX, y: -_this.bubbleSize}, 0)
				.wait(1000)
				.then({x:origX, y:origY}, Math.random() * 2000, animate.easeOut);
		});

		var shooter = new Shooter({
			superview: this,
			originPoint: new Point(device.width * .5, device.height - this.bubbleSize * 1.5)
		});
		shooter.on(Shooter.SHOOT, this._onShoot);

		// START THE GAME!
		setTimeout(function(){
			_this._loadNextBubble(); // fill the hopper
			_this._loadNextBubble();
		}, 3000);

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
			animate(_this.bubbleQueue[1]).now({y:device.height - _this.halfBubbleSize});
			animate(_this.bubbleQueue[0]).now({y:device.height - _this.bubbleSize * 1.5});
		}, 100);

	};

	var shooting = false;
	this._onShoot = function(vector){
		if(shooting) return; // only shoot one at a time
		// console.log('onShoot', vector.x, vector.y);

		shooting = true;
		this.emit(BubbleBoard.SHOOT);

		var _this = this;
		var bubble = _this.bubbleQueue.shift();
		if(!bubble) return;

		var shootUpdateHandler = function(){
			var speed = 20;
			bubble.style.x += vector.x * speed;
			bubble.style.y += vector.y * speed;

			// bounce on the edges
			if(bubble.style.x <= 0 || (bubble.style.x + bubble.style.width) >= device.width){
				vector.x *= -1;
			}

			// hit test other bubbles
			var hitCeiling = bubble.style.y <= 0;
			var hitBubble = false;
			var bubbleCenterPoint = new Point(bubble.style.x + _this.halfBubbleSize, bubble.style.y + _this.halfBubbleSize);
			for(var i = _this.bubbles.length - 1; i >= 0; i--){
				var testBubble = _this.bubbles[i];
				var distance = new Line(bubbleCenterPoint, new Point(testBubble.style.x + _this.halfBubbleSize, testBubble.style.y + _this.halfBubbleSize)).getLength();
				if(distance <= _this.bubbleSize * .9){ // .9 because approx 5% transparent pixel padding
					hitBubble = true;
					i = 0; // quit loop
				}
			}

			if(hitCeiling || hitBubble){
				//console.log('hitCeiling || hitBubble', hitCeiling || hitBubble)

				// hit test cells and position the bubble
				for(var c = _this.cells.length - 1; c >= 0; c--){
					var cell = _this.cells[c];
					var hitCell = intersect.pointAndRect(
						// halfway to previous bubble center point. had to interpolate because bubble was popping into the next cell
						new Point(bubble.style.x + _this.halfBubbleSize - (vector.x * speed * .5), bubble.style.y + _this.halfBubbleSize - (vector.y * speed * .5)), 
						new Rect(cell.style.x, cell.style.y, cell.style.width, cell.style.height)
					);
					if(hitCell){
						bubble.style.x = cell.style.x;
						bubble.style.y = cell.style.y;
						c = 0; // quit loop
					}
				}

				bubble.lastPosition = new Point(bubble.style.x, bubble.style.y);
				GC.app.engine.removeListener('Tick', shootUpdateHandler);
				_this.emit(BubbleBoard.HIT);
				_this._evaluateBubbles();
				_this.bubbles.push(bubble);
				_this._loadNextBubble();
				shooting = false;

			}

		}
		GC.app.engine.on('Tick', shootUpdateHandler);

	};

	this._evaluateBubbles = function(thrownBubble){

		// TODO: evaluate if bubbles should be popped.
		// only eval chain of same-color bubbles that are touching thrownBubble

		// TODO: evaluate if bubbles should be dropped.
	};

});

BubbleBoard.HIT = 'BubbleBoard.HIT';
BubbleBoard.SHOOT = 'BubbleBoard.SHOOT';

exports = BubbleBoard;
