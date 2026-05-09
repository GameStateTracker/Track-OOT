import modalRegistry from "@emcjs/fe/registry/ModalRegistry.js";
import ModalDialog from "@emcjs/fe/ui/modal/ModalDialog.js";
import Toast from "@emcjs/fe/ui/overlay/message/Toast.js";
import SavestateHandler from "gametrackerjs/savestate/SavestateHandler.js";
import PageSwitcher from "../util/PageSwitcher.js";
import "../savestateConverter/StateConverter.js";
import {
    aboutOverlay,
    romOptionsOverlay,
    trackerSettingsOverlay
} from "../registry/OverlayRegistry.js";

PageSwitcher.register("main", [{
    "content": "FILE",
    "submenu": [{
        "content": "NEW",
        "handler": state_New
    }, {
        "content": "LOAD",
        "handler": state_Load
    }, {
        "content": "SAVE",
        "handler": state_Save
    }, {
        "content": "SAVE AS",
        "handler": state_SaveAs
    }, {
        "content": "MANAGE",
        "handler": states_Manage
    }]
}, {
    "content": "EXTRAS",
    "submenu": [{"mixin": "fullscreen"}, {
        "content": "UPLOAD SPOILER",
        "handler": openSpoilerSettingsWindow
    }, {
        "content": "CLEAR SPECIFIC DATA",
        "handler": openClearDataWindow
    }, {
        "content": "REMOTE ITEM VIEW",
        "handler": openRemoteItemView
    }, {
        "content": "DETACHED WINDOWS",
        "submenu": [
            {
                "content": "DETACHED ITEM WINDOW",
                "handler": openDetachedItems
            }, {
                "content": "DETACHED LOCATIONLIST WINDOW",
                "handler": openDetachedLocationlist
            }, {
                "content": "DETACHED WORLDMAP WINDOW",
                "handler": openDetachedWorldmap
            }
        ]
    }, {
        "content": "EDITORS",
        "handler": showEditors
    }]
}, {
    "content": "ARCHIPELAGO",
    "handler": openArchipelagoWindow
}, {
    "content": "RANDOMIZER OPTIONS",
    "handler": openRomSettingsOverlay
}, {
    "content": "TRACKER SETTINGS",
    "handler": openSettingsOverlay
}, {
    "content": "ABOUT",
    "handler": openAboutOverlay
}], {
    "hk_state_new": state_New,
    "hk_state_load": state_Load,
    "hk_state_save": state_Save,
    "hk_state_saveas": state_SaveAs,
    "hk_state_manage": states_Manage,
    "hk_detached_window": openDetachedItems,
    "hk_import_spoiler": openSpoilerSettingsWindow,
    "hk_options": openRomSettingsOverlay,
    "hk_settings": openSettingsOverlay
});
PageSwitcher.switch("main");

async function state_Save() {
    const activestate = await SavestateHandler.getName();
    if (activestate) {
        await SavestateHandler.save();
        Toast.success(`Saved "${activestate}" successfully.`);
    } else {
        state_SaveAs();
    }
}

async function state_New() {
    if (await SavestateHandler.isDirty()) {
        if (!await ModalDialog.confirm("Warning, you have unsaved changes.", "Do you want to discard your changes and create a new state?")) {
            return;
        }
    }
    SavestateHandler.reset();
}

async function state_Load() {
    const activestate = await SavestateHandler.getName();
    modalRegistry.show("LoadSavestate", activestate);
}

async function state_SaveAs() {
    const activestate = await SavestateHandler.getName();
    modalRegistry.show("SaveSavestate", activestate);
}

async function states_Manage() {
    const activestate = await SavestateHandler.getName();
    modalRegistry.show("ManageSavestate", activestate);
}

function openDetachedItems() {
    const popup = window.open("/detached/?layout=items", "[D]TrackOOT - Items", "popup=1,toolbar=0,location=0,addressbar=0,directories=0,status=0,menubar=0,scrollbars=1,resizable=0,titlebar=0");
    popup.moveTo(screen.availLeft, screen.availTop);
    popup.resizeTo(200, 200);
}

function openDetachedLocationlist() {
    const popup = window.open("/detached/?fill&layout=locationlist", "[D]TrackOOT - LocationList", "popup=1,toolbar=0,location=0,addressbar=0,directories=0,status=0,menubar=0,scrollbars=1,resizable=0,titlebar=0");
    popup.moveTo(screen.availLeft, screen.availTop);
    popup.resizeTo(600, 800);
}

function openDetachedWorldmap() {
    const popup = window.open("/detached/?fill&layout=map", "[D]TrackOOT - WorldMap", "popup=1,toolbar=0,location=0,addressbar=0,directories=0,status=0,menubar=0,scrollbars=1,resizable=0,titlebar=0");
    popup.moveTo(screen.availLeft, screen.availTop);
    popup.resizeTo(screen.availWidth, screen.availHeight);
}

function openSettingsOverlay() {
    trackerSettingsOverlay.show();
}

function openRomSettingsOverlay() {
    romOptionsOverlay.show();
}

function openAboutOverlay() {
    aboutOverlay.show();
}

function openRemoteItemView() {
    modalRegistry.show("RemoteItemView");
}

function openArchipelagoWindow() {
    modalRegistry.show("Archipelago");
}

function openSpoilerSettingsWindow() {
    modalRegistry.show("SpoilerLog");
}

function openClearDataWindow() {
    modalRegistry.show("ClearData");
}

function showEditors() {
    PageSwitcher.switch("editor_choice");
}
