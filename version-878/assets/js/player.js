(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function showMessage(shell, text) {
        var message = shell.querySelector("[data-player-message]");
        if (!message) {
            return;
        }
        message.textContent = text;
        message.classList.add("active");
    }

    function hideMessage(shell) {
        var message = shell.querySelector("[data-player-message]");
        if (message) {
            message.textContent = "";
            message.classList.remove("active");
        }
    }

    function loadHls(callback, failure) {
        if (window.Hls) {
            callback(window.Hls);
            return;
        }
        var existing = document.querySelector("script[data-hls-loader]");
        if (existing) {
            existing.addEventListener("load", function () {
                callback(window.Hls);
            });
            existing.addEventListener("error", failure);
            return;
        }
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
        script.async = true;
        script.setAttribute("data-hls-loader", "true");
        script.addEventListener("load", function () {
            callback(window.Hls);
        });
        script.addEventListener("error", failure);
        document.head.appendChild(script);
    }

    function startPlayer(shell) {
        var video = shell.querySelector("video[data-src]");
        var overlay = shell.querySelector("[data-play-button]");
        if (!video) {
            return;
        }
        var source = video.getAttribute("data-src");
        if (!source) {
            showMessage(shell, "当前内容暂时无法播放");
            return;
        }
        hideMessage(shell);
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var playVideo = function () {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    showMessage(shell, "点击视频控件继续播放");
                });
            }
        };
        if (video.getAttribute("data-loaded") === "true") {
            playVideo();
            return;
        }
        video.setAttribute("data-loaded", "true");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            video.load();
            return;
        }
        loadHls(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage(shell, "播放连接异常，请稍后重试");
                        hls.destroy();
                    }
                });
            } else {
                video.src = source;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
            }
        }, function () {
            video.src = source;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            video.load();
        });
    }

    ready(function () {
        document.querySelectorAll("[data-player]").forEach(function (shell) {
            var overlay = shell.querySelector("[data-play-button]");
            var video = shell.querySelector("video[data-src]");
            if (overlay) {
                overlay.addEventListener("click", function () {
                    startPlayer(shell);
                });
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.getAttribute("data-loaded") !== "true") {
                        startPlayer(shell);
                    }
                });
            }
        });
    });
})();
