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
    
    const successCallback = stream => {
      $('#heightIndicator').show()
      $('#webcam-msg').hide()
      attachMediaStream(video, stream)
      if ($W.flipped == true) {
        $W.flipped = false; // <= turn it false because f_h() will toggle it. messy.
        $W.flip_horizontal();
      }
    };

    const errorCallback = () => console.warn(error);

    getUserMedia($W.defaultConstraints, successCallback, errorCallback);
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
