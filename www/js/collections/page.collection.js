define([
   'backbone',
   'models/page.model'
], function(Backbone, PageModel) {
   /**
    * Object
    */
   var PageCollection = Backbone.Collection.extend({
      model: PageModel
   });

   return PageCollection;
});