import GlobalContext from "/emcJS/data/storage/global/GlobalContext.js";
import modalRegistry from "/emcJS/data/registry/ModalRegistry.js";
import Modal from "/emcJS/ui/modal/Modal.js";
import "/emcJS/ui/form/button/Button.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import TPL from "./NewGameModal.js.html" assert {type: "html"};
import STYLE from "./NewGameModal.js.css" assert {type: "css"};

export default class NewGameModal extends Modal {

    #showInitCheckboxEl;

    constructor() {
        super("Initialize new state");
        // TODO set init icon
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const contentEl = this.shadowRoot.getElementById("content");
        const footerEl = this.shadowRoot.getElementById("footer");
        contentEl.append(els);
        /* --- */
        const showInitContainerEl = this.shadowRoot.getElementById("show-init-container");
        footerEl.append(showInitContainerEl);
        this.#showInitCheckboxEl = this.shadowRoot.getElementById("show-init-checkbox");
        const romSettingsButton = this.shadowRoot.getElementById("open-options-button");
        romSettingsButton.addEventListener("click", () => {
            this.close();
            const romOptionsWindow = GlobalContext.get("RomOptionsWindow");
            if (romOptionsWindow) {
                romOptionsWindow.show();
            }
        });
        const uploadSpoilerButton = this.shadowRoot.getElementById("uplaod-spoiler-button");
        uploadSpoilerButton.addEventListener("click", () => {
            this.close();
            const spoilerLogWindow = modalRegistry.show("SpoilerLogWindow");
            if (spoilerLogWindow) {
                spoilerLogWindow.show();
            }
        });
    }

    show() {
        super.show();
        this.#showInitCheckboxEl.checked = SettingsStorage.get("show_state_init_window");
    }

    close() {
        SettingsStorage.set("show_state_init_window", this.#showInitCheckboxEl.checked);
        super.close();
    }

}

customElements.define("tootr-modal-new-game", NewGameModal);
