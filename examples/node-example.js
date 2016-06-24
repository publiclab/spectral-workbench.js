#!/usr/bin/env node

// This example creates a spectrum from JSON data, then, separately, 
// imports an image file and converts its first line into nested array data.

// More finished (and useful) examples can be found in the /scripts/ directory.

var SpectralWorkbench = require('../dist/spectral-workbench.js').SpectralWorkbench;

var data = {
  "data": { 
    "title": "Test spectrum",
    "lines":[ // as many data points as you like may be entered here:
      {"average":64.3333,"r":69,"g":46,"b":78,"wavelength":269.089},
      {"average":63.3333,"r":71,"g":45,"b":74,"wavelength":277.718},
      {"average":64,"r":71,"g":47,"b":74,"wavelength":291.524},
      {"average":64,"r":68,"g":49,"b":75,"wavelength":303.604}
    ]
  }
}

var spectrum = new SpectralWorkbench.Spectrum(data);

console.log('spectrum.getIntensity(282):', spectrum.getIntensity(282));

var image;

image = new SpectralWorkbench.Image(false, {
          url: 'spec/javascripts/fixtures/test-spectrum-9.png'
        }); 

console.log('image.getLine(1):', image.getLine(1));
