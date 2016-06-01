/*
 * Functions
 * 
 * @type    AMD Object
 * @autor   Fabian Prinz-Arnold
 */

define([
   'lodash'
], function(_) {
   return {
      /*
       * Calculate distance between two points
       */
      distance: function(p1, p2) {
         if (p1.left !== undefined) {
            p1.x = p1.left;
         }
         if (p1.top !== undefined) {
            p1.y = p1.top;
         }
         if (p2.left !== undefined) {
            p2.x = p2.left;
         }
         if (p2.top !== undefined) {
            p2.y = p2.top;
         }

         var dx = 0;
         var dy = 0;

         dx = p2.x - p1.x;
         dx *= dx;
         dy = p2.y - p1.y;
         dy *= dy;

         return Math.sqrt(dx + dy);
      },
      /*
       * Special chars to Underscore
       */
      hateSpecialChars: function(string) {
         var string = string.replace(/[^\w\s]/gi, '_');
         var string = string.replace(/ /g, '_');
         return string;
      },
      /*
       * Calculate scale to fit content inside of the box
       */
      getScale: function(content, box) {
         // image is smaller than the max size
         if (content.width < box.width) {
            box.width = content.width;
         }
         if (content.height < box.height) {
            box.height = content.height;
         }

         // scale to fit
         var width_scale = box.width / content.width;
         var height_scale = box.height / content.height;

         return Math.min(width_scale, height_scale); // limited by width or height
      }
   };
});