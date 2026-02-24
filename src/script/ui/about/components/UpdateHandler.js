import CustomElement from "/emcJS/ui/element/CustomElement.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import "/emcJS/ui/form/button/Button.js";
import "/emcJS/ui/form/button/LinkButton.js";
import "/emcJS/ui/form/FormGroup.js";
import "/emcJS/ui/progress/ProgressBar.js";
import TPL from "./UpdateHandler.js.html" assert {type: "html"};
import STYLE from "./UpdateHandler.js.css" assert {type: "css"};

export default class UpdateHandler extends CustomElement {

    #startCheckUpdate;

    #checkUpdateContentEl;

    #forceUpdateContentEl;

    #updateAvailableContentEl;

    #updateUnavailableContentEl;

    #updateRunningContentEl;

    #updateFinishedContentEl;

    #progressEl;

    #progressTextEl;

    #checkUpdateEl;

    #downloadUpdateEl;

    #downloadForcedEl;

    #reloadEl;

    constructor() {
        super();
        if ("serviceWorker" in navigator) {
            this.shadowRoot.append(TPL.generate());
            STYLE.apply(this.shadowRoot);

            this.#progressEl = this.shadowRoot.getElementById("update-progress");
            this.#progressTextEl = this.shadowRoot.getElementById("update-progress-text");

            this.#checkUpdateContentEl = this.shadowRoot.getElementById("update-check");
            this.#forceUpdateContentEl = this.shadowRoot.getElementById("update-force");
            this.#updateAvailableContentEl = this.shadowRoot.getElementById("update-available");
            this.#updateUnavailableContentEl = this.shadowRoot.getElementById("update-unavailable");
            this.#updateRunningContentEl = this.shadowRoot.getElementById("update-running");
            this.#updateFinishedContentEl = this.shadowRoot.getElementById("update-finished");
            this.#checkUpdateEl = this.shadowRoot.getElementById("check-update");
            this.#downloadUpdateEl = this.shadowRoot.getElementById("download-update");
            this.#downloadForcedEl = this.shadowRoot.getElementById("download-forced");
            this.#reloadEl = this.shadowRoot.getElementById("reload");

            navigator.serviceWorker.addEventListener("message", (event) => {
                if (event.data.type == "state") {
                    switch (event.data.msg) {
                        case "update_available": {
                            const nowDate = new Date();
                            const startDate = this.#startCheckUpdate;
                            const remainingTime = 2000 - (nowDate - startDate);
                            setTimeout(() => {
                                this.#onUpdateAvailable();
                            }, remainingTime < 0 ? 0 : remainingTime);
                        } break;
                        case "update_unavailable": {
                            const nowDate = new Date();
                            const startDate = this.#startCheckUpdate;
                            const remainingTime = 2000 - (nowDate - startDate);
                            setTimeout(() => {
                                this.#onUpdateUnavailable();
                            }, remainingTime < 0 ? 0 : remainingTime);
                        } break;
                        case "need_download": {
                            const {total} = event.data;
                            this.#updateProgress(0, total);
                        } break;
                        case "file_downloaded": {
                            const {
                                loaded, total
                            } = event.data;
                            this.#updateProgress(loaded, total);
                        } break;
                        case "update_finished": {
                            this.#updateProgress(0, 0);
                            this.#onUpdateFinished();
                        } break;
                    }
                } else if (event.data.type == "error") {
                    this.#onUpdateError();
                }
            });

            this.#checkUpdateEl.addEventListener("click", () => {
                this.checkUpdate();
            });

            this.#downloadUpdateEl.addEventListener("click", () => {
                this.#startUpdate();
            });

            this.#downloadForcedEl.addEventListener("click", () => {
                this.#startUpdate(true);
            });

            this.#reloadEl.addEventListener("click", () => {
                window.location.reload();
            });
        }

        this.checkUpdate();
    }

    async checkUpdate() {
        if ("serviceWorker" in navigator) {
            this.#checkUpdate();
            this.#startCheckUpdate = new Date();
            const cacheControl = await navigator.serviceWorker.getRegistration("/sw.js");
            if (cacheControl != null) {
                cacheControl.active.postMessage("check");
            }
        }
    }

    #checkUpdate() {
        this.#checkUpdateContentEl.style.display = "";
        this.#forceUpdateContentEl.style.display = "none";
        this.#updateAvailableContentEl.style.display = "none";
        this.#updateUnavailableContentEl.style.display = "none";
        this.#updateRunningContentEl.style.display = "none";
        this.#updateFinishedContentEl.style.display = "none";
    }

    async #startUpdate(force = false) {
        this.#checkUpdateContentEl.style.display = "none";
        this.#forceUpdateContentEl.style.display = "none";
        this.#updateAvailableContentEl.style.display = "none";
        this.#updateUnavailableContentEl.style.display = "none";
        this.#updateRunningContentEl.style.display = "";
        this.#updateFinishedContentEl.style.display = "none";
        const cacheControl = await navigator.serviceWorker.getRegistration("/sw.js");
        if (cacheControl != null) {
            cacheControl.active.postMessage(force ? "forceupdate" : "update");
        }
    }

    #onUpdateAvailable() {
        this.#checkUpdateContentEl.style.display = "none";
        this.#forceUpdateContentEl.style.display = "";
        this.#updateAvailableContentEl.style.display = "";
        this.#updateUnavailableContentEl.style.display = "none";
        this.#updateRunningContentEl.style.display = "none";
        this.#updateFinishedContentEl.style.display = "none";
        this.dispatchEvent(new Event("updateavailable"));
    }

    #onUpdateUnavailable() {
        this.#checkUpdateContentEl.style.display = "none";
        this.#forceUpdateContentEl.style.display = "";
        this.#updateAvailableContentEl.style.display = "none";
        this.#updateUnavailableContentEl.style.display = "";
        this.#updateRunningContentEl.style.display = "none";
        this.#updateFinishedContentEl.style.display = "none";
    }

    #onUpdateFinished() {
        this.#checkUpdateContentEl.style.display = "none";
        this.#forceUpdateContentEl.style.display = "";
        this.#updateAvailableContentEl.style.display = "none";
        this.#updateUnavailableContentEl.style.display = "none";
        this.#updateRunningContentEl.style.display = "none";
        this.#updateFinishedContentEl.style.display = "";
    }

    #onUpdateError() {
        this.#checkUpdateContentEl.style.display = "none";
        this.#forceUpdateContentEl.style.display = "";
        this.#updateAvailableContentEl.style.display = "none";
        this.#updateUnavailableContentEl.style.display = "";
        this.#updateRunningContentEl.style.display = "none";
        this.#updateFinishedContentEl.style.display = "none";
        this.dispatchEvent(new Event("noconnection"));
    }

    #updateProgress(value, max) {
        this.#progressEl.max = max;
        this.#progressEl.value = value;
        this.#progressTextEl.innerText = `${value}/${max}`;
    }

    initialFocus() {
        if (this.#updateAvailableContentEl.style.display === "") {
            this.#downloadUpdateEl.focus();
        } else {
            this.#checkUpdateEl.focus();
        }
    }

}

customElements.define("ootrt-updatehandler", UpdateHandler);
