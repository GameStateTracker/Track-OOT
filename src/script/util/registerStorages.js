import ObservableMultiDefaultValueStorage from "@emcjs/core/data/storage/observable/ObservableMultiDefaultValueStorage.js";
import ObservableDefaultValueStorage from "@emcjs/core/data/storage/observable/ObservableDefaultValueStorage.js";
import Savestate from "gametrackerjs/savestate/Savestate.js";
import LogicCaller from "gametrackerjs/util/logic/LogicCaller.js";
import SongsResource from "../resource/SongsResource.js";
import ShopItemsStorage from "../storage/ShopItemsStorage.js";

// dungeons
Savestate.registerStorage("dungeonRewards", new ObservableDefaultValueStorage(""));

// shops
Savestate.registerStorage("shopItemsPrice", new ObservableDefaultValueStorage(0));
Savestate.registerStorage("shopItemsName", new ObservableDefaultValueStorage(""));

// gossipstones
Savestate.registerStorage("gossipstoneItems", new ObservableDefaultValueStorage(""));
Savestate.registerStorage("gossipstoneLocations", new ObservableDefaultValueStorage(""));

// songs
const songNotesStorage = new ObservableMultiDefaultValueStorage();
const songData = SongsResource.get();
for (const ref in songData) {
    songNotesStorage.setDefault(ref, songData[ref].notes);
}
Savestate.registerStorage("songNotes", songNotesStorage);

// --> register to logic caller
LogicCaller.registerStorage(Savestate.getStorage("songNotes"), "songnotes[", "]");
LogicCaller.registerStorage(ShopItemsStorage, "shopslot[", "]");
