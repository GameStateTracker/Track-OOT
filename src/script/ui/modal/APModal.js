import Modal from "/emcJS/ui/modal/Modal.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import "/emcJS/ui/form/button/Button.js";
import "/emcJS/ui/form/element/input/number/NumberInput.js";
import "/emcJS/ui/form/element/input/password/PasswordInput.js";
import "/emcJS/ui/form/element/input/string/StringInput.js";
import "/emcJS/ui/form/element/input/switch/SwitchInput.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import ArchipelagoController from "../../util/archipelago/ArchipelagoController.js";
import {AP_STORAGES} from "../../util/archipelago/storage/RegisterAPStorage.js";
import TPL from "./APModal.js.html" assert {type: "html"};
import STYLE from "./APModal.js.css" assert {type: "css"};

const APStateStorage = Savestate.getStorage("APConfig");

export default class APModal extends Modal {

    #apHostnameEl;

    #apPortEl;

    #apSlotNameEl;

    #apPasswordEl;

    #apSettingsSyncEl;

    #connectEl;

    #disconnectEl;

    #cancelEl;

    #purgeEl;

    constructor() {
        super("Archipelago");
        this.setIcon({
            type: "url",
            content: "/images/icons/ap.svg",
            style: {shadow: true}
        });
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const contentEl = this.shadowRoot.getElementById("content");
        const footerEl = this.shadowRoot.getElementById("footer");

        const formEl = els.getElementById("form");
        this.#cancelEl = els.getElementById("cancel");
        this.#purgeEl = els.getElementById("purge");
        this.#connectEl = els.getElementById("connect");
        this.#disconnectEl = els.getElementById("disconnect");

        contentEl.append(formEl);
        footerEl.append(this.#purgeEl);
        footerEl.append(this.#cancelEl);
        footerEl.append(this.#connectEl);
        footerEl.append(this.#disconnectEl);

        this.#apHostnameEl = this.shadowRoot.getElementById("apHostname");
        this.#apPortEl = this.shadowRoot.getElementById("apPort");
        this.#apSlotNameEl = this.shadowRoot.getElementById("apSlotName");
        this.#apPasswordEl = this.shadowRoot.getElementById("apPassword");
        this.#apSettingsSyncEl = this.shadowRoot.getElementById("apSettingsSync");

        this.#purgeEl.addEventListener("click", () => this.#purgeAPState());
        this.#cancelEl.addEventListener("click", () => this.cancel());
        this.#connectEl.addEventListener("click", () => this.connect());
        this.#disconnectEl.addEventListener("click", () => this.disconnect());
    }

    show() {
        const {
            apHostname, apPort, apSlotName, apSettingsSync
        } = APStateStorage.getAll();

        this.#apHostnameEl.value = apHostname ?? "archipelago.gg";
        this.#apPortEl.value = apPort;
        this.#apSlotNameEl.value = apSlotName ?? "";
        this.#apPasswordEl.value = "";
        this.#apSettingsSyncEl.value = apSettingsSync ?? true;

        if (ArchipelagoController.isConnected()) {
            this.#onConnected();
        } else {
            this.#onDisonnected();
        }

        super.show();
    }

    async connect() {
        const apHostname = this.#apHostnameEl.value;
        const apPort = parseInt(this.#apPortEl.value) || "";
        const apSlotName = this.#apSlotNameEl.value;
        const apPassword = this.#apPasswordEl.value;
        const apSettingsSync = this.#apSettingsSyncEl.value;

        try {
            this.#onConnecting();
            await ArchipelagoController.connect({
                hostname: apHostname,
                port: apPort,
                slotName: apSlotName,
                password: apPassword,
                syncSettings: apSettingsSync
            });
            APStateStorage.setAll({
                apHostname,
                apPort,
                apSlotName,
                apSettingsSync
            });
            this.#onConnected();
            this.remove();
        } catch (error) {
            this.#onDisonnected();
            console.error(error);
            ModalDialog.error("Error", "An error occured", [error]);
        }
    }

    async disconnect() {
        ArchipelagoController.disconnect();
        this.#onDisonnected();
    }

    cancel() {
        this.remove();
    }

    focusLast() {
        this.#cancelEl.focus();
    }

    async #purgeAPState() {
        const result = await ModalDialog.confirm("Delete AP Savedata", "Do you really want to delete the AP Item/Location data");
        if (result === true) {
            AP_STORAGES.items.clearAsChange();
            AP_STORAGES.locations.clearAsChange();
            Savestate.deleteMeta("archipelago");
            SavestateHandler.forceCache();
        }
    }

    #onConnecting() {
        this.busy = true;
        this.#connectEl.text = "connecting...";
        this.#connectEl.disabled = true;

        this.#apHostnameEl.readonly = true;
        this.#apPortEl.readonly = true;
        this.#apSlotNameEl.readonly = true;
        this.#apPasswordEl.readonly = true;
    }

    #onConnected() {
        this.busy = false;
        this.#connectEl.text = "connect";
        this.#connectEl.disabled = false;

        this.#apHostnameEl.readonly = true;
        this.#apPortEl.readonly = true;
        this.#apSlotNameEl.readonly = true;
        this.#apPasswordEl.readonly = true;

        this.#connectEl.hidden = true;
        this.#purgeEl.hidden = true;
        this.#disconnectEl.hidden = false;
    }

    #onDisonnected() {
        this.busy = false;
        this.#connectEl.text = "connect";
        this.#connectEl.disabled = false;

        this.#apHostnameEl.readonly = false;
        this.#apPortEl.readonly = false;
        this.#apSlotNameEl.readonly = false;
        this.#apPasswordEl.readonly = false;

        this.#connectEl.hidden = false;
        this.#purgeEl.hidden = false;
        this.#disconnectEl.hidden = true;
    }

}

customElements.define("tootr-modal-ap", APModal);
