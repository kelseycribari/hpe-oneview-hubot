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

import { buildD3Chart } from '../charting/chart';
const svg2png = require("svg2png");
const Bluebird = require('bluebird');
const fs = require("fs");
const path = require("path");
const expect = require("chai").expect;

let sinon = require('sinon');
let chai = require('chai');

chai.should();

function relative(relPath) {
    return path.resolve(__dirname, relPath);
}

describe('Chart', () => {

  let networkMetricList = [
    {metricName:'receiveKilobytesPerSec',metricSamples: [ '69', '69', '69']},
    {metricName:'transmitKilobytesPerSec',metricSamples: [ '71', '71', '71',]}
  ];

  it('buildD3Chart', () => {
    let robot = {adapterName: 'shell', logger: {}};
    let svg = sinon.createStubInstance(svg2png);
    sinon.stub.returns(Bluebird.resolve());

    return buildD3Chart(robot, 'room', 'result', networkMetricList, 300).then((result) => {
      result.should.equal('Adapter shell does not support web file upload.');
      expect(fs.existsSync(`result-chart.png`)).to.equal(true);
    });
  });
});
