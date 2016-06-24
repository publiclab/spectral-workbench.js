#!/usr/bin/env node

// This example creates a spectrum from JSON data, then
// uploads it to the specified server (default spectralworkbench.org)

var fs = require('fs');
var path = require('path');
var SpectralWorkbench = require('../dist/spectral-workbench.js').SpectralWorkbench;

var options = parseArgv(process.argv);

if (options.hasOwnProperty('help')) {
  help();
} else {
  run();
}

function run() {

  if (!options.hasOwnProperty('token')) console.log('API token required: see README.md');
  if (!options.hasOwnProperty('file')) console.log('file required: see --help');
  options.url   = options.url   || "https://spectralworkbench.org/spectrums.json";
  options.title = options.title || "Uploaded data"; 

  var content = fs.readFileSync(options.file);

  upload(JSON.parse(content));

}


function upload(fileData) {

  var data = {
    "title": options.title,
    "data": { 
      "lines": fileData
    }
  }

  var spectrum = new SpectralWorkbench.Spectrum(data);

  if (options.hasOwnProperty('calibrate')) {

    var args = options.calibrate.split(','),
        w1   = args[0],
        w2   = args[1],
        x1   = args[2],
        x2   = args[3];

    // this is non-ideal, but will be expanded upon with a better calibrate API:
    spectrum.json.data.lines = spectrum.calibrate(w1, w2, x1, x2);
    spectrum.load(); // calibrate does not save

  }

  spectrum.upload(
    options.url, 
    function callback(err, httpResponse, body) { 
      console.log(body) 
    }, 
    { 
      token: options.token // Find your secret API token on your SpectralWorkbench.org profile page
    }
  );

}

function help() {
  console.log('upload.js')
  console.log('  --title       <string> a title for your spectrum. Default: "Uploaded data"')
  console.log('  --url         <string> the server to upload to. Default: https://spectralworkbench.org')
  console.log('  --token       <string> secret API token, from server (see README). Default: none')
  console.log('  --file        <path>   path to a CSV file. Default: none')
  console.log('')
  console.log('  --calibrate   <w1>,<w2>,<x1>,<x2>, four numbers specifying wavelength 1 & 2,')
  console.log('                                     and (integer) pixels 1 & 2, on which to base')
  console.log('                                     a linear calibration.')
  console.log('')
  console.log('This example creates a spectrum from CSV data, then')
  console.log('uploads it to the specified server (default spectralworkbench.org)')
  console.log('')
  console.log('Example:')
  console.log('> upload.js --token 1234567890 --file spectrum.json')
  console.log('')
  console.log('JSON format:')
  console.log('   [')
  console.log('     {"average": 64.33, "r": 69, "g": 46, "b": 78, "wavelength": 269.0 },')
  console.log('     {"average": 63.33, "r": 71, "g": 45, "b": 74, "wavelength": 277.7 },')
  console.log('     {"average": 64,    "r": 71, "g": 47, "b": 74, "wavelength": 291.5 },')
  console.log('     {"average": 64,    "r": 68, "g": 49, "b": 75, "wavelength": 303.6 }')
  console.log('   ]')
  console.log('')
}

// This is the standard function for parsing process.argv. It will return
// an object that where `--argumentName` is a property name and the
// proceding argument is the value. If there is no proceeding value then
// it will be interpreted as a boolean true.
function parseArgv(argv) {
  params = {}
  argv.forEach(function(arg, i) {
    if (arg.substr(0, 2) == '--') {
      paramName = arg.substr(2, arg.length)
      nextArg = argv[i+1]
      if (typeof nextArg == 'string' && nextArg.substr(0, 2) == '--') {
        params[paramName] = true
      }
      else {
        params[paramName] = nextArg
      }
    }
  })
  return params
}

