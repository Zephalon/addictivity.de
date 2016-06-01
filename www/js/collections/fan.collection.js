/*
 * Fan Collection
 * 
 * @type    AMD Collection
 * @autor   Fabian Prinz-Arnold
 */

define([
   'backbone',
   'models/fan.model'
], function(Backbone, FanModel) {
   /**
    * Object
    */
   var FanCollection = Backbone.Collection.extend({
      model: FanModel
   });

   return FanCollection;
});
