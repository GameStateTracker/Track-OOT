import I18nOption from "/emcJS/ui/i18n/builtin/I18nOption.js";
import "/emcJS/ui/form/element/select/simple/SimpleSelect.js";
import {ClientTypes} from "/GameTrackerJS/util/rtc/multiplayer/config/MultiplayerConfig.js";
import MultiplayerUser from "./MultiplayerUser.js";
import TPL from "./MultiplayerUser.js.html" assert {type: "html"};
import STYLE from "./MultiplayerUser.js.css" assert {type: "css"};

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
            const ev = new Event("type");
            ev.data = this.#clientTypeEl.value;
            this.dispatchEvent(ev);
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

}

customElements.define("ootrt-multiplayer-user-managed", MultiplayerUserManaged);
