'use strict';

var fs = require('fs');
var test = require('tape');
var SpectralWorkbench = require('../../dist/spectral-workbench.js').SpectralWorkbench;

var spectrum;

test('spectrum initializes with sample data', function (t) {

  var data = {
    "title": "Test spectrum",
    "data": { 
      "lines":[ // as many data points as you like may be entered here:
        { "average" :64, "r": 69, "g": 46, "b": 78, "pixel": 0 },
        { "average" :63, "r": 71, "g": 45, "b": 74, "pixel": 1 },
        { "average" :64, "r": 71, "g": 47, "b": 74, "pixel": 2 },
        { "average" :64, "r": 68, "g": 49, "b": 75, "pixel": 3 }
      ]
    }
  }

  spectrum = new SpectralWorkbench.Spectrum(data);

  t.equal(spectrum.average[0].x, 0);
  t.equal(spectrum.average[0].y, 0.25);

  // this is non-ideal, but will be expanded upon with a better calibrate API:
  spectrum.json.data.lines = spectrum.calibrate(400, 500, 0, 3);
  spectrum.load(); // calibrate does not save

  t.equal(spectrum.average[0].x, 400);
  t.equal(spectrum.average[0].y, 0.25);

  t.equal(spectrum.average[3].x, 500);
  t.equal(spectrum.average[3].y, 0.25);

  t.end();

});


test('image initializes and responds to getLine', function (t) {

  var image = new SpectralWorkbench.Image(false, {
          url: 'spec/javascripts/fixtures/test-spectrum-9.png'
        }); 

  t.deepEqual(image.getLine(1)[0], [ 69, 46, 78, 255 ]);
  t.end();

});
