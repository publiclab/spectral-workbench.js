SpectralWorkbench.Image = Class.extend({

  init: function(_graph, callback) {

    var image = this;

    image.selector  = _graph.args.imageSelector || 'div.swb-spectrum-img-container';

    // if ($(image.selector).length > 0) image.container = $(image.selector);
    // else {
    //   // Do we really need an image element? Only if it's part of a Graph.
    //   // If we have a GUI, it needs to respond to graph width css...
    // }

    image.container = $(image.selector);
    image.el        = image.container.find('img');

    image.obj       = new Image();
    image.lineEl    = false; // the line indicating the cross-section

    image.callback = callback;

    image.obj.onload = function() {

      // Build a canvas element, but hide it.
      // Here, we may switch to node-canvas or something for headless use.
      $('body').append('<canvas id="spectral-workbench-canvas" style="display:none;"></canvas>;');
      image.canvasEl = $('canvas#spectral-workbench-canvas');
      image.graph = _graph;
      image.width = image.obj.width;
      image.height = image.obj.height;
      image.canvasEl.width(image.width);
      image.canvasEl.height(image.height);
      image.ctx = image.canvasEl[0].getContext("2d");
      image.ctx.canvas.width = image.width;
      image.ctx.canvas.height = image.height;
      image.ctx.drawImage(image.obj, 0, 0, image.width, image.height);

      if (_graph && _graph.args.hasOwnProperty('sample_row')) image.setLine(_graph.args.sample_row);

      image.callback(); // since image loading is asynchronous

    }

    image.obj.src = _graph.args.imgSrc || image.el.attr('src');


    /* ======================================
     * Returns a array of pixel brightnesses in [r,g,b,a] format, 
     * values from 0-255
     */
    image.getPoint = function(x,y) {

      return image.ctx.getImageData(x, y, 1, 1).data;

    }


    /* ======================================
     * Returns a nested array of pixels, each in the format of getPoint(), 
     * values from 0-255
     */
    image.getLine = function(y) {

      var output = [],
          input  = image.ctx.getImageData(0, y, image.width, 1).data;

      for (var i = 0; i < input.length; i += 4) {
        output.push([ input[i],
                      input[i+1],
                      input[i+2],
                      input[i+3] ]);
      }

      return output;

    }


    /* ======================================
     * Display a horizontal line on the image, y pixels below the top edge
     * (used for showing the image cross section)
     */
    image.setupLine = function(y) {

      if (_graph) {

        image.el.before($('<div class="section-line-container"><div class="section-line"></div></div>'));
        image.lineContainerEl = _graph.image.container.find('.section-line-container');
        image.lineContainerEl.css('position', 'relative');
        image.lineEl = _graph.image.container.find('.section-line');
        image.lineEl.css('position', 'absolute')
                    .css('width', '100%')
                    .css('top', 0)
                    .css('border-bottom', '1px solid rgba(255,255,255,0.5)')
                    .css('font-size', '9px')
                    .css('color', 'rgba(255,255,255,0.5)')
                    .css('text-align', 'right')
                    .css('padding-right', '6px')

      }

    }


    /* ======================================
     * Display a horizontal line on the image, y pixels below the top edge
     * in displace pixels. To use in image pixels, divide by image pixels and multiply
     * by display height of element in pixels -- 100 by default.
     * (used for showing the image cross section)
     */
    image.setLine = function(y) {

      if (!image.lineEl) image.setupLine();

      y -= 1; // off by one correction
      y = y / image.height * 100; // convert to display scale

      if (y > 20) {

        image.lineEl.html('GRAPHED CROSS SECTION &nbsp;');
        image.lineEl.css('margin-top', '-22px');

      } else {

        image.lineEl.html('');
        image.lineEl.css('margin-top', '0');

      }

      image.lineEl.css('top', y);

      return image.lineEl;

    }


    /* ======================================
     * Executes callback(x, y, e) when image is clicked
     * adjusted to actual pixels in original raw image
     */
    image.click = function(callback) {

      image.el.click(function(e){

        var x = Math.round((e.offsetX / image.el.width())  * image.width),
            y = Math.round((e.offsetY / image.el.height()) * image.height);

        callback(x, y, e);

      });

    }


    /* ======================================
     * Deletes click listeners
     */
    image.clickOff = function() {

      image.el.off('click');

    }


    /* ======================================
     * Resizes image elements; called in Graph.updateSize()
     */
    image.updateSize = function() {

      // OK, due to issue https://github.com/publiclab/spectral-workbench/issues/240, 
      // we are getting aggressively empirical here and adding "_graph.extraPadding" to fix things
      // but essentially it seems there's a difference between reported d3 chart display width and actual 
      // measurable DOM width, so we adjust the displayed image with extraPadding.
      _graph.image.container.width(_graph.width)
                            .height(100);

      if (!_graph.embed) _graph.image.container.css('margin-left',  _graph.margin.left);
      else               _graph.image.container.css('margin-left',  _graph.margin.left);
                         // .css('margin-right', _graph.margin.right); // margin not required on image, for some reason


      if (_graph.range && _graph.datum) {

        if (_graph.datum.isCalibrated()) {

          // amount to mask out of image if there's a range tag;
          // this is measured in nanometers:
          _graph.leftCrop =   _graph.extent[0] - _graph.datum.json.data.lines[0].wavelength;
          _graph.rightCrop = -_graph.extent[1] + _graph.datum.json.data.lines[_graph.datum.json.data.lines.length - 1].wavelength;
          // note, we must use extent here instead of range, as range may extend beyond limit of data;
          // although we could alternately set the chart extent to include empty space

          _graph.pxPerNm = (_graph.width) / (_graph.extent[1] - _graph.extent[0]);
         
          _graph.leftCrop  *= _graph.pxPerNm;
          _graph.rightCrop *= _graph.pxPerNm;

        } else {

          // for uncalibrated, we still allow range, in case someone's doing purely comparative work:
          _graph.leftCrop =   _graph.extent[0] - _graph.datum.json.data.lines[0].pixel;
          _graph.rightCrop = -_graph.extent[1] + _graph.datum.json.data.lines[_graph.datum.json.data.lines.length - 1].pixel;
         
          _graph.pxPerNm = 1; // a lie, but as there are no nanometers in an uncalibrated spectrum, i guess it's OK.

        }

        _graph.image.el.width(_graph.width + _graph.leftCrop + _graph.rightCrop) // left and rightCrop are masked out range
                       .css('max-width', 'none')
                       .css('margin-left', -_graph.leftCrop);

      } else {

        _graph.image.el.width(_graph.width)
                       .height(100)
                       .css('max-width', 'none')
                       .css('margin-left', 0);

      }

    }


  }

});
