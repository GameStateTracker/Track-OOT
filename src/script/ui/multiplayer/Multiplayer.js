import Panel from "/emcJS/ui/layout/Panel.js";
import MultiplayerControllerInst from "../../util/rtc/MultiplayerControllerInst.js";
import "./components/lobby/MultiplayerLobby.js";
import "./components/room/MultiplayerRoomClient.js";
import "./components/room/MultiplayerRoomMaster.js";
import TPL from "./Multiplayer.js.html" assert {type: "html"};
import STYLE from "./Multiplayer.js.css" assert {type: "css"};

export default class Multiplayer extends Panel {

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */

        const lobby_view = this.shadowRoot.getElementById("lobby_view");
        const room_master = this.shadowRoot.getElementById("room_master");
        const room_client = this.shadowRoot.getElementById("room_client");
        const logger = this.shadowRoot.getElementById("logger");

        MultiplayerControllerInst.setLogger(logger);

        MultiplayerControllerInst.addEventListener("roomupdate", function(event) {
            room_master.updateRoom(event.data);
            room_client.updateRoom(event.data);
        });

        lobby_view.addEventListener("hosting", function() {
            lobby_view.classList.remove("active");
            room_master.classList.add("active");
        });

        lobby_view.addEventListener("joined", function() {
            lobby_view.classList.remove("active");
            room_client.classList.add("active");
        });

        room_master.addEventListener("close", function() {
            room_master.classList.remove("active");
            lobby_view.classList.add("active");
        });

        room_client.addEventListener("leave", function() {
            room_client.classList.remove("active");
            lobby_view.classList.add("active");
        });
    }

}

customElements.define("ootrt-multiplayer", Multiplayer);
