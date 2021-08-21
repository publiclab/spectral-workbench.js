 $W.auto_detect_sample_row=function() {
        
    // We need a separate canvas to draw the snapshot, whenever we try to auto detect the sample row.
    if ($('#autoDetectCanvas').length == 0) {
      $('body').append("<canvas style='display:none;' id='autoDetectCanvas'></canvas>")
    }

    var video = document.getElementsByTagName('video')[0]
    var canvas = document.getElementById('autoDetectCanvas')
    canvas.height = $W.height
    canvas.width = $W.width
    var context = canvas.getContext('2d')

    context.drawImage(video, 0, 0)

    img = context.getImageData(0,0,$W.width,$W.height)

    var detected = []
    var max_avg_intensity = 0
    var selected_row = -1

    for (var row = 0; row < $W.height; row++) {

      var red_vals = {"low":10000, "high": -10000}
      var green_vals = {"low":10000, "high": -10000}
      var blue_vals = {"low":10000, "high": -10000}
      var intensity_vals = {"low":10000, "high": -10000}

      var vals = [red_vals, green_vals, blue_vals, intensity_vals]
      var sum_intensity = 0
      var count_intensity = 0

      for (var col = 0; col < $W.width; col++) { 
        var red = img.data[((row*(img.width*4)) + (col*4)) + 0]
        var green = img.data[((row*(img.width*4)) + (col*4)) + 1]
        var blue = img.data[((row*(img.width*4)) + (col*4)) + 2]
        var intensity = (red+green+blue)/3

        var bands = [red, green, blue, intensity]

        $.each(vals, function(index, val){
          if (val["low"] > bands[index]) val["low"] = bands[index]
          if (val["high"] < bands[index]) val["high"] = bands[index]
        })
        
        sum_intensity += intensity
        count_intensity++
      }

      // If we need intensity diffs, 
      // diff = intensity_vals["high"] - intensity_vals["low"]
      
      diff = red_vals["high"] - red_vals["low"]
      
      //console.log(diff)
      if (diff > 20) {
        detected.push(row)
        var avg_intensity = parseInt(sum_intensity / count_intensity)
        if (avg_intensity < 255 && max_avg_intensity < avg_intensity){
            selected_row = row
            max_avg_intensity = avg_intensity
        }        
      }
    }
    
    // console.log(selected_row)
    
    //alert(detected)
    //if (detected.length > 0) {
    //    $W.setSampleRows(selected_row, selected_row+1);
    //}

    if (selected_row > -1) $W.setSampleRows(selected_row, selected_row+1);
    else console.log('AutoDetectSampleRow: Increase light intensity and try again!')
  }
$W.toggle_rotation=function(){
    
  $W.rotated = !$W.rotated
  if ($W.rotated == true) $('.btn-rotate').addClass('active');
  else                    $('.btn-rotate').removeClass('active');
  var style = $('#heightIndicator')[0].style
  var stylePrev = $('#heightIndicatorPrev')[0].style
  if ($W.rotated) {
    style.marginTop = '0px';
    style.borderBottomWidth = "0px"
    style.borderRightWidth = "2px"
    style.height = "240px"
    style.width = "0px"
    stylePrev.marginTop = '0px';
    stylePrev.borderBottomWidth = "0px"
    stylePrev.borderRightWidth = "2px"
    stylePrev.height = "100px"
    stylePrev.width = "0px"
    $('#heightIndicator .vertical').show();
    $('#heightIndicator .horizontal').hide();
    $('.spectrum-example-horizontal').hide();
    $('.spectrum-example-vertical').show();
  } else {
    style.marginLeft = '0px';
    style.borderBottomWidth = "2px"
    style.borderRightWidth = "0px"
    style.width = "320px"
    style.height = "0px"
    stylePrev.marginLeft = '0px';
    stylePrev.borderBottomWidth = "2px"
    stylePrev.borderRightWidth = "0px"
    stylePrev.width = "100%"
    stylePrev.height = "0px"
    $('#heightIndicator .vertical').hide();
    $('#heightIndicator .horizontal').show();
    $('.spectrum-example-horizontal').show();
    $('.spectrum-example-vertical').hide();
  }
  // reset the indicator to the correct sample row:
  $W.setSampleRows($W.sample_start_row,$W.sample_start_row)
}
$W.getRow=function() {
    $W.frame += 1
    var video = $('video')[0];
    // Grab the existing canvas:
    var saved =  $W.excerptCanvas(0,0, $W.width, $W.height, $W.ctx).getImageData(0,0, $W.width, $W.height)

    // manipulate the canvas to get the image to copy onto the canvas in the right orientation
    $W.ctx.save()
    $W.getCrossSection(video)
    $W.ctx.restore()

    // draw old data 1px below new row of data:
    $W.ctx.putImageData(saved,0,1)


    // populate the sidebar preview if there's a "preview" element:
    if ($('#preview').length > 0) {
       $W.preview_ctx.canvas.width = $('#preview').width()
       $W.preview_ctx.canvas.height = $('#preview').width()*0.75
      $('#preview').height($('#preview').width()*0.75)
      if ( $W.flipped) {
         $W.preview_ctx.translate($('#preview').width(),0)
         $W.preview_ctx.scale(-1,1)
      }
       $W.preview_ctx.drawImage($('video')[0],0,0,$('#preview').width(),$('#preview').width()*0.75)
      if ( $W.rotated != true) $("#heightIndicatorPrev").width($('#sidebar').width())
       $W.resetHeightIndicators(false)
    }

    // get the slice of data
    img =  $W.ctx.getImageData(0,0, $W.canvas.width, $W.sample_height)

    // use it to generate a graph
    if ( $W.mode == "average") {
       $W.data[0] = {label: "Webcam",data:[]}
    } else if ( $W.mode == "rgb") {
       $W.data[0] = {label: "R",data:[]}
       $W.data[1] = {label: "G",data:[]}
       $W.data[2] = {label: "B",data:[]}
    } else if ( $W.mode == "combined") {
       $W.data[0] = {label: "Combined",data:[]}
       $W.data[1] = {label: "R",data:[]}
       $W.data[2] = {label: "G",data:[]}
       $W.data[3] = {label: "B",data:[]}
       $W.data[4] = {label: "Overexposed",data:[]}
    }

    // store it in the "raw" data store too
     $W.full_data = []
    for (var col = 0; col <  $W.canvas.width; col++) {
      var red = 0
      for (row=0;row< $W.sample_height;row++) {
         red += img.data[((row*(img.width*4)) + (col*4)) + 0]
      }
      red /=  $W.sample_height
      var green = 0
      for (row=0;row< $W.sample_height;row++) {
         green += img.data[((row*(img.width*4)) + (col*4)) + 1]
      }
      green /=  $W.sample_height
      var blue = 0
      for (row=0;row< $W.sample_height;row++) {
         blue += img.data[((row*(img.width*4)) + (col*4)) + 2]
      }
      blue /=  $W.sample_height
      var intensity = (red+blue+green)/3
       $W.full_data.push([red,green,blue,intensity])
      if (! $W.calibrated) {
        if ( $W.mode == "average") {
           $W.data[0].data.push([col,intensity/2.55])
        } else if ( $W.mode == "rgb") {
           $W.data[0].data.push([col,red/2.55])
           $W.data[1].data.push([col,green/2.55])
           $W.data[2].data.push([col,blue/2.55])
        } else if ( $W.mode == "combined") {
           $W.data[0].data.push([col,intensity/2.55])
           $W.data[1].data.push([col,red/2.55])
           $W.data[2].data.push([col,green/2.55])
           $W.data[3].data.push([col,blue/2.55])
          if (red == 255 || green == 255 || blue == 255){
             $W.data[4].data.push([col,100])
             $W.data[4].data.push([col,100])
             $W.data[4].data.push([col,100])
          }
        }
      } else {
        if ( $W.mode == "average") {
          if ( $W.baseline != null) {
            var wavelength = parseInt( $W.getWavelength(col))
             $W.data[0].data.push([wavelength, $W.baseline[wavelength]-intensity/2.55])
          } else  $W.data[0].data.push([parseInt( $W.getWavelength(col)),intensity/2.55])
        } else if ( $W.mode == "rgb") {
          var w =  $W.getWavelength(col)
           $W.data[0].data.push([w,red/2.55])
           $W.data[1].data.push([w,green/2.55])
           $W.data[2].data.push([w,blue/2.55])
        } else if ( $W.mode == "combined") {
          if ( $W.baseline != null) {
            var wavelength = parseInt( $W.getWavelength(col))
             $W.data[0].data.push([wavelength, $W.baseline[wavelength]-intensity/2.55])
          } else  $W.data[0].data.push([parseInt( $W.getWavelength(col)),intensity/2.55])
          var w =  $W.getWavelength(col)
           $W.data[1].data.push([w,red/2.55])
           $W.data[2].data.push([w,green/2.55])
           $W.data[3].data.push([w,blue/2.55])
          if (red == 255 || green == 255 || blue == 255){ 
             $W.data[4].data.push([w,100])
          }
          
        }
      }
    }
     $W.plot = $.plot($("#graph"), $W.data,flotoptions);
    $.each( $W.markers,function(i,m) {
      $('#graph').append('<div style="position:absolute;left:' + (m[2] + 4) + 'px;top:10px;color:#aaa;font-size:smaller">'+m[0]+': '+parseInt( $W.getIntensity( $W.data[0].data,m[1]))+'%</div>');
    })
     $W.unflipped_data =  $W.full_data
    if ( $W.flipped)  $W.unflipped_data =  $W.unflipped_data.reverse()
    if ( $W.macro &&  $W.macro.draw) {
      try {
         $W.macro.draw()
      } catch(e) {
        console.log(e)
      }
    }
  }
// Resulotion Map
// Map resolution option name to value
const resolutionMap = {
  "1080p": { width: 1920, height: 1080 },
  "720p": { width: 1080, height: 720 },
  "480p": { width: 854, height: 480 },
  "360p": { width: 640, height: 360 },
  "240p": { width: 426, height: 240 }
}

// Temasys Adapter JS
// https://github.com/Temasys/AdapterJS
// AdapterJS provides polyfills and cross-browser helpers for WebRTC. It wraps around
// the native APIs in Chrome, Opera and Firefox and provides support for WebRTC in 
// Internet Explorer and Safari on Mac and Windows through the available Temasys Browser Plugins.

$W.getUserMedia = function(options) {
  AdapterJS.webRTCReady(() => {
    // The WebRTC API is ready.
    const container = document.getElementById('webcam'),
          video = document.createElement('video');
    
    container.appendChild(video);
    video.autoplay = true;
    video.id = 'webcam-video'

    var videoElement = document.getElementById('webcam-video');
    var videoSelect = document.querySelector('select#videoSource');
    var selectors = [videoSelect];
    
    successCallback = stream => {
      $('#heightIndicator').show()
      $('#webcam-msg').hide()

      window.stream = stream;
      videoElement = attachMediaStream(videoElement, stream)
      if ($W.flipped == true) {
        $W.flipped = false; // <= turn it false because f_h() will toggle it. messy.
        $W.flip_horizontal();
      }
      return getVidDevices();
    };

    const errorCallback = () => console.warn(error);

    getUserMedia($W.defaultConstraints, successCallback, errorCallback);

    gotVidDevices = (deviceInfos) => {
      let values = selectors.map(function(select) {
        return select.value; 
      });
    
      selectors.forEach(function(select) {
        while (select.firstChild) {
          select.removeChild(select.firstChild);
        }
      });
      for (let i = 0; i !== deviceInfos.length; ++i) {
        let deviceInfo = deviceInfos[i];
        let option = document.createElement('option');
        option.value = (deviceInfo.id || deviceInfo.deviceId);
        if (deviceInfo.kind === 'videoinput' || deviceInfo.kind === 'video') {
          console.log(deviceInfo.label);
          option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
          videoSelect.appendChild(option);
        } 
      }
      
      selectors.forEach(function(select, selectorIndex) {
        if (Array.prototype.slice.call(select.childNodes).some(function(n) {
          return n.value === values[selectorIndex];
        })) {
          select.value = values[selectorIndex];
        }
      });
    }
  
    getVidDevices = () => {
      if (typeof Promise === 'undefined') {
        return MediaStreamTrack.getSources(gotVidDevices);
      } else {
        return navigator.mediaDevices.enumerateDevices()
        .then(gotVidDevices)
        .catch((error) => {
          console.error(error);
        });
      }
    }
  
    getVidDevices();
  
    start = () => {
      if (window.stream) {
        window.stream.getTracks().forEach(function(track) {
          track.stop(); //stopping the current video stream
        });
      }
  
      var videoSource = videoSelect.value;
      var constraints = {
        video: {
          deviceId: videoSource ? {exact: videoSource} : undefined //Taking device ids as the video source 
        }
      };
  
      if (typeof Promise === 'undefined') {
      navigator.getUserMedia(constraints, successCallback, function(){}); 
      } 
      else {
      navigator.mediaDevices.getUserMedia(constraints)
      .then(successCallback);
      } 
    }
  
    videoSelect.onchange = start; //repeating the process for source change
  
    start();
  });
};

$W.updateResolution = function(resolution) {
  const width = resolutionMap[resolution].width,
        height = resolutionMap[resolution].height;

  const constraints = {
    ...$W.defaultConstraints,
    video: {
      ...$W.defaultConstraints.video,
      width: { min: width },
      height: { min: height }
    }
  };
  const message = $('#resolution-message > small');

  const successCallback = stream => {
    attachMediaStream(document.getElementById("webcam-video"), stream);
    message.html('Update Successfully!');
    message.css('color', '#52BE80');
  }

  const errorCallback = error => {
    message.html(error.name || 'Failed to update resolution');
    message.css('color', '#E74C3C');
    console.warn(error);
  };

  getUserMedia(constraints, successCallback, errorCallback);
}
