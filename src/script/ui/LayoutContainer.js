// frameworks
import CSSTemplate from "@emcjs/fe/util/template/CSSTemplate.js";
import Layout from "@emcjs/fe/ui/layout/Layout.js";

// GameTrackerJS
import "gametrackerjs/ui/panel/exitlist/ExitList.js";
// Track-OOT
import LayoutsResource from "../resource/LayoutsResource.js";
import "../ui/panel/itemgrid/ItemGrid.js";
import "../ui/panel/locationlist/TrackerLocationList.js";
import "../ui/panel/worldlist/WorldList.js";
import "../ui/panel/worldmap/WorldMap.js";
import "../ui/panel/shoplist/ShopList.js";
import "../ui/panel/songlist/SongList.js";
import "../ui/panel/dungeonstate/DungeonState.js";
import "../ui/panel/aptextclient/APTextClient.js";

const STYLE = new CSSTemplate(`
.state {
    display: inline;
    padding: 0 5px;
    white-space: nowrap;
}
`);

class HTMLTrackerLayoutContainer extends Layout {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    get layout() {
        return this.getAttribute("layout");
    }

    set layout(val) {
        this.setAttribute("layout", val);
    }

    static get observedAttributes() {
        return ["layout"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "layout":
                if (oldValue != newValue) {
                    const layout = LayoutsResource.get(newValue);
                    if (layout) {
                        super.loadLayout(layout);
                    }
                }
                break;
        }
    }

}

customElements.define("ootrt-layoutcontainer", HTMLTrackerLayoutContainer);
