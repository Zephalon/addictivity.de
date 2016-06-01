/*
 * Fan Model
 * 
 * @type    AMD Model
 * @autor   Fabian Prinz-Arnold
 */

define([
   'lodash',
   'backbone',
   'functions',
   'json!data/db.json',
   'json!data/settings.json'
], function(_, Backbone, functions, db, settings) {
   /**
    * Object
    */
   var FanModel = Backbone.Model.extend({
      defaults: {
         'color': '#00ff00',
         'page_count': 0,
         'active_page': 1,
         'active': false,
         'open': false,
         'start_position_top': 0,
         'start_position_left': 0,
         'last_position_top': 0,
         'last_position_left': 0
      },
      initialize: function() {
         this.router = new Backbone.Router({});
         this.set('id', this.collection.length);
      },
      /**
       * Switch Current Fan
       */
      switchFan: function(value) {
         if (value === undefined) {
            this.set('active', !this.get('active'));
         } else {
            this.set('active', value);
         }
         this.setHashtag();
      },
      /**
       * Switch Current Page
       * 
       * @param {integer} page_id
       * @returns {string}
       */
      setHashtag: function(page_id) {
         // ? fan is already active - close it!
         var route = ''; // default (close)
         
         // ? not cover clicked and already active
         if (!(page_id === 0 && this.get('active'))) {
            if (page_id === 0) {
               page_id = this.get('active_page'); // rewire cover page (id 0)
            }
            var route = this.get('category') + '/' + this.get('slug') + '/' + db[this.get('id')]['pages'][page_id - 1]['slug'] + '/';

         }
         this.router.navigate(route, {
            trigger: true,
            replace: false
         });
         return route;
      },
      /*
       * Calculate Page Angles
       */
      getPageAngles: function(fan_id, page_id) {
         var new_angles = {};
         if (page_id !== null && page_id !== undefined) { // is any page open?
            new_angles[page_id] = 0; // active page -> top

            // settings
            var gap_minimal = settings.page.gap_minimal; // deg
            var gap_frontpage = settings.page.gap_before - 5; // deg

            // angles pages _before_ active page
            var gap_before = settings.page.gap_before; // deg
            var gap_base = settings.page.gap_base; // deg

            for (i = page_id - 1; i >= 0; i--) {
               gap_base *= 0.9; // reduce gap
               if (gap_base < gap_minimal) {
                  gap_base = gap_minimal;
               }
               gap_before -= gap_base;
               new_angles[i] = parseInt(this.correctAngle(360 - gap_before)); // set new angle

               gap_frontpage = 0; // reset distance for cover
            }

            // angles pages _after_ active page
            var gap_after = settings.page.gap_after; // deg
            gap_base = settings.page.gap_base; // deg /-/ re-set

            for (i = page_id + 1; i <= this.get('page_count'); i++) {
               gap_base *= 0.9; // reduce gap
               if (gap_base < gap_minimal) {
                  gap_base = gap_minimal;
               }
               gap_after += gap_base;
               new_angles[i] = parseInt(this.correctAngle(gap_after)); // set new angle
            }
         } else {
            //new_angles[0] = 180 - this.get('page_count'); // cover
            for (i = 0; i <= this.get('page_count'); i++) {
               new_angles[i] = 180 + Math.round(this.get('page_count') * 0.25) - i * 0.5;
            }
         }

         return new_angles;
      },
      /**
       * Sets 360 deg to -180 <-> 180
       * 
       * @param {number} angle
       * @returns {Number}
       */
      correctAngle: function(angle) {
         var new_angle = angle;
         if (new_angle > 180) {
            new_angle = 360 - new_angle;
         }
         return new_angle;
      }
   });
   return FanModel;
});