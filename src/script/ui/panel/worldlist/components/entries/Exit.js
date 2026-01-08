import {getGatewayIn} from "/GameTrackerJS/data/resource/WorldResource.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import WorldListExit from "/GameTrackerJS/ui/panel/worldlist/components/entries/Exit.js";
import LogicViewerModal from "../../../../modal/LogicViewerModal.js";

export default class TrackerWorldListExit extends WorldListExit {

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

customElements.define("ootrt-worldlist-exit", TrackerWorldListExit);
UIRegistry.get("worldlist-exit").setDefault(TrackerWorldListExit);
