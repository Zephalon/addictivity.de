/*!
 * jQuery loadImages [MOD]
 *
 * Copyright(c) 2012 Fabian Arnold <mail@addictivity.com>
 * Based on: http://www.roslindesign.com/2010/05/11/jquery-image-preloader-with-callback/
 *
 * http://addictivity.de
 *
 * Version: 1.2.0
 *
 */

(function( $ ){
   // cache needed for overagressive garbage collectors
   var cache = [];

   // images can either be an array of paths to images or a  single image
   $.loadImages = function (images, callback) {

      // if our first argument is an string, we convert it to an array
      if (typeof images == 'string') {
         images = [images];
      }

      var images_length = images.length;
      var loaded_counter = 0;

      for (var i = 0; i < images_length; i++) {
         var cache_image = new Image();
         // set the onload method before the src is called otherwise will fail to be called in IE
         cache_image.onload = function () {
            loaded_counter++;
            if (loaded_counter === images_length) {
               if ($.isFunction(callback)) {
                  callback();
               }
            }
         }
         cache_image.src = images[i];
         cache.push(cache_image);
      }
   }
})(jQuery)