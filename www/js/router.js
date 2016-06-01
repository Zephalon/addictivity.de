/*
 * Router
 * 
 * @type    AMD Constructor
 * @autor   Fabian Prinz-Arnold
 */

define([
   'jquery',
   'lodash',
   'backbone',
   'functions',
   'json!data/db.json',
   'json!data/settings.json'
], function($, _, Backbone, functions, db, settings) {
   /**
    * Define Application Router
    */
   var AppRouter = Backbone.Router.extend({
      routes: {
         "": "clear_stage",
         ":category/:fan/:page/": "open_page"
      }
   });

   /**
    * Initialize
    */
   var initialize = function(app) {
      var app_router = new AppRouter;
      app_router.app = app;

      app_router.on('route:clear_stage', function() {
         clearStage();
      });

      app_router.on('route:open_page', function(category, fan_title, page_title) {
         openPage(category, fan_title, page_title);
      });

      Backbone.history.start({
         pushState: false
      });
   };

   var clearStage = function() {
      document.title = settings.app.home_title + settings.app.title;
      this.stage.fan_list.trigger('switch', false, false); // fan and page id
      //this.stage.fan_list.trigger('all:close');
   };

   var openPage = function(category, fan_title, page_title) {
      var id = getWorkId(fan_title, page_title); // get ids by title
      if (id) {
         document.title = db[id[0]].title + ' » ' + db[id[0]].pages[id[1] - 1].title + settings.app.title;
         this.stage.fan_list.trigger('switch', id[0], id[1]); // fan and page id
         
         //var fan_model = this.stage.fan_views[id[0]].model;
         //fan_model.set('active', true); // open fan
         //fan_model.set('active_page', id[1]); // open fan
         //this.stage.fan_views[id[0]].open(id[1]); // open fan
      } else {
         console.log('Route not found.');
         clearStage();
      }
   };

   /*
    * Get the ID of Fan and Page by the titles
    */
   var getWorkId = function(fan_title, page_title) {
      var fan_id = false;
      var page_id = false;

      // get fan id
      _.each(db, function(fan, id) {
         if (fan.slug === fan_title) {
            fan_id = id;
         }
      });
      if (fan_id === false) {
         return false; // not found
      }

      // get page id
      _.each(db[fan_id].pages, function(page, id) {
         if (page.slug === page_title) {
            page_id = id + 1; // 0 = cover
         }
      });
      if (page_id === false) {
         return false; // not found
      } else {
         return [fan_id, page_id];
      }
   };

   /**
    * Public Functions
    */
   return {
      initialize: initialize
   };
});