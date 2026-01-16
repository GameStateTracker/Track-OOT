import CustomElement from "/emcJS/ui/element/CustomElement.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import MultiplayerClient from "/GameTrackerJS/util/rtc/multiplayer/peer/MultiplayerClient.js";
import MultiplayerControllerInst from "../../../../util/rtc/MultiplayerControllerInst.js";
import "./entry/MultiplayerUser.js";
import "../logger/MultiplayerLogger.js";
import TPL from "./MultiplayerRoomClient.js.html" assert {type: "html"};
import STYLE from "./MultiplayerRoomClient.js.css" assert {type: "css"};

export default class MultiplayerRoomClient extends CustomElement {

    #disconnectEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */

        this.#disconnectEl = this.shadowRoot.getElementById("disconnect");

        this.#disconnectEl.addEventListener("click", async () => {
            const rtcPeer = MultiplayerControllerInst.getPeer();
            if (rtcPeer instanceof MultiplayerClient) {
                await rtcPeer.disconnect();
            }
            this.dispatchEvent(new Event("disconnected"));
        });
    }

    updateRoom(data) {
        this.innerHTML = "";
        if (data.host) {
            const el = document.createElement("ootrt-multiplayer-user");
            el.name = data.host;
            el.role = "host";
            this.append(el);
        }
        if (data.players) {
            for (const inst of data.players) {
                const el = document.createElement("ootrt-multiplayer-user");
                el.name = inst;
                el.role = "player";
                if (inst == MultiplayerControllerInst.getPeer().username) {
                    this.prepend(el);
                } else {
                    this.append(el);
                }
            }
        }
        if (data.spectators) {
            for (const inst of data.spectators) {
                const el = document.createElement("ootrt-multiplayer-user");
                el.name = inst;
                el.role = "spectator";
                if (inst == MultiplayerControllerInst.getPeer().username) {
                    this.prepend(el);
                } else {
                    this.append(el);
                }
            }
        }
    }

}

customElements.define("ootrt-multiplayer-room-client", MultiplayerRoomClient);
