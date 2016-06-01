/*
 * Fan View
 * 
 * @type    AMD View
 * @autor   Fabian Prinz-Arnold
 */

define([
   'jquery',
   'lodash',
   'backbone',
   'mustache',
   'functions',
   'json!data/settings.json',
   'models/page.model',
   'views/page.view',
   'views/cover.view',
   'collections/page.collection',
   'text!../../tpl/fan.html',
   'vendor/plugins/jquery.momentum',
   'vendor/plugins/jquery.micon',
   'vendor/plugins/jquery.transit'
], function($, _, Backbone, Mustache, functions, settings, PageModel, PageView, CoverView, PageCollection, template) {
   /**
    * Object
    */
   var FanView = Backbone.View.extend({
      // --- Vars ---
      className: 'fan',
      page_views: {},
      events: {
         'mouseenter .cover': 'showIcon',
         'mouseleave .cover': 'hideIcon'
      },
      // --- Startup ---
      initialize: function(options) {
         this.options = options;
         this.id = this.model.defaults.id;

         _.bindAll(this, 'createPages');
         _.bindAll(this, 'appendPage');
         _.bindAll(this, 'render');
         _.bindAll(this, 'triggerSwitch');
         _.bindAll(this, 'switchFan');
         _.bindAll(this, 'appendPage');
         _.bindAll(this, 'open');
         _.bindAll(this, 'close');
         _.bindAll(this, 'peak');
         _.bindAll(this, 'flip');

         // event binding
         this.model.on('fan:open', this.open, this);
         this.model.on('fan:close', this.close, this);
         this.on('fan:trigger', this.triggerSwitch); // set new route (hash) - not in model to detect dragging
         settings.stage.fan_list.on('switch', this.switchFan, this); // open fan or switch page

         // set up fan collection
         this.model.page_list = new PageCollection();
         this.model.page_list.bind('add', this.appendPage, this); // collection event binder

         // init momentum
         this.$el.momentum({
            container: '#wrapper',
            active_z: 9,
            inactive_z: settings.fan.inactive_z
         });
      },
      createPages: function() {
         // add cover
         this.model.page_list.add({
            'id': 0,
            'title': this.model.get('title'),
            'color': this.model.get('color')
         });

         // add pages
         _(this.model.get('pages')).each(function(value) {
            this.model.page_list.add(value);
         }, this);
      },
      appendPage: function(page_model) {
         var fan_id = this.model.get('id');

         // inherit vars & references
         page_model.set({
            'fan_id': fan_id,
            'fan': this,
            'color': this.model.get('color')
         });

         var page_id = page_model.get('id');

         // cover or page
         if (page_id === 0) {
            var page_view = new CoverView({
               'fan': this,
               'model': page_model
            });
            // TODO page_view.model.on();
         } else {
            // set page count
            this.model.set('page_count', this.model.get('page_count') + 1, {// set count shortcut
               silent: true
            });

            var page_view = new PageView({
               'fan': this,
               'model': page_model
            });
         }

         this.page_views[page_id] = page_view;
         $(this.el).append(page_view.render().el);

         // initial angle
         page_view.$el.css({
            transformOrigin: (settings.page.width * 0.5) + 'px ' + (settings.page.height - (settings.page.width * 0.25)) + 'px'
         });
         var angles = this.model.getPageAngles(fan_id);
         page_view.$el.css('transform', 'rotate(' + angles[page_id] + ')');
         page_model.set('angle', angles[page_id], {
            silent: true
         }); // reference

         page_view.$el.css('z-index', (100 - page_id)); // set z-index
      },
      render: function() {
         var html = Mustache.render(template, this.model.toJSON());
         this.$el.html(html);
         this.$el.css('z-index', settings.fan.inactive_z);

         return this; // chainable
      },
      // --- Actions ---
      triggerSwitch: function(page_id) {
         // ? not dragging
         if (!this.$el.data('momentum').state.dragging) {
            // ? cover clicked and this is active
            this.model.setHashtag(page_id); // clear stage
         }
      },
      switchFan: function(fan_id, page_id) {
         if (fan_id === this.model.get('id')) {
            this.model.trigger('fan:open', page_id);
         } else {
            this.model.trigger('fan:close');
         }
      },
      open: function(page_id) {
         var _this = this;

         if (!this.model.get('active')) { // TODO
            // ? active and not dragging
            this.model.set('active', true);
            this.$el.addClass('active');

            // set new background color
            $('body').stop(true).animate({
               backgroundColor: this.model.get('color')
            }, 1000);

            this.$el.momentum('pause');
            this.$el.css('z-index', settings.fan.active_z);

            // save current position
            var current_position = this.$el.position();
            this.model.set('last_position_top', current_position.top);
            this.model.set('last_position_left', current_position.left);

            // set new position
            var new_position = {
               x: settings.w_width - settings.fan.active_position[0],
               y: settings.w_height - settings.fan.active_position[1]
            };

            this.move(new_position, function() {
               // flip when at destination
               _this.$el.addClass('open');
               _this.flip(page_id); // do the flip!
               _this.model.set('active_page', page_id);
            });

            // open pages - useless?
            /*if (page_id === null || page_id === undefined) {
               page_id = this.model.get('active_page');
            }*/
         } else {
            // always switch page when active
            this.flip(page_id); // do the flip!
            this.model.set('active_page', page_id);
         }
      },
      close: function() {
         if (this.model.get('active')) {
            this.model.set('active', false);
            $('body').stop(true).animate({
               backgroundColor: '#000000'
            }, 1000);

            this.$el.removeClass('active').removeClass('open');
            this.$el.momentum('unpause');

            this.$el.css('z-index', settings.fan.inactive_z);

            // new (start) position
            var new_position = {
               x: this.model.get('last_position_left'),
               y: this.model.get('last_position_top')
            };

            this.move(new_position);
            this.flip(); // close pages
         }
      },
      // --- Functions ---
      showIcon: function() {
         if (!this.model.get('active')) {
            $.micon(settings.icon.move);
         }
      },
      hideIcon: function() {
         $.micon('stop');
      },
      // --- Animations ---
      move: function(new_position, callback) {
         var _this = this;

         var current_position = this.$el.position();
         var distance = functions.distance(current_position, new_position);
         var speed = (settings.fan.speed / 500) * distance;

         this.$el.stop(true).transition({
            top: new_position.y + 'px',
            left: new_position.x + 'px'
         }, speed, 'ease', function() {
            _this.model.trigger('in_position');
            if (_.isFunction(callback)) {
               callback();
            }
         });
      },
      peak: function() {
         if (!this.model.get('active')) {
            var peak_angle = settings.fan.peak_angle;
            var start_angle = 180 + ((this.model.get('page_count') / 2) * peak_angle);

            // apply values
            for (var i = 0; i <= this.model.get('page_count'); i++) {
               var new_angle = start_angle - (i * peak_angle);
               this.model.page_list.at(i).set('angle', new_angle);
            }
         }
      },
      flip: function(page_id) {
         if (this.model.get('active') || page_id === undefined || page_id === null) {
            if (page_id === undefined) {
               page_id = null;
            }

            var new_angles = this.model.getPageAngles(this.model.get('id'), page_id);

            // apply values
            for (var i = 0; i <= this.model.get('page_count'); i++) {
               this.model.page_list.at(i).set('angle', new_angles[i]);
            }

            this.model.page_list.at(this.model.get('active_page')).set('active', false); // hide current page
            if (page_id !== null) {
               this.model.set('active_page', page_id); // set new as last page
               this.model.page_list.at(page_id).set('active', true); // set new page
            }
         }
      }
   });

   return FanView;
});