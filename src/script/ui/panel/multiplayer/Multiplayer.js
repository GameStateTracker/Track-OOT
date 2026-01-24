import Panel from "/emcJS/ui/layout/Panel.js";
import MultiplayerControllerInst from "../../../util/rtc/MultiplayerControllerInst.js";
import "./components/lobby/MultiplayerLobby.js";
import "./components/room/MultiplayerRoomClient.js";
import "./components/room/MultiplayerRoomHost.js";
import TPL from "./Multiplayer.js.html" assert {type: "html"};
import STYLE from "./Multiplayer.js.css" assert {type: "css"};

export default class Multiplayer extends Panel {

    #contentEl;

    #lobbyViewEl;

    #roomHostEl;

    #roomClientEl;

    #loggerEl;

    #mode = "lobby";

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */

        this.#contentEl = this.shadowRoot.getElementById("content");
        this.#lobbyViewEl = this.shadowRoot.getElementById("lobby-view");
        this.#roomHostEl = this.shadowRoot.getElementById("room-host");
        this.#roomClientEl = this.shadowRoot.getElementById("room-client");
        this.#loggerEl = this.shadowRoot.getElementById("logger");

        MultiplayerControllerInst.setLogger(this.#loggerEl);

        MultiplayerControllerInst.addEventListener("roomupdate", (event) => {
            if  (this.#mode === "host") {
                this.#roomHostEl.updateRoom(event.data);
            } else if (this.#mode === "client") {
                this.#roomClientEl.updateRoom(event.data);
            } else {
                this.#roomHostEl.updateRoom(event.data);
                this.#roomClientEl.updateRoom(event.data);
            }
        });

        this.#lobbyViewEl.addEventListener("hosting", () => {
            this.#mode = "host";
            this.#contentEl.setAttribute("active-panel", "host");
            this.#roomHostEl.refreshRoomName();
        });

        this.#lobbyViewEl.addEventListener("joined", () => {
            this.#mode = "client";
            this.#contentEl.setAttribute("active-panel", "client");
            this.#roomClientEl.refreshRoomName();
        });

        this.#roomHostEl.addEventListener("disconnected", () => {
            this.#mode = "lobby";
            this.#contentEl.setAttribute("active-panel", "lobby");
        });

        this.#roomClientEl.addEventListener("disconnected", () => {
            this.#mode = "lobby";
            this.#contentEl.setAttribute("active-panel", "lobby");
        });
    }

}

customElements.define("ootrt-multiplayer", Multiplayer);
