define([
   'backbone',
   'models/image.model'
], function(Backbone, ImageModel) {
   /**
    * Object
    */
   var ImageCollection = Backbone.Collection.extend({
      model: ImageModel
   });

   return ImageCollection;
});