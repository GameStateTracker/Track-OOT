import "/emcJS/ui/layout/Layout.js";
import VersionData from "/GameTrackerJS/data/VersionData.js";
import Language from "/GameTrackerJS/util/Language.js";
import ItemViewClient from "/GameTrackerJS/util/rtc/itemview/ItemViewClient.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import "/script/ui/panel/itemgrid/ItemGrid.js";
import "/script/ui/panel/dungeonstate/DungeonState.js";
import {SYNCED_STORAGES} from "../../config/rtc/ItemViewConfig.js";
import "./styles.js";

const layoutEl = document.getElementById("layout");
const infoPanelEl = document.getElementById("info-panel");
const panelWidthEl = document.getElementById("panel-width");
const panelHeightEl = document.getElementById("panel-height");

const client = new ItemViewClient(window.location.hostname == "localhost" ? 8001 : "", SYNCED_STORAGES);
client.addEventListener("disconnected", () => {
    console.info("lost connection to rtc host");
    Savestate.purge();
    infoPanelEl.style.display = "";
    connect();
});

const connectToken = decodeURI(window.location.hash.slice(1));

const LAYOUT = {
    "type": "vbox",
    "items": [
        {
            "type": "panel",
            "name": "itemgrid",
            "options": {"grid": "items"}
        },
        {
            "type": "panel",
            "name": "dungeon-status",
            "options": {
                "activetypesoption": "dungeonstate_active_types",
                "orientation": "row",
                "active": [
                    "key",
                    "bosskey"
                ]
            }
        }
    ]
};

try {
    await Language.load("en_us");
    connect();
    // load layout
    layoutEl.loadLayout(LAYOUT);
    const layoutWidth = layoutEl.clientWidth;
    const layoutHeight = layoutEl.clientHeight;
    infoPanelEl.style.width = `${layoutWidth}px`;
    infoPanelEl.style.height = `${layoutHeight}px`;
    panelWidthEl.innerText = layoutWidth;
    panelHeightEl.innerText = layoutHeight;
} catch (err) {
    console.error(err);
}

async function connect() {
    try {
        console.info("attempt to connect to rtc host...");
        const connected = await client.connect(connectToken, "", VersionData.version);
        if (!connected) {
            console.info("rtc connection failed");
            setTimeout(() => {
                connect();
            }, 5000);
        } else {
            infoPanelEl.style.display = "none";
            console.info("rtc connection successful");
        }
    } catch (err) {
        console.error(err);
    }
}
