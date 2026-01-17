import I18nOption from "/emcJS/ui/i18n/builtin/I18nOption.js";
import "/emcJS/ui/form/element/select/simple/SimpleSelect.js";
import "/emcJS/ui/form/button/Button.js";
import {ClientTypes} from "/GameTrackerJS/util/rtc/multiplayer/config/MultiplayerConfig.js";
import MultiplayerUser from "./MultiplayerUser.js";
import TPL from "./MultiplayerUserManaged.js.html" assert {type: "html"};
import STYLE from "./MultiplayerUserManaged.js.css" assert {type: "css"};

export default class MultiplayerUserManaged extends MultiplayerUser {

    #clientTypeEl;

    #kickEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#clientTypeEl = this.shadowRoot.getElementById("client-type");
        this.#kickEl = this.shadowRoot.getElementById("kick");

        this.#clientTypeEl.addEventListener("change", () => {
            const newRole = this.#clientTypeEl.value;
            if (this.role != newRole) {
                const ev = new Event("role");
                ev.data = newRole;
                this.dispatchEvent(ev);
            }
        });
        this.#kickEl.addEventListener("click", () => {
            this.dispatchEvent(new Event("kick"));
        });

        for (const [, clientType] of ClientTypes) {
            const {
                value, label
            } = clientType;
            const option = I18nOption.create(value, label);
            this.#clientTypeEl.append(option);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback?.(name, oldValue, newValue);
        switch (name) {
            case "role": {
                if (oldValue != newValue) {
                    this.#clientTypeEl.value = newValue;
                }
            } break;
        }
    }

}

customElements.define("ootrt-multiplayer-user-managed", MultiplayerUserManaged);
