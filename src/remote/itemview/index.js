import "/emcJS/ui/layout/Layout.js";
import VersionData from "/GameTrackerJS/data/VersionData.js";
import Language from "/GameTrackerJS/util/Language.js";
import ItemViewClient from "/GameTrackerJS/util/rtc/itemview/ItemViewClient.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import "/script/ui/panel/itemgrid/ItemGrid.js";
import "/script/ui/panel/dungeonstate/DungeonState.js";
import "./styles.js";

// TODO missing dungeonstate sync for reward location
const ITEM_STORAGE = Savestate.getStorage("items");

const layoutEl = document.getElementById("layout");

const client = new ItemViewClient(window.location.hostname == "localhost" ? 8001 : "");
client.addEventListener("disconnected", () => {
    console.info("lost connection to rtc host");
    ITEM_STORAGE.clear();
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
    const waw = window.outerWidth - window.innerWidth;
    const wah = window.outerHeight - window.innerHeight;
    window.resizeTo(waw + layoutEl.clientWidth, wah + layoutEl.clientHeight);
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
            console.info("rtc connection successful");
        }
    } catch (err) {
        console.error(err);
    }
}
