function initMoviePlayer(videoId, layerId, streamUrl) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var hlsInstance = null;

    if (!video || !layer || !streamUrl) {
        return;
    }

    function start() {
        layer.classList.add('is-hidden');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.getAttribute('src') !== streamUrl) {
                video.setAttribute('src', streamUrl);
            }
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.play().catch(function () {});
            }
            return;
        }

        video.setAttribute('src', streamUrl);
        video.play().catch(function () {});
    }

    layer.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (video.paused) {
            video.play().catch(function () {});
        }
    });
}
