import Panel from "/emcJS/ui/layout/Panel.js";
import MultiplayerControllerInst from "../../util/rtc/MultiplayerControllerInst.js";
import "./components/lobby/MultiplayerLobby.js";
import "./components/room/MultiplayerRoomClient.js";
import "./components/room/MultiplayerRoomHost.js";
import TPL from "./Multiplayer.js.html" assert {type: "html"};
import STYLE from "./Multiplayer.js.css" assert {type: "css"};

export default class Multiplayer extends Panel {

    #lobbyViewEl;

    #roomHostEl;

    #roomClientEl;

    #loggerEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */

        this.#lobbyViewEl = this.shadowRoot.getElementById("lobby-view");
        this.#roomHostEl = this.shadowRoot.getElementById("room-host");
        this.#roomClientEl = this.shadowRoot.getElementById("room-client");
        this.#loggerEl = this.shadowRoot.getElementById("logger");

        MultiplayerControllerInst.setLogger(this.#loggerEl);

        MultiplayerControllerInst.addEventListener("roomupdate", (event) => {
            this.#roomHostEl.updateRoom(event.data);
            this.#roomClientEl.updateRoom(event.data);
        });

        this.#lobbyViewEl.addEventListener("hosting", () => {
            this.#lobbyViewEl.classList.remove("active");
            this.#roomHostEl.classList.add("active");
        });

        this.#lobbyViewEl.addEventListener("joined", () => {
            this.#lobbyViewEl.classList.remove("active");
            this.#roomClientEl.classList.add("active");
        });

        this.#roomHostEl.addEventListener("disconnected", () => {
            this.#roomHostEl.classList.remove("active");
            this.#lobbyViewEl.classList.add("active");
        });

        this.#roomClientEl.addEventListener("disconnected", () => {
            this.#roomClientEl.classList.remove("active");
            this.#lobbyViewEl.classList.add("active");
        });
    }

}

customElements.define("ootrt-multiplayer", Multiplayer);
