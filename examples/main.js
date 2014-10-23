var vids = {
	youtube: "n_-ayw8sLOA",
	vimeo: "75320274",
	dailymotion: "x1571bg"
};
var opts = {
	autoplay: true,
	autohide: true,
	theme: "light"
};

var x;
$(function(){
	x = $("#player").xmbd();

	x.on("playerStateChange", function(e){
		console.log(e);
	});

	x.embed("vimeo", vids.vimeo, opts);

	$(".cmd").click(function(e){
		e.preventDefault();
		x.action($(this).text().toLowerCase());
	});
	$(".mbd").click(function(e){
		e.preventDefault();
		var p = $(this).text().toLowerCase();
		x.embed(p, vids[p], opts);
	});
	$("#cue").click(function(e){
		e.preventDefault();
		x.action("cue", 20);
	});
});
