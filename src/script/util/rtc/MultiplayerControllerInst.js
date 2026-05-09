import MultiplayerController from "gametrackerjs/util/rtc/multiplayer/MultiplayerController.js";

const RTC_PORT = window.location.hostname == "localhost" ? 8001 : "";

export default new MultiplayerController(RTC_PORT);
