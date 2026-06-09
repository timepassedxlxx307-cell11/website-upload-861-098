(function () {
    function startVideo(video, streamUrl, overlay) {
        if (!video || !streamUrl) {
            return;
        }
        if (video.hlsController) {
            video.hlsController.destroy();
            video.hlsController = null;
        }
        function play() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            play();
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            video.hlsController = hls;
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, play);
        } else {
            video.src = streamUrl;
            play();
        }
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    }

    window.setupPlayer = function (streamUrl) {
        var video = document.getElementById("videoPlayer");
        var overlay = document.getElementById("playOverlay");
        if (!video) {
            return;
        }
        if (overlay) {
            overlay.addEventListener("click", function () {
                startVideo(video, streamUrl, overlay);
            });
        }
        video.addEventListener("click", function () {
            if (!video.currentSrc) {
                startVideo(video, streamUrl, overlay);
            }
        });
    };
}());
