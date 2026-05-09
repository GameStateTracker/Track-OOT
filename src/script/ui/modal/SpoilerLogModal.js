import ModalFormDialog from "@emcjs/fe/ui/modal/ModalFormDialog.js";
import ModalDialog from "@emcjs/fe/ui/modal/ModalDialog.js";
import BusyIndicatorManager from "@emcjs/fe/util/busy/BusyIndicatorManager.js";
import "@emcjs/fe/ui/Paging.js";
import "@emcjs/fe/ui/form/element/input/file/FileInput.js";
import SavestateHandler from "gametrackerjs/savestate/SavestateHandler.js";
import SettingsConfigHandler from "gametrackerjs/util/settings/SettingsConfigHandler.js";
import SpoilerOptionsResource from "../../resource/SpoilerOptionsResource.js";
import SpoilerParser from "../../util/spoilerparser/SpoilerParser.js";
import TPL from "./SpoilerLogModal.js.html" assert {type: "html"};
import STYLE from "./SpoilerLogModal.js.css" assert {type: "css"};

const options = SpoilerOptionsResource.get();
const settingsConfigHandler = new SettingsConfigHandler(options, (label) => `parse[${label}]`);

export default class SpoilerLogModal extends ModalFormDialog {

    #footerEl;

    #spoilerFileInputEl;

    constructor() {
        super("Spoiler parser");
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.loadFormConfig(settingsConfigHandler.config, settingsConfigHandler.defaultValues);
        this.#footerEl = this.shadowRoot.getElementById("footer");
        this.#spoilerFileInputEl = els.getElementById("spoiler-file-input");
        this.#footerEl.prepend(this.#spoilerFileInputEl);
    }

    async show() {
        const values = SavestateHandler.getAll("parseSpoiler");
        const data = settingsConfigHandler.convertToFormData(values);
        const result = await super.show(data);
        if (result) {
            await this.#parseSpoiler(result);
        }
        return result;
    }

    getSubmitValue() {
        const result = super.getSubmitValue();
        return settingsConfigHandler.convertFromFormData(result);
    }

    async submit() {
        const spoiler = this.#spoilerFileInputEl.getData();
        const spoilerData = spoiler?.data;
        if (spoilerData) {
            super.submit();
        } else {
            await BusyIndicatorManager.unbusy();
            await ModalDialog.alert("No spoiler log loaded", "Please load a spoiler log first, then try again!");
        }
    }

    async #parseSpoiler(parserOptions) {
        await BusyIndicatorManager.busy();
        SavestateHandler.set("parseSpoiler", parserOptions);
        const spoiler = this.#spoilerFileInputEl.getData();
        const spoilerData = spoiler?.data;
        if (spoilerData) {
            try {
                const savestateData = await SpoilerParser.parse(spoilerData, parserOptions);
                if (savestateData != null) {
                    SavestateHandler.overwriteClean(savestateData);
                }
                this.#spoilerFileInputEl.value = "";
                await BusyIndicatorManager.unbusy();
            } catch (err) {
                console.error(err);
                await BusyIndicatorManager.clear();
                await ModalDialog.alert("Error loading spoiler", err.message);
            }
        } else {
            await BusyIndicatorManager.unbusy();
            await ModalDialog.alert("No spoiler log loaded", "Please load a spoiler log first, then try again!");
            this.show();
        }
    }

}

customElements.define("tootr-modal-spoilerlog", SpoilerLogModal);
