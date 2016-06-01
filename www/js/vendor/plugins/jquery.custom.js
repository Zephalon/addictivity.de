/*
 * Background Animation Fix
 * http://stackoverflow.com/questions/5518834/jquery-animate-background-position-firefox
 */
(function($) {
   if(!document.defaultView || !document.defaultView.getComputedStyle){
      var oldCSS = jQuery.css;
      jQuery.css = function(elem, name, force){
         if(name === 'background-position'){
            name = 'backgroundPosition';
         }
         if(name !== 'backgroundPosition' || !elem.currentStyle || elem.currentStyle[ name ]){
            return oldCSS.apply(this, arguments);
         }
         var style = elem.style;
         if ( !force && style && style[ name ] ){
            return style[ name ];
         }
         return oldCSS(elem, 'backgroundPositionX', force) +' '+ oldCSS(elem, 'backgroundPositionY', force);
      };
   }

   var oldAnim = $.fn.animate;
   $.fn.animate = function(prop){
      if('background-position' in prop){
         prop.backgroundPosition = prop['background-position'];
         delete prop['background-position'];
      }
      if('backgroundPosition' in prop){
         prop.backgroundPosition = '('+ prop.backgroundPosition + ')';
      }
      return oldAnim.apply(this, arguments);
   };

   function toArray(strg){
      strg = strg.replace(/left|top/g,'0px');
      strg = strg.replace(/right|bottom/g,'100%');
      strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g,"$1px$2");
      var res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
      return [parseFloat(res[1],10),res[2],parseFloat(res[3],10),res[4]];
   }

   $.fx.step.backgroundPosition = function(fx) {
      if (!fx.bgPosReady) {
         var start = $.css(fx.elem,'backgroundPosition');

         if(!start){//FF2 no inline-style fallback
            start = '0px 0px';
         }

         start = toArray(start);

         fx.start = [start[0],start[2]];

         var end = toArray(fx.end);
         fx.end = [end[0],end[2]];

         fx.unit = [end[1],end[3]];
         fx.bgPosReady = true;
      }

      var nowPosX = [];
      nowPosX[0] = ((fx.end[0] - fx.start[0]) * fx.pos) + fx.start[0] + fx.unit[0];
      nowPosX[1] = ((fx.end[1] - fx.start[1]) * fx.pos) + fx.start[1] + fx.unit[1];
      fx.elem.style.backgroundPosition = nowPosX[0]+' '+nowPosX[1];
   };
})(jQuery);


/*
 * Custom Easing (css)
 */
$.cssEase['bounce'] = 'cubic-bezier(.19,1.15,.61,1.05)';


/*
 * Background Color Animation
 */
(function(d){d.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(f,e){d.fx.step[e]=function(g){if(!g.colorInit){g.start=c(g.elem,e);g.end=b(g.end);g.colorInit=true}g.elem.style[e]="rgb("+[Math.max(Math.min(parseInt((g.pos*(g.end[0]-g.start[0]))+g.start[0]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[1]-g.start[1]))+g.start[1]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[2]-g.start[2]))+g.start[2]),255),0)].join(",")+")"}});function b(f){var e;if(f&&f.constructor==Array&&f.length==3){return f}if(e=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(f)){return[parseInt(e[1]),parseInt(e[2]),parseInt(e[3])]}if(e=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(f)){return[parseFloat(e[1])*2.55,parseFloat(e[2])*2.55,parseFloat(e[3])*2.55]}if(e=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(f)){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}if(e=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(f)){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}if(e=/rgba\(0, 0, 0, 0\)/.exec(f)){return a.transparent}return a[d.trim(f).toLowerCase()]}function c(g,e){var f;do{f=d.css(g,e);if(f!=""&&f!="transparent"||d.nodeName(g,"body")){break}e="backgroundColor"}while(g=g.parentNode);return b(f)}var a={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]}})(jQuery);