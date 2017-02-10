/*
(c) Copyright 2016-2017 Hewlett Packard Enterprise Development LP

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import Resource from './resource';

export default class Alert extends Resource {

  constructor(oneViewResource) {
    if (oneViewResource) {
      super(oneViewResource);
      this.associatedResource = oneViewResource.associatedResource;
      this.severity = oneViewResource.severity;
      this.alertState = oneViewResource.alertState;
      this.taskHyperlink = oneViewResource.taskHyperlink;
    }
  }

  buildSlackFields() {
    let fields = [];
    for (const field in this) {
      if (this.__isNonDisplayField__(field) || !this[field]) {
        continue;
      }
      if (field === 'associatedResource') {
        fields.push({
          title: 'Resource',
          short: true,
          value: '<' + this[field].resourceHyperlink + '|' + this[field].resourceName + '>'
        });
      } else {
        fields.push({
            title: field,
            short: true,
            value: this[field]
          });
      }
    }
    return fields;
  }

  buildHipChatOutput() {
    let output = '';
    for (const field in this) {
      if (this.__isNonDisplayField__(field) || !this[field]) {
        continue;
      }
      if (field === 'associatedResource') {
        output += '\t\u2022 Resource: ' + this[field].resourceName + '\n';
      } else {
        output += '\t\u2022 ' + field + ': ' + this[field] + '\n';
      }
    }
    //Add status to output only for HipChat
    output += '\t\u2022 Severity: ' +  this.severity + '\n';
    return output;
  }

  __isNonDisplayField__(field){
    var nonDisplayFields = ['type', 'status', 'severity', 'hyperlink'];
    return nonDisplayFields.includes(field.toLowerCase());
  }
}
