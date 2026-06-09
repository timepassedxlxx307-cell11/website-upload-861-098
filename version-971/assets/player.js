(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var source = video ? video.querySelector("source") : null;
      var button = shell.querySelector(".play-overlay");
      var stream = source ? source.getAttribute("src") : "";
      var prepared = false;
      var hls = null;

      function prepare() {
        if (prepared || !video || !stream) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function start() {
        if (!video) {
          return;
        }
        prepare();
        video.controls = true;
        if (button) {
          button.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
        video.addEventListener("play", function () {
          if (button) {
            button.classList.add("is-hidden");
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
