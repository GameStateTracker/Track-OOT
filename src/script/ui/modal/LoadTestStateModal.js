import Modal from "/emcJS/ui/modal/Modal.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import "/emcJS/ui/form/button/Button.js";
import "/emcJS/ui/form/element/input/file/FileInput.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import TPL from "./LoadTestStateModal.js.html" assert {type: "html"};
import STYLE from "./LoadTestStateModal.js.css" assert {type: "css"};

export default class LoadTestStateModal extends Modal {

    #cancelEl;

    #submitEl;

    #fileEl;

    constructor() {
        super("Load Test-State");
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const contentEl = this.shadowRoot.getElementById("content");
        const footerEl = this.shadowRoot.getElementById("footer");

        const formEl = els.getElementById("form");
        this.#cancelEl = els.getElementById("cancel");
        this.#submitEl = els.getElementById("submit");

        contentEl.append(formEl);
        footerEl.append(this.#cancelEl);
        footerEl.append(this.#submitEl);

        this.#fileEl = this.shadowRoot.getElementById("file");

        this.#cancelEl.addEventListener("click", () => this.cancel());
        this.#submitEl.addEventListener("click", () => this.submit());
    }

    async submit() {
        const fileContent = this.#fileEl.getData();
        const testData = fileContent?.data;

        try {
            if (testData != null) {
                await BusyIndicatorManager.busy();
                const {state} = testData;
                Savestate.deserialize({data: state});
                this.remove();
                await BusyIndicatorManager.unbusy();
            } else {
                await ModalDialog.alert("No Test-File loaded", "Please load a Test-File!");
                this.show();
            }
        } catch (error) {
            console.error(error);
            ModalDialog.error("Error", "An error occured", [error]);
        }
    }

    cancel() {
        this.remove();
    }

}

customElements.define("tootr-modal-load-test-state", LoadTestStateModal);
