import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import {ClientTypes} from "gametrackerjs/util/rtc/multiplayer/config/MultiplayerConfig.js";
import TPL from "./MultiplayerUser.js.html" assert {type: "html"};
import STYLE from "./MultiplayerUser.js.css" assert {type: "css"};

export default class MultiplayerUser extends CustomElement {

    #iconTooltipEl;

    #iconEl;

    #nameEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#iconTooltipEl = this.shadowRoot.getElementById("icon-tooltip");
        this.#iconEl = this.shadowRoot.getElementById("icon");
        this.#nameEl = this.shadowRoot.getElementById("name");
    }

    get name() {
        return this.getAttribute("name");
    }

    set name(val) {
        this.setAttribute("name", val);
    }

    get role() {
        return this.getAttribute("role");
    }

    set role(val) {
        this.setAttribute("role", val);
    }

    static get observedAttributes() {
        return ["name", "role"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "role": {
                if (oldValue != newValue) {
                    const tooltipContent = ClientTypes.get(newValue)?.label ?? "";
                    this.#iconTooltipEl.i18nTooltip = tooltipContent;
                    this.#iconEl.setAttribute("title", newValue);
                }
            } break;
            case "name": {
                if (oldValue != newValue) {
                    this.#nameEl.innerHTML = newValue;
                }
            } break;
        }
    }

}

customElements.define("ootrt-multiplayer-user", MultiplayerUser);
