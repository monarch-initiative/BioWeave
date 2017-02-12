import ng from 'angular';
import ngResource from 'angular-resource';

import 'bootstrap/dist/css/bootstrap.min.css';
import nguibootstrap from 'angular-ui-bootstrap';

import jsonformatter from 'jsonformatter';
import 'jsonformatter/dist/json-formatter.min.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/idea.css';

import MainController from './MainController.js';
require('./style.css');

var dependentModules = [nguibootstrap, ngResource, jsonformatter];

var app = ng.module('app', dependentModules);

app.config(['JSONFormatterConfigProvider', function (JSONFormatterConfigProvider) {
    JSONFormatterConfigProvider.hoverPreviewEnabled = true;
  }]);

app.config(['$httpProvider', function config($httpProvider) {
  $httpProvider.defaults.withCredentials = true;
  $httpProvider.defaults.useXDomain = true;
}]);

app.controller(
  'MainController',
  ['$scope', '$resource', '$http', '$timeout',
  function ($scope, $resource, $http, $timeout) {
    return new MainController($scope, $resource, $http, $timeout);
  }]);

app.filter('highlight', ['$sce', function($sce) {
  return function(input, lang) {
    if (lang && input) {
      return hljs.highlight(lang, input).value;
    }

    return input;
  };
}]);

app.filter('unsafe', ['$sce', function($sce) {
                      return $sce.trustAsHtml;
                     }]);

app.directive('highlight', ['$interpolate', function($interpolate) {
        return {
        restrict: 'EA',
        scope: true,
        compile: function (tElem, tAttrs) {
          var interpolateFn = $interpolate(tElem.html(), true);
          tElem.html(''); // disable automatic intepolation bindings

          return function(scope, elem, attrs) {
            scope.$watch(interpolateFn, function (value) {
              elem.html(hljs.highlight('javascript', value).value);
            });
          };
        }
      };
    }]);
