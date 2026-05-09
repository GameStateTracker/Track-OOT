import AbstractFormElement from "@emcjs/fe/ui/form/element/AbstractFormElement.js";
import FormElementRegistry from "@emcjs/fe/registry/form/FormElementRegistry.js";
import {setBooleanAttribute} from "@emcjs/fe/util/node/NodeAttributes.js";
import {registerFocusable} from "@emcjs/fe/util/element/ElementFocusManager.js";
import "@emcjs/fe/ui/form/element/select/switch/SwitchSelect.js";
import "@emcjs/fe/ui/form/element/select/list/ListSelect.js";
import TPL from "./DungeonStateActiveTypes.js.html" assert {type: "html"};
import STYLE from "./DungeonStateActiveTypes.js.css" assert {type: "css"};

export default class DungeonStateActiveTypes extends AbstractFormElement {

    #containerEl;

    #inputEl;

    #selectionEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#containerEl = this.shadowRoot.getElementById("container");
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#selectionEl = this.shadowRoot.getElementById("selection");
        this.#inputEl.addEventListener("input", () => {
            const value = this.#inputEl.value;
            if (value === "custom") {
                this.value = this.#selectionEl.value;
            } else {
                this.value = "";
            }
        });
        this.#selectionEl.addEventListener("input", () => {
            const value = this.#inputEl.value;
            if (value === "custom") {
                this.value = this.#selectionEl.value;
            }
        });
    }

    formDisabledCallback(disabled) {
        super.formDisabledCallback(disabled);
        this.#inputEl.disabled = disabled;
        this.#selectionEl.disabled = disabled;
    }

    focus(options) {
        this.#inputEl.focus(options);
    }

    set value(value) {
        if (value !== "" && !Array.isArray(value)) {
            value = "";
        }
        super.value = value;
    }

    get value() {
        return super.value;
    }

    static get observedAttributes() {
        const superObserved = super.observedAttributes ?? [];
        return [
            ...superObserved,
            "readonly"
        ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        switch (name) {
            case "readonly": {
                if (oldValue != newValue) {
                    setBooleanAttribute(this.#inputEl, name, this.readOnly);
                }
            } break;
        }
    }

    renderValue(value) {
        if (Array.isArray(value)) {
            this.#containerEl.classList.add("custom");
            this.#inputEl.value = "custom";
            this.#selectionEl.value = value;
            this.scrollIntoView();
        } else {
            this.#containerEl.classList.remove("custom");
            this.#inputEl.value = "default";
        }
    }

}

FormElementRegistry.register("DungeonStateActiveTypes", DungeonStateActiveTypes);
customElements.define("ootrt-input-dungeonstateactivetype", DungeonStateActiveTypes);
registerFocusable("ootrt-input-dungeonstateactivetype");
