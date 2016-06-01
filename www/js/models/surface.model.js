/*
 * Surface Model
 * 
 * @type    AMD Model
 * @autor   Fabian Prinz-Arnold
 */

define([
   'jquery',
   'lodash',
   'backbone',
   'json!data/settings.json'
], function($, _, Backbone, settings) {
   /**
    * Object
    */
   var SurfaceModel = Backbone.Model.extend({
      defaults: {
         samples: [],
         radius: settings.surface.tile_size * 0.5,
         w: Math.ceil((2 * Math.sqrt(3) * settings.surface.tile_size) * 0.5) - 2,
         h: Math.ceil((3 * settings.surface.tile_size) * 0.5) - 2,
         count_x: 0,
         count_y: 0,
         tiles_total: 0
      },
      initialize: function() {
         _.bindAll(this, 'setDimensions');
         _.bindAll(this, 'setDefaultSamples');

         this.setDimensions();
         this.setDefaultSamples();
      },
      setDimensions: function() {
         this.set('count_x', Math.ceil($(window).width() / this.get('w')) * 2 + 2);
         this.set('count_y', Math.ceil($(window).height() / this.get('h')));
         this.set('tiles_total', this.get('count_x') + this.get('count_y'));
      },
      setDefaultSamples: function() {
         var samples = [];
         for (var x = 0; x < this.get('count_x'); x++) {
            samples[x] = [];
            for (var y = 0; y < this.get('count_y'); y++) {
               samples[x][y] = {};
               samples[x][y].color = [0, 0, 0];
               samples[x][y].saturation = 0;
               samples[x][y].lightness = Math.random() * 0.1;
            }
         }

         this.set('samples', samples);
      }
   });
   return SurfaceModel;
});

