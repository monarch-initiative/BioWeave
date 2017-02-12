import Papa from 'papaparse';
import _ from 'lodash';
import BioWeaveCompiler from './BioWeaveCompiler.js';
import BioWeaveEngine from './BioWeaveEngine.js';
import Wikidata from './Wikidata.js';

export default class MainController {
  constructor($scope, $resource, $http, $timeout) {
    console.log('xMfainController');
    this.bwc = new BioWeaveCompiler();
    this.bwe = new BioWeaveEngine();
    this.wikidata = new Wikidata();

    // Initialization of secrets into HTML5 local storage.
    // This hardcoded setting should be replaced with a UI Dialog
    // that prompts the user for these values.
    // Meanwhile, the DUMMY values below should be replaced with actual
    // authentication info and the resulting source code should NOT
    // be committed to Git, else the secrets won't be secret
    //
    // this.wikidata.setWikidataSessionKeys(
    //   'DUMMY',        // lgname,
    //   'DUMMY',        // lgpassword,
    //   'DUMMY',        // oauth_consumer_key,
    //   'DUMMY',        // oauth_token,
    //   'DUMMY',        // consumerSecret,
    //   'DUMMY');       // tokenSecret

    this.$scope = $scope;
    this.$resource = $resource;
    this.$http = $http;
    this.$timeout = $timeout;

    this.showSourceDBs = false;
    this.showTargetDB = false;
    this.showBWSource = true;
    this.showBWGenerator = false;
    this.showBWCompiled = false;
    this.showLog = false;

    this.SourceDBs = {};
    this.TargetDBTitle = '';
    this.TargetDBColumns = [];
    this.TargetDBRows = [];
    this.BWSource = '';
    this.BWGenerator = '';
    this.log = {};
    this.BWCompiled = {};

    var that = this;

    $timeout(
      function () {
        that.continueInitialization();
        // that.testWikidataLoginOAuth();
        // that.testWikidataLoginBot();
        that.testWikidataGet();
        // that.testWikidataPost();
      },
      10);
  }


  continueInitialization() {
    var SourceDBToWikidataSource = require('raw-loader!./ZFINToWikidata/ZFINGeneToWikidata.bws');
    this.BWSource = SourceDBToWikidataSource;

    var compileResult = this.bwc.compile(SourceDBToWikidataSource);
    this.BWGenerator = compileResult.generator;
    this.BWCompiled = compileResult.compiled;
    this.log = compileResult.log;

    for (var sourceIndex in this.BWCompiled.sources) {
      var source = this.BWCompiled.sources[sourceIndex];
      this.loadSourceData(source.details);
    }
  }

  loadSourceData(details) {
    var url = details.url;
    var columns = details.columns;
    var title = details.title;
    var skipLines = details.skipLines || 0;
    var that = this;
    this.bwe.loadTSV(url, columns, title, skipLines,
      function(rows) {
        that.$scope.$apply(function() {
          that.SourceDBs[url] = {
            title: title,
            columns: columns,
            rows: rows,
            show: false
          };
      });
    });
  }

  testWikidataGet() {
    console.log('testWikidataGet');
    var that = this;

    this.wikidata.testWikidataGet(function(data) {
      that.$scope.$apply(function() {
        that.showTargetDB = false;
        that.TargetDBTitle = data.title;
        that.TargetDBColumns = data.columns;
        that.TargetDBRows = data.rows;
      });
    });
  }

  testWikidataLoginOAuth() {
    var that = this;
    this.wikidata.testWikidataLoginOAuth();
  }

  testWikidataLoginBot() {
    var that = this;
    this.wikidata.testWikidataLoginBot();
  }

  testWikidataPost() {
    var that = this;
    this.wikidata.testWikidataPost(function(data) {
      that.showTargetDB = false;
      that.TargetDBTitle = data.title;
      that.TargetDBColumns = data.columns;
      that.TargetDBRows = data.rows;
      that.testWikidataGet();
    });
  }
}
