if (!window.location.origin) { window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');}
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

module("General");
asyncTest("Event-Lib", function(){
	var x = $("#qunit-fixture").xmbd();
	x.on("custom", function(val, bal){
		ok(true, "Event triggering working");
		equal(val, "value", "Params working");
	});
	x.embed("vimeo", vids.vimeo, {
		on: {
			custom2: function(val){
				ok(true, "Event binding through embed-method");
				equal(val, "value", "embed-method, Params working");
				start();
			}
		}
	});
	x.trigger("custom", "value");
	x.trigger("custom2", "value");
});

test("Same GUID when retrieving again", function(){
	var orgGuid = $("#qunit-fixture").xmbd().guid;
	var newGuid = $("#qunit-fixture").xmbd().guid;

	equal(orgGuid, newGuid, "working");
});

module("GetMediaUrl");
test("YouTube", function(){
	var x = $("#qunit-fixture").xmbd();
	var ap_url = x.getMediaUrl("youtube", vids["youtube"], {
		autoplay: true
	});
	var ah_url = x.getMediaUrl("youtube", vids["youtube"], {
		autohide: true
	});
	var loop_url = x.getMediaUrl("youtube", vids["youtube"], {
		loop: true
	});
	var theme_url = x.getMediaUrl("youtube", vids["youtube"], {
		theme: "light"
	});

	var ap_should = "https://www.youtube.com/embed/" + vids["youtube"] + "?autoplay=1&autohide=2&loop=0&theme=dark&origin=" + encodeURIComponent(window.location.origin) + "&playerapiid=" + x.guid + "&enablejsapi=1&rel=0";
	var ah_should = "https://www.youtube.com/embed/" + vids["youtube"] + "?autoplay=0&autohide=1&loop=0&theme=dark&origin=" + encodeURIComponent(window.location.origin) + "&playerapiid=" + x.guid + "&enablejsapi=1&rel=0";
	var loop_should = "https://www.youtube.com/embed/" + vids["youtube"] + "?autoplay=0&autohide=2&loop=1&playlist=" + vids["youtube"] + "&theme=dark&origin=" + encodeURIComponent(window.location.origin) + "&playerapiid=" + x.guid + "&enablejsapi=1&rel=0";
	var theme_should = "https://www.youtube.com/embed/" + vids["youtube"] + "?autoplay=0&autohide=2&loop=0&theme=light&origin=" + encodeURIComponent(window.location.origin) + "&playerapiid=" + x.guid + "&enablejsapi=1&rel=0";

	equal(ap_url.url, ap_should, "Autoplay-Check");
	equal(ah_url.url, ah_should, "Autohide-Check");
	equal(loop_url.url, loop_should, "Loop-Check");
	equal(theme_url.url, theme_should, "Theme-Check");
});

test("Vimeo", function(){
	var x = $("#qunit-fixture").xmbd();
	var ap_url = x.getMediaUrl("vimeo", vids["vimeo"], {
		autoplay: true
	});
	var ah_url = x.getMediaUrl("vimeo", vids["vimeo"], {
		autohide: true
	});
	var loop_url = x.getMediaUrl("vimeo", vids["vimeo"], {
		loop: true
	});
	var color_un_url = x.getMediaUrl("vimeo", vids["vimeo"], {
		color: "FFF"
	});
	var color_pref_url = x.getMediaUrl("vimeo", vids["vimeo"], {
		color: "#FFF"
	});

	var ap_should = "https://player.vimeo.com/video/" + vids["vimeo"] + "?autoplay=1&byline=1&portrait=1&color=00adef&loop=0&player_id=" + x.guid + "&api=1";
	var ah_should = "https://player.vimeo.com/video/" + vids["vimeo"] + "?autoplay=0&byline=0&portrait=0&color=00adef&loop=0&player_id=" + x.guid + "&api=1";
	var loop_should = "https://player.vimeo.com/video/" + vids["vimeo"] + "?autoplay=0&byline=1&portrait=1&color=00adef&loop=1&player_id=" + x.guid + "&api=1";
	var color_should = "https://player.vimeo.com/video/" + vids["vimeo"] + "?autoplay=0&byline=1&portrait=1&color=FFF&loop=0&player_id=" + x.guid + "&api=1";

	equal(ap_url.url, ap_should, "Autoplay-Check");
	equal(ah_url.url, ah_should, "Autohide-Check");
	equal(loop_url.url, loop_should, "Loop-Check");
	equal(color_un_url.url, color_should, "Color-Check");
	equal(color_pref_url.url, color_should, "Prefixed Color-Check");
});

test("Dailymotion", function(){
	var x = $("#qunit-fixture").xmbd();
	var ap_url = x.getMediaUrl("dailymotion", vids["dailymotion"], {
		autoplay: true
	});
	var color_un_url = x.getMediaUrl("dailymotion", vids["dailymotion"], {
		highlight: "fff",
		foreground: "fff",
		background: "fff"
	});
	var color_pref_url = x.getMediaUrl("dailymotion", vids["dailymotion"], {
		highlight: "#fff",
		foreground: "#fff",
		background: "#fff"
	});

	var ap_should = "https://www.dailymotion.com/swf/" + vids["dailymotion"] + "?autoPlay=1&playerapiid=" + x.guid + "&enableApi=1";
	var color_should = "https://www.dailymotion.com/swf/" + vids["dailymotion"] + "?autoPlay=0&highlight=fff&foreground=fff&background=fff&playerapiid=" + x.guid + "&enableApi=1";

	equal(ap_url.url, ap_should, "Autoplay");
	equal(color_un_url.url, color_should, "Color");
	equal(color_pref_url.url, color_should, "Color, prefixed");
});

module("GetMediaId");
test("YouTube", function(){
	var x = $("#qunit-fixture").xmbd();
	var id = vids["youtube"];

	var url_formats = [
		{
			descr: "Short Format",
			url: "http://youtu.be/" + id
		},
		{
			descr: "iframe",
			url: "http://www.youtube.com/embed/" + id
		},
		{
			descr: "iframe-secure",
			url: "https://www.youtube.com/embed/" + id
		},
		{
			descr: "object",
			url: "http://www.youtube.com/v/" + id
		},
		{
			descr: "watch",
			url: "http://www.youtube.com/watch?v=" + id
		},
		{
			descr: "user",
			url: "http://www.youtube.com/user/Scobleizer#p/u/1/" + id
		},
		{
			descr: "screeningroom",
			url: "http://www.youtube.com/ytscreeningroom?v=" + id
		},
		{
			descr: "subdomain",
			url: "http://gdata.youtube.com/feeds/api/videos/" + id
		}
	];

	var result, url;
	for(var i = 0; i < url_formats.length; i++){
		result = x.getMediaId(url_formats[i].url);

		ok(result, url_formats[i].descr + " - Returns Object");
		if(result){
			equal(result.provider, "youtube", url_formats[i].descr + " - Recognizes Provider");
			equal(result.id, id, url_formats[i].descr + " - Recognizes ID");
		}
	}

	for(var i = 0; i < url_formats.length; i++){
		url = url_formats[i].url;
		url += (url.indexOf("?") === -1 ? "?" : "&") + "feature=youtu.be&autoplay=1";
		result = x.getMediaId(url);

		ok(result, url_formats[i].descr + " [paramed] - Returns Object");
		if(result){
			equal(result.provider, "youtube", url_formats[i].descr + " [paramed] - Recognizes Provider");
			equal(result.id, id, url_formats[i].descr + " [paramed] - Recognizes ID");
		}
	}
});

test("Vimeo", function(){
	var x = $("#qunit-fixture").xmbd();
	var id = vids["vimeo"];
	var url_formats = [
		{
			descr: "channel-hashed",
			url: "http://vimeo.com/channels/hd#" + id
		},
		{
			descr: "usual",
			url: "http://vimeo.com/" + id
		},
		{
			descr: "usual-secure",
			url: "https://vimeo.com/" + id
		},
		{
			descr: "groups",
			url: "http://vimeo.com/groups/brooklynbands/videos/" + id
		},
		{
			descr: "staffpicks",
			url: "http://vimeo.com/staffpicks#" + id
		},
		{
			descr: "embedded",
			url: "http://player.vimeo.com/video/" + id
		}
	];

	var result;
	for(var i = 0; i < url_formats.length; i++){
		result = x.getMediaId(url_formats[i].url);

		ok(result, url_formats[i].descr + " - Recognizes URL");
		if(result){
			equal(result.provider, "vimeo", url_formats[i].descr + " - Recognizes Provider");
			equal(result.id, id, url_formats[i].descr + " - Recognizes ID");
		}
	}
});

test("Dailymotion", function(){
	var x = $("#qunit-fixture").xmbd();
	var id = vids["dailymotion"];
	var url_formats = [
		{
			descr: "usual",
			url: "http://www.dailymotion.com/video/" + id
		},
		{
			descr: "usual-titled",
			url: "http://www.dailymotion.com/video/" + id + "_some-random-video-title"
		},
		{
			descr: "usual-secure",
			url: "https://www.dailymotion.com/video/" + id
		},
		{
			descr: "hub",
			url: "http://www.dailymotion.com/hub/" + id + "_Blarghblablabla"
		},
		{
			descr: "hub - hash-changed",
			url: "http://www.dailymotion.com/hub/x9q_Blablablargh#video=" + id
		},
		{
			descr: "embedded",
			url: "http://www.dailymotion.com/swf/" + id
		}
	];

	var result;
	for(var i = 0; i < url_formats.length; i++){
		result = x.getMediaId(url_formats[i].url);

		ok(result, url_formats[i].descr + " - Recognizes URL");
		if(result){
			equal(result.provider, "dailymotion", url_formats[i].descr + " - Recognizes Provider");
			equal(result.id, id, url_formats[i].descr + " - Recognizes ID");
		}
	}
});

module("General");
test("Embedding", function(){
	var x = $("#qunit-fixture").xmbd();

	/*x.embed("youtube", vids.youtube);
	ok(x.html().indexOf("object") !== -1, "Embedding SWFObjects");*/

	x.embed("vimeo", vids.vimeo);
	ok($("#qunit-fixture").html().indexOf("iframe") !== -1, "Embedding Iframes");
});

/*module("Callbacks & Actions (Vimeo)");

asyncTest("PlayerReady", function(){
	var x = $("#qunit-fixture").xmbd();

	x.on("playerReady", function(s){
		console.log(s);
		ok(true, "Called!");
		start();
	});
	x.embed("vimeo", vids.vimeo);
});

asyncTest("PlayerStateChange", function(){
	var x = $("#qunit-fixture").xmbd();

	x.on("playerStateChange", function(s){
		ok(true, "Called!");
		x.unbind("playerStateChange");
		start();
	});
	x.embed("vimeo", vids.vimeo);
});

asyncTest("vPlaying and action('play')", function(){
	var x = $("#qunit-fixture").xmbd();


	x.embed({
		provider: "vimeo",
		id: vids.vimeo,
		on: {
			playerReady: function(){
				x.action("play");
			},
			vPlaying: function(){
				ok(true, "Called!");
				start();
			}
		}
	});
});

asyncTest("vPaused and action('pause')", function(){
	var x = $("#qunit-fixture").xmbd();


	x.embed({
		provider: "vimeo",
		id: vids.vimeo,
		autoplay: true,
		on: {
			vPlaying: function(){
				x.action("pause");
			},
			vPaused: function(){
				ok(true, "Called!");
				start();
			}
		}
	});
});

asyncTest("action('stop')", function(){
	var x = $("#qunit-fixture").xmbd();


	x.embed({
		provider: "vimeo",
		id: vids.vimeo,
		autoplay: true,
		on: {
			playerStateChange: function(s){
				if(s === "vUnstarted" || s === "vEnded" || s === "vPaused"){
					ok(true, "Called!");
					start();
				}
			},
			vPlaying: function(){
				x.action("stop");
			}
		}
	});
});

asyncTest("action('toggle')", function(){
	var x = $("#qunit-fixture").xmbd();

	x.embed({
		provider: "vimeo",
		id: vids.vimeo,
		autoplay: true,
		on: {
			vPlaying: function(){
				equal(x.action("toggle"), "pause", "Toggle pauses");
				x.action("toggle");
			},
			vPaused: function(){
				ok(true, "Toggle paused");
				start();
			}
		}
	});
});*/
