import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import ModalDialog from "@emcjs/fe/ui/modal/ModalDialog.js";
import "@emcjs/fe/ui/i18n/I18nLabel.js";
import "@emcjs/fe/ui/i18n/I18nTextbox.js";
import "@emcjs/fe/ui/icon/FontIcon.js";
import "@emcjs/fe/ui/form/button/Button.js";
import "@emcjs/fe/ui/form/button/LinkButton.js";
import VersionData from "gametrackerjs/data/VersionData.js";
import "./UpdateHandler.js";
import TPL from "./AboutPanel.js.html" assert {type: "html"};
import STYLE from "./AboutPanel.js.css" assert {type: "css"};

const NOSW = (new URL(location.href)).searchParams.get("nosw") !== null;

export default class AboutPanel extends CustomElement {

    #currentChangelogEl;

    #trackerVersionEl;

    #trackerDateEl;

    #eraseButtonEl;

    #updateBlockEl;

    #updateHandlerEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#currentChangelogEl = this.shadowRoot.getElementById("current-changelog");
        this.#trackerVersionEl = this.shadowRoot.getElementById("tracker-version");
        this.#trackerDateEl = this.shadowRoot.getElementById("tracker-date");
        this.#eraseButtonEl = this.shadowRoot.getElementById("erase-button");
        this.#updateBlockEl = this.shadowRoot.getElementById("update-block");
        this.#updateHandlerEl = this.shadowRoot.getElementById("updatehandler");
        /* --- */
        this.#initUpdateHandler();
        /* --- */
        this.#trackerVersionEl.innerHTML = VersionData.version;
        this.#trackerDateEl.innerHTML = VersionData.date;
        this.#eraseButtonEl.addEventListener("click", async () => {
            const eraseString = await ModalDialog.prompt("Erase all data", "Warning: All stored data will be lost\nPlease enter \"erase data\" to confirm");
            if (eraseString == "erase data") {
                window.location.href = "/uninstall.html?nosw";
            }
        });
    }

    checkUpdate() {
        if (!NOSW) {
            this.#updateHandlerEl.checkUpdate();
        }
    }

    #initUpdateHandler() {
        if (NOSW) {
            this.#updateBlockEl.style.display = "none";
        } else {
            this.#updateHandlerEl.addEventListener("updateavailable", () => {
                const ev = new Event("updateavailable");
                this.dispatchEvent(ev);
            });
            this.#updateHandlerEl.addEventListener("noconnection", () => {
                const ev = new Event("updaterror");
                this.dispatchEvent(ev);
            });
        }
    }

    initialFocus() {
        this.#currentChangelogEl.focus();
    }

    focusUpdate() {
        this.#updateHandlerEl.initialFocus();
    }

}

customElements.define("tootr-about-panel-about", AboutPanel);
