/*
 * Page Model
 * 
 * @type    AMD Model
 * @autor   Fabian Prinz-Arnold
 */

define([
   'lodash',
   'backbone'
], function(_, Backbone) {
   /**
    * Object
    */
   var PageModel = Backbone.Model.extend({
      defaults: {
         angle: 180,
         active: false,
         current_image: 0,
         lightbox: false
      },
      initialize: function() {
         this.set('id', this.collection.length);
      }
   });

   return PageModel;
});