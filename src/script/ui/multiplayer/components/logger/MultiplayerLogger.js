import CustomElement from "/emcJS/ui/element/CustomElement.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import TPL from "./MultiplayerLogger.js.html" assert {type: "html"};
import STYLE from "./MultiplayerLogger.js.css" assert {type: "css"};

export default class MultiplayerLogger extends CustomElement {

    #titleEl;

    #outputEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#titleEl = this.shadowRoot.getElementById("title");
        this.#outputEl = this.shadowRoot.getElementById("output");

        this.#titleEl.addEventListener("click", () => {
            this.expanded = !this.expanded;
        });
    }

    set expanded(value) {
        this.setBooleanAttribute("expanded", value);
    }

    get expanded() {
        return this.getBooleanAttribute("expanded");
    }

    log(...message) {
        if (message.length == 1) {
            message = message[0];
        }
        if (typeof message == "object") {
            this.#outputEl.value += "LOG " + JSON.stringify(message, null, 4) + "\n----------------------------------------\n";
        } else {
            this.#outputEl.value += "LOG\n" + message + "\n----------------------------------------\n";
        }
        this.#outputEl.scrollTop = this.#outputEl.scrollHeight;
    }

    info(...message) {
        if (message.length == 1) {
            message = message[0];
        }
        if (typeof message == "object") {
            this.#outputEl.value += "INFO " + JSON.stringify(message, null, 4) + "\n----------------------------------------\n";
        } else {
            this.#outputEl.value += "INFO\n" + message + "\n----------------------------------------\n";
        }
        this.#outputEl.scrollTop = this.#outputEl.scrollHeight;
    }

    warn(...message) {
        if (message.length == 1) {
            message = message[0];
        }
        if (typeof message == "object") {
            this.#outputEl.value += "WARN " + JSON.stringify(message, null, 4) + "\n----------------------------------------\n";
        } else {
            this.#outputEl.value += "WARN\n" + message + "\n----------------------------------------\n";
        }
        this.#outputEl.scrollTop = this.#outputEl.scrollHeight;
    }

    error(...message) {
        if (message.length == 1) {
            message = message[0];
        }
        if (typeof message == "object") {
            this.#outputEl.value += "ERROR " + JSON.stringify(message, null, 4) + "\n----------------------------------------\n";
        } else {
            this.#outputEl.value += "ERROR\n" + message + "\n----------------------------------------\n";
        }
        this.#outputEl.scrollTop = this.#outputEl.scrollHeight;
    }

}

customElements.define("ootrt-multiplayer-logger", MultiplayerLogger);
