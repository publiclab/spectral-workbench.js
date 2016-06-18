spectral-workbench.js
====

[![Build Status](https://travis-ci.org/publiclab/spectral-workbench.js.svg?branch=master)](https://travis-ci.org/publiclab/spectral-workbench.js)

The JavaScript heart of Spectral Workbench; a Public Lab project to record, manipulate, and analyze spectrometric data. 

spectral-workbench.js is currently set up to run in a browser, but some parts may work headless, in a JavaScript console. We hope to further separate the views from the library logic so that headless or Node.js usage is easier.

This library is primarily used in the Spectral Workbench application, running at http://spectralworkbench.org, which is a Ruby on Rails project that is also [open source](https://github.com/publiclab/spectral-workbench). Read about how to build and use your own spectrometer with it here: http://publiclab.org/wiki/spectrometer


****


## Installation


### In Node.js

To install spectral-workbench, run:

    npm install spectral-workbench


### In a browser

To begin using spectral-workbench.js on a webpage, you'll need to include jQuery, and to use any HTML-based features (such as UI or graphing), you'll need to include its dependencies.

First, run:

    npm install

then:

    bower install

Your page should include:

````html
<script src="node_modules/jquery/dist/jquery.min.js"></script>
<script src="bower_components/d3/d3.js" type="text/javascript"></script>                                                                              
<script src="bower_components/nvd3/build/nv.d3.js" type="text/javascript"></script>                                                                              
<script src="bower_components/bootstrap-css/js/bootstrap.min.js"></script>
<script src="bower_components/moment/moment.js"></script>
<link href="bower_components/nvd3/build/nv.d3.css" rel="stylesheet">
````

Then include the library itself: 
 
````html
<script src="dist/spectral-workbench.js" type="text/javascript"></script>
````

To see graphed output, you'll need a `<div>` with the `id` "graph", like so:

````html
<div id="graph"></div>
````

A spectrum may be displayed in a [d3-based](http://d3js.org) graph with the Graph constructor: 

````js

jQuery(document).ready(function($) {
  graph = new SpectralWorkbench.Graph({
    spectrum_id: 1, // unique id <int>, typically a database primary key
    selector: '#graph' // defaults to "#graph" using jQuery selector syntax
  });
});

````

****

## Usage


### Inputting data

You can pass a nested array of `[wavelength, intensity]` data to the Spectrum constructor like this:

````js

var data = [
  [400, 24],
  [410, 44],
  [420, 42],
  [430, 45],
  [440, 20]
];

var spectrum = new SpectralWorkbench.Spectrum(data);

````

This assumes monochrome input with units `[nanometers, 0-255]`, although if you're using a [Public Lab webcam-based spectrometer](https://publiclab.org/wiki/spectrometer), you'll be dealing with RGB data. 

For a working example of an array-based spectrum see: https://publiclab.github.io/spectral-workbench.js/examples/array.html

You can also use a string of comma-separated values (a CSV), where each line is `wavelength,intensity` (similarly to the array format above):

````js

// \n instead of linebreaks here: 
var string = "400,24\n410,44\n420,42\n430,45\n440,20";

var spectrum = new SpectralWorkbench.Spectrum(string);

````

TSVs (tab-separated values) are also supported as of v0.0.10.

Most tests continue to use a legacy data format (that used by the SpectralWorkbench.org service) which we'd like to simplify, but for now, you can create a Spectrum object from JSON data in the following format, that does accept RGB pixel data:

````js

var data = {
  "data": { 
    "name": "Test spectrum",
    "lines":[ // as many data points as you like may be entered here:
      { "average":64.3333, "r":69, "g":46, "b":78, "wavelength":269.089 },
      { "average":31,      "r":33, "g":19, "b":41, "wavelength":958.521 }
    ]
  }
}

var spectrum = new SpectralWorkbench.Spectrum(data);

````

For a working example, see: https://publiclab.github.io/spectral-workbench.js/examples/


### In Node.js

To write a script in Node.js, you could create and run a file like this:

````js

#!/usr/bin/env node

var SpectralWorkbench = require('spectral-workbench').SpectralWorkbench;

var data = {
  "data": { 
    "name": "Test spectrum",
    "lines":[ // as many data points as you like may be entered here:
      {"average":64.3333,"r":69,"g":46,"b":78,"wavelength":269.089},
      {"average":63.3333,"r":71,"g":45,"b":74,"wavelength":277.718},
      {"average":64,"r":71,"g":47,"b":74,"wavelength":291.524},
      {"average":64,"r":68,"g":49,"b":75,"wavelength":303.604}
    ]
  }
}

var spectrum = new SpectralWorkbench.Spectrum(data);

console.log(spectrum.getIntensity(282));

````

And run it with `node yourscript.js`


### Manipulating spectrum data

Once you've initialized a Spectrum, you can add Operations to it using the following syntax:

````js

var spectrum = new SpectralWorkbench.Spectrum(data);

spectrum.addAndParseTag('smooth:3');

````

Operations are a type of tag that are passed as strings in `operation:value` format, and there are a variety of operations available, including:

* `smooth`
* `subtract`
* `transform`
* `crossSection` (requires an image)
* plus several more

Read more at https://publiclab.org/wiki/spectral-workbench-operations


****


## Contributing

We welcome community contributions to spectral-workbench.js! Learn more about contributing to Spectral Workbench or other Public Lab code projects on this page: http://publiclab.org/wiki/developers


## Bug reports & troubleshooting

If you are submitting a bug, please include:

* where/when you see the issue, so we can try to reproduce it
* any relevant JavaScript console output
* your browser (and version if possible!)
* anything you can about the sequence of events which led to the bug 

Thank you for your help!


## Automated tests


To run Jasmine tests, open `test.html` in a browser. You can also run them on our Github Pages-hosted suite here: http://publiclab.github.io/spectral-workbench.js/test.

Alternatively, if you have phantomjs installed, run: `grunt jasmine` to run tests from the command line.


## Building

spectral-workbench.js is built using a Grunt task from the source files in `/src/`, and the compiled file is saved to `/dist/spectral-workbench.js`. To build, run `grunt build`. To watch files for changes, and build whenever they occur, run `grunt`. You'll need the Grunt CLI -- `npm install -g grunt-cli`. 


****

Copyright 2011-2015 Public Lab
publiclab.org | spectralworkbench.org

## License

spectral-workbench.js is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Spectral Workbench is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Spectral Workbench.  If not, see <http://www.gnu.org/licenses/>.
