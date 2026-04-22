import CustomElement from "/emcJS/ui/element/CustomElement.js";
import "/emcJS/ui/input/Option.js";
import StateDataEventManagerMixin from "/GameTrackerJS/ui/mixin/StateDataEventManagerMixin.js";
import AreaStateManager from "/GameTrackerJS/statemanager/world/area/AreaStateManager.js";
import DungeonstateStates from "/script/state/dungeon/DungeonStateManager.js";
import TPL from "./DungeonType.js.html" assert {type: "html"};
import STYLE from "./DungeonType.js.css" assert {type: "css"};

const DESCRIPTION = "Set the area to be either \"Vanilla/Normal\" or \"Master Quest\".\nOnly dungeons can have \"Master Quest\" variants.";

export default class DungeonType extends StateDataEventManagerMixin(CustomElement) {

    #optionEls =  new Map();

    #selectedEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("type", (event) => {
            this.value = event.value ?? "";
        });
        this.addEventListener("click", (event) => this.next(event));
        this.addEventListener("contextmenu", (event) => this.revert(event));

        this.#optionEls.set("", this.shadowRoot.querySelector("[value='']"));
        this.#optionEls.set("v", this.shadowRoot.querySelector("[value='v']"));
        this.#optionEls.set("mq", this.shadowRoot.querySelector("[value='mq']"));
    }

    connectedCallback() {
        super.connectedCallback?.();
        // state
        const state = this.getState();
        if (state != null) {
            this.value = state.type ?? "";
        }
    }

    applyDefaultValues() {
        this.value = "v";
    }

    applyStateValues(state) {
        if (state != null) {
            this.value = state.type ?? "";
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get readOnly() {
        const val = this.getAttribute("readonly");
        return !!val && val != "false";
    }

    set readOnly(val) {
        this.setAttribute("readonly", val);
    }

    static get observedAttributes() {
        return ["ref", "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    // state
                    const state = DungeonstateStates.get(newValue);
                    this.readOnly = true;
                    if (state != null) {
                        const area = AreaStateManager.get(newValue);
                        if (area?.props.lists?.mq != null) {
                            this.readOnly = false;
                        }
                    }
                    this.switchState(state);
                } break;
                case "value": {
                    if (this.#selectedEl) {
                        this.#selectedEl.classList.remove("active");
                        this.#selectedEl = null;
                    }
                    const ne = this.#optionEls.get(newValue);
                    if (ne) {
                        ne.classList.add("active");
                        this.#selectedEl = ne;
                    }
                    this.#applyTooltip();

                    const ev = new Event("change");
                    ev.oldValue = oldValue;
                    ev.value = newValue;
                    this.dispatchEvent(ev);
                } break;
            }
        }
    }

    next(event) {
        if (!this.readOnly) {
            const state = this.getState();
            if (state != null) {
                if (state.type == "v") {
                    state.type = "mq";
                } else {
                    state.type = "v";
                }
            }
        }
        event.preventDefault();
        return false;
    }

    revert(event) {
        if (!this.readOnly) {
            const state = this.getState();
            if (state != null) {
                state.type = undefined;
            }
        }
        event.preventDefault();
        return false;
    }

    #applyTooltip() {
        if (this.#selectedEl != null) {
            this.title = `${DESCRIPTION}\n\nActive value: ${this.#selectedEl.dataset.description ?? this.#selectedEl.value}`;
        } else {
            this.title = `${DESCRIPTION}\n\nActive value: [No value selected]`;
        }
    }

}

customElements.define("ootrt-dungeontype", DungeonType);
