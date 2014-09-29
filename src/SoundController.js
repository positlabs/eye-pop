import src.Bubble as Bubble;
import src.BubbleBoard as BubbleBoard;
import AudioManager;

var audiomanager = new AudioManager({
  path: 'resources/sounds',
  files: {
    bg: {
      path: 'music',
      volume: 0.5,
      background: true
    },
    explode: {
      path: 'effects'
    },
  }
});

exports = {

	init: function(){
		GC.app.on(BubbleBoard.HIT, function(){});
		GC.app.on(Bubble.POPPED, function(){
			// audiomanager.play('explode');
		});
		audiomanager.play('bg');
	}


}


