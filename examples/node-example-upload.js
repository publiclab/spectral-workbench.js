#!/usr/bin/env node

// This example creates a spectrum from JSON data, then, separately, 
// imports an image file and converts its first line into nested array data.

var SpectralWorkbench = require('../dist/spectral-workbench.js').SpectralWorkbench;

var data = {
  "title": "Test spectrum",
  "data": { 
    "lines":[ // as many data points as you like may be entered here:
      {"average":64.3333,"r":69,"g":46,"b":78,"wavelength":269.089},
      {"average":63.3333,"r":71,"g":45,"b":74,"wavelength":277.718},
      {"average":64,"r":71,"g":47,"b":74,"wavelength":291.524},
      {"average":64,"r":68,"g":49,"b":75,"wavelength":303.604}
    ]
  }
}

var spectrum = new SpectralWorkbench.Spectrum(data);

spectrum.upload(
  'http://localhost:3000/spectrums.json', 
  function callback(err, httpResponse, body) { 
    console.log(body) 
  }, 
  { 
    token: "31343338303237303934" // Find your secret API token on your SpectralWorkbench.org profile page
  }
);
