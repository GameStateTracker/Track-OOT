import OverlayPanel from "/emcJS/ui/overlay/OverlayPanel.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import ActionMessage from "/emcJS/ui/overlay/message/ActionMessage.js";
import "./components/AboutPanel.js";
import "./components/CreditsPanel.js";
import TPL from "./AboutOverlay.js.html" assert {type: "html"};
import STYLE from "./AboutOverlay.js.css" assert {type: "css"};

export default class AboutOverlay extends OverlayPanel {

    #showUpdatePopup = true;

    #contentEl;

    #aboutEl;

    constructor() {
        super("About");
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#contentEl = this.shadowRoot.getElementById("content");
        this.#contentEl.append(els);
        this.#aboutEl = this.shadowRoot.getElementById("about");
        /* --- */
        this.#aboutEl.addEventListener("updateavailable", () => {
            if (this.#showUpdatePopup) {
                this.#showUpdatePopup = false;
                ActionMessage.info({
                    text: "A new update is available.\nClick here to download!",
                    time: 60
                }).addEventListener("action", () => {
                    this.show();
                    this.#aboutEl.focusUpdate();
                });
            }
        });
        this.#aboutEl.addEventListener("updaterror", () => {
            if (!this.#showUpdatePopup) {
                ModalDialog.alert("Connection Lost", "The ServiceWorker was not able to establish or keep connection to the Server<br>Please try again later.");
            }
        });
        this.#aboutEl.checkUpdate();
    }

    initialFocus() {
        this.#aboutEl.initialFocus();
    }

}

customElements.define("tootr-overlay-about", AboutOverlay);
