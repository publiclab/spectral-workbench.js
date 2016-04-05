spectral-workbench.js
====

The JavaScript heart of Spectral Workbench; a Public Lab project to record, manipulate, and analyze spectrometric data. 

spectral-workbench.js is currently set up to run in a browser, but some parts may work headless, in a JavaScript console. We hope to further separate the views from the library logic so that headless or Node.js usage is easier.

This library is primarily used in the Spectral Workbench application, running at http://spectralworkbench.org, which is a Ruby on Rails project that is also [open source](https://github.com/publiclab/spectral-workbench). Read about how to build and use your own spectrometer with it here: http://publiclab.org/wiki/spectrometer


****


## Installation

To begin using spectral-workbench.js, you'll need to include its dependencies: 


````html
<script src="node_modules/jquery/dist/jquery.min.js"></script>
<script src="bower_components/d3/d3.js" type="text/javascript"></script>                                                                              
<script src="bower_components/nvd3/build/nv.d3.js" type="text/javascript"></script>                                                                              
<script src="bower_components/bootstrap-css/js/bootstrap.min.js"></script>
<script src="bower_components/moment/moment.js"></script>
````

Then include the library: 
 
````html
<script src="dist/spectral-workbench.js" type="text/javascript"></script>

````
To see graphed output, you'll need a `<div>` with the `id` "graph", like so:

````html
    <div id="graphing">
 
      <div id="graph">
        <div class="zoom"><a onClick="graph.zoom();" class="btn-zoom"><i class="fa fa fa-zoom-in"></i></a></div>
        <i class="fa fa fa-spinner fa fa-spin"></i>
      </div>
 
    </div>
````

We plan to abstract this so that a graph may be appended to any `div` specified in the constructor.


````js
    jQuery(document).ready(function($) {
      graph = new SpectralWorkbench.Graph({
        spectrum_id: 1 // unique id <int>, typically a database primary key
      });
    });
````


For a working example, please see the automated test runner, linked to below.


****


## Automated tests


To run Jasmine tests, open `spec/javascripts/test.html` in a browser.


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
