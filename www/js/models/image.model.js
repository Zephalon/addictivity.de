/*
 * Image Model
 * 
 * @type    AMD Model
 * @autor   Fabian Prinz-Arnold
 */

define([
   'jquery',
   'lodash',
   'backbone',
   'vendor/image-downsampler',
   'json!data/settings.json'
], function($, _, Backbone, ImageDownsampler, settings) {
   /**
    * Object
    */
   var ImageModel = Backbone.Model.extend({
      defaults: {
         type: "jpg",
         path: "/",
         preloaded: false,
         w: Math.ceil((2 * Math.sqrt(3) * settings.surface.tile_size) * 0.5) - 2,
         h: Math.ceil((3 * settings.surface.tile_size) * 0.5)
      },
      initialize: function() {
         _.bindAll(this, 'setPath');
         _.bindAll(this, 'loadImage');
         _.bindAll(this, 'setSamples');
         _.bindAll(this, 'convertRGB2HSL');

         this.set('count_x', Math.ceil(settings.w_width / this.get('w') + 1) * 2);
         this.set('count_y', Math.ceil(settings.w_height / this.get('h')) + 1);

         this.on('change:preloaded', this.loadImage, this);
         this.set('id', this.collection.length);
      },
      setPath: function() {
         // not pretty
         this.page = this.get('page');
         this.fan = this.page.model.get('fan');
         var page_slug = this.page.model.get('slug');
         var fan_slug = this.fan.model.get('slug');

         this.set('path', 'img/work/' + fan_slug + '/' + page_slug + '/' + page_slug + '_' + (this.get('id') + 1) + '.' + this.get('type'));
      },
      loadImage: function() {
         var _this = this;

         this.image = new Image();
         this.image.src = this.get('path');
         
         // run downsampler on image load
         this.image.onload = function() {
            ImageDownsampler.run(_this.image, {
               samples_x: _this.get('count_x'),
               samples_y: _this.get('count_y'),
               accuracy: settings.surface.accuracy,
               async: true
            }, _this.setSamples);
         };
      },
      /**
       * Set Async Data
       * 
       * @param {array} samples
       */
      setSamples: function(samples) {
         // transform array & hsv conversion
         for (var y = 0; y < this.get('count_y'); y++) {
            for (var x = 0; x < this.get('count_x'); x++) {
               samples[x][y].color = [
                  samples[x][y].r / 255,
                  samples[x][y].g / 255,
                  samples[x][y].b / 255
               ];
               var hsl = this.convertRGB2HSL(samples[x][y].color);
               samples[x][y].hue = hsl[0];
               samples[x][y].saturation = hsl[1];
               samples[x][y].lightness = hsl[2];
            }
         }

         this.set('samples', samples);
      },
      /**
       * Convert RGB value to HSL color space
       * 
       * @param {array} rgb
       * @returns {array}
       */
      convertRGB2HSL: function(rgb) {
         var result = [];
         var max = _.max(rgb);
         var min = _.min(rgb);

         // hue
         if (max === rgb[0]) {
            result[0] = 0.0 + 60.0 * (rgb[1] - rgb[2]);
            if (result[0] < 0.0) {
               result[0] += 360.0;
            }
         } else if (max === rgb[1]) {
            result[0] = 120.0 + 60.0 * (rgb[2] - rgb[0]);
         } else {
            result[0] = 240.0 + 60.0 * (rgb[0] - rgb[1]);
         }
         // saturation
         result[1] = max - min;
         // lightness
         result[2] = (rgb[0] + rgb[1] + rgb[2]) / 3;

         return result; // [h, s, l]
      }
   });

   return ImageModel;
});