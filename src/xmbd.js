/*! jQuery xmbd - v0.1.2 - 2013-10-10
 * https://github.com/screeny05/xmbd
 * Copyright (c) 2013 Sebastian Langer
 * MIT-Licensed */

;(function($){
	"use strict";
	$.fn.xmbd = function(){
		var $plg = this;
		
		// Always be sure to update these variables!
		$plg.current = {
			state: -1,
			provider: "",
			id: ""
		};
		
		// And be sure to never change these.
		// Except you want to rename one, but be sure
		// that there will be no one left behind.
		$plg.availableStates = {
			"-1": "vUnstarted",
			0: "vEnded",
			1: "vPlaying",
			2: "vPaused",
			3: "vBuffering",
			5: "vCued",
			9: "playerReady",
		};
		
		// Generate a GUID to use as the players id.
		// This also ensures we always get the right events for our player.
		// Take a look at the very last lines of code
		// which add methods like `onYouTubePlayerReady` to the window object.
		$plg.guid = $plg.guid="xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx".replace(/[xy]/g,function(b){var a=16*Math.random()|0;return("x"==b?a:a&3|8).toString(16);});
		
		/*
		*	Small Library for triggering Events
		*	*****
		*	To trigger one, either use `$plg.trigger` or the more convenient
		*	`$plg.triggerStateChange` for StateChanges
		*/
		var events = {};
		$plg.on = function(e, fn){
			if(!events.hasOwnProperty(e)){
				events[e] = [];
			}
			events[e].push(fn);
		};
		$plg.unbind = function(e){
			if(events.hasOwnProperty(e)){
				delete events[e];
			}
		};
		$plg.trigger = function(e, d){
			if(events.hasOwnProperty(e)){
				$(events[e]).each(function(i, e){
					e(d);
				});
			}
		};
		$plg.clearEvents = function(){
			events = {};
		};
		
		/*
		*	Media Provider Library
		*	Providers need:
		*	- iframe:bool true = url is an iframe, not a swf
		*	- getId(url:string) - turns a full url into the video-id
		*	- getUrl(id:string, options:object) - turns a video-id with given options into a embeddable url
		*	- state(s:var) - turns the state of the player into a yt-api-compatible state-number
		*	- play, pause, stop, cue - should explain themselves
		*/
		$plg.provider = {
			youtube: {
				// we use YouTube's ActionScript-API
				iframe: false,
				getId: function(url){
					if(typeof url !== "string"){
						return false;
					}
					// Found this RegEx somewhere on SO; Maybe i can give credit to the creator when i find it again.
					var m = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
					if(!m){
						return false;
					} else {
						return m[1];
					}
				},
				getUrl: function(id, options){
					// Note: (+(true)) turns to to a number-type. i.e: 1.
					// JSHint-Compatible!
					// For a detailed explanation of parameters,
					// see: https://developers.google.com/youtube/player_parameters
					
					// be sure to have a options-object!
					options = options || {};
					var params = [
						"autoplay="	+ (+(options.autoplay || false)),
						"autohide="		+ (options.autohide || false ? "1" : "2"),
						"loop="			+ (options.loop || false ? "1&playlist=" + id : "0"),
						"theme="		+ (options.theme || "dark"),
						"origin="		+ encodeURIComponent(window.location.origin),
						"playerapiid="	+ $plg.guid,
						"enablejsapi=1",
						"version=3",
						"rel=0"
					].join("&");
					
					// Yeah, I hear you saying:
					// > string concatenation like this is not the fastest way, just use the +-operator!
					// No, I won't. it's just more convenient imho. (more info: http://bit.ly/1cOocNZ)
					return "//www.youtube.com/v/" + id + "?" + params;
				},
				getInfo: function(id, fn){
					$.getJSON("//gdata.youtube.com/feeds/api/videos/" + id + "?alt=json-in-script&format=5&callback=?", function(data){
						if(!data || !data.entry){
							return fn(true);
						}

						var i = data.entry;

						var r = {};
						r.name = i.title.$t;
						r.provider = "youtube";
						r.id = id;
						r.duration = -1;
						r.available = false;

						$.each(i.media$group.media$content, function(i, item){
							if(item.yt$format === 5){
								r.duration = item.duration;
								r.available = true;
							}
						});

						return fn(null, r);
					});
				},
				state: function(s){
					// If the youtube-numbered-state is in the list of available states
					// emit it. else return whatever status it may be.
					if($plg.availableStates.hasOwnProperty(s)){
						return $plg.availableStates[s];
					} else {
						return s;
					}
				},
				// Just some proxy-functions
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
				}
			},
			vimeo: {
				iframe: true,
				getId: function(url){
					var m = url.match(/vimeo\.com\/(?:.*#|.*\/videos\/|video\/)?([0-9]+)/i);
					if(!m){
						return false;
					} else {
						return m[1];
					}
				},
				getUrl: function(id, options){
					// For a detailed explanation of the parameters
					// see: http://developer.vimeo.com/player/embedding#universal-parameters
					options = options || {};
					var params = [
						"?autoplay="	+ (+(options.autoplay || false)),
						"byline="		+ (+!(options.autohide || false)),
						"portrait="		+ (+!(options.autohide || false)),
						"color="		+ (options.color || "00adef").replace("#", ""),
						"loop="			+ (+(options.loop || false)),
						"player_id="	+ $plg.guid,
						"api=1"
					].join("&");
					return "//player.vimeo.com/video/" + id + params;
				},
				getInfo: function(id, fn){
					$.ajax({
						url: "//www.vimeo.com/api/v2/video/" + id + ".json?callback=?",
						dataType: "jsonp",
						timeout: 3000,
						success: function(data) {
							/* jshint camelcase: false */
							if(!data || !data[0]){
								return fn(true);
							}
							fn(null, {
								name: data[0].title,
								provider: "vimeo",
								id: id,
								duration: data[0].duration,
								available: data[0].embed_privacy == "anywhere"
							});
						},
						error: function(){
							return fn(true);
						}
					});
				},
				state: function(s){
					var st = $plg.availableStates;
					switch(s){
						case "finish":			return st[0];
						case "play":			return st[1];
						case "pause":			return st[2];
						case "loadProgress":	return st[3];
						case "seek":			return st[5];
						case "ready":			return st[9];
						default:				return s;
					}
				},
				post: function(method, value){
					// vimeo uses a different kind of API than YouTube
					// because it uses an Iframe and EventListeners
					// so we have to "post" messages to the iframe
					// see: http://developer.vimeo.com/player/js-api#universal-with-postmessage
					
					value = value || true;
					var p = $("#" + $plg.guid);
					
					// NEVER forget to include the protocol!
					// That's because we use protocol-relative urls.
					// see: http://www.paulirish.com/2010/the-protocol-relative-url/
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
				}
			},
			dailymotion: {
				iframe: false,
				getId: function(url){
					// Dailymotion URLs may be a little weird.
					// if m[2] is not null we use this instead of m[1]
					// that's because the url may contain a video in the hashtag.
					// if there's no video-id in the hashtag we can safely use m[1] (the original id)
					var m = url.match(/dailymotion.com\/(?:(?:video|hub|swf)\/([^_]+))?[^#]*(?:#video=([^_&]+))?/i);
					if(!m){
						return false;
					} else {
						if(m[2]){
							return m[2];
						} else {
							return m[1];
						}
					}
				},
				getUrl: function(id, options){
					// For a detailed explanation of the params,
					// see: http://www.dailymotion.com/doc/api/player.html#parameters
					options = options || {};
					var params = [
						"?autoPlay="   + (+(options.autoplay || false)),
						"highlight="   + (options.highlight  || "").replace("#", ""),
						"foreground="  + (options.foreground || "").replace("#", ""),
						"background="  + (options.background || "").replace("#", ""),
						"playerapiid=" + $plg.guid,
						"enableApi=1"
					].join("&").replace("&highlight=&foreground=&background=", "");
					return "//www.dailymotion.com/swf/" + id + params;
				},
				getInfo: function(id, fn){
					$.getJSON("https://api.dailymotion.com/video/" + id + "?fields=title,duration,embed_url&callback=?", function(data) {
						/* jshint camelcase: false */
						if(!data || !data.embed_url){
							return fn(true);
						}
						fn(null, {
							name: data.title,
							provider: "dailymotion",
							id: id,
							duration: data.duration,
							available: !!data.embed_url
						});
					});
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
				}
			}
		};
		
		// Abstracted Function to provide easier access to all
		// available media-providers.
		// Executes the getUrl()-method of the given provider or returns an error.
		$plg.getMediaUrl = function(prov, id, options){
			if(!$plg.provider.hasOwnProperty(prov)){
				$plg.trigger("error", "Provider not supported");
				throw new Error("Provider not supported");
			}
			return {
				url: $plg.provider[prov].getUrl(id, options),
				iframe: $plg.provider[prov].iframe
			};
		};
		
		// Abstracted Function (see $plg.getMediaUrl)
		// Executes the getId()-method of each provider to test
		// if the url is a valid url of the current provider
		// and to return the media-id and iframe-property
		$plg.getMediaId = function(url){
			for(var provider in $plg.provider){
				if($plg.provider.hasOwnProperty(provider)){
					var regex = $plg.provider[provider].getId(url);
					if(regex){
						return {
							provider: provider,
							id: regex
						};
					}
				}
			}
			
			return false;
		};

		$plg.getMediaInfo = function(prov, id, fn){
			if(!$plg.provider.hasOwnProperty(prov)){
				$plg.trigger("error", "Provider not supported");
				return fn(true);
			}
			return $plg.provider[prov].getInfo(id, fn);
		};
		
		// Abstracted Function (see $plg.getMediaUrl)
		// if the provider offers a method such as `play`
		// execute it. else check if the user wants to
		// toggle (play on paused, pause on playing)
		// if neither is the case, throw an error.
		$plg.action = function(s){
			if($plg.provider[$plg.current.provider].hasOwnProperty(s)){
				return $plg.provider[$plg.current.provider][s].apply(this, Array.prototype.slice.call(arguments, 1));
			} else if(s === "toggle"){
				if($plg.current.state !== "vPlaying"){
					$plg.action("play");
					return "play";
				} else {
					$plg.action("pause");
					return "pause";
				}
			} else {
				throw new Error("No such method: " + s);
			}
		};
		
		// Easy-Access function to embed media.
		// Look at the documentation for how to use.
		// Look at the comments for how to modify.
		$plg.embed = function(prov, id, options){
			// if we use the object-style version, we have to
			// provide the right variables to the code.
			// i.e: prov from options, id from options.
			if(typeof prov == "object" && typeof id == "undefined" && typeof options == "undefined"){
				options = prov;
				id = options.id;
				prov = options.provider;
			}
			
			options = options || {};
			
			// Add all the event-handlers in the on-object.
			if(options.hasOwnProperty("on")){
				for(var key in options.on){
					if(options.on.hasOwnProperty(key)){
						$plg.on(key, options.on[key]);
					}
				}
			}
			
			// retrieve embed url and iframe-bool from our abstracted method.
			var embedObj = $plg.getMediaUrl(prov, id, options);
			
			// be sure to update these!
			$plg.current.provider = prov;
			$plg.current.id = id;
			
			// if there already is an embedded object, delete it
			// so we don't have two instances.
			if($("#" + $plg.guid).length > 0){
				$("#" + $plg.guid).remove();
			}
			// if there was already a player, send a vUnstarted event
			if($plg.player){
				$plg.triggerStateChange($plg.availableStates["-1"]);
			}
			// embed the object according to it's iframe-attribute
			if(!embedObj.iframe){
				$plg.embedSWF(embedObj.url);
			} else {
				$plg.embedIframe(embedObj.url);
			}
		};
		
		$plg.embedIframe = function(url){
			$plg.html("<iframe src='" + url + "' id='" + $plg.guid + "' width='100%' height='100%' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>");
		};
		
		$plg.embedSWF = function(url){
			$plg.html("<div id='" + $plg.guid + "'></div>");
			swfobject.embedSWF(url, $plg.guid, "100%", "100%", "8", null, null, {
				allowScriptAccess: "always",
				allowFullScreen: "true"
			}, {
				id: $plg.guid
			}, function(e){
				// throw an error if we had no success embedding the swfobject.
				if(!e.success){
					$plg.trigger("error", "Unable to embed SWF");
					throw new Error("Unable to embed SWF");
				}
			});
		};
		
		// Updates the State and throws necessary Events.
		$plg.triggerStateChange = function(s){
			$plg.current.state = s;
			$plg.trigger(s);
			$plg.trigger("playerStateChange", s);
		};
		
		// Youtube-Compatible Media-Providers use this.
		// i.e: YouTube, DailyMotion
		window["onytcstatechange_" + $plg.guid] = function(s){
			// parse the state into a string.
			s = $plg.provider.youtube.state(s);
			// if this is the inital throw of this event
			// change the $plg.player property, so we can
			// execute player-specific methods like play & pause.
			if(s === "playerReady"){
				$plg.player = document.getElementById($plg.guid);
			}

			$plg.triggerStateChange(s);
		};
		// Vimeo stateChange-Handler
		window["onvimeostatechange_" + $plg.guid] = function(s){
			s = $plg.provider.vimeo.state(s);
			$plg.triggerStateChange(s);
			
			// if this is the inital throw of this event
			// add eventListeners for all necessary events.
			// TODO: are Errors also appended?
			if(s === "playerReady"){
				// set $plg.player to a truthy value
				// to enable the vUnstarted-event on detachment
				$plg.player = "vimeo";
				$(["pause", "finish", "play"]).each(function(i, e){
					$plg.provider.vimeo.post("addEventListener", e);
				});
			}
		};
		
		return $plg;
	};
}(jQuery));

// Youtube-Compatible-Provider
window.ytCompatibleReady = function(e){
	"use strict";
	var player = document.getElementById(e);
	player.addEventListener("onStateChange", "onytcstatechange_" + e);
	player.addEventListener("onError", "onytcstatechange_" + e);
	window["onytcstatechange_" + e](9);
};

//Vimeo specific
window.onVimeoMessage = function(m){
	/* jshint camelcase: false */
	"use strict";
	var data = JSON.parse(m.data);
	window["onvimeostatechange_" + data.player_id](data.event);
};
// see Vimeo API-Docs for more info about this.
if(window.addEventListener){
	window.addEventListener("message", window.onVimeoMessage, false);
} else {
	window.attachEvent("onmessage", window.onVimeoMessage, false);
}

//Dailymotion specific
window.onDailymotionPlayerReady = window.ytCompatibleReady;
window.onYouTubePlayerReady = window.ytCompatibleReady;

// Use window.location.origin for youtube
// This is just a fix for Browsers which do
// not support this property. damn IE.
// See: http://tosbourn.com/2013/08/javascript/a-fix-for-window-location-origin-in-internet-explorer/
if (!window.location.origin) {
	window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port: "");
}







