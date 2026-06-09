(function () {
    "use strict";

    function normalizeText(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (!button || !menu) {
            return;
        }

        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupImageFallbacks() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing-image");
            }, { once: true });
        });
    }

    function setupHeroFocus() {
        var tiles = Array.prototype.slice.call(document.querySelectorAll("[data-hero-card]"));
        var index = 0;

        if (tiles.length < 2) {
            return;
        }

        function setActive(nextIndex) {
            tiles.forEach(function (tile) {
                tile.classList.remove("is-active");
            });
            tiles[nextIndex].classList.add("is-active");
        }

        setActive(index);
        window.setInterval(function () {
            index = (index + 1) % tiles.length;
            setActive(index);
        }, 3600);
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var channel = scope.querySelector("[data-filter-channel]");
            var year = scope.querySelector("[data-filter-year]");
            var reset = scope.querySelector("[data-filter-reset]");
            var count = scope.querySelector("[data-filter-count]");
            var container = scope.parentElement || document;
            var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));

            function getSearchText(card) {
                return normalizeText([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags")
                ].join(" "));
            }

            function applyFilter() {
                var keyword = normalizeText(input ? input.value : "");
                var selectedChannel = channel ? channel.value : "";
                var selectedYear = year ? year.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var matchesKeyword = !keyword || getSearchText(card).indexOf(keyword) !== -1;
                    var matchesChannel = !selectedChannel || card.getAttribute("data-channel") === selectedChannel;
                    var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                    var shouldShow = matchesKeyword && matchesChannel && matchesYear;

                    card.hidden = !shouldShow;
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "当前显示 " + visible + " / " + cards.length + " 部影片";
                }
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }
            if (channel) {
                channel.addEventListener("change", applyFilter);
            }
            if (year) {
                year.addEventListener("change", applyFilter);
            }
            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (channel) {
                        channel.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    applyFilter();
                });
            }

            applyFilter();
        });
    }

    function loadHlsLibrary() {
        return new Promise(function (resolve, reject) {
            if (window.Hls) {
                resolve(window.Hls);
                return;
            }

            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error("HLS library could not be loaded."));
            };
            document.head.appendChild(script);
        });
    }

    function setupPlayers() {
        document.querySelectorAll("[data-video-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var startButton = player.querySelector("[data-player-start]");
            var status = player.querySelector("[data-player-status]");
            var hlsInstance = null;
            var initialized = false;

            if (!video || !startButton) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function playVideo() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        setStatus("浏览器阻止了自动播放，请再次点击播放器控件。 ");
                    });
                }
            }

            function initializeAndPlay() {
                var source = video.getAttribute("data-src");

                if (!source) {
                    setStatus("未找到播放源。 ");
                    return;
                }

                if (initialized) {
                    playVideo();
                    return;
                }

                initialized = true;
                setStatus("正在初始化 HLS 播放源…");

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", playVideo, { once: true });
                    video.load();
                    return;
                }

                loadHlsLibrary().then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        hlsInstance = new Hls({
                            enableWorker: true,
                            lowLatencyMode: false
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                            setStatus("播放源加载完成，正在播放…");
                            playVideo();
                        });
                        hlsInstance.on(Hls.Events.ERROR, function (_, data) {
                            if (data && data.fatal) {
                                setStatus("播放源加载失败，请刷新页面后重试。 ");
                            }
                        });
                    } else {
                        video.src = source;
                        video.load();
                        playVideo();
                    }
                }).catch(function () {
                    video.src = source;
                    video.load();
                    playVideo();
                });
            }

            startButton.addEventListener("click", initializeAndPlay);
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                player.classList.remove("is-playing");
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupImageFallbacks();
        setupHeroFocus();
        setupFilters();
        setupPlayers();
    });
}());
