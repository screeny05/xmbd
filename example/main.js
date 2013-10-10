/*
<iframe src="player.vimeo.com/video/75320274"   width="500" height="281" frameborder="0"></iframe>
<iframe src="www.youtube.com/embed/n_-ayw8sLOA" width="560" height="315" frameborder="0"></iframe>
<iframe src="www.dailymotion.com/embed/video/x1571bg" width="480" height="270" frameborder="0"></iframe>
*/

var x;
$(function(){
	x = $("#player").xmbd();
	
	x.on("playerChange", function(e){
		console.log(e);
	});

	x.embed("dailymotion", "x1571bg", {
		autoplay: true,
		autohide: true,
		theme: "light"
	});
	
	$(".cmd").click(function(e){
		e.preventDefault();
		x.action($(this).text().toLowerCase());
	});
	$("#cue").click(function(e){
		e.preventDefault();
		x.action("cue", 20);
	});
});











