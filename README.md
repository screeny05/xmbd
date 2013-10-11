# xmbd.

xmbd is a jQuery-plugin which gives you the ability to embed media from several provider on your website.

xmbd provides different events and methods for different provider under one simple interface! 

It's as simple as `$('#someId').xmbd.embed('vimeo', '75320274');` to include a video on your page.

*Sidenote:* Be sure to include [swfobject](https://code.google.com/p/swfobject/) to enable embedding of flash-objects.


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

## Available Events:
* `vUnstarted`: No Video loaded
* `vEnded`: Video Finished Playing (like ending, huh?!)
* `vPlaying`: Video has been started to play
* `vPaused`: Someone or Something has paused the Video
* `vBuffering`: As it names says. The Video is buffering
* `vCued`: The Video has been cued. like seeked but in another word.
* `playerReady`: The Player is ready for some action!
* `playerChange`: There has been a stateChange. This event is like all *v-prefixed-events* but you don't have to subscribe to each just to get changes. **Warning:** This is probalby not the final event-name. i might change it to something like.. `playerStateChange` or `hollyMollyawesomeness`
* `error`: Our Plain old error event

## Available Methods:
* `play`: Plays the item (who would've known?)
* `pause`: Eyup, this pauses the item
* `toggle`: like play and pause combined but more convenient
* `stop`: Stops the Video/Whatever. **Warning:** May not work on every object. Falls back to a simple pause if needed.
* `cue`: Cues to a given second somewhere in the objects timeline. See above for a usage sample (needs a second param=time)

## Available Embed-Options:
*Sidenote:* Some of these are not available on every provider so this is a list with those everyone has.

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

1. Use colors for `foreground` or `color` like `00adef` (Hex but without the #)
2. Autohide under Vimeo just hides [byline and portrait](http://developer.vimeo.com/player/embedding#universal-parameters)
3. Autohide under YouTube uses autohide=[2](https://developers.google.com/youtube/player_parameters#autohide) *not 1* (Refer to the manual for differences)
4. Available YouTube-Themes: `dark` and `light`

## Available Media-Provider:

* Vimeo
* YouTube
* DailyMotion

*Soon to be supported:*

* Spotify
* Facebook
* SoundCloud
* Ustream
* *Yours!*

