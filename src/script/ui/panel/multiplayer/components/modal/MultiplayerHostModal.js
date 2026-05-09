import Modal from "@emcjs/fe/ui/modal/Modal.js";
import ModalDialog from "@emcjs/fe/ui/modal/ModalDialog.js";
import I18nOption from "@emcjs/fe/ui/i18n/builtin/I18nOption.js";
import "@emcjs/fe/ui/i18n/I18nLabel.js";
import "@emcjs/fe/ui/form/button/Button.js";
import "@emcjs/fe/ui/form/element/input/password/PasswordInput.js";
import "@emcjs/fe/ui/form/element/input/string/StringInput.js";
import "@emcjs/fe/ui/form/element/input/text/TextInput.js";
import "@emcjs/fe/ui/form/element/select/simple/SimpleSelect.js";
import VersionData from "gametrackerjs/data/VersionData.js";
import {ClientTypes} from "gametrackerjs/util/rtc/multiplayer/config/MultiplayerConfig.js";
import MultiplayerControllerInst from "../../../../../util/rtc/MultiplayerControllerInst.js";
import TPL from "./MultiplayerHostModal.js.html" assert {type: "html"};
import STYLE from "./MultiplayerHostModal.js.css" assert {type: "css"};

export default class MultiplayerHostModal extends Modal {

    #nameEl;

    #passwordEl;

    #descriptionEl;

    #clientTypeEl;

    #hostEl;

    #cancelEl;

    constructor() {
        super("Create Multiplayer Room");
        this.setIcon({
            type: "url",
            content: "/images/icons/multi.svg",
            style: {shadow: true}
        });
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const contentEl = this.shadowRoot.getElementById("content");
        const footerEl = this.shadowRoot.getElementById("footer");

        const formEl = els.getElementById("form");
        this.#cancelEl = els.getElementById("cancel");
        this.#hostEl = els.getElementById("host");

        contentEl.append(formEl);
        footerEl.append(this.#cancelEl);
        footerEl.append(this.#hostEl);

        this.#nameEl = this.shadowRoot.getElementById("name");
        this.#passwordEl = this.shadowRoot.getElementById("password");
        this.#descriptionEl = this.shadowRoot.getElementById("description");
        this.#clientTypeEl = this.shadowRoot.getElementById("client-type");

        for (const [, clientType] of ClientTypes) {
            const {
                value, label
            } = clientType;
            const option = I18nOption.create(value, label);
            this.#clientTypeEl.append(option);
        }

        this.#cancelEl.addEventListener("click", () => this.cancel());
        this.#hostEl.addEventListener("click", () => this.register());
    }

    show() {
        this.#initModal();
        super.show();
    }

    async register() {
        const name = this.#nameEl.value;
        const password = this.#passwordEl.value;
        const description = this.#descriptionEl.value;
        const clientType = this.#clientTypeEl.value;

        try {
            this.#onRegistering();
            const res = await MultiplayerControllerInst.host(name, password, VersionData.version, {desc: description});
            this.#onDefault();
            if (res) {
                const peer = MultiplayerControllerInst.getPeer();
                peer.joiningClientType = clientType;
                const ev = new Event("hosting");
                ev.peer = peer;
                this.dispatchEvent(ev);
                this.remove();
            }
        } catch (error) {
            this.#onDefault();
            console.error(error);
            ModalDialog.error("Error", "An error occured", [error]);
        }
    }

    cancel() {
        this.remove();
    }

    focusLast() {
        this.#hostEl.focus();
    }

    #onRegistering() {
        this.busyIndicator.busy();
        this.#hostEl.text = "Creating...";
        this.#hostEl.disabled = true;
    }

    #onDefault() {
        this.busyIndicator.reset();
        this.#hostEl.text = "Create";
        this.#hostEl.disabled = false;
    }

    #initModal() {
        this.#onDefault();
        this.#nameEl.value = "";
        this.#passwordEl.value = "";
        this.#descriptionEl.value = "";
        this.#clientTypeEl.value = ClientTypes.defaultType.value;
    }

}

customElements.define("tootr-modal-multiplayer-host", MultiplayerHostModal);
