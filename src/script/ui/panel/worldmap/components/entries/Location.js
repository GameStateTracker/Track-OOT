import UIRegistry from "gametrackerjs/registry/UIRegistry.js";
import WorldMapLocation from "gametrackerjs/ui/panel/worldmap/components/entries/Location.js";
import MetaObserver from "gametrackerjs/util/observer/MetaObserver.js";
import LogicViewerModal from "../../../../modal/LogicViewerModal.js";
import APHintLocations from "../../../../../resource/APHintLocations.js";

const archipelagoActiveObserver = new MetaObserver("archipelago");
const apHintLocations = APHintLocations.get();

export default class TrackerWorldMapLocation extends WorldMapLocation {

    constructor() {
        super();
        /* context menu */
        this.setAddedDefaultContextMenuItems([
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

}

customElements.define("ootrt-worldmap-location", TrackerWorldMapLocation);
UIRegistry.get("worldmap-location").setDefault(TrackerWorldMapLocation);
