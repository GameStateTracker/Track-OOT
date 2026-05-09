import {getGatewayIn} from "gametrackerjs/data/resource/WorldResource.js";
import UIRegistry from "gametrackerjs/registry/UIRegistry.js";
import WorldMapExit from "gametrackerjs/ui/panel/worldmap/components/entries/Exit.js";
import LogicViewerModal from "../../../../modal/LogicViewerModal.js";

export default class TrackerWorldMapExit extends WorldMapExit {

    constructor() {
        super();
        /* context menu */
        this.setAddedDefaultContextMenuItems([
            "splitter",
            {
                menuAction: "show_logic",
                content: "Show Logic"
            }
        ]);
        this.addDefaultContextMenuHandler("show_logic", () => {
            const state = this.getState();
            if (state != null) {
                LogicViewerModal.show(getGatewayIn(state.props.logicAccess ?? ""), `exit[${this.ref}]`);
            }
        });
    }

}

customElements.define("ootrt-worldmap-exit", TrackerWorldMapExit);
UIRegistry.get("worldmap-exit").setDefault(TrackerWorldMapExit);
