(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.querySelector("#movie-player");
    var button = document.querySelector("#play-toggle");
    if (!video || !button) return;

    var stream = button.getAttribute("data-stream") || "";
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
      if (attached || !stream) return;
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = stream;
    }

    function playVideo() {
      attachStream();
      button.classList.add("is-hidden");
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (!attached) playVideo();
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  });
})();
