import ui.View;
import device;
import ui.ImageView;
import src.Bubble as Bubble;
import math.geom.Point as Point;
from event.input.dispatch import eventTypes;

/*

	Handles touch interactions for shooting balls

	TODO: try using gestureview
	http://docs.gameclosure.com/api/ui-gestureview.html

*/

var ShooterController = Class(ui.View, function (supr){

	this.init = function(opts){

		opts = merge(opts, {
			width: device.width,
			height: device.height*.8,
			zIndex: 10
		});

		supr(this, 'init', [opts]);
		var _this = this;

		this.on("InputStart", onInputStart);
		this.on("InputMove", onInputMove);
		this.on("InputSelect", onInputSelect);

		this.originPoint = opts.originPoint;

	};

	function onInputStart(e, point){
		// console.log('onInputStart', point);
	}

	function onInputMove(e, point){
		// console.log('onInputMove', point);
	}

	function onInputSelect(e, point){
		// console.log('onInputSelect', point);
		var diff = point.subtract(this.originPoint);
		var vector = diff.normalize(new Point(0, 0));
		this.emit(ShooterController.SHOOT, vector);
	}

});

ShooterController.SHOOT = 'ShooterController.SHOOT';

exports = ShooterController;
