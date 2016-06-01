/*
 * Lightbox View
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
   'vendor/plugins/jquery.micon'
], function($, _, Backbone, functions, settings) {
   /**
    * Object
    */
   var LightboxView = Backbone.View.extend({
      el: '#lightbox',
      events: {
         'click': 'hideLightbox',
         'touchstart': 'hideLightbox'
      },
      $parts: {},
      initialize: function() {
         _.bindAll(this, 'showLightbox');
         _.bindAll(this, 'hideLightbox');

         this.model.on('change:lightbox', this.showLightbox, this);

         // reference $parts
         this.$parts.lightbox_bg = this.$el.find('#lightbox_bg');
         this.$parts.lightbox_content = this.$el.find('#lightbox_content');
      },
      showLightbox: function() {
         if (this.model.get('lightbox')) {
            var current_image = this.model.image_list.at(this.model.get('current_image'));
            var content_width = current_image.get('width');
            var content_height = current_image.get('height');

            this.$el.addClass('active');

            // show and set icon
            $.micon(settings.icon.hide_lightbox);

            // calculate & set image size
            if (content_width !== undefined && content_height !== undefined) {
               var boundary = {
                  width: settings.w_width - 50,
                  height: settings.w_height - 50
               };
               var image = {
                  width: content_width,
                  height: content_height
               };
               var scale = functions.getScale(image, boundary);

               // get & set final size
               var f_width = Math.round(image.width * scale);
               var f_height = Math.round(image.height * scale);

               this.$parts.lightbox_content
                       .css({
                          width: f_width,
                          height: f_height,
                          left: Math.round((settings.w_width - f_width) * 0.5),
                          top: Math.round((settings.w_height - f_height) * 0.5)
                       });
            }

            this.$parts.lightbox_content.css('background-image', 'url(' + current_image.get('path') + ')');
         }
      },
      hideLightbox: function() {
         var _this = this;
         this.model.set('lightbox', false);
         this.$el.removeClass('active');
         $.micon('stop');

         // todo - restart timer
      }
   });

   return LightboxView;
});