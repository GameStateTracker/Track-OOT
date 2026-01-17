import {decodeSearchParams} from "/emcJS/util/net/URLUtils.js";
import "/emcJS/ui/layout/Layout.js";
import Language from "/GameTrackerJS/util/Language.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import "/GameTrackerJS/util/sync/StorageSyncSlave.js";
import LayoutsResource from "/script/resource/LayoutsResource.js";
import "/script/ui/panel/itemgrid/ItemGrid.js";
import "/script/ui/panel/worldlist/WorldList.js";
import "/script/ui/panel/worldmap/WorldMap.js";
import "/script/ui/panel/dungeonstate/DungeonState.js";
import "./styles.js";

const params = decodeSearchParams(window.location);

const containerEl = document.getElementById("container");
if (params.fill) {
    containerEl.classList.add("fill");
}

const layoutEl = document.getElementById("layout");
const layoutName = params.layout || "items";

try {
    // load current language
    await Language.load(SettingsStorage.get("language"), "en_us");
    // load layout
    const layout = LayoutsResource.get(layoutName);
    layoutEl.loadLayout(layout);
    const waw = window.outerWidth - window.innerWidth;
    const wah = window.outerHeight - window.innerHeight;
    window.resizeTo(waw + layoutEl.clientWidth, wah + layoutEl.clientHeight);
} catch (err) {
    console.error(err);
}
