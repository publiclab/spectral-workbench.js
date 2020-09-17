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