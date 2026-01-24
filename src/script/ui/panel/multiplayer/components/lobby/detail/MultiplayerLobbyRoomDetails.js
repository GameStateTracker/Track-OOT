import CustomElement from "/emcJS/ui/element/CustomElement.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import {isStringNotEmpty} from "/emcJS/util/helper/CheckType.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import VersionData from "/GameTrackerJS/data/VersionData.js";
import MultiplayerControllerInst from "../../../../../../util/rtc/MultiplayerControllerInst.js";
import TPL from "./MultiplayerLobbyRoomDetails.js.html" assert {type: "html"};
import STYLE from "./MultiplayerLobbyRoomDetails.js.css" assert {type: "css"};

export default class MultiplayerLobbyRoomDetails extends CustomElement {

    #nameEl;

    #iconEl;

    #versionEl;

    #descEl;

    #joinEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#nameEl = this.shadowRoot.getElementById("name");
        this.#iconEl = this.shadowRoot.getElementById("icon");
        this.#versionEl = this.shadowRoot.getElementById("version");
        this.#descEl = this.shadowRoot.getElementById("desc");
        this.#joinEl = this.shadowRoot.getElementById("join");

        this.#joinEl.addEventListener("click", async () => {
            const pass = await this.#promptPassword();
            const res = await MultiplayerControllerInst.join(this.name, pass, VersionData.version);
            if (res) {
                const peer = MultiplayerControllerInst.getPeer();
                const ev = new Event("joined");
                ev.peer = peer;
                this.dispatchEvent(ev);
            }
        });
    }

    set pass(val) {
        this.setBooleanAttribute("pass", val);
    }

    get pass() {
        return this.getBooleanAttribute("pass");
    }

    set name(val) {
        this.setStringAttribute("name", val);
    }

    get name() {
        return this.getStringAttribute("name");
    }

    set desc(val) {
        this.setStringAttribute("desc", val);
    }

    get desc() {
        return this.getStringAttribute("desc");
    }

    set version(val) {
        this.setStringAttribute("version", val);
    }

    get version() {
        return this.getStringAttribute("version");
    }

    static get observedAttributes() {
        return ["pass", "name", "desc", "version"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "pass": {
                    if (this.pass) {
                        this.#iconEl.classList.add("lock-closed");
                    } else {
                        this.#iconEl.classList.remove("lock-closed");
                    }
                } break;
                case "name": {
                    this.#nameEl.innerHTML = newValue;
                    if (isStringNotEmpty(newValue)) {
                        this.#joinEl.disabled = false;
                    } else {
                        this.#joinEl.disabled = true;
                    }
                } break;
                case "desc": {
                    if (isStringNotEmpty(newValue)) {
                        this.#descEl.innerHTML = newValue.toLowerCase();
                    } else {
                        this.#descEl.innerHTML = "";
                    }
                } break;
                case "version": {
                    if (isStringNotEmpty(newValue)) {
                        this.#versionEl.innerHTML = newValue.toLowerCase();
                    } else {
                        this.#versionEl.innerHTML = "";
                    }
                } break;
            }
        }
    }

    async #promptPassword() {
        if (!!this.pass && this.pass != "false") {
            return await ModalDialog.promptSensitive("Password required", "Please enter password!");
        }
        return "";
    }

}

customElements.define("ootrt-multiplayer-lobby-room-details", MultiplayerLobbyRoomDetails);
