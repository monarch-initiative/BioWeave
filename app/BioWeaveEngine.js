//
// No Angular allowed here. This is pure JS
//

import Papa from 'papaparse';
import _ from 'lodash';

export default class BioWeaveEngine {
  constructor() {
  }

  loadTSV(url, columns, title, skipLines, complete) {
    var that = this;

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
          var config = {
            download: false,
            delimiter: '\t',  // auto-detect
            header: false,
            comments: false,
            // dynamicTyping: false,
            // preview: 0,
            // encoding: "",
            // worker: false,
            // comments: false,
            // step: undefined,
            // complete: undefined,
            // error: undefined,
            // download: false,
            skipEmptyLines: true,
            // chunk: undefined,
            // fastMode: undefined,
            // beforeFirstChunk: undefined,
            // withCredentials: undefined
          };

          config.complete = function(results, file) {
            complete(results.data);
          };

          var tsvSource = xmlHttp.responseText.split('\n');
          tsvSource = tsvSource.slice(skipLines);
          tsvSource = tsvSource.join('\n');
          Papa.parse(tsvSource, config);
        }
    };
    xmlHttp.open("GET", url, true); // true for asynchronous
    xmlHttp.send(null);
  }

}



