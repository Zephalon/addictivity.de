/*!
 * Image Downsampler v1.0.1
 * <https://github.com/Zephalon/ImageDownsampler>
 *  
 * Copyright (c) 2014, Fabian Prinz-Arnold <mail@addictivity.com>
 * 
 * Distributed under the MIT license.
 * All rights reserved.
 */

(function(root, factory) {
   if (typeof exports === "object" && exports) {
      factory(exports); // CommonJS
   } else {
      var image_downsampler = {};
      factory(image_downsampler);
      if (typeof define === "function" && define.amd) {
         define(image_downsampler); // AMD
      } else {
         root.ImageDownsampler = image_downsampler; // <script>
      }
   }
}(this, function(image_downsampler) {
   // defaults
   var defaults = {
      samples_x: 10, // number of samples in width
      samples_y: 10, // number of samples in height
      accuracy: 5, // sample every * pixel for better performance
      bleed: 10, // distance to image border to avoid faulty analysing
      async: false // set to true and provide a callback
   };
   var debug = false; // debug mode

   /**
    * Execute Downsampling (aka ImageDownsampler.run)
    * 
    * Validate parameters and fetch data sync/async
    * 
    * @param {image} image | {object} imagedata
    * @param {object} settings
    * @param {function} callback
    */
   var executeDownsampling = function(image, settings, callback) {
      if (image instanceof HTMLImageElement || typeof image === 'object') {
         // setup
         if (typeof settings !== 'object') {
            settings = defaults;
         } else {
            settings = mergeOptions(defaults, settings);
         }

         if (settings.async && typeof callback === 'function') {
            // execute asynchronous
            log('execute asynchronous', 'executeDownsampling');
            setTimeout(function() {
               fetchData(image, settings, callback);
            }, 0);
         } else if (!settings.async) {
            // execute synchronous
            log('execute synchronous', 'executeDownsampling');
            return fetchData(image, settings);
         } else {
            log('set to async, but no callback provided', 'executeDownsampling');
            return false;
         }
      } else {
         log('invalid image', 'executeDownsampling');
         return false;
      }
   };

   /**
    * Fetch Data
    * 
    * This function is called asyncronous if option is set
    * 
    * @param {image} image | {object} imagedata
    * @param {object} settings
    * @param {type} callback
    * @returns {undefined}
    */
   var fetchData = function(image, settings, callback) {
      var imagedata, samples;

      // get image data
      if (image instanceof HTMLImageElement) {
         imagedata = getImagedata(image); // image provided, get imagedata
      } else {
         imagedata = image; // imagedata already provided
      }

      samples = analyseImagedata(imagedata.data, imagedata.width, imagedata.height, settings);

      // run callback if asynchronous
      if (callback !== undefined) {
         callback(samples);
      } else {
         return samples;
      }
   };

   /**
    * Attach Canvas & Load Image
    * 
    * @param {image} image
    */
   var getImagedata = function(image) {
      if (image instanceof HTMLImageElement) {
         var canvas = document.createElement('canvas');
         var context = canvas.getContext && canvas.getContext('2d');
         var height = canvas.height = image.naturalHeight || image.offsetHeight || image.height;
         var width = canvas.width = image.naturalWidth || image.offsetWidth || image.width;
         // draw image
         try {
            context.drawImage(image, 0, 0);
         } catch (e) {
            log('no image found. loaded?', 'getImagedata');
            return false;
         }

         // retrieve imagedata
         try {
            var data = context.getImageData(0, 0, width, height);
         } catch (e) {
            log('security error: wrong domain', 'getImagedata');
            return false;
         }
         log('imagedata loaded ' + data.width + 'x' + data.height, 'getImagedata');

         return data;
      } else {
         log('no image found', 'getImagedata');
         return false;
      }
   };

   /**
    * Analyse Imagedata
    * 
    * @param {array} data
    * @param {integer} width
    * @param {integer} height
    * @param {object} settings
    * @returns {Array}
    */
   var analyseImagedata = function(data, width, height, settings) {
      log('analysing ' + data.length + ' subpixel', 'analyseImagedata');
      // create sample array [x][y]
      var samples = [];
      for (var x = 0; x < settings.samples_x; x++) {
         samples[x] = [];
         for (var y = 0; y < settings.samples_y; y++) {
            samples[x][y] = {r: 0, g: 0, b: 0};
         }
      }

      var pixel_per_samples = {
         x: Math.floor((width - 2 * settings.bleed) / settings.samples_x),
         y: Math.floor((height - 2 * settings.bleed) / settings.samples_y)
      };

      log('accuracy ' + settings.accuracy + ', pixel per sample: ' + Math.ceil(pixel_per_samples.x / settings.accuracy) + 'x' + Math.ceil(pixel_per_samples.y / settings.accuracy), 'analyseImagedata');

      // break image data into blocks
      for (var x = 0; x < settings.samples_x; x++) {
         for (var y = 0; y < settings.samples_y; y++) {
            // start point (sub-pixel)
            var start_x = x * pixel_per_samples.x;
            var start_y = y * pixel_per_samples.y;
            // select each pixel
            var pixel_count = 0;
            var rgb = {r: 0, g: 0, b: 0};
            for (var tx = 0; tx < pixel_per_samples.x; tx += settings.accuracy) {
               for (var ty = 0; ty < pixel_per_samples.y; ty += settings.accuracy) {
                  var position = (settings.bleed + start_x + tx + ((settings.bleed + start_y + ty) * width)) * 4; // multiply by 4, each pixel has 3 subpixel

                  rgb.r += data[position];
                  rgb.g += data[position + 1];
                  rgb.b += data[position + 2];
                  pixel_count++;
               }
            }

            // save average value
            samples[x][y] = {
               r: ~~(rgb.r / pixel_count),
               g: ~~(rgb.g / pixel_count),
               b: ~~(rgb.b / pixel_count)
            };
         }
      }
      return samples;
   };

   /**
    * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
    * http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
    * 
    * @param {object} obj1
    * @param {object} obj2
    */
   var mergeOptions = function(obj1, obj2) {
      var obj3 = {};
      for (var attrname in obj1) {
         obj3[attrname] = obj1[attrname];
      }
      for (var attrname in obj2) {
         obj3[attrname] = obj2[attrname];
      }
      return obj3;
   };

   /**
    * Debug Log
    * 
    * @param {string} msg
    * @param {string} location
    */
   var log = function(msg, location) {
      if (debug) {
         if (location === undefined) {
            location = 'n/a';
         }
         console.log('[ImageDownsampler] ' + msg + ' @ ' + location);
      }
   };

   // expose functions
   image_downsampler.run = executeDownsampling;
   image_downsampler.get = getImagedata;
}));