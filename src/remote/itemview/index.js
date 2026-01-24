import "/emcJS/ui/layout/Layout.js";
import VersionData from "/GameTrackerJS/data/VersionData.js";
import Language from "/GameTrackerJS/util/Language.js";
import ItemViewClient from "/GameTrackerJS/util/rtc/itemview/ItemViewClient.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import "/script/ui/panel/itemgrid/ItemGrid.js";
import "/script/ui/panel/dungeonstate/DungeonState.js";
import "./styles.js";

const containerEl = document.getElementById("container");
const layoutEl = document.getElementById("layout");
const infoPanelEl = document.getElementById("info-panel");
const pageWidthEl = document.getElementById("page-width");
const pageHeightEl = document.getElementById("page-height");
const panelWidthEl = document.getElementById("panel-width");
const panelHeightEl = document.getElementById("panel-height");

const locationStateEl = document.getElementById("location-state");
const doneEl = document.getElementById("locations-done");
const availEl = document.getElementById("locations-available");
const missEl = document.getElementById("locations-missing");
const exitsEl = document.getElementById("exits-available");

const SHOW_DISCONNECTED_TIMEOUT = 10000;
let disconnectedTimer = null;

const client = new ItemViewClient(window.location.hostname == "localhost" ? 8001 : "");
client.addEventListener("disconnected", () => {
    console.info("lost connection to rtc host");
    Savestate.purge();
    disconnectedTimer = setTimeout(() => {
        infoPanelEl.style.display = "";
    }, SHOW_DISCONNECTED_TIMEOUT);
    connect();
});

client.addEventListener("access", (event) => {
    const {
        reachable_min, reachable_max, unopened_min, unopened_max, done_min, done_max, entrances_min, entrances_max
    } = event.value;
    if (reachable_min == reachable_max) {
        availEl.innerHTML = reachable_min;
    } else {
        availEl.innerHTML = `[${reachable_min}..${reachable_max}]`;
    }
    if (unopened_min == unopened_max) {
        missEl.innerHTML = unopened_min;
    } else {
        missEl.innerHTML = `[${unopened_min}..${unopened_max}]`;
    }
    if (done_min == done_max) {
        doneEl.innerHTML = done_min;
    } else {
        doneEl.innerHTML = `[${done_min}..${done_max}]`;
    }
    if (done_min == done_max) {
        doneEl.innerHTML = done_min;
    } else {
        doneEl.innerHTML = `[${done_min}..${done_max}]`;
    }
    if (entrances_min == entrances_max) {
        exitsEl.innerHTML = entrances_min;
    } else {
        exitsEl.innerHTML = `[${entrances_min}..${entrances_max}]`;
    }
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
    locationStateEl.classList.remove("hidden");
    const containerWidth = containerEl.clientWidth;
    const containerHeight = containerEl.clientHeight;
    infoPanelEl.style.width = `${containerWidth}px`;
    infoPanelEl.style.height = `${containerHeight}px`;
    pageWidthEl.innerText = containerWidth;
    pageHeightEl.innerText = containerHeight;
    panelWidthEl.innerText = layoutEl.clientWidth;
    panelHeightEl.innerText = layoutEl.clientHeight;
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
            clearTimeout(disconnectedTimer);
            disconnectedTimer = null;
            infoPanelEl.style.display = "none";
            console.info("rtc connection successful");
        }
    } catch (err) {
        console.error(err);
        setTimeout(() => {
            connect();
        }, 5000);
    }
}
