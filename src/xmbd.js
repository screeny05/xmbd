// Changelog v0.3.0:
// * unbind-docs
// * retrieve old xmbd-instances
// * add docs for getInfo()
// * forceSecure

/*! jQuery xmbd - v0.2.2 - 2014-04-20
 * https://github.com/screeny05/xmbd
 * Copyright (c) 2014 Sebastian Langer
 * MIT-Licensed */

;(function($){
  "use strict";


  // Our constructor-function
  var Xmbd = function(element){
    var self = this;

    self.element = element;
    self.$element = $(element);

    var forceSecure = true;

    // Always be sure to update these variables!
    self.current = {
      state: -1,
      provider: "",
      id: ""
    };

    // And be sure to never change these.
    // Except you want to rename one, but be sure
    // that there will be no one left behind.
    var availableStates = {
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
    self.guid = "xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx".replace(/[xy]/g,function(b){var a=16*Math.random()|0;return("x"==b?a:a&3|8).toString(16);});

    /*
    * Small Library for triggering Events
    * *****
    * To trigger one, either use `self.trigger` or the more convenient
    * `self.triggerStateChange` for StateChanges
    */
    var events = {};
    self.on = function(e, fn){
      if(!events.hasOwnProperty(e)){
        events[e] = [];
      }
      events[e].push(fn);
    };
    self.unbind = function(e){
      // if `e` is a function iterate over all events and bound functions
      // and remove the function the user wants to get removed
      if(typeof e === "function"){
        $.each(events, function(eventName, boundFunctions){
          for (var i = 0; i < boundFunctions.length; i++) {
            if(boundFunctions[i] === e){
              events.splice(i, 1);
            }
          }
        });
      } else if(events.hasOwnProperty(e)){
        delete events[e];
      }
    };
    self.trigger = function(e, d){
      if(events.hasOwnProperty(e)){
        $(events[e]).each(function(i, e){
          e.call(self, d);
        });
      }
    };
    self.clearEvents = function(){
      events = {};
    };


    /*
    * Media Provider Library
    * Providers need:
    * - iframe:bool true = url is an iframe, not a swf
    * - getId(url:string) - turns a full url into the video-id
    * - getUrl(id:string, options:object) - turns a video-id with given options into a embeddable url
    * - getInfo(id:string, fn:function) - returns available info about an item {name, provider, id, duration, available}
    * - state(s:var) - turns the state of the player into a yt-api-compatible state-number
    * - play, pause, stop, cue - should explain themselves
    */
    var providerYoutube = {
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
          "autoplay=" + (+(options.autoplay || false)),
          "autohide="   + (options.autohide || false ? "1" : "2"),
          "loop="     + (options.loop || false ? "1&playlist=" + id : "0"),
          "theme="    + (options.theme || "dark"),
          "origin="   + encodeURIComponent(window.location.origin),
          "playerapiid="  + self.guid,
          "enablejsapi=1",
          "version=3",
          "rel=0"
        ].join("&");
        
        // Yeah, I hear you saying:
        // > string concatenation like this is not the fastest way, just use the +-operator!
        // No, I won't. it's just more convenient imho. (more info: http://bit.ly/1cOocNZ)
        return (forceSecure ? "https:" : "") + "//www.youtube.com/v/" + id + "?" + params;
      },
      getInfo: function(id, fn){
        $.getJSON((forceSecure ? "https:" : "") + "//gdata.youtube.com/feeds/api/videos/" + id + "?alt=json-in-script&callback=?", function(data){
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

          // check if there is an embedable video
          $.each(i.media$group.media$content, function(i, item){
            if(item.yt$format === 5){
              r.duration = item.duration;
              r.available = true;
            }
          });

          // yt:state docs:
          // https://developers.google.com/youtube/2.0/reference?hl=de&csw=1#youtube_data_api_tag_yt:state
          // "Video entries that contain a <yt:state> tag are not playable."
          if(i.app$control && i.app$control.yt$state){
            r.available = false;
          }

          return fn(null, r);
        });
      },
      state: function(s){
        // If the youtube-numbered-state is in the list of available states
        // emit it. else return whatever status it may be.
        if(availableStates.hasOwnProperty(s)){
          return availableStates[s];
        } else {
          return s;
        }
      },
      // Just some proxy-functions
      play: function(){
        self.player.playVideo();
      },
      pause: function(){
        self.player.pauseVideo();
      },
      stop: function(){
        self.player.stopVideo();
      },
      cue: function(time){
        self.player.seekTo(time, true);
      }
    };

    var providerVimeo = {
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
          "?autoplay="  + (+(options.autoplay || false)),
          "byline="   + (+!(options.autohide || false)),
          "portrait="   + (+!(options.autohide || false)),
          "color="    + (options.color || "00adef").replace("#", ""),
          "loop="     + (+(options.loop || false)),
          "player_id="  + self.guid,
          "api=1"
        ].join("&");
        return (forceSecure ? "https:" : "") + "//player.vimeo.com/video/" + id + params;
      },
      getInfo: function(id, fn){
        $.ajax({
          url: (forceSecure ? "https:" : "") + "//www.vimeo.com/api/v2/video/" + id + ".json?callback=?",
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
        var st = availableStates;
        switch(s){
          case "finish":      return st[0];
          case "play":      return st[1];
          case "pause":     return st[2];
          case "loadProgress":  return st[3];
          case "seek":      return st[5];
          case "ready":     return st[9];
          default:        return s;
        }
      },
      post: function(method, value){
        // vimeo uses a different kind of API than YouTube
        // because it uses an Iframe and EventListeners
        // so we have to "post" messages to the iframe
        // see: http://developer.vimeo.com/player/js-api#universal-with-postmessage
        
        value = value || true;
        var p = $("#" + self.guid);
        
        // NEVER forget to include the protocol!
        // That's because we use protocol-relative urls.
        // see: http://www.paulirish.com/2010/the-protocol-relative-url/
        var url = window.location.protocol + p.attr("src").split("?")[0];
        p[0].contentWindow.postMessage(JSON.stringify({ method: method, value: value }), url);
      },
      play: function(){
        self.provider.vimeo.post("play");
      },
      pause: function(){
        self.provider.vimeo.post("pause");
      },
      stop: function(){
        self.provider.vimeo.post("unload");
      },
      cue: function(time){
        self.provider.vimeo.post("seekTo", time);
      }
    };

    var providerDailymotion = {
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
            "playerapiid=" + self.guid,
            "enableApi=1"
          ].join("&").replace("&highlight=&foreground=&background=", "");
          return (forceSecure ? "https:" : "") + "//www.dailymotion.com/swf/" + id + params;
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
          self.player.playVideo();
        },
        pause: function(){
          self.player.pauseVideo();
        },
        stop: function(){
          self.player.stopVideo();
        },
        cue: function(time){
          self.player.seekTo(time);
        }
    };

    self.provider = {};
    self.provider.youtube       = providerYoutube;
    self.provider.vimeo         = providerVimeo;
    self.provider.dailymotion   = providerDailymotion;

    // Abstracted Function to provide easy access to all
    // available media-providers.
    // Executes the getUrl()-method of the given provider or returns an error.
    self.getMediaUrl = function(prov, id, options){
      if(!self.provider.hasOwnProperty(prov)){
        self.trigger("error", "Provider not supported");
      }
      return {
        url: self.provider[prov].getUrl(id, options),
        iframe: self.provider[prov].iframe
      };
    };

    // Abstracted Function (see self.getMediaUrl)
    // Executes the getId()-method of each provider to test
    // if the url is a valid url of the current provider
    // and to return the media-id and iframe-property
    self.getMediaId = function(url){
      for(var provider in self.provider){
        if(self.provider.hasOwnProperty(provider)){
          var regex = self.provider[provider].getId(url);
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

    self.getMediaInfo = function(prov, id, fn){
      if(!self.provider.hasOwnProperty(prov)){
        self.trigger("error", "Provider not supported");
        return fn(true);
      }
      return self.provider[prov].getInfo(id, fn);
    };
    
    // Abstracted Function (see self.getMediaUrl)
    // if the provider offers a method such as `play`
    // execute it. else check if the user wants to
    // toggle (play on paused, pause on playing)
    // if neither is the case, throw an error.
    self.action = function(s){
      if(self.provider[self.current.provider].hasOwnProperty(s)){
        return self.provider[self.current.provider][s].apply(self, Array.prototype.slice.call(arguments, 1));
      } else if(s === "toggle"){
        if(self.current.state !== "vPlaying"){
          self.action("play");
          return "play";
        } else {
          self.action("pause");
          return "pause";
        }
      } else {
        self.trigger("error", "No such method: '" + s + "'");
      }
    };


    // Easy-Access function to embed media.
    // Look at the documentation for how to use.
    // Look at the comments for how to modify.
    self.embed = function(prov, id, options){
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
            self.on(key, options.on[key]);
          }
        }
      }
      
      // retrieve embed url and iframe-bool from our abstracted method.
      var embedObj = self.getMediaUrl(prov, id, options);
      
      // be sure to update these!
      self.current.provider = prov;
      self.current.id = id;
      
      // if there already is an embedded object, delete it
      // so we don't have two instances.
      if($("#" + self.guid).length > 0){
        $("#" + self.guid).remove();
      }
      // if there was already a player, send a vUnstarted event
      if(self.player){
        self.triggerStateChange(availableStates["-1"]);
      }
      // embed the object according to it's iframe-attribute
      if(!embedObj.iframe){
        self.embedSWF(embedObj.url);
      } else {
        self.embedIframe(embedObj.url);
      }
    };
    
    self.embedIframe = function(url){
      self.$element.html("<iframe src='" + url + "' id='" + self.guid + "' width='100%' height='100%' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>");
    };
    
    self.embedSWF = function(url){
      self.$element.html("<div id='" + self.guid + "'></div>");
      swfobject.embedSWF(url, self.guid, "100%", "100%", "8", null, null, {
        allowScriptAccess: "always",
        allowFullScreen: "true"
      }, {
        id: self.guid
      }, function(e){
        // throw an error if we had no success embedding the swfobject.
        if(!e.success){
          self.trigger("error", "Unable to embed SWF");
        }
      });
    };
    
    // Updates the State and throws necessary Events.
    self.triggerStateChange = function(s){
      self.current.state = s;
      self.trigger(s);
      self.trigger("playerStateChange", s);
    };
    
    // Youtube-Compatible Media-Providers use this.
    // i.e: YouTube, DailyMotion
    window["onytcstatechange_" + self.guid] = function(s){
      // parse the state into a string.
      s = self.provider.youtube.state(s);
      // if this is the inital throw of this event
      // change the self.player property, so we can
      // execute player-specific methods like play & pause.
      if(s === "playerReady"){
        self.player = document.getElementById(self.guid);
      }

      self.triggerStateChange(s);
    };
    // Vimeo stateChange-Handler
    window["onvimeostatechange_" + self.guid] = function(s){
      s = self.provider.vimeo.state(s);
      self.triggerStateChange(s);
      
      // if this is the inital throw of this event
      // add eventListeners for all necessary events.
      // TODO: are Errors also appended?
      if(s === "playerReady"){
        // set self.player to a truthy value
        // to enable the vUnstarted-event on detachment
        self.player = "vimeo";
        $(["pause", "finish", "play"]).each(function(i, e){
          self.provider.vimeo.post("addEventListener", e);
        });
      }
    };
  };

  $.fn.xmbd = function(){
    var pluginData = $(this).data("plugin_xmbd");
    if(!pluginData){
      pluginData = new Xmbd(this);
      $(this).data("plugin_xmbd", pluginData);
    }

    return pluginData;
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
