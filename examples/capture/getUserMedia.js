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

