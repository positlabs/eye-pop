import ui.TextView as TextView;
import src.BubbleBoard as BubbleBoard;
import src.SoundController as SoundController;

exports = Class(GC.Application, function () {

	this.initUI = function () {

		var board = new BubbleBoard({superview: this});

		SoundController.init();

	};

	this.launchUI = function () {};

});
