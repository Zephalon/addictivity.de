/*
 * Application
 * 
 * @type    AMD Constructor
 * @autor   Fabian Prinz-Arnold
 */

define([
   'router',
   'json!data/settings.json',
   'models/stage.model',
   'views/stage.view'
], function(Router, settings, StageModel, StageView) {
   var _this = this;

   /**
    * Initialize
    */
   var initialize = function() {
      // cache window size
      settings.w_height = $(window).height();
      settings.w_width = $(window).width();

      // create stage
      _this.stage = new StageView({
         'model': new StageModel()
      });
      Router.initialize(_this);
   };

   /**
    * Public Methods
    */
   return {
      initialize: initialize
   };
});