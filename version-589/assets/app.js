(function () {
    var body = document.body;

    document.querySelectorAll('[data-nav-toggle]').forEach(function (button) {
        button.addEventListener('click', function () {
            var menu = document.querySelector('[data-mobile-menu]');
            if (!menu) {
                return;
            }
            menu.classList.toggle('open');
            body.classList.toggle('menu-open', menu.classList.contains('open'));
        });
    });

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var target = form.getAttribute('action') || './movies.html';
            window.location.href = value ? target + '?q=' + encodeURIComponent(value) : target;
        });
    });

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-movie-listing]').forEach(function (listing) {
        var search = listing.querySelector('[data-movie-search]');
        var cards = Array.prototype.slice.call(listing.querySelectorAll('[data-movie-card]'));
        var pills = Array.prototype.slice.call(listing.querySelectorAll('[data-filter-key]'));
        var activeFilter = { key: 'all', value: 'all' };

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var query = normalize(search ? search.value : '');
            cards.forEach(function (card) {
                var keywords = normalize(card.getAttribute('data-keywords'));
                var matchedQuery = !query || keywords.indexOf(query) !== -1;
                var matchedFilter = true;

                if (activeFilter.key !== 'all') {
                    matchedFilter = normalize(card.getAttribute('data-' + activeFilter.key)).indexOf(normalize(activeFilter.value)) !== -1;
                }

                card.hidden = !(matchedQuery && matchedFilter);
            });
        }

        if (search) {
            var params = new URLSearchParams(window.location.search);
            var preset = params.get('q');
            if (preset) {
                search.value = preset;
            }
            search.addEventListener('input', applyFilter);
        }

        pills.forEach(function (pill) {
            pill.addEventListener('click', function () {
                activeFilter = {
                    key: pill.getAttribute('data-filter-key') || 'all',
                    value: pill.getAttribute('data-filter-value') || 'all'
                };
                pills.forEach(function (item) {
                    item.classList.toggle('active', item === pill);
                });
                applyFilter();
            });
        });

        applyFilter();
    });

    document.querySelectorAll('[data-video-player]').forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.player-overlay');
        var loaded = false;
        var hlsInstance = null;

        function attachStream() {
            if (!video || loaded) {
                return;
            }

            var stream = video.getAttribute('data-stream');
            if (!stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }

            loaded = true;
        }

        function playVideo() {
            attachStream();
            if (!video) {
                return;
            }
            if (button) {
                button.hidden = true;
            }
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === 'function') {
                playRequest.catch(function () {
                    if (button) {
                        button.hidden = false;
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.hidden = true;
                }
            });
            video.addEventListener('ended', function () {
                if (button) {
                    button.hidden = false;
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}());
