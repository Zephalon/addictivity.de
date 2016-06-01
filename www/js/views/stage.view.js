/*
 * Stage View
 * 
 * @type    AMD View
 * @autor   Fabian Prinz-Arnold
 */

define([
   'jquery',
   'lodash',
   'backbone',
   'mustache',
   'json!data/db.json',
   'json!data/settings.json',
   'models/fan.model',
   'views/fan.view',
   'collections/fan.collection',
   'models/surface.model',
   'views/surface.view',
   'views/menu.view',
   'text!../../tpl/stage.html'
], function($, _, Backbone, Mustache, db, settings, FanModel, FanView, FanCollection, SurfaceModel, SurfaceView, MenuView, template) {
   /**
    * Object
    */
   var StageView = Backbone.View.extend({
      el: '#stage',
      fan_views: {},
      events: {
         'click #lightbox': 'hideLightbox',
         'touchstart #lightbox': 'hideLightbox'
      },
      options: {},
      $parts: {},
      initialize: function(options) {
         this.options = options;

         _.bindAll(this, 'render');
         _.bindAll(this, 'appendFan');

         this.$parts = {};
         
         settings.stage = this; // expose 

         // set up fan collection
         this.fan_list = new FanCollection();
         this.fan_list.bind('add', this.appendFan, this); // collection event binder

         this.surface = new SurfaceView({
            'model': new SurfaceModel()
         });

         this.render();
         
         $('#spark-spinner').fadeOut(500);
      },
      appendFan: function(fan_model) {
         var fan_view = new FanView({
            'stage': this,
            'model': fan_model
         });

         var fan_id = fan_model.get('id');
         this.fan_views[fan_id] = fan_view;
         this.$parts.fan_container.append(fan_view.render().el);

         // intitial position
         var top = settings.w_height - 220;
         var left = -10 + ((fan_id + 1) * 120);
         this.fan_list.at(fan_id).set('start_position_top', top);
         this.fan_list.at(fan_id).set('start_position_left', left);
         fan_view.$el.css('top', top + 'px');
         fan_view.$el.css('left', left + 'px');

         fan_view.createPages();
      },
      render: function() {
         var html = Mustache.render(template, this.model.toJSON());
         this.$el.html(html);

         // reference partial elements
         this.$parts.overlay = this.$el.find('#overlay');
         this.$parts.topbar = this.$el.find('#topbar');
         this.$parts.fan_container = this.$el.find('#fan_container');

         // create mainmenu
         this.mainmenu = new MenuView();
         this.$parts.topbar.append(this.mainmenu.render().el);

         // create new fans
         _(db).each(function(value, key) {
            this.fan_list.add(value);
         }, this);

         return this; // chainable
      }
   });

   return StageView;
});