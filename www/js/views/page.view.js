/*
 * Page View
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
   'models/image.model',
   'views/image.view',
   'collections/image.collection',
   'views/lightbox.view',
   'text!../../tpl/page.html',
   'vendor/plugins/jquery.micon',
   'vendor/plugins/jquery.transit',
   'vendor/plugins/jquery.easing'
], function($, _, Backbone, Mustache, settings, ImageModel, ImageView, ImageCollection, LightboxView, template) {
   /**
    * Object
    */
   var PageView = Backbone.View.extend({
      // --- Vars ---
      className: 'page',
      image_views: {},
      events: {
         'click': 'showPage',
         'click .image': 'showLightbox',
         'mouseenter .image': 'showLightboxIcon',
         'mouseleave .image': 'hideLightboxIcon',
         'click .prev': 'cycleImages',
         'click .next': 'cycleImages',
         'mouseenter .content .meta': 'animateMetaMouseover',
         'mouseleave .content .meta': 'animateMetaMouseout',
         'touchstart': 'showPage',
         'touchstart .image': 'showLightbox',
         'touchstart .prev': 'cycleImages',
         'touchstart .next': 'cycleImages'
      },
      // --- Startup ---
      initialize: function(options) {
         this.options = options;

         _.bindAll(this, 'showLightbox');
         _.bindAll(this, 'render');
         _.bindAll(this, 'showPage');
         _.bindAll(this, 'rotate');

         this.$parts = {}; // ! avoid reference confict - do not move this up ;)

         // event binding
         this.model.on('change:angle', this.rotate, this);
         this.model.on('change:active', this.openContent, this);
         this.model.on('change:active', this.closeContent, this);
         //this.model.get('fan').model.on('moved', this.openContent, this);

         // set up image collection
         this.model.image_list = new ImageCollection();
         this.model.image_list.bind('add', this.appendImage, this); // collection event binder

         // create lightbox
         this.lightbox = new LightboxView({
            'model': this.model
         });

         this.id = this.model.get('id');
      },
      showLightbox: function() {
         this.model.set('lightbox', true);
         
         // dont change images in background
         clearTimeout(this.model.attributes.cycle_timer);
      },
      render: function() {
         var html = Mustache.render(template, this.model.toJSON());
         this.$el.html(html);

         // reference partial elements
         this.$parts.prv_img = this.$el.find('.prv_img');
         this.$parts.images = this.$el.find('.images');
         this.$parts.colorcode = this.$el.find('.colorcode');
         this.$parts.content = this.$el.find('.content');
         this.$parts.more = this.$el.find('.more');
         this.$parts.control_panel = this.$el.find('.control_panel');
         this.$parts.control_next = this.$el.find('.control_panel .next');
         this.$parts.control_prev = this.$el.find('.control_panel .prev');

         // add images
         _(this.model.get('images')).each(function(value) {
            this.model.image_list.add(value);
         }, this);

         // hide control if only one image
         if (this.model.get('images').length === 1) {
            this.$parts.control_next.hide();
            this.$parts.control_prev.hide();
         }

         var thumb_path = 'img/work/_thumb/' + this.model.get('slug') + '.jpg';
         this.$parts.prv_img.css('background-image', 'url(' + thumb_path + ')');

         return this; // chainable
      },
      appendImage: function(image_model) {
         var page_id = this.id;

         // inherit vars & references
         image_model.set({
            'page_id': page_id,
            'page': this
         });

         // create new view
         var image_view = new ImageView({
            model: image_model
         });
         this.image_views[page_id] = image_view;
         this.$parts.images.append(image_view.render().el);
      },
      // --- Actions ---
      showPage: function() {
         this.options.fan.trigger('fan:trigger', this.model.id);
      },
      closeContent: function() {
         if (!this.model.get('active')) {
            // ? close page
            this.$el.removeClass('active');

            // clear delay timers to avoid collissions
            clearTimeout(this.model.attributes.cycle_timer);
            clearTimeout(this.model.attributes.open_timer);

            // hide the page
            this.$parts.content.stop(true).show()
                    .animate({
                       width: 0,
                       height: 0
                    }, (settings.page.open_speed), 'easeOutExpo', function() {
                       $(this).hide();
                    });

            this.model.image_list.at(this.model.get('current_image')).set('active', false);
         }
      },
      openContent: function() {
         if (this.model.get('active')) {
            var _this = this;
            this.$el.addClass('active');

            // ? open page
            //this.setMeta();

            // delay image cycle
            this.model.set('open_timer', setTimeout(function() {
               _this.cycleImages(0);
            }, (settings.page.flip_speed * 1)));
         }
      },
      cycleImages: function(option) {
         var _this = this;

         clearTimeout(this.model.attributes.cycle_timer);

         // stop the cycle
         if (option === 'stop' || !this.model.get('active')) {
            return false;
         }

         // control button clicked
         if (option !== undefined) {
            if (option.target !== undefined) {
               if ($(option.target).hasClass('prev')) {
                  option = 'prev';
               } else if ($(option.target).hasClass('next')) {
                  option = 'next';
               } else {
                  return false; // no instructions -> abort
               }
            }
         }

         // single image
         if (this.model.get('images').length === 1) {
            _this.model.image_list.at(0).set('active', true);
            return false;
         }

         // multiple images => set image id & start timer
         var current_image = this.model.get('current_image');

         // get image id
         if ($.isNumeric(option)) {
            show_image = option;
         } else {
            if (option === 'next') {
               show_image = this.getNextImage(current_image);
            } else if (option === 'prev') {
               show_image = this.getPrevImage(current_image);
            } else {
               show_image = current_image; // do not change
            }
         }

         // set view vars
         if (current_image !== show_image) {
            this.model.image_list.at(current_image).set('active', false);
            this.model.set('current_image', show_image);
         }

         this.model.image_list.at(show_image).set('active', true);
         this.model.image_list.at(this.getNextImage(show_image)).set('preloaded', true); // preload upcoming image

         // recall timer
         this.model.set('cycle_timer', setTimeout(function() {
            _this.cycleImages.call(_this, 'next');
         }, settings.image.cycle_delay));

         return true;
      },
      getNextImage: function(current_image) {
         var image = current_image + 1;
         if (image >= this.model.get('images').length) {
            image = 0;
         }
         return image;
      },
      getPrevImage: function(current_image) {
         var image = current_image - 1;
         if (image < 0) {
            image = this.model.get('images').length - 1;
         }
         return image;
      },
      // --- Functions ---
      showLightboxIcon: function() {
         $.micon(settings.icon.show_lightbox);
      },
      hideLightboxIcon: function() {
         $.micon('stop');
      },
      // --- Animations ---
      animateMetaMouseover: function() {
         this.$parts.more.stop(true).show().css('margin-bottom', (this.$parts.more.height() * -1)).animate({
            'margin-bottom': 20
         }, 800, 'easeOutElastic');
      },
      animateMetaMouseout: function() {
         this.$parts.more.stop(true).animate({
            'margin-bottom': (this.$parts.more.height() * -1)
         }, 500, 'easeOutElastic', function() {
            $(this).hide();
         });
      },
      rotate: function() {
         this.$el.css({'transform': 'rotate(' + this.model.get('angle') + 'deg)'}); // 'native'

         //this.$el.clearQueue();
         /*this.$el.transition({
          rotate: this.model.get('angle') + 'deg'
          }, settings.page.flip_speed, 'bounce');*/
      }
   });

   return PageView;
});