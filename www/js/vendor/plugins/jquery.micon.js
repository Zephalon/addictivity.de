/*!
 * jQuery Micon
 * 
 * Copyright(c) 2012-2014 Fabian Prinz-Arnold <mail@addictivity.com>
 * 
 * Requires FontAwesome (http://fontawesome.io)
 *
 * @version    1.1
 * @data       2014/01/23
 */

(function( $ ){
   /*
    * Methods are Public
    */
   var methods = {
      // default settings
      def: {
         'container': 'body',
         'icon': 'icon-repeat',
         'class': 'default',
         'offset_x': 15,
         'offset_y': 15,
         'fade_speed': 300,
         'current_position': {
            'x': 0,
            'y': 0
         }
      },

      // initialize
      init: function (options) {
         if (!functions.settings) {
            // the plugin hasn't been initialized yet
            functions.settings = {};

            // create micon element
            $('body').append('<div id="micon" class="fa"></div>'); // create new icon
            methods.def.$micon = $('#micon'); // save jquery object
            methods.def.$micon.hide().fadeIn(functions.settings.fade_speed); // animate
            methods.changeSettings.apply(this, [options]); // set up data
            functions.move.apply(this); // set position for the first time
         } else {
            // the plugin is running, so just change the settings
            methods.changeSettings.apply(this, [options]);
         }
      },

      // change settings
      changeSettings: function (options) {
         // set string as icon
         if (typeof(options) === 'string') {
            options = {
               icon: options
            };
         }
         functions.settings = $.extend(methods.def, options); // extend the default settings
         functions.setContainer.apply(this); // bind move event to container
         functions.setIcon.apply(this); // apply icon
      },

      // stop mouser
      stop: function () {
         if (functions.settings !== undefined) {
            $(functions.settings.container).off('.micon');
            $('#micon').remove();
            delete functions.settings;
         }
      }
   };


   /*
    * Functions are Private
    */
   var functions = {
      // move the icon element to mouse position
      move: function (event) {
         if (event === undefined) {
            // if no event is given, use the stored position
            event = {
               pageX: functions.settings.current_position.x,
               pageY: functions.settings.current_position.y
            };
         } else {
            // store position for later use
            functions.settings.current_position.x = event.pageX;
            functions.settings.current_position.y = event.pageY;
         }

         functions.settings.$micon.css({
            left: event.pageX + functions.settings.offset_x,
            top: event.pageY + functions.settings.offset_y
         });
      },

      // set container
      setContainer: function () {
         var _this = this;

         $(functions.settings.container).off('.micon'); // unbind all .micon events
         $(functions.settings.container).on('mousemove.micon touchmove.micon', function (event) {
            functions.move.apply(_this, [event]);
         });
      },

      // set icon
      setIcon: function () {
         functions.settings.$micon.removeClass(); // remove all classes
         functions.settings.$micon.addClass('fa').addClass('fa-' + functions.settings.icon).addClass(functions.settings.class); // set new icon-class
      }
   };

   $.micon = function (method) {
      // method calling logic
      if (methods[method]) {
         return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
      } else if (typeof method === 'object' || typeof method === 'string' || !method) {
         return methods.init.apply(this, arguments);
      } else {
         $.error( 'Method ' +  method + ' does not exist on jQuery.micon' );
      }

   };
})( jQuery );