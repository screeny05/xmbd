# ![xmbd.](http://i.imgur.com/BWwq2iO.png "xmbd.") [![Build Status](https://travis-ci.org/screeny05/xmbd.png?branch=master)](https://travis-ci.org/screeny05/xmbd) [![Dependency Status](https://gemnasium.com/screeny05/xmbd.png)](https://gemnasium.com/screeny05/xmbd)


xmbd is a jQuery-plugin which gives you the ability to embed media from several provider on your website.

xmbd provides different events and methods for different provider under one simple interface! 

It's as simple as `$('#someId').xmbd.embed('vimeo', '75320274');` to include a video on your page.

**Note:** Be sure to include [swfobject](https://code.google.com/p/swfobject/) to enable embedding of flash-objects.


## How-To:
1. Create a xmbd-object

   ```javascript
   var x = $('#someid').xmbd();
   ```
2. Embed a Media-Object (with some options)

   ```javascript
   x.embed('vimeo', '75320274', {
     autoplay: true
   });
   ```
3. Add Event Listeners

   ```javascript
   x.on('playerReady', function(){
     console.log('Player loaded successfully');
   });
   
   x.on('vEnded', function(){
     console.log('Video Finished');
   });
   
   x.on('vPause', function(){
     console.log('Someone paused this video!');
   });
   ```
4. Invoke some Methods

   ```javascript
   $('#pause').click(function(){
     x.action('pause');
   });
   
   $('#cue').click(function(){
     // Cues the video to 20secs
     x.action('cue', 20);
   });
   ```
5. Do Whatever you want!

## [Examples can be found here](http://screeny05.github.io/xmbd/examples.html)

## Available Methods (Public jQuery Methods)
* `embed`: can be invoked the way you like it!
   
   For options see [Available Embed Options](#available-embed-options) below.

   #### With three parameters (3rd one optional)
   ```javascript
   x.embed(provider, id, options);

   // example:
   x.embed('youtube', 'xxxxxxxxxx', {
     autoplay: true,
     autohide: true,
     theme: 'light'
   });
   ```

   #### With one parameter (object-style):
   ```javascript
   x.embed(mediaObject);

   // example:
   x.embed({
     provider: 'youtube',
     id: 'xxxxxxxxx',
     autoplay: true,
     autohide: true
   });
   ```
   
   #### Note: You can also place event-handler inside the options:
   **They won't be removed when you're embeding another media-item. so take care!**
   
   ```javascript
   x.embed('youtube', 'xxxxxxxxxx', {
     autoplay: true,
     on: {
       vEnded: function(){
         alert("Media Item ended");
       }
     }
   });
   ```
   
   *or Object-Style:*
   ```javascript
   x.embed({
     provider: 'youtube',
     id: 'xxxxxxxxxx',
     autoplay: true,
     on: {
       vEnded: function(){
         alert("Media Item ended");
       }
     }
   });
   ```
   
   **Returns:** Nothing  
   **Summary:** Replaces the jQuery-selected-dom-element with an embedded media-object.
   
   
* `getMediaUrl`: call it like `x.getMediaUrl(provider:string, id:string, options:object);`  
   **Returns:** a fully-featured and embed-ready id-object:

   ```javascript
   {
     url: '//youtube.com/v/xxxxxxxxxx?autoplay=1',
     iframe: false
   }
   ```
   The `iframe` tells you whether you have to embed the url as iframe or as swfobject.  
   **Summary:** have a look at the 3-parameter-style invokation of the embed method.
   
   
* `getMediaId`: call it like `x.getMediaId(url:string)`  
   **Returns:** the media-id and provider of the given url as object:

   ```javascript
   {
     provider: 'youtube',
     id: 'xxxxxxxxx'
   }
   ```
   **Summary:** This method should work on every known ulr-form of every provider. But if yours is not supported, open an Issue!

   Works like a charm with:
   * `http://youtu.be/xxxxxxxxxxx`
   * `http://www.youtube.com/watch?v=xxxxxxxxxxx`
   * `http://vimeo.com/channels/hd#00000000`
   * `http://player.vimeo.com/video/00000000`
   * `http://www.dailymotion.com/hub/x9q_Blablablargh#video=2312`

* `action`: Executes an Action on the Player (see [the list below](#available-actions-for-use-with-xaction) for available Actions)

## Available Objects:
You can access the current state of the player through `x.current`.

It contains three different properties:

```javascript
current = {
  state: 'vPlaying', // see Available Events for info to the states
  provider: 'youtube',
  id: 'xxxxxxxxx'
}
```

## Available Events:
* `vUnstarted`: No Video loaded
* `vEnded`: Video Finished Playing (like ending, huh?!)
* `vPlaying`: Video has been started to play
* `vPaused`: Someone or Something has paused the Video
* `vBuffering`: As it names says. The Video is buffering
* `vCued`: The Video has been cued. like seeked but in another word.
* `playerReady`: The Player is ready for some action!
* `playerStateChange`: There has been a stateChange. This event is like all *v-prefixed-events* but you don't have to subscribe to each just to get changes.
* `error`: An error event. *Needs some more work*

**Note:** To unbind from an Event, use `x.unbind('playerStateChange')`. This removes **ALL** Event-Handlers of the given event. All.

## Available Actions (for use with `x.action("*")`)
* `play`: Plays the item (who would've known?)
* `pause`: Eyup, this pauses the item
* `toggle`: like play and pause combined but more convenient
* `stop`: Stops the Video/Whatever. **Warning:** May not work on every object. Falls back to a simple pause if needed.
* `cue`: Cues to a given second somewhere in the objects timeline. See above for a usage sample (needs a second param: *time*)

## Available Embed-Options:
This is a list of available options for embedding a media-object.  
See the footnotes for further details.

Param        | Vimeo | YouTube | DailyMotion
-------------|:-----:|:-------:|:----------:
`autoplay`   | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
`loop`       | :heavy_check_mark: | :heavy_check_mark: |
`autohide`   | :heavy_check_mark: | :heavy_check_mark:
`theme`      || :heavy_check_mark:
`color`      | :heavy_check_mark:
`highlight`  ||| :heavy_check_mark:
`foreground` ||| :heavy_check_mark:
`background` ||| :heavy_check_mark:

1. Use colors for `foreground` or `color` like `00adef` (Or `#00ADEF` if you're more comfortable with this)
2. Autohide under Vimeo just hides [byline and portrait](http://developer.vimeo.com/player/embedding#universal-parameters)
3. Autohide under YouTube uses autohide=[2](https://developers.google.com/youtube/player_parameters#autohide) *not 1* (Refer to the manual for differences)
4. Available YouTube-Themes: `dark` and `light`

## Available Media-Provider:

* Vimeo
* YouTube
* DailyMotion

**Soon to be supported:**

* Spotify
* SoundCloud
* MixCloud
* Grooveshark
* Last.fm
* Ustream
* Vevo
* Twitch.tv
* Justin.tv
* Vine
* *Yours!*

## Building & Testing

1. Get the source-code
2. Get the Grunt-CLI `npm install grunt-cli`
3. Do some testing `npm test`
