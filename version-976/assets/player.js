(function () {
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

    boxes.forEach(function (box) {
        var video = box.querySelector("video");
        var cover = box.querySelector(".player-cover");
        var hls = null;
        var ready = false;

        if (!video || !cover) {
            return;
        }

        var url = video.getAttribute("src");

        var begin = function () {
            cover.classList.add("is-hidden");

            if (!ready) {
                ready = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }

                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                        }
                    });
                } else {
                    video.setAttribute("src", url);
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }
        };

        cover.addEventListener("click", begin);
        video.addEventListener("click", function () {
            if (!ready || video.paused) {
                begin();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
