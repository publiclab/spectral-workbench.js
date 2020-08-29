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