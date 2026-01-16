import Modal from "/emcJS/ui/modal/Modal.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import "/emcJS/ui/form/button/Button.js";
import "/emcJS/ui/form/element/input/password/PasswordInput.js";
import "/emcJS/ui/form/element/input/string/StringInput.js";
import "/emcJS/ui/form/element/input/switch/SwitchInput.js";
import VersionData from "/GameTrackerJS/data/VersionData.js";
import ParameterStorage from "/GameTrackerJS/storage/ParameterStorage.js";
import ItemViewHost from "/GameTrackerJS/util/rtc/itemview/ItemViewHost.js";
import {SYNCED_STORAGES} from "../../../config/rtc/ItemViewConfig.js";
import TPL from "./ItemViewerModal.js.html" assert {type: "html"};
import STYLE from "./ItemViewerModal.js.css" assert {type: "css"};
import {uniqueKey} from "/emcJS/util/helper/UniqueGenerator.js";

export default class ItemViewerModal extends Modal {

    #itemViewHost = new ItemViewHost(window.location.hostname == "localhost" ? 8001 : "", SYNCED_STORAGES);

    #connectionTokenEl;

    #generateTokenEl;

    #viewLinkEl;

    #connectEl;

    #disconnectEl;

    constructor() {
        super("Remote Item View");
        this.setImageIcon("/images/icons/stream.svg", {shadow: "#000000"});
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const contentEl = this.shadowRoot.getElementById("content");
        const footerEl = this.shadowRoot.getElementById("footer");

        const formEl = els.getElementById("form");
        this.#connectEl = els.getElementById("connect");
        this.#disconnectEl = els.getElementById("disconnect");

        contentEl.append(formEl);
        footerEl.append(this.#connectEl);
        footerEl.append(this.#disconnectEl);

        this.#connectionTokenEl = this.shadowRoot.getElementById("connection-token");
        this.#generateTokenEl = this.shadowRoot.getElementById("generate-token");
        this.#viewLinkEl = this.shadowRoot.getElementById("view-link");

        this.#connectEl.addEventListener("click", () => {
            this.connect();
        });
        this.#disconnectEl.addEventListener("click", () => {
            this.disconnect();
        });

        this.#connectionTokenEl.addEventListener("change", () => {
            const connectionToken = this.#connectionTokenEl.value;
            const linkUrl = new URL(`/remote/itemview/#${connectionToken}`, location);
            this.#viewLinkEl.value = linkUrl.href;
        });
        this.#generateTokenEl.addEventListener("click", () => {
            const connectionToken = uniqueKey();
            this.#connectionTokenEl.value = connectionToken;
        });
    }

    show() {
        const connectionToken = ParameterStorage.get("item_view_modal.token");
        this.#connectionTokenEl.value = connectionToken;
        if (this.#itemViewHost.isHosting()) {
            this.#onConnected();
        } else {
            this.#onDisonnected();
        }
        super.show();
    }

    async connect() {
        const connectionToken = this.#connectionTokenEl.value;
        ParameterStorage.set("item_view_modal.token", connectionToken);
        try {
            this.#onConnecting();
            await this.#itemViewHost.host(connectionToken, "", VersionData.version);
            this.#onConnected();
        } catch (error) {
            this.#onDisonnected();
            console.error(error);
            ModalDialog.error("Error", "An error occured", [error]);
        }
    }

    async disconnect() {
        await this.#itemViewHost.close();
        this.#onDisonnected();
    }

    focusLast() {
        if (this.#itemViewHost.isHosting()) {
            this.#connectEl.focus();
        } else {
            this.#disconnectEl.focus();
        }
    }

    #onConnecting() {
        this.#connectEl.text = "connecting...";
        this.#connectEl.disabled = true;

        this.#connectionTokenEl.readonly = true;
        this.#generateTokenEl.disabled = true;
    }

    #onConnected() {
        this.#connectEl.text = "connect";
        this.#connectEl.disabled = false;

        this.#connectionTokenEl.readonly = true;
        this.#generateTokenEl.disabled = true;

        this.#connectEl.hidden = true;
        this.#disconnectEl.hidden = false;
    }

    #onDisonnected() {
        this.#connectEl.text = "connect";
        this.#connectEl.disabled = false;

        this.#connectionTokenEl.readonly = false;
        this.#generateTokenEl.disabled = false;

        this.#connectEl.hidden = false;
        this.#disconnectEl.hidden = true;
    }

}

customElements.define("tootr-modal-itemviewer", ItemViewerModal);
