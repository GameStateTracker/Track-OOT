import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import ModalDialog from "@emcjs/fe/ui/modal/ModalDialog.js";
import "@emcjs/fe/ui/i18n/I18nLabel.js";
import "@emcjs/fe/ui/form/button/Button.js";
import StateDataEventManagerMixin from "gametrackerjs/ui/mixin/StateDataEventManagerMixin.js";
import SongStateManager from "../../../../state/song/SongStateManager.js";
import "./SongStave.js";
import "./SongBuilder.js";
import TPL from "./SongField.js.html" assert {type: "html"};
import STYLE from "./SongField.js.css" assert {type: "css"};

export default class SongField extends StateDataEventManagerMixin(CustomElement) {

    #titleEl;

    #buttonContainerEl;

    #editEl;

    #resetEl;

    #clearEl;

    #staveEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#titleEl = this.shadowRoot.getElementById("title");
        this.#buttonContainerEl = this.shadowRoot.getElementById("button-container");
        this.#editEl = this.shadowRoot.getElementById("edit");
        this.#resetEl = this.shadowRoot.getElementById("reset");
        this.#clearEl = this.shadowRoot.getElementById("clear");
        this.#staveEl = this.shadowRoot.getElementById("stave");

        this.registerStateHandler("notes", (event) => {
            this.#staveEl.value = event.value;
        });

        /* mouse events */
        this.#editEl.onclick = () => {
            this.#editSong();
        };
        this.#resetEl.onclick = () => {
            this.#resetSong();
        };
        this.#clearEl.onclick = () => {
            this.#clearSong();
        };
    }

    applyDefaultValues() {
        this.#buttonContainerEl.classList.add("hidden");
        this.#staveEl.value = "";
    }

    applyStateValues(state) {
        if (state != null) {
            this.#buttonContainerEl.classList.toggle("hidden", !state.props.editable);
            this.#staveEl.value = state.notes;
        }
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get ref() {
        return this.getAttribute("ref");
    }

    static get observedAttributes() {
        return ["ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            const state = SongStateManager.get(this.ref);
            this.#titleEl.i18nValue = `song[${newValue}]`;
            this.switchState(state);
        }
    }

    #editSong() {
        const builder = document.createElement("ootrt-songbuilder");
        builder.value = this.#staveEl.value;
        const d = new ModalDialog(`song[${this.ref}]`, {
            submit: true,
            cancel: true
        });
        d.addEventListener("submit", (result) => {
            if (result) {
                const state = this.getState();
                if (state != null) {
                    state.notes = builder.value;
                }
            }
        });
        d.append(builder);
        d.show();
    }

    #resetSong() {
        const state = this.getState();
        if (state != null) {
            state.notes = null;
        }
    }

    #clearSong() {
        const state = this.getState();
        if (state != null) {
            state.notes = "";
        }
    }

}

customElements.define("ootrt-songfield", SongField);
