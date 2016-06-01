/*!
 * jQuery Momentum
 * 
 * Copyright(c) 2012-2014 Fabian Prinz-Arnold <fabian@prinz-arnold.de>
 * 
 * @version    1.2
 * @license    Licensed under MIT
 */

(function($) {
   /*
    * Methods are Public
    */
   var methods = {
      // default settings
      def: {
         decay: 0.05, // aka friction
         timeout: 500, // timeout for dragging
         vmin: 1, // minimum velocity
         vmax: 200, // maximum velocity
         container: null,
         paused: false
      },
      // initialize
      init: function(options) {
         return this.each(function() {
            var _this = this;
            var $this = $(this);

            data = $this.data('momentum');

            // the plugin hasn't been initialized yet
            if (!data) {
               // apply data
               $this.data('momentum', {
                  settings: {},
                  state: {
                     drift: false,
                     dragging: false,
                     velocity: {
                        x: 0,
                        y: 0
                     }
                  }
               });

               // set up data
               methods.changeSettings.apply(this, [options]);
               var state = $this.data('momentum').state;
               var settings = $this.data('momentum').settings;

               methods.setContainer.apply(this); // calculate boundaries

               $this.on('mousedown.momentum touchstart.momentum', function(event) {
                  event.preventDefault();
                  functions.startDrag.apply(this, [event]);
               });
            }
         });
      },
      // change settings
      changeSettings: function(options) {
         $(this).data('momentum').settings = $.extend(methods.def, options);
      },
      // set the containing element (string or jQuery object)
      setContainer: function(container) {
         var _this = this;
         var $this = $(this);
         var settings = $this.data('momentum').settings;

         // set container element
         if (container !== undefined && container !== '' && container !== null) {
            settings.container = container;
         } else if (settings.container !== undefined && settings.container !== '' && settings.container !== null) {
            container = settings.container;
         }

         // set and check if any element is found
         if (typeof container === 'string') {
            $container = $(container);
         } else {
            $container = container;
         }
         // select parent element if nothing is found
         if ($container.length !== 1) {
            $container = $this.parent();
         }

         // listen for resize
         $container.resize(function(e) {
            methods.setContainer.apply(_this);
            functions.doDrift.apply(_this);
         });

         // set bounderies
         var cont_pos = $this.position();
         settings.min_x = Math.round(cont_pos.left);
         settings.min_y = Math.round(cont_pos.top);
         settings.max_x = Math.round($container.width() - $this.width());
         settings.max_y = Math.round($container.height() - $this.height());
      },
      // stop momentum
      stop: function() {
         functions.stopDrag.apply(this);
         functions.stopDrift.apply(this);
      },
      // (un)pause momentum
      pause: function() {
         functions.stopDrift.apply(this);
         $(this).data('momentum').state.paused = true;
      },
      unpause: function() {
         $(this).data('momentum').state.paused = false;
      },
      // remove momentum
      off: function() {
         methods.stop.apply(this);
         $.removeData(this, 'momentum');
      }
   };


   /*
    * Functions are Private
    */
   var functions = {
      // bind drag events
      startDrag: function(event) {
         var _this = this;
         var $this = $(this);
         var state = $this.data('momentum').state;

         if (!state.paused) {
            var position = $this.position();

            state.dragging = false;
            state.drift = false;
            state.start = {
               x: event.pageX,
               y: event.pageY
            };
            state.last = state.start;
            state.offset = {
               x: event.pageX - position.left,
               y: event.pageY - position.top
            };
            state.stopwatch = new Date().getTime();

            // bind drag to body
            $('body').on('mousemove.momentum touchmove.momentum', function(event) {
               functions.doDrag.apply(_this, [event]);
            })
                    .on('mouseup.momentum touchend.momentum mouseleave.momentum touchleave.momentum', function(event) {
                       event.preventDefault();
                       functions.stopDrag.apply(_this, [event]);
                    });
         }
      },
      // drag the object
      doDrag: function(event) {
         var $this = $(this);
         var state = $this.data('momentum').state;
         var settings = $this.data('momentum').settings;

         // set z-index
         if ($.isNumeric(settings.active_z)) {
            $this.css('z-index', settings.active_z);
         }

         // save velocity and position
         state.velocity = {
            x: state.last.x - event.pageX,
            y: state.last.y - event.pageY
         };
         state.last = {
            x: event.pageX,
            y: event.pageY
         };
         state.stopwatch = new Date().getTime();

         state.dragging = true;

         functions.setPosition.apply(this, [event.pageX - state.offset.x, event.pageY - state.offset.y]);
      },
      // stop dragging
      stopDrag: function(event) {
         var _this = this;
         var $this = $(this);
         var settings = $this.data('momentum').settings;

         // set z-index
         if ($.isNumeric(settings.inactive_z)) {
            $this.css('z-index', settings.inactive_z);
         }

         // unbind events
         $('body').off('.momentum');

         setTimeout(function() {
            state = $(_this).data('momentum').state;
            state.dragging = false;
         }, 300);
         functions.startDrift.apply(this, [event.pageX, event.pageY]);
      },
      // start drifting
      startDrift: function(current_x, current_y) {
         var _this = this;
         var $this = $(this);
         var settings = $this.data('momentum').settings;
         var state = $this.data('momentum').state;

         state.drift = true;

         // check if it's timed out
         var dtime = new Date().getTime() - state.stopwatch; // calculate time difference
         if (dtime > settings.timeout) {
            state.velocity = {
               x: 0,
               y: 0
            };
         }

         // request initial animation frame
         requestAnimationFrame(function() {
            functions.doDrift.call(_this);
         });
      },
      // execute drift
      doDrift: function() {
         var _this = this;
         var $this = $(this);
         var settings = $this.data('momentum').settings;
         var state = $this.data('momentum').state;

         // calculate new velocity
         state.velocity.x *= (1 - settings.decay);
         state.velocity.y *= (1 - settings.decay);
         state.velocity.total = Math.abs(Math.sqrt((state.velocity.x * state.velocity.x) + (state.velocity.y * state.velocity.y)));

         // maximum velocity check
         if (state.velocity.total > settings.vmax) {
            var vfactor = settings.vmax / state.velocity.total;
            state.velocity.x *= vfactor;
            state.velocity.y *= vfactor;
         }

         var position = $this.position(); // cache current position

         // bounce back at containment borders
         if (position.left < settings.min_x || position.left > settings.max_x || position.top < settings.min_y || position.top > settings.max_y) {
            // @top
            if (position.top < settings.min_y) {
               state.velocity.y = Math.abs(state.velocity.y) * -1 - settings.vmin;
            }
            // @left
            if (position.left < settings.min_x) {
               state.velocity.x = Math.abs(state.velocity.x) * -1 - settings.vmin;
            }
            // @bottom
            if (position.top > settings.max_y) {
               state.velocity.y = Math.abs(state.velocity.y) - settings.vmin;
            }
            // @right
            if (position.left > settings.max_x) {
               state.velocity.x = Math.abs(state.velocity.x) - settings.vmin;
            }
         } else {
            // stop drift if to slow
            if (state.velocity.total < settings.vmin) {
               functions.stopDrift.apply(this);
               return false;
            }
         }

         functions.setPosition.apply(this, [position.left - state.velocity.x, position.top - state.velocity.y]); // set new position

         // request new animation frame
         requestAnimationFrame(function() {
            functions.doDrift.call(_this);
         });
      },
      // stop drift
      stopDrift: function() {
         var $this = $(this);
         var state = $this.data('momentum').state;

         state.drift = false;
         state.velocity.x = 0;
         state.velocity.y = 0;
      },
      // set new object position
      setPosition: function(x, y) {
         $(this).css({
            top: y,
            left: x
         });
      }
   };

   $.fn.momentum = function(method) {
      // method calling logic
      if (methods[method]) {
         return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
      } else if (typeof method === 'object' || !method) {
         return methods.init.apply(this, arguments);
      } else {
         $.error('Method ' + method + ' does not exist on jQuery.momentum');
      }

   };
})(jQuery);