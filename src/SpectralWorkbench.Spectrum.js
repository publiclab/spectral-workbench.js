SpectralWorkbench.Spectrum = SpectralWorkbench.Datum.extend({

  sigFigWavelength: 4, // currently used in calibrate() for wavelength
  sigFigIntensity: 4, // since image channel data is 0-255, or 000.4-100.0
  channels: ["average", "red", "green", "blue"],

  /* ======================================
   * <data> is a JSON object as it arrives from the server at SpectralWorkbench.org
   */
  init: function(data, _graph) {

    // _super is Datum; this stashes <data> in this.json
    this._super(data, _graph);

    var _spectrum = this;

   _spectrum.load = function() {

     if (_spectrum.args instanceof Array) _spectrum.decodeArray(_spectrum.args);
     else if (typeof _spectrum.args == 'string') _spectrum.decodeCSV(_spectrum.args);
     else if (_spectrum.json && (_spectrum.json.lines || _spectrum.json.data.lines)) _spectrum.decodeJSON(_spectrum.json); // snapshot or spectrum format

    }

    /* ======================================
     * Decodes and saves a [wavelength, intensity] array of 
     * data into spectrum.average/red/green/blue
     */
    _spectrum.decodeCSV = function(string) {

        var points = string.split('\n');

        points.forEach(function(point, i) { 
          points[i] = [ +point.split(',')[0], +point.split(',')[1] ];
        });

        _spectrum.decodeArray(points);

    }

    /* ======================================
     * Decodes and saves a [wavelength, intensity] array of 
     * data into spectrum.average/red/green/blue
     */
    _spectrum.decodeArray = function(array) {

      _spectrum.average = [];
      _spectrum.red     = [];
      _spectrum.green   = [];
      _spectrum.blue    = [];

      // Set up x and y properties like data.x and data.y for d3
      array.forEach(function(line, i) {
     
        var x = line[0];

        // Only actually add it if it's in specified wavelength range ([start, end]), if any;
        // or, if there's no graph at all, add it. Perhaps range should be stored in spectrum?
        // But we need range in the graph to calculate viewport sizes.
        // Tortured:
        if (!_spectrum.graph || (!_spectrum.graph.range || (x >= _spectrum.graph.range[0] && x <= _spectrum.graph.range[1]))) {

          _spectrum.average.push({ y: _spectrum.scale8BitToFloat(line[1]), x: x })
          _spectrum.red.push(    { y: _spectrum.scale8BitToFloat(line[1]), x: x })
          _spectrum.green.push(  { y: _spectrum.scale8BitToFloat(line[1]), x: x })
          _spectrum.blue.push(   { y: _spectrum.scale8BitToFloat(line[1]), x: x })

        }

      });

      _spectrum.json = {};
      _spectrum.json.data = { 'lines': [] };
      _spectrum.json.data.lines = _spectrum.encodeJSON();

    }


    /* ======================================
     * Decodes and saves a SpectralWorkbench.org-style JSON object of 
     * data into spectrum.average/red/green/blue
     * UNTESTED IN JASMINE
     */
    _spectrum.decodeJSON = function(json) {

      _spectrum.average = [];
      _spectrum.red     = [];
      _spectrum.green   = [];
      _spectrum.blue    = [];

      // Rearrange in case we got a Snapshot response (which is more minimal) instead of a Spectrum response
      if (json.lines) _spectrum.json.data = { 'lines': json.lines };

      // Set up x and y properties like data.x and data.y for d3
      json.data.lines.forEach(function(line, i) {
     
        if (line.wavelength == null) var x = line.pixel; // change graph labels
        else                         var x = line.wavelength;

        // Only actually add it if it's in specified wavelength range ([start, end]), if any;
        // or, if there's no graph at all, add it. Perhaps range should be stored in spectrum?
        // But we need range in the graph to calculate viewport sizes.
        // Tortured:
        if (!_spectrum.graph || (!_spectrum.graph.range || (x >= _spectrum.graph.range[0] && x <= _spectrum.graph.range[1]))) {

          _spectrum.average.push({ y: _spectrum.scale8BitToFloat(line.average), x: x })
 
          if (line.r != null) _spectrum.red.push(  { y: _spectrum.scale8BitToFloat(line.r), x: x })
          if (line.g != null) _spectrum.green.push({ y: _spectrum.scale8BitToFloat(line.g), x: x })
          if (line.b != null) _spectrum.blue.push( { y: _spectrum.scale8BitToFloat(line.b), x: x })

        }

      });

    }


    /* ======================================
     * Prepares a server-ready formatted JSON object of 
     * currently displayed data based on spectrum.average/red/green/blue
     * UNTESTED IN JASMINE
     */
    _spectrum.encodeJSON = function() {

      var lines = [];

      _spectrum.average.forEach(function(line, i) {

        lines.push({
          average:    +_spectrum.average[i].y,
          r:          +_spectrum.red[i].y,
          g:          +_spectrum.green[i].y,
          b:          +_spectrum.blue[i].y   
        });

        if (_spectrum.isCalibrated()) lines[lines.length-1].wavelength = _spectrum.average[i].x;
        else                          lines[lines.length-1].pixel      = _spectrum.average[i].x;
        
      }); 

      return lines;

    }


    /* ======================================
     * Scales data from an 8-bit float to a 0-1 float
     * at _spectrum.sigFigIntensity precision
     * UNTESTED IN JASMINE
     */
    _spectrum.scale8BitToFloat = function(value) {

      return parseInt(value / 2.55) / 100;

    }


    /* ======================================
     * Scales data from a 0-1 float to an 8-bit float 
     * at _spectrum.sigFigIntensity precision
     * UNTESTED IN JASMINE
     */
    _spectrum.scaleIntensityTo8Bit = function(value) {

      return (value * 255).toPrecision(_spectrum.sigFigIntensity);

    }


    /* ======================================
     * Returns closest intensity for a given wavelength,
     * from available wavelength/intensity pairs
     */
    _spectrum.getIntensity = function(wavelength, channel) {

      channel = channel || "average";

      channel = _spectrum[channel];

      // reverse it if need be
      if (channel[0].x > channel[channel.length - 1].x) channel.reverse();

      var stepsize        = (channel[channel.length-1].x - channel[0].x) / channel.length,
          startWavelength = channel[0].x,
          wavelengthIndex = parseInt((wavelength - startWavelength) / stepsize);

      // must consider data of different lengths!

      if (wavelengthIndex > 0 && wavelengthIndex < channel.length) {

        return channel[wavelengthIndex].y;

      } else return 0;

    }


    /* ======================================
     * Returns [min, max] x-axis extent of displayed data
     * without wavelength range limiting
     * in nanometers (or pixels if uncalibrated)
     */
    _spectrum.getFullExtentX = function() {

      if (_spectrum.isCalibrated()) {

        var start =  _spectrum.json.data.lines[0].wavelength;
        var end =  _spectrum.json.data.lines[_spectrum.json.data.lines.length-1].wavelength;

      } else {

        var start =  _spectrum.json.data.lines[0].pixel;
        var end =  _spectrum.json.data.lines[_spectrum.json.data.lines.length-1].pixel;

      }

      return [start, end];

    }


    /* ======================================
     * Returns [min, max] x-axis extent of displayed data
     * after any wavelength range limiting
     * in nanometers (or pixels if uncalibrated)
     */
    _spectrum.getExtentX = function() {

      var start =  _spectrum.average[0].x;
      var end =  _spectrum.average[_spectrum.average.length - 1].x;

      return [start, end];

//      return d3.extent(_spectrum.d3()[0].values, function(d){ return d.x; }); // previous version, probably slower?

    }


    /* ======================================
     * Returns [min, max] y-axis extent of displayed data
     */
    _spectrum.getExtentY = function() {

      return d3.extent(_spectrum.d3()[0].values, function(d){ return d.y; });

    }


    /* ======================================
     * Returns nearest point to <x> in data space
     * in given <channel>; default channel is 'average'.
     */
    _spectrum.getNearestPoint = function(x, channel) {

      channel = channel || "average";

      var closest = null;

      channel = _spectrum[channel].forEach(function(pixel) {

        if (closest == null || Math.abs(pixel.x - x) < closest.dist) {

          closest = pixel;
          closest.dist = Math.abs(pixel.x - x);

        }

      });

      return closest;

    }


    /* ======================================
     * Returns highest intensity wavelength (or pixel if uncalibrated) 
     * within <distance> pixels of <x>
     * in given <channel>; default channel is 'average'.
     */
    _spectrum.getNearbyPeak = function(x, distance, channel) {

      channel = channel || "average";

      var max = null,
          compared = 0; // # of pixels compared
          plateau = []; // list of equally high points in case there are multiple; 
                        // we return the center of the plateau; even 
                        // if the plateau is not continuous

      channel = _spectrum[channel].forEach(function(pixel, i) {

        if (pixel.x > x - distance && pixel.x < x + distance) {

          compared += 1;

          if (max == null) max = pixel;

          if (pixel.y > max.y) {

            max = pixel;
            plateau = [];

          } else if (pixel.y == max.y) {

            plateau.push(pixel);

          }

        }

      });

      if (compared > 0) {

        // don't allow plateaus at <3%
        if (plateau.length > 0 && max.y > 0.03) {

          console.log('Found plateau ' + plateau.length + ' wide in given range; returned center.');
          return plateau[~~(plateau.length/2)].x; // the middle of the plateau

        } else return max.x;

      } else {

        console.log('No data fell within ' + distance + ' of ' + x + '.');
        return x; // fallback to original position

      }

    }


    /* ======================================
     * Returns true if the spectrum is calibrated (client-side)
     */
    _spectrum.isCalibrated = function() {

      //return _spectrum.json.data.lines[0].hasOwnProperty('wavelength');
      // rewritten as above was not accounting for unsaved 
      // calibration; below can be wrong but it's very unlikely
      return _spectrum.average[0] && _spectrum.average[0].x != 0;

    }


    /* ======================================
     * Linear calibrates on the client side; then uploads and tags
     * w1 and w2 are nanometer wavelength values, and x1 and x2 are 
     * corresponding pixel positions, measured from left
     */
    _spectrum.calibrateAndUpload = function(w1, w2, x1, x2) {

      _spectrum.json.data.lines = _spectrum.calibrate(w1, w2, x1, x2);

      _spectrum.graph.datum.load()
      _spectrum.graph.reload()
      _spectrum.graph.refresh()

      _spectrum.upload(false, function() {

        _spectrum.getPowerTag('calibration').forEach(function(tag) {

          tag.destroy();

        });

        if (_spectrum.getTag('calibration') == false) _spectrum.addTag('calibration');

        _spectrum.graph.UI.notify("Your new calibration has been saved.", "success");

      });

    }


    /* ======================================
     * Linear calibrates on the client side, but doesn't save;
     * returns a new set of lines which can be used to overwrite
     * spectrum.json.data.lines.
     * w1 and w2 are nanometer wavelength values, and x1 and x2 are 
     * corresponding pixel positions, measured from left.
     */
    _spectrum.calibrate = function(w1, w2, x1, x2, flipping) {

      var stepsize = (w2 - w1) / (x2 - x1),
          startwavelength = w1 - (stepsize * x1),
          output = [],
          lines = _spectrum.json.data.lines;

      if (typeof flipping == "undefined") flipping = true; // deal with flipped images by default

      // account for reversed data:
      if (flipping && _spectrum.graph) {

        if (x1 > x2) {
 
          console.log('flipping data and image due to x1/x2 reversal');

          // I don't believe we *ever* want to actually reverse the data's order!
          // lines = lines.reverse();
          _spectrum.graph.imgEl.addClass('flipped');
 
        } else {
 
          _spectrum.graph.imgEl.removeClass('flipped');
 
        }

      }

      lines.forEach(function(line, i) {

        output.push({
          'average': line.average,
          'r': line.r,
          'g': line.g,
          'b': line.b,
          'wavelength': +(startwavelength + (i * stepsize)).toPrecision(_spectrum.sigFigWavelength)
        });

      });

      return output;

    }


    /* ======================================
     * Converts a nanometer value to a pixel x-value in the original image
     * from raw JSON data, disregarding range, assuming that each
     * spectrum.json.data.lines corresponds to a pixel in the original image,
     * (counting from left) if the current spectrum is calibrated
     */
    _spectrum.nmToPx = function(nm) {

      if (_spectrum.isCalibrated()) {

        var lines = _spectrum.json.data.lines,
            w1 = lines[0].wavelength,
            w2 = lines[lines.length-1].wavelength,
            stepsize = lines.length / (w2 - w1);

        // keep 4 significant digits
        return 0 + (nm * stepsize);

      } else {

        return false;

      }

    }


    /* ======================================
     * Converts a pixel value (counting from left) 
     * from raw JSON data, disregarding range, to a nanometer 
     * value if the current spectrum is calibrated.
     * Result may not correspond to a specific point of data, but use
     * spectrum.getNearestPoint() if needed.
     * Returns false if not calibrated.
     */
    _spectrum.pxToNm = function(px) {

      if (_spectrum.isCalibrated()) {

        var lines = _spectrum.json.data.lines,
            w1 = lines[0].wavelength,
            w2 = lines[lines.length-1].wavelength,
            stepsize = (w2 - w1) / lines.length;

        // keep 4 significant digits
        return w1 + (px * stepsize);

      } else {

        return false;

      }

    }


    /* ======================================
     * Output server-style JSON of the spectrum
     * with all active powertags/operations applied -- exactly as currently seen in the graph
     */
    _spectrum.toJSON = function() {

      var json = [];

      _spectrum.average.forEach(function(pixel, index) {

        json.push({
          'average': +pixel.y,
          'r': +_spectrum.red[index].y,
          'g': +_spectrum.green[index].y,
          'b': +_spectrum.blue[index].y,
          'pixel': index
        });

      });

      return json;

    }


    /* ======================================
     * Iterate through channel data and set precision of 
     * each entry to sigFigures>, but defaulting to
     * _spectrum.sigFigIntensity which is 3.
     */
    _spectrum.setSigFigures = function(sigFigures) {

       sigFigures = sigFigures || _spectrum.sigFigIntensity;

       _spectrum.channels.forEach(function(channel, i) {

         _spectrum[channel].forEach(function(point, i) {

           if (point.y) point.y = +point.y.toPrecision(sigFigures);
           if (point.x) point.x = +point.x.toPrecision(_spectrum.sigFigWavelength);

         });

       });

    }


    /* ======================================
     * Overwrite spectrum.json.data.lines, the raw JSON of the spectrum
     * <y> is the y-position of the cross section of pixels, where 0 is the top row
     * <keepCalibrated> is a boolean which indicates whether to keep or flush the calibration
     */
    _spectrum.imgToJSON = function(y, keepCalibrated) {

      var lines = [];

      _spectrum.graph.image.getLine(y).forEach(function(pixel, index) {

        lines.push({
          'average': +((pixel[0] + pixel[1] + pixel[2]) / 3).toPrecision(_spectrum.sigFigIntensity),
          'r': pixel[0],
          'g': pixel[1],
          'b': pixel[2],
          'pixel': index
        });

        if (keepCalibrated) lines[lines.length - 1].wavelength = _spectrum.pxToNm(index);

      });

      _spectrum.json.data.lines = lines;

    }


    /* ======================================
     * Upload a new json string to the server, overwriting the original. 
     * Not recommended without cloning! But recoverable from original image.
     * Most uses of this function will be deprecated with the Snapshots system:
     * https://publiclab.org/wiki/spectral-workbench-snapshots
     */
    _spectrum.upload = function(url, callback) {

      url = url || '/spectrums/' + _spectrum.id;

      $.ajax({

        url: url,
        type: "PUT",
        dataType: "json",
        data: {
          spectrum: {
            title: _spectrum.json.title,
            notes: _spectrum.json.notes,
            // we stringify manually here since it was not flattening 
            // spectrum.json.data.lines into an array, but an object
            data: JSON.stringify(_spectrum.json.data)
          }
        }
      }).done(function(response) {

        callback(response);

      }).fail(function(response) {

        _spectrum.graph.UI.notify(response['errors'], "error");

      });
      
    }


    /* ======================================
     * Fetch data to populate self, from server, using spectrum.id.
     * Overwrites spectrum.json and runs spectrum.load().
     */
    _spectrum.fetch = function(url, callback) {

      url = url || '/spectrums/' + _spectrum.id + '.json';

      $.ajax({

        url: url,
        type: "GET",
        dataType: "json",
        success: function(response) {

          _spectrum.json  = response;
          _spectrum.load();

          if (callback) callback();

        },
        error: function(response) {

          _spectrum.graph.UI.notify(response['errors'], "error");

        }
      });
      
    }

 
    /* ======================================
     * Inspects all channels recursively for sequential
     * pixels of 100%, which would indicate overexposure. Returns
     * whether it passed the threshold and the last inspected index.
     * <threshold> is how bright a pixel must be to trigger an overexposure warning (0-255)
     * <consecutive> is how many pixels of consecutive 100% triggers an overexposure warning
     */
    _spectrum.getOverexposure = function(threshold, consecutive) {

      var overexposure_recurse = function(data, i, count, color, threshold, consecutive) {
     
        if (count > consecutive) return [true, i]
        else {
     
          if (data[i][color] >= threshold) {
            return overexposure_recurse(data, i+2, count+2, color, threshold, consecutive)
          } else return [false,i]
     
        }
     
      }

      var _overexposed = {r: false, g: false, b: false}
          _colors = ["r","g","b"],
          _lines = _spectrum.json.data.lines;

      threshold = threshold || 250;
      consecutive = consecutive || 20;

      // check each channel for plateaus at 100%:
      _colors.forEach(function(color) {

        var spectrumIndex = 0;

        while (spectrumIndex < _lines.length) {

          var line = _lines[spectrumIndex];
          var scan = overexposure_recurse(_lines, spectrumIndex, 0, color, threshold, consecutive);

          if (scan[0]) {

            _overexposed[color] = true;
            spectrumIndex = _lines.length; // skip to end

          } else spectrumIndex = scan[1] + 10;

        }

      });

      return _overexposed;

    }

 
    /* ======================================
     * Determines if a spectrum is too dark and makes a recommendation to fix this
     * <threshold> is a percent brightness cutoff; returns a boolean
     */
    _spectrum.getTooDark = function(threshold) {

      var _tooDark = true;

      // by percent!
      threshold = threshold || 0.05;

      // check each channel for plateaus at 100%:
      _spectrum.channels.forEach(function(_channel) {

        for (var i = 0; i < _spectrum[_channel].length; i += 1) {

          if (_spectrum[_channel][i].y > threshold) _tooDark = false;

        }

      });

      return _tooDark;

    }


    /* ======================================
     * Returns a set of graph line datasets formatted for 
     * display in a d3 chart, based on spectrum.average
     */
    _spectrum.d3 = function() {

      return [
        {
          values: _spectrum.average,
          key:    _spectrum.title+" (average)",
          color:  '#444',
          id:     _spectrum.id
        },
        {
          values: _spectrum.red,
          key:    _spectrum.title+" (R)",
          color:  'rgba(255,0,0,0.2)'
        },
        {
          values: _spectrum.green,
          key:    _spectrum.title+" (G)",
          color:  'rgba(0,255,0,0.2)'
        },
        {
          values: _spectrum.blue,
          key:    _spectrum.title+" (B)",
          color:  'rgba(0,0,255,0.2)'
        }
      ];

    }


    _spectrum.load();

  }

});
