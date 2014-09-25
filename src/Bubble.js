// import ui.View;
import ui.ImageView;
import ui.SpriteView
import device;

var Bubble = Class(ui.SpriteView, function (supr){

	this.init = function(opts){

		opts = merge(opts, {
			url: 'resources/images/eyeballs/' + opts.type.charAt(opts.type.length-1).toLowerCase(),
			frameRate: 18 + Math.round(Math.random() * 12),
			autoStart: true,
			delay: Math.random() * 20000 + 5000
		});

		supr(this, 'init', [opts]);

		this.type = opts.type;
	}

});

Bubble.A = 'Bubble.A'; // red
Bubble.B = 'Bubble.B'; // green
Bubble.C = 'Bubble.C'; // blue
Bubble.D = 'Bubble.D'; // yellow

exports = Bubble;