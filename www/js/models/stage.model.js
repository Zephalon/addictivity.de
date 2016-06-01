/*
 * Stage Model
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
   var StageModel = Backbone.Model.extend({
      defaults: {
         'overlay': false
      },
      initialize: function() {
      }
   });

   return StageModel;
});