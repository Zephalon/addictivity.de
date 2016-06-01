/*
 * Menu View
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
   'text!../../tpl/mainmenu.html'
], function($, _, Backbone, Mustache, settings, template) {
   /**
    * Object
    */
   var MenuView = Backbone.View.extend({
      id: 'mainmenu',
      events: {
      },
      options: {},
      initialize: function(options) {
         this.options = options;

         _.bindAll(this, 'render');
      },
      render: function() {
         settings.mainmenu.reverse(); // invert array for right float

         var html = Mustache.render(template, settings);
         this.$el.html(html);

         return this; // chainable
      }
   });

   return MenuView;
});

