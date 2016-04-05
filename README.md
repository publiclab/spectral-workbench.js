spectral-workbench.js
====

The JavaScript heart of Spectral Workbench; a Public Lab project to record, manipulate, and analyze spectrometric data. 

spectral-workbench.js is currently set up to run in a browser, but some parts may work headless, in a JavaScript console. We hope to further separate the views from the library logic so that headless or Node.js usage is easier.

This library is primarily used in the Spectral Workbench application, running at http://spectralworkbench.org, which is a Ruby on Rails project that is also [open source](https://github.com/publiclab/spectral-workbench). Read about how to build and use your own spectrometer with it here: http://publiclab.org/wiki/spectrometer


****


## Installation

First, run:

    npm install

then:

    bower install


## Usage on a webpage

To begin using spectral-workbench.js on a webpage, you'll need to include jQuery, and to use any HTML-based features (such as UI or graphing), you'll need to include: 


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

### Inputting data

We currently use a legacy data format we'd like to simplify, but for now, you can create a Spectrum object from data in the following format:

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


****


## Automated tests


To run Jasmine tests, open `spec/javascripts/test.html` in a browser. You can run them on our Github Pages-hosted suite here: http://publiclab.github.io/spectral-workbench.js/test.html.


## Contributing

We welcome community contributions to spectral-workbench.js! Learn more about contributing to Spectral Workbench or other Public Lab code projects on this page: http://publiclab.org/wiki/developers


## Bug reports & troubleshooting

If you are submitting a bug, please include:

* where/when you see the issue, so we can try to reproduce it
* any relevant JavaScript console output
* your browser (and version if possible!)
* anything you can about the sequence of events which led to the bug 

Thank you for your help!  

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
