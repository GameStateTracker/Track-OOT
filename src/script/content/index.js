import PageSwitcher from "../util/PageSwitcher.js";

PageSwitcher.setNavigationMixin("fullscreen", [{
    "content": "TOGGLE FULLSCREEN",
    "handler": toggleFullscreen
}]);

function toggleFullscreen() {
    if (document.fullscreenEnabled) {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}
