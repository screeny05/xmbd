/*! jQuery xmbd - v0.1 - 2013-10-10
 * https://github.com/screeny05/xmbd
 * Copyright (c) 2013 Sebastian Langer
 * MIT-Licensed */
;(function($){
	$.fn.xmbd = function(){
		var $plg = this;
		
		$plg.current = {
			state: -1,
			provider: "",
			id: ""
		};
		// Generate a GUID to use as the players id
		$plg.guid = $plg.guid="xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx".replace(/[xy]/g,function(b){var a=16*Math.random()|0;return("x"==b?a:a&3|8).toString(16)});
		
		/*
		*	Small Library for triggering Events
		*/
		var events = {};
		$plg.on = function(e, fn){
			if(!events.hasOwnProperty(e))
				events[e] = [];
			events[e].push(fn);
		};
		$plg.trigger = function(e, d){
			if(events.hasOwnProperty(e))
				$(events[e]).each(function(i, e){
					e(d);
				});
		};
		
		/*
		*	Media Provider Library
		*	Providers need:
		*	- regex(url) [turns a full url into the video-id]
		*	- url(id, options) [turns a video-id with given options into a embeddable url]
		*	- state(s) [turns the state from the player into a yt-api-compatible state-number]
		*	- play, pause, toggle, stop, cue [should explain themselves]
		*/
		$plg.provider = {
			youtube: {
				iframe: false,
				regex: function(url){
					var m = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
					if(!m)
						return false;
					else
						return m[1];
				},
				url: function(id, options){
					options = options || {};
					var params = [
						"?autoplay="	+ +(options.autoplay || false),
						"autohide="		+ (options.autohide || false ? "1" : "2"),
						"loop="			+ (options.loop || false ? "1&playlist=" + id : "0"),
						"theme="		+ (options.theme || "dark"),
						"origin="		+ encodeURIComponent(window.location.protocol + "//" + window.location.host),
						"playerapiid="	+ $plg.guid,
						"enablejsapi=1",
						"version=3",
						"rel=0"
					].join("&");
				
					return "//www.youtube.com/v/" + id + params;
				},
				play: function(){
					$plg.player.playVideo();
				},
				pause: function(){
					$plg.player.pauseVideo();
				},
				stop: function(){
					$plg.player.stopVideo();
				},
				cue: function(time){
					$plg.player.seekTo(time, true);
				},
				toggle: function(){
					if($plg.current.state == 1)
						$plg.action("pause");
					else
						$plg.action("play");
				}
			},
			vimeo: {
				iframe: true,
				regex: function(url){
					var m = url.match(/(?:player\.)?vimeo\.com\/(?:\w+\/)*(\d+)/i);
					if(!m)
						return false;
					else
						return m[1];
				},
				url: function(id, options){
					var params = [
						"?autoplay="	+ +(options.autoplay || false),
						"byline="		+ +(options.autohide || false),
						"portrait="		+ +(options.autohide || false),
						"color="		+ (options.color || "00adef"),
						"loop="			+ +(options.loop || false),
						"player_id="	+ $plg.guid,
						"api=1"
					].join("&");
					return "//player.vimeo.com/video/" + id + params;
				},
				state: function(s){
					switch(s){
						case "finish":			return 0;
						case "play":			return 1;
						case "pause":			return 2;
						case "loadProgress":	return 3;
						case "seek":			return 5;
						case "ready":			return 9;
						default:				return s;
					}
				},
				post: function(method, value){
					value = value || true;
					var p = $("#" + $plg.guid);
					var url = window.location.protocol + p.attr("src").split("?")[0];
					p[0].contentWindow.postMessage(JSON.stringify({ method: method, value: value }), url);
				},
				play: function(){
					$plg.provider.vimeo.post("play");
				},
				pause: function(){
					$plg.provider.vimeo.post("pause");
				},
				stop: function(){
					$plg.provider.vimeo.post("unload");
				},
				cue: function(time){
					$plg.provider.vimeo.post("seekTo", time);
				},
				toggle: function(){
					if($plg.current.state == 1)
						$plg.action("pause");
					else
						$plg.action("play");
				}
			},
			dailymotion: {
				iframe: false,
				regex: function(url){
					//Todo
				},
				url: function(id, options){
					var params = [
						"?autoPlay="	+ (options.autoplay || false),
						(options.highlight == false ? "" : "highlight="	+ options.highlight),
						(options.foreground == false ? "" : "foreground="	+ options.foreground),
						(options.background == false ? "" : "background="	+ options.background),
						"playerapiid="	+ $plg.guid,
						"enableApi=1"
					].join("&");
					return "//www.dailymotion.com/swf/" + id + params
				},
				play: function(){
					$plg.player.playVideo();
				},
				pause: function(){
					$plg.player.pauseVideo();
				},
				stop: function(){
					$plg.player.stopVideo();
				},
				cue: function(time){
					$plg.player.seekTo(time);
				},
				toggle: function(){
					if($plg.current.state == 1)
						$plg.action("pause");
					else
						$plg.action("play");
				}
			}
		};
		
		$plg.getProviderUrl = function(prov, id, options){
			if(!$plg.provider.hasOwnProperty(prov)){
				throw new Error("Provider not supported");
				$plg.trigger("error", "Provider not supported");
			}
			return {
				url: $plg.provider[prov].url(id, options),
				iframe: $plg.provider[prov].iframe
			};
		};
		
		$plg.embed = function(prov, id, options){
			if(typeof prov == "object" && typeof id == "undefined" && typeof options == "undefined"){
				if(prov.hasOwnProperty("options"))
					options = prov.options;
				if(prov.hasOwnProperty("on"))
					options.on = prov.on;
				id = prov.id;
				prov = prov.provider;
			}
			options = options || {};
			if(options.hasOwnProperty("on")){
				for(var key in options.on){
					if(options.on.hasOwnProperty(key)){
						$plg.on(key, options.on[key]);
					}
				}
			}
			
			var embedObj = $plg.getProviderUrl(prov, id, options);
			$plg.current.provider = prov;
			$plg.current.id = id;
			
			if($("#" + $plg.guid).length > 0)
				$("#" + $plg.guid).remove();
			
			if($plg.player)
				$plg.trigger("vUnstarted");
			
			if(!embedObj.iframe)
				$plg.embedSWF(embedObj.url);
			else
				$plg.embedIframe(embedObj.url);
		};
		
		$plg.embedIframe = function(url){
			$plg.append("<iframe src='" + url + "' id='" + $plg.guid + "' width='100%' height='100%' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>");
		};
		
		$plg.embedSWF = function(url){
			$plg.html("<div id='" + $plg.guid + "'></div>");

			swfobject.embedSWF(url, $plg.guid, "100%", "100%", "8", null, null, { allowScriptAccess: "always", allowFullScreen: "true" }, { id: $plg.guid }, function(e){
				if(!e.success){
					throw new Error("Unable to embed SWF");
					$plg.trigger("error", "Unable to embed SWF");
				}
			});
		};
		
		$plg.action = function(s){
			if($plg.provider[$plg.current.provider].hasOwnProperty(s))
				return $plg.provider[$plg.current.provider][s].apply(this, Array.prototype.slice.call(arguments, 1));
			throw new Error("No such method: " + s);
		};
		
		$plg.triggerStateChange = function(s){
			var t = $plg.trigger;
			t("playerChange", s);
			$plg.current.state = s;
			switch(s){
				case -1: t("vUnstarted"); break;
				case 0 : t("vEnded"); break;
				case 1 : t("vPlaying"); break;
				case 2 : t("vPaused"); break;
				case 3 : t("vBuffering"); break;
				case 5 : t("vCued"); break;
				case 9 : t("playerReady"); break;
				default: t("error", s);
			}
		};
		
		// Youtube-Compatible
		window["onytcstatechange_" + $plg.guid] = function(s){
			$plg.triggerStateChange(s);
			if(s == 9){
				$plg.player = document.getElementById($plg.guid);
			}
		};
		// Vimeo
		window["onvimeostatechange_" + $plg.guid] = function(s){
			s = $plg.provider.vimeo.state(s);
			$plg.triggerStateChange(s);
			if(s == 9){
				$(["pause", "finish", "play"]).each(function(i, e){
					$plg.provider.vimeo.post("addEventListener", e);
				});
			}
		};
		
		return $plg;
	}
}(jQuery));

// Youtube-Compatible-Provider
window.ytCompatibleReady = function(e){
	var player = document.getElementById(e);
	player.addEventListener("onStateChange", "onytcstatechange_" + e);
	player.addEventListener("onError", "onytcstatechange_" + e);
	window["onytcstatechange_" + e](9);
}

//Vimeo specific
window.onVimeoMessage = function(m){
	var data = JSON.parse(m.data);
	window["onvimeostatechange_" + data.player_id](data.event);
}
if(window.addEventListener)
	window.addEventListener('message', onVimeoMessage, false);
else
	window.attachEvent('onmessage', onVimeoMessage, false);

//Dailymotion specific
window.onDailymotionPlayerReady = window.ytCompatibleReady;
window.onYouTubePlayerReady = window.ytCompatibleReady;



