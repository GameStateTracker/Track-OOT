import Modal from "/emcJS/ui/modal/Modal.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import "/emcJS/ui/form/button/Button.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import TPL from "./ClearDataModal.js.html" assert {type: "html"};
import STYLE from "./ClearDataModal.js.css" assert {type: "css"};

async function clearData(event) {
    const buttonEl = event.target;
    if (!await ModalDialog.confirm("Warning", `Do you really want to delete "${buttonEl.innerHTML}"? This can not be undone.`)) {
        return;
    }
    const types = buttonEl.dataset.types.split(",");
    const data = {};
    for (const name of types) {
        data[name] = null;
    }
    SavestateHandler.overwrite(data);
}

export default class ClearDataModal extends Modal {

    constructor() {
        super("Clear data");
        // TODO set clear icon
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const contentEl = this.shadowRoot.getElementById("content");
        contentEl.append(els);
        /* --- */
        const buttonEls = contentEl.querySelectorAll("[data-types]");
        for (const buttonEl of Array.from(buttonEls)) {
            buttonEl.addEventListener("click", clearData);
        }
    }

}

customElements.define("tootr-modal-clear-data", ClearDataModal);
