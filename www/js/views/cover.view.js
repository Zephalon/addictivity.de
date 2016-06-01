/*
 * Cover View
 * 
 * @type    AMD View
 * @autor   Fabian Prinz-Arnold
 */

define([
   'jquery',
   'lodash',
   'backbone',
   'mustache',
   'json!data/settings.json',
   'text!../../tpl/cover.html',
   'vendor/plugins/jquery.transit'
], function($, _, Backbone, Mustache, settings, template) {
   /**
    * Object
    */
   var CoverView = Backbone.View.extend({
      className: 'cover',
      events: {
         'click': 'toggleFan',
         'mouseover': 'animateMouseover',
         'mouseout': 'animateMouseout',
         'touchstart': 'toggleFan'
      },
      initialize: function(options) {
         this.options = options;
         
         _.bindAll(this, 'render');
         _.bindAll(this, 'toggleFan');
         _.bindAll(this, 'rotate');

         this.model.on('change:angle', this.rotate, this);
         this.render(data);
      },
      toggleFan: function() {
         this.options.fan.trigger('fan:trigger', this.model.id);
      },
      render: function() {
         var html = Mustache.render(template, this.model.toJSON());
         this.$el.html(html);

         return this; // chainable
      },
      // --- Animations ---
      animateMouseover: function() {
         this.model.get('fan').peak();
      },
      animateMouseout: function() {
         if (!this.model.get('fan').model.get('active')) {
            this.model.get('fan').flip();
         }
      },
      rotate: function() {
         this.$el.clearQueue().stop(true);
         this.$el.transition({
            rotate: this.model.get('angle') + 'deg'
         }, settings.page.flip_speed, 'bounce');
      }
   });

   return CoverView;
});