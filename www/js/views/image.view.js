/*
 * Image View
 * 
 * @type    AMD View
 * @autor   Fabian Prinz-Arnold
 */

define([
   'jquery',
   'lodash',
   'backbone',
   'functions',
   'json!data/settings.json',
   'models/surface.model',
   'views/surface.view',
   'views/lightbox.view',
   'vendor/plugins/jquery.loadimages'
], function($, _, Backbone, functions, settings, SurfaceModel, SurfaceView, LightboxView) {
   /**
    * Object
    */
   var ImageView = Backbone.View.extend({
      // --- Vars ---
      className: 'image',
      events: {
         'click': 'showLightbox',
         'touchstart': 'showLightbox'
      },
      // --- Startup ---
      initialize: function(options) {
         this.options = options;

         _.bindAll(this, 'render');
         _.bindAll(this, 'toggleImage');
         _.bindAll(this, 'preloadImage');
         _.bindAll(this, 'resizeContainer');
         _.bindAll(this, 'changeSurface');

         this.model.on('change:preloaded', this.preloadImage, this);
         this.model.on('change:active', this.toggleImage, this);
         this.model.on('change:active', this.changeSurface, this);
         this.model.on('change:samples', this.changeSurface, this);

         this.model.setPath(); // delayed, is set after view creation
      },
      render: function() {
         return this; // chainable
      },
      // --- Functions ---
      toggleImage: function() {
         if (this.model.get('active')) {
            // ? show
            if (!this.model.get('preloaded')) {
               this.preloadImage(); // preload if not yet preloaded
            }

            this.resizeContainer(); // resize the image container
            this.$el.stop(true).fadeIn(settings.image.cycle_change_duration);
         } else {
            // ? hide
            this.$el.stop(true).fadeOut(settings.image.cycle_change_duration * 0.5);
         }
      },
      changeSurface: function() {
         var _this = this;

         if (this.model.get('active')) {
            setTimeout(function() {
               settings.stage.surface.model.set('samples', _this.model.get('samples'));
            }, settings.page.open_speed);
         }
      },
      preloadImage: function() {
         var _this = this;

         this.model.set('preloaded', true);
         var path = this.model.get('path'); // cache

         $.loadImages(path, function() {
            _this.model.set('preloaded', true);
            _this.$el.css({'background-image': 'url(' + _this.model.get('path') + ')'});
         });
      },
      resizeContainer: function() {
         var boundary = {
            width: $(window).width() - 250,
            height: $(window).height() - 210
         };

         var image = {
            width: this.model.get('width'),
            height: this.model.get('height')
         };

         var scale = functions.getScale(image, boundary);

         // get & set final size
         var width = (image.width * scale) + (settings.image.margin[1] + settings.image.margin[3]);
         var height = (image.height * scale) + (settings.image.margin[0] + settings.image.margin[2]);

         this.model.get('page').$parts.content.stop(true).show().animate({
            width: width,
            height: height
         }, settings.page.open_speed, 'easeOutExpo');
      }
   });

   return ImageView;
});

