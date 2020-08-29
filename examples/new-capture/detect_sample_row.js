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