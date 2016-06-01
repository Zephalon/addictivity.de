/*
 * Surface View
 * 
 * @type    AMD View
 * @autor   Fabian Prinz-Arnold
 */

define([
   'jquery',
   'lodash',
   'backbone',
   'paper',
   'json!data/settings.json'
], function($, _, Backbone, Paper, settings) {
   /**
    * Object
    */
   var SurfaceView = Backbone.View.extend({
      el: '#stage',
      events: {},
      options: {},
      initialize: function(options) {
         _.bindAll(this, 'change');
         _.bindAll(this, 'render');

         this.model.on('change:samples', this.change, this);

         // setup canvas
         var canvas = document.getElementById('canvas');
         canvas.width = $(window).width();
         canvas.height = $(window).height();
         Paper.setup(canvas);

         // vars
         this.count = 0;
         this.triangles = [];
         this.triangles_flat = [];

         var samples = this.model.get('samples');

         // generate grid
         for (var y = 0; y < this.model.get('count_y'); y++) {
            this.triangles.push([]);

            for (var x = 0; x < this.model.get('count_x'); x++) {
               // calculate center
               var center = new Paper.Point(
                       (this.model.get('w') * x * 0.5) - (this.model.get('w') * 0.5 * (y % 2)),
                       this.model.get('h') * y + settings.surface.tile_size
                       );

               // create triangle (position, corners, size)
               var triangle = new Paper.Path.RegularPolygon(center, 3, settings.surface.tile_size);

               // setup new triangle
               triangle.rotate(180 * (x % 2)); // zick zack!
               triangle.fillColor = samples[x][y].color;
               triangle.fillColor.saturation = samples[x][y].saturation;
               triangle.fillColor.lightness = samples[x][y].lightness;

               var distance_tl = (1 / this.model.get('count_y')) * y + (1 / this.model.get('count_x')) * x;
               triangle.variation = (Math.random() + distance_tl * 2) * 0.2;
               triangle.x = x;
               triangle.y = y;

               this.triangles[y].push(triangle);
               this.triangles_flat.push(triangle);
            }
         }

         // Draw the view now:
         Paper.view.draw();
      },
      change: function() {
         if (this.model.get('samples') !== undefined) {
            this.samples = this.model.get('samples'); // cache
            this.triangles_flat_temp = _.clone(this.triangles_flat);
            this.count = 0; // reset
            this.render();
         }
      },
      render: function() {
         this.count++;

         if (this.count % 5 === 0) {
            var progress = (1 / settings.surface.change_duration) * this.count;

            for (var i = 0; i < this.triangles_flat_temp.length; i++) {
               var triangle = this.triangles_flat_temp[i];
               if (progress >= triangle.variation) {
                  triangle.fillColor = this.samples[triangle.x][triangle.y].color;
                  triangle.fillColor.saturation = this.samples[triangle.x][triangle.y].saturation;
                  triangle.fillColor.lightness = this.samples[triangle.x][triangle.y].lightness;
                  this.triangles_flat_temp.splice(i, 1);
               }
            }
            _.compact(this.triangles_flat_temp);

            /*for (var y = 0; y < this.model.get('count_y'); y++) {
             for (var x = 0; x < this.model.get('count_x'); x++) {
             var triangle = this.triangles[y][x];
             if (progress >= triangle.variation) {
             triangle.fillColor = this.samples[x][y].color;
             triangle.fillColor.saturation = this.samples[x][y].saturation;
             triangle.fillColor.lightness = this.samples[x][y].lightness;
             }
             }
             }*/

            paper.view.draw();
         }

         if (this.count < settings.surface.change_duration) {
            window.requestAnimationFrame(this.render);
         }
      }
   });

   return SurfaceView;
});