/* eslint-disable */

//
// No Angular allowed here. This is pure JS
//
import _ from 'lodash';

import oauthSignature from 'oauth-signature';

const wikidataItemSandboxId = 'Q4115189';


// make a key-value string from a JavaScript Object
function _serialize(obj) {
  var query = [];
  var props = Object.getOwnPropertyNames(obj);
  props.forEach(function (prop) {
      query.push(encodeURIComponent(prop) + "=" + encodeURIComponent(obj[prop]));
  });
  return query.join("&");
}


function jsonp(url, key, callback) {
  var head = document.head;
  var script = document.createElement('script');
    // generate minimally unique name for callback function
  var callbackName = 'f' + Math.round(Math.random() * Date.now());

  // set request url
  script.setAttribute('src',
    /*  add callback parameter to the url
      where key is the parameter key supplied
      and callbackName is the parameter value */
    (url + (url.indexOf('?') > 0 ? '&' : '?')
       + key + '=' + callbackName));

  /*  place jsonp callback on window,
    the script sent by the server should call this
    function as it was passed as a url parameter */
  window[callbackName] =
    function(json){
      // suicide
      window[callbackName] = undefined;
      // clean up script tag created for request
      setTimeout(function(){
        head.removeChild(script);
      }, 0);
      // hand data back to the user
      callback(json);
    };
  // actually make the request
  head.appendChild(script);
}


export default class Wikidata {
  constructor($scope, $resource, $http, $timeout) {
    this.$scope = $scope;
    this.$resource = $resource;
    this.$http = $http;
    this.$timeout = $timeout;
    this.restoreWikidataSessionKeys();
  }

  restoreWikidataSessionKeys() {
    this.lgname = window.localStorage.getItem('lgname') || '';
    this.lgpassword = window.localStorage.getItem('lgpassword') || '';
    this.oauth_consumer_key = window.localStorage.getItem('oauth_consumer_key') || '';
    this.oauth_token = window.localStorage.getItem('oauth_token') || '';
    this.consumerSecret = window.localStorage.getItem('consumerSecret') || '';
    this.tokenSecret = window.localStorage.getItem('tokenSecret') || '';

    console.log('restoreWikidataSessionKeys lgname', this.lgname);
  }

  setWikidataSessionKeys(lgname, lgpassword, oauth_consumer_key, oauth_token, consumerSecret, tokenSecret) {
    window.localStorage.setItem('lgname', lgname);
    window.localStorage.setItem('lgpassword', lgpassword);
    window.localStorage.setItem('oauth_consumer_key', oauth_consumer_key);
    window.localStorage.setItem('oauth_token', oauth_token);
    window.localStorage.setItem('consumerSecret', consumerSecret);
    window.localStorage.setItem('tokenSecret', tokenSecret);
    this.restoreWikidataSessionKeys();
  }

  testWikidataGet(continuation) {
    console.log('testWikidataGet');
    var that = this;
    var wikiDataString = 'https://www.wikidata.org/w/api.php';
    var doctorBotSandbox = 'https://www.wikidata.org/wiki/User:DoctorBot/sandbox.json';
    var doctorBotId = 'User:DoctorBot';
    var pinkerID = 'Q212730'; // wikidata-id of Steven Pinker
    var wikiDataArgs = '?action=wbgetentities&format=json&ids=' + wikidataItemSandboxId + '&languages=en&origin=*&props=claims';
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        console.log('xmlHttp:', xmlHttp);
        var responseText = JSON.parse(xmlHttp.responseText);
        var claims = responseText.entities[wikidataItemSandboxId].claims;
        console.log('claims:', claims);
        var rows = _.map(claims,
                              function(c) {
                                var links = [];
                                for (var r in c) {
                                  var mainsnak = c[r].mainsnak;
                                  links.push({
                                              property: mainsnak.property,
                                              propertyLink: 'https://www.wikidata.org/wiki/Property:' + mainsnak.property,
                                              value: mainsnak.datavalue,
                                              valueLink: 'https://www.wikidata.org/wiki/' + mainsnak.datavalue.value.id,
                                              });
                                }
                                return {
                                  claim: c,
                                  links: links
                                };
                              });
        var result = {
          title: 'Wikidata Item Sandbox',
          columns: ['links'],
          rows: rows
        };
        continuation(result);
      }
    };
    // xmlHttp.setRequestHeader('origin', '*');
    xmlHttp.withCredentials = false;
    xmlHttp.open('GET', wikiDataString + wikiDataArgs, true); // true for asynchronous
    //         params: {
    //                   origin: '*',
    //                   format: 'json',
    //                   // meta: 'userinfo',
    //                   action: 'wbgetentities',
    //                   ids: wikidataItemSandboxId,
    //                   languages: 'en',
    //                   // sites: 'enwikidata',
    //                   // titles: 'Wikidata:Sandbox',
    //                   // props: 'info|sitelinks|aliases|labels|descriptions|claims|datatype'
    //                   props: 'claims'
    //                 }

    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    // xmlHttp.setRequestHeader('origin', '*');
    xmlHttp.withCredentials = false;
    xmlHttp.send(null);
  }
  // /w/api.php?action=query&format=json&meta=tokens

  getEditTokenViaJSONP(continuation) {
    var getTokenURL = 'https://www.wikidata.org/w/api.php?action=query&format=json&meta=tokens&origin=*';
    jsonp(getTokenURL, 'callback', function(data){
        console.log('getEditTokenViaJSONP', data);
    });
  }

  getEditToken(continuation) {
    console.log('getEditToken');
    var that = this;
    var getTokenURL = 'https://www.wikidata.org/w/api.php?action=query&meta=tokens&format=json';
    window.callback = function() {
      console.log('callback');
    };
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        console.log('xmlHttp.responseText:', xmlHttp.responseText);
        var response = JSON.parse(xmlHttp.responseText);
        console.log('getEditToken:', response);
        continuation(response.query.tokens.csrftoken);
      }
    };
    // xmlHttp.setRequestHeader('origin', '*');
    console.log('open', 'GET', getTokenURL);
    xmlHttp.open('GET', getTokenURL); // true for asynchronous
    // xmlHttp.withCredentials = false;
    // xmlHttp.setRequestHeader('Content-Type', 'application/json');
    // xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // xmlHttp.setRequestHeader('origin', '*');
    xmlHttp.send(null);
  }

  getLoginToken(continuation) {
    console.log('getLoginToken');
    var that = this;
    var getTokenURL = 'https://www.wikidata.org/w/api.php?action=query&format=json&meta=tokens&type=login';
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        console.log('xmlHttp.responseText:', xmlHttp.responseText);
        var response = JSON.parse(xmlHttp.responseText);
        console.log('getLoginToken:', response);
        continuation(response);
      }
    };
    // xmlHttp.setRequestHeader('origin', '*');
    xmlHttp.open('GET', getTokenURL, true); // true for asynchronous
    xmlHttp.withCredentials = false;
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    // xmlHttp.setRequestHeader('origin', '*');
    xmlHttp.send(null);
  }

  loginWithBotPW(continuation) {
    console.log('loginWithBotPW entry');
    var that = this;
    var getTokenURL = 'https://www.wikidata.org/w/api.php?action=query&format=json&meta=tokens&callback=?';
    var loginUrl = 'https://www.wikidata.org/w/api.php';
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        console.log('xmlHttp.responseText:', xmlHttp.responseText);
        var response = JSON.parse(xmlHttp.responseText);
        console.log('loginWithBotPW response:', response);
        continuation(response.login.token);
      }
    };
    // action=login&format=json&lgname=BOTNAME&lgpassword=BOTPASSWORD
    // var args = '?action=login&format=json&lgname=DoctorBot%40DoctorBot&lgpassword=DUMMY';
    var args = '';  // ?origin=*';
    xmlHttp.open('POST', loginUrl + args, true); // true for asynchronous
    xmlHttp.withCredentials = true;
    xmlHttp.setRequestHeader('Content-Type', 'text/plain');
    var params = {
      action: 'login',
      format: 'json',
      lgname: this.lgname,
      lgpassword: this.lgpassword
    };
    var paramString = 'action=login&format=json&lgname=DoctorBot@DoctorBot&lgpassword=DUMMY';
    xmlHttp.send(paramString);
  }


  generateOAuthHeader(method, url, urlParams, postParams) {
    console.log('generateOAuthHeader', method, url, urlParams, postParams);
    var that = this;
    var getTokenURL = 'https://www.wikidata.org/w/api.php?action=query&format=json&meta=tokens&callback=?';

    var oauthParameters = {
      oauth_consumer_key : this.oauth_consumer_key,
      oauth_token : this.oauth_token,
      oauth_nonce : 'DUMMY',
      oauth_timestamp : 'DUMMY',
      oauth_signature_method : 'HMAC-SHA1',
      oauth_version : '1.0'
    };
    console.log('oauthParameters', oauthParameters);

    var consumerSecret = this.consumerSecret;
    var tokenSecret = this.tokenSecret;

    var oauthParametersWithUrlAndPost = Object.assign({}, oauthParameters, urlParams, postParams);

    console.log('oauthParametersWithUrlAndPost', oauthParametersWithUrlAndPost);
    // generates a RFC 3986 encoded, BASE64 encoded HMAC-SHA1 hash
    var encodedSignature = oauthSignature.generate('POST', url, oauthParametersWithUrlAndPost, consumerSecret, tokenSecret);
    console.log('encodedSignature', encodedSignature);
    // // generates a BASE64 encode HMAC-SHA1 hash
    // signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret,
    //     { encodeSignature: false});
  }


  testWikidataLoginOAuth() {
    console.log('testWikidataLoginOAuth');

    var oauth = this.generateOAuthHeader(
                            'GET',
                            'https://www.wikidata.org/w/api.php',
                            {},     // urlParams
                            {});    // postParams
    console.log('testWikidataLoginOAuth returns', oauth);
  }

  testWikidataLoginBot() {
    console.log('testWikidataLoginBot');

    this.loginWithBotPW(function(token) {
      console.log('loginWithBotPW returns token', token);
    });
  }

  testWikidataPost(continuation) {
    console.log('testWikidataPost');
    var that = this;

    // this.generateOAuthHeader(method, url, urlParams, postParams);
    // continuation({});

    this.getEditToken(function(token) {
      console.log('getEditToken returns', token);

      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
          console.log('xmlHttp.responseText:', xmlHttp.responseText);
          var response = JSON.parse(xmlHttp.responseText);
          console.log('testWikidataPost:', response);
          continuation(response);
        }
      };


      // https://www.wikidata.org/w/api.php?action=query&format=json&meta=tokens
      var wikiDataArgs = { // '?action=wbcreateclaim&format=json&ids=' + wikidataItemSandboxId + '&languages=en&origin=*&props=claims';
        // action: 'wbcreateclaim',
        entity: wikidataItemSandboxId,
        property: 'P370', // https://www.wikidata.org/wiki/Property:P370
        snaktype: 'value',
        value: JSON.stringify('Hello World'),
        token: token,
        bot: 1
      };

      var args = 'action=wbcreateclaim&format=json';  // ?origin=*';
      xmlHttp.open('POST', 'https://www.wikidata.org/w/api.php?' + args, true); // true for asynchronous
      xmlHttp.setRequestHeader('Content-Type', 'application/json');
      // xmlHttp.withCredentials = true;
      xmlHttp.send(_serialize(wikiDataArgs));
    });
  }
}
