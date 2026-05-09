import DataGridCell from "@emcjs/fe/ui/dataview/datagrid/components/cell/DataGridCell.js";
import ContextMenuManagerMixin from "@emcjs/fe/ui/mixin/ContextMenuManagerMixin.js";
import {HINT_STATUS} from "archipelagojs/consts/HintStatus.js";
import ArchipelagoController from "../../../../../util/archipelago/ArchipelagoController.js";
import APHintStatusContextMenu from "./ctxmenu/APHintStatusContextMenu.js";
import TPL from "./DataGridCellAPStatus.js.html" assert {type: "html"};
import STYLE from "./DataGridCellAPStatus.js.css" assert {type: "css"};

const HINT_STATUS_TYPES = {
    [HINT_STATUS.HINT_UNSPECIFIED]: "unspecified",
    [HINT_STATUS.HINT_NO_PRIORITY]: "no-priority",
    [HINT_STATUS.HINT_AVOID]: "avoid",
    [HINT_STATUS.HINT_PRIORITY]: "priority",
    [HINT_STATUS.HINT_FOUND]: "found"
};

const HINT_STATUS_NAMES = {
    [HINT_STATUS.HINT_UNSPECIFIED]: "Unspecified",
    [HINT_STATUS.HINT_NO_PRIORITY]: "No Priority",
    [HINT_STATUS.HINT_AVOID]: "Avoid",
    [HINT_STATUS.HINT_PRIORITY]: "Priority",
    [HINT_STATUS.HINT_FOUND]: "Found"
};

export default class DataGridCellAPStatus extends ContextMenuManagerMixin(DataGridCell) {

    #isReceiver;

    #contentEl;

    #valueEl;

    constructor(dataGridId) {
        super(dataGridId);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#contentEl = this.shadowRoot.getElementById("content");
        this.#contentEl.append(els);
        this.#valueEl = this.shadowRoot.getElementById("value");
        /* --- */
        this.addEventListener("click", (event) => {
            if (this.#isReceiver) {
                this.showDefaultContextMenu(event);
                event.stopPropagation();
                event.preventDefault();
                return false;
            }
        });
        this.setDefaultContextMenu(APHintStatusContextMenu);
        this.addDefaultContextMenuHandler("no-priority", (event) => {
            event.stopPropagation();
            this.#sendStatusToServer(HINT_STATUS.HINT_NO_PRIORITY);
        });
        this.addDefaultContextMenuHandler("priority", (event) => {
            event.stopPropagation();
            this.#sendStatusToServer(HINT_STATUS.HINT_PRIORITY);
        });
        this.addDefaultContextMenuHandler("avoid", (event) => {
            event.stopPropagation();
            this.#sendStatusToServer(HINT_STATUS.HINT_AVOID);
        });
    }

    set value(val) {
        this.setJSONAttribute("value", val);
    }

    get value() {
        return this.getJSONAttribute("value");
    }

    onValueChange(value) {
        if (value == null) {
            this.#valueEl.innerText = "";
            this.#valueEl.className = "";
            this.#contentEl.classList.remove("editable");
        } else {
            const {
                statusId, receiving
            } = value;
            this.#valueEl.innerText = HINT_STATUS_NAMES[statusId];
            this.#valueEl.className = `hint-${HINT_STATUS_TYPES[statusId]}`;
            this.#contentEl.classList.toggle("editable", receiving);
            this.#isReceiver = receiving;
        }
    }

    #sendStatusToServer(statusId) {
        const {
            location: {locationId}, finder: {playerId}
        } = this.rowData;
        ArchipelagoController.updateHintStatus(playerId, locationId, statusId);
    }

}

DataGridCell.registerCellType("apstatus", DataGridCellAPStatus, 200);
customElements.define("ootrt-grid-datagrid-cell-apstatus", DataGridCellAPStatus);
