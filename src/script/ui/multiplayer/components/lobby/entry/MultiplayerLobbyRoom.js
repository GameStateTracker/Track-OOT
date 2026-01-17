import CustomElement from "/emcJS/ui/element/CustomElement.js";
import TPL from "./MultiplayerLobbyRoom.js.html" assert {type: "html"};
import STYLE from "./MultiplayerLobbyRoom.js.css" assert {type: "css"};

export default class MultiplayerLobbyRoom extends CustomElement {

    #iconEl;

    #nameEl;

    #descEl;

    #versionEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#iconEl = this.shadowRoot.getElementById("icon");
        this.#nameEl = this.shadowRoot.getElementById("name");
        this.#descEl = this.shadowRoot.getElementById("desc");
        this.#versionEl = this.shadowRoot.getElementById("version");
    }

    get pass() {
        return this.getAttribute("pass");
    }

    set pass(val) {
        this.setAttribute("pass", val);
    }

    get name() {
        return this.getAttribute("name");
    }

    set name(val) {
        this.setAttribute("name", val);
    }

    get desc() {
        return this.getAttribute("desc");
    }

    set desc(val) {
        this.setAttribute("desc", val);
    }

    get version() {
        return this.getAttribute("version");
    }

    set version(val) {
        this.setAttribute("version", val);
    }

    static get observedAttributes() {
        return ["pass", "name", "desc", "version"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "pass":
                    if (!!newValue && newValue != "false") {
                        this.#iconEl.classList.add("lock-closed");
                    } else {
                        this.#iconEl.classList.remove("lock-closed");
                    }
                    break;
                case "name":
                    this.#nameEl.innerHTML = newValue;
                    break;
                case "desc":
                    this.#descEl.innerHTML = newValue.split("\n")[0];
                    break;
                case "version":
                    if (newValue != "") {
                        this.#versionEl.innerHTML = newValue.toLowerCase();
                    } else {
                        this.#versionEl.innerHTML = "";
                    }
                    break;
            }
        }
    }

}

customElements.define("ootrt-multiplayer-lobby-room", MultiplayerLobbyRoom);
