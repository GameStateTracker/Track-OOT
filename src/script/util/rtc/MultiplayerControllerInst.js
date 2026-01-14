import MultiplayerController from "/GameTrackerJS/util/rtc/multiplayer/MultiplayerController.js";

const SYNCED_STORAGES = [
    // GameTrackerJS
    "items",
    "locations",
    "exitBindings",
    "areaHints",
    "locationItems",
    "startItems",
    "options",
    // Track-OOT
    "dungeonRewards",
    "dungeonTypes",
    "shopItems",
    "shopItemsPrice",
    "shopItemsBought",
    "songNotes",
    "gossipstoneLocations",
    "gossipstoneItems"
];
const RTC_PORT = window.location.hostname == "localhost" ? 8001 : "";

export default new MultiplayerController(RTC_PORT, SYNCED_STORAGES);
