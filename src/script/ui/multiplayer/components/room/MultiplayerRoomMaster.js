import CustomElement from "/emcJS/ui/element/CustomElement.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import MultiplayerHost from "/GameTrackerJS/util/rtc/multiplayer/peer/MultiplayerHost.js";
import MultiplayerControllerInst from "../../../../util/rtc/MultiplayerControllerInst.js";
import "./entries/MultiplayerUser.js";
import "./entries/MultiplayerUserManaged.js";
import "../logger/MultiplayerLogger.js";
import TPL from "./MultiplayerRoomMaster.js.html" assert {type: "html"};
import STYLE from "./MultiplayerRoomMaster.js.css" assert {type: "css"};

export default class MultiplayerRoomMaster extends CustomElement {

    #disconnectEl;

    #visibilityEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */

        this.#disconnectEl = this.shadowRoot.getElementById("disconnect");
        this.#visibilityEl = this.shadowRoot.getElementById("visibility");

        this.#disconnectEl.addEventListener("click", async () => {
            const rtcPeer = MultiplayerControllerInst.getPeer();
            if (rtcPeer instanceof MultiplayerHost) {
                await rtcPeer.disconnect();
                this.dispatchEvent(new Event("disconnect"));
            }
        });

        this.#visibilityEl.addEventListener("click", async () => {
            const rtcPeer = MultiplayerControllerInst.getPeer();
            if (rtcPeer instanceof MultiplayerHost) {
                if (rtcPeer.isRoomVisible()) {
                    const res = await rtcPeer.setRoomVisible(false);
                    if (res) {
                        this.#visibilityEl.text = "show room";
                    }
                } else {
                    const res = await rtcPeer.setRoomVisible(true);
                    if (res) {
                        this.#visibilityEl.text = "hide room";
                    }
                }
            }
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
                const el = document.createElement("ootrt-multiplayer-user-managed");
                el.name = inst;
                el.role = "player";
                el.addEventListener("kick", kickUser);
                this.append(el);
            }
        }
        if (data.spectators) {
            for (const inst of data.spectators) {
                const el = document.createElement("ootrt-multiplayer-user-managed");
                el.name = inst;
                el.role = "spectator";
                el.addEventListener("kick", kickUser);
                this.append(el);
            }
        }
    }

}

function kickUser(event) {
    const rtcPeer = MultiplayerControllerInst.getPeer();
    if (rtcPeer instanceof MultiplayerHost) {
        rtcPeer.kick(event.target.name);
    }
}

customElements.define("ootrt-multiplayer-room-master", MultiplayerRoomMaster);
