(function() {
  var VIDEO_WIDTH = 320;
  var VIDEO_HEIGHT = 0; // This will be computed based on the input stream
  var CHAR_PIXEL_WIDTH = 3;
  var CHAR_PIXEL_HEIGHT = 7;
  var NUM_CHAR_PER_ROW = 0;
  var NUM_CHAR_COLS = 0;
  var CHAR_GRADIENT = "$B8W#*admt|?~-<i;,^'. ";

  var bufferReady = true;

  function startup() {
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    ascii = document.getElementById("ascii");

    navigator.getMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    navigator.getMedia(
      {
        video: true,
        audio: false
      },
      function(stream) {
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL.createObjectURL(stream);
        }
        video.play();
      },
      function(err) {
        console.log("An error occured! " + err);
      }
    );

    var isVideoStreaming = false;
    video.addEventListener(
      "canplay",
      function(ev) {
        if (!isVideoStreaming) {
          VIDEO_HEIGHT = video.videoHeight / (video.videoWidth / VIDEO_WIDTH);

          // Firefox currently has a bug where the height can't be read from
          // the video, so we will make assumptions if this happens.
          if (isNaN(VIDEO_HEIGHT)) {
            VIDEO_HEIGHT = VIDEO_WIDTH / (4 / 3);
          }

          video.setAttribute("width", VIDEO_WIDTH);
          video.setAttribute("height", VIDEO_HEIGHT);
          canvas.setAttribute("width", VIDEO_WIDTH);
          canvas.setAttribute("height", VIDEO_HEIGHT);
          isVideoStreaming = true;

          NUM_CHAR_PER_ROW = Math.floor(VIDEO_WIDTH / CHAR_PIXEL_WIDTH);
          NUM_CHAR_COLS = Math.floor(VIDEO_HEIGHT / CHAR_PIXEL_HEIGHT);
        }
        setInterval(createAscii, 33);
      },
      false
    );
  }

  function createAscii() {
    if (bufferReady && VIDEO_WIDTH && VIDEO_HEIGHT) {
      bufferReady = false;

      // get the byte pixel data from the screne
      var context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
      var pixelByteData = context.getImageData(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT)
        .data;

      // turn the byte data into ascii art by sampling the pixels
      var resultString = "";
      for (var y = 0; y < NUM_CHAR_COLS; y++) {
        for (var x = 0; x < NUM_CHAR_PER_ROW; x++) {
          var index =
            (y + 1) * VIDEO_WIDTH * CHAR_PIXEL_HEIGHT * 4 -
            x * CHAR_PIXEL_WIDTH * 4;

          var pixelRed = pixelByteData[index];
          var pixelGreen = pixelByteData[index + 1];
          var pixelBlue = pixelByteData[index + 2];

          var pixelAvg = (pixelRed + pixelBlue + pixelGreen) / 3;

          var charGradIndex = Math.floor(pixelAvg / 255 * CHAR_GRADIENT.length);
          resultString += CHAR_GRADIENT.charAt(charGradIndex);
        }
        resultString += "\n";
      }
      ascii.textContent = resultString;
      bufferReady = true;
    }
  }

  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener("load", startup, false);
})();
