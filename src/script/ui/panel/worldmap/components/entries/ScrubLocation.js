import ModalDialog from "@emcjs/fe/ui/modal/ModalDialog.js";
import {delimitInteger} from "@emcjs/core/util/helper/number/Integer.js";
import UIRegistry from "gametrackerjs/registry/UIRegistry.js";
import WorldMapLocation from "gametrackerjs/ui/panel/worldmap/components/entries/Location.js";
import MetaObserver from "gametrackerjs/util/observer/MetaObserver.js";
import LogicViewerModal from "../../../../modal/LogicViewerModal.js";
import APHintLocations from "../../../../../resource/APHintLocations.js";

const archipelagoActiveObserver = new MetaObserver("archipelago");
const apHintLocations = APHintLocations.get();

function resolveIcon(icon) {
    if (Array.isArray(icon)) {
        return icon[0];
    } else {
        return icon;
    }
}

export default class TrackerWorldMapScrubLocation extends WorldMapLocation {

    #itemEl;

    constructor() {
        super();
        /* --- */
        this.#itemEl = this.shadowRoot.getElementById("item");
        /* state handler */
        this.registerStateHandler("price", () => {
            const state = this.getState();
            this.#applyPrice(state?.price);
        });
        /* context menu */
        this.setAddedDefaultContextMenuItems([
            "splitter",
            {
                menuAction: "set_price",
                content: "Set Price"
            },
            "splitter",
            {
                menuAction: "show_logic",
                content: "Show Logic"
            },
            {
                type: "splitter",
                group: "ap"
            },
            {
                group: "ap",
                menuAction: "hint_ap_location",
                content: "AP Hint Location"
            }
        ]);
        this.addDefaultContextMenuHandler("set_price", async () => {
            const state = this.getState();
            if (state != null) {
                const price = await ModalDialog.promptNumber("Set Price", "Please enter a price", 0, 999);
                if (typeof price === "number") {
                    if (!isNaN(price)) {
                        state.price = delimitInteger(price, 0, 999);
                    } else {
                        state.price = null;
                    }
                }
            }
        });
        this.addDefaultContextMenuHandler("show_logic", () => {
            const state = this.getState();
            if (state != null) {
                LogicViewerModal.show(state.props.logicAccess ?? "", `location[${this.ref}]`);
            }
        });
        this.addDefaultContextMenuHandler("hint_ap_location", () => {
            const apHintLocation = apHintLocations[this.ref];
            if (apHintLocation != null) {
                const viewchoiceEl = document.getElementById("main-content");
                viewchoiceEl.active = "ap";
                const apTextClient = document.getElementById("ap-textclient");
                apTextClient.setLocationHintMessage(apHintLocation);
            }
        });
        /* AP */
        if (!archipelagoActiveObserver.value) {
            this.toggleDefaultContextMenuGroupActive("ap", false);
        }
        archipelagoActiveObserver.onChange((event) => {
            const {value} = event;
            this.toggleDefaultContextMenuGroupActive("ap", !!value);
        });
    }

    applyDefaultValues() {
        super.applyDefaultValues();
        this.#applyPrice();
    }

    applyStateValues(state) {
        super.applyStateValues(state);
        this.#applyPrice(state.price);
    }

    #applyPrice(price) {
        if (this.#itemEl != null) {
            if (price != null) {
                this.#itemEl.text = price;
            } else {
                this.#itemEl.text = "?";
            }
        }
    }

    applyItem(itemData) {
        if (this.#itemEl != null) {
            if (itemData != null) {
                this.#itemEl.src = resolveIcon(itemData?.icon) ?? "/images/items/unknown.png";
            } else {
                this.#itemEl.src = "/images/items/unknown.png";
            }
        }
    }

}

customElements.define("ootrt-worldmap-scrublocation", TrackerWorldMapScrubLocation);
UIRegistry.get("worldmap-location").register("scrub", TrackerWorldMapScrubLocation);
