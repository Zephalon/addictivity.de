/*
 * Application Core
 * 
 * Constructor
 * 
 * @autor   Fabian Prinz-Arnold
 */

/**
 * 'require' Configuration
 */
require.config({
   baseUrl: 'js',
   paths: {
      'jquery': 'vendor/jquery',
      'lodash': 'vendor/lodash',
      'backbone': 'vendor/backbone',
      'underscore': 'vendor/lodash',
      'mustache': 'vendor/mustache',
      'paper': 'vendor/paper',
      'text': 'vendor/plugins/require.text',
      'json': 'vendor/plugins/require.json'
   },
   shim: {
      'backbone': {
         deps: ['lodash', 'jquery'],
         exports: 'Backbone'
      },
      'underscore': {
         exports: '_'
      },
      'paper': {
         exports: 'Paper'
      },
      'plugins/jquery.custom': ['jquery'],
      'plugins/jquery.easing': ['jquery'],
      'plugins/jquery.loadimages': ['jquery'],
      'plugins/jquery.micon': ['jquery'],
      'plugins/jquery.momentum': ['jquery'],
      'plugins/jquery.mousewheel': ['jquery'],
      'plugins/jquery.transit': ['jquery']
   }
});

/**
 * 'require' Load Application
 */
require([
   'app'
], function(app) {
   app.initialize();
});