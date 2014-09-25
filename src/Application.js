import ui.TextView as TextView;
import src.BubbleBoard as BubbleBoard;

exports = Class(GC.Application, function () {

	this.initUI = function () {

		var board = new BubbleBoard({
			superview: this
		});

	};

	this.launchUI = function () {};

});
