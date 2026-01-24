import CustomElement from "/emcJS/ui/element/CustomElement.js";
import EventManager from "/emcJS/util/event/EventManager.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import MultiplayerHost from "/GameTrackerJS/util/rtc/multiplayer/peer/MultiplayerHost.js";
import MultiplayerControllerInst from "../../../../../util/rtc/MultiplayerControllerInst.js";
import "./entry/MultiplayerUser.js";
import "./entry/MultiplayerUserManaged.js";
import "../logger/MultiplayerLogger.js";
import TPL from "./MultiplayerRoomHost.js.html" assert {type: "html"};
import STYLE from "./MultiplayerRoomHost.js.css" assert {type: "css"};

export default class MultiplayerRoomHost extends CustomElement {

    #roomNameEl;

    #disconnectEl;

    #visibilityEl;

    #clientEventManager = new EventManager();

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#roomNameEl = this.shadowRoot.getElementById("room-name");
        this.#disconnectEl = this.shadowRoot.getElementById("disconnect");
        this.#visibilityEl = this.shadowRoot.getElementById("visibility");

        this.#disconnectEl.addEventListener("click", async () => {
            const rtcPeer = MultiplayerControllerInst.getPeer();
            if (rtcPeer instanceof MultiplayerHost) {
                await rtcPeer.disconnect();
                this.dispatchEvent(new Event("disconnected"));
            }
        });

        this.#visibilityEl.addEventListener("click", async () => {
            const rtcPeer = MultiplayerControllerInst.getPeer();
            if (rtcPeer instanceof MultiplayerHost) {
                if (rtcPeer.isRoomVisible()) {
                    const res = await rtcPeer.setRoomVisibility(false);
                    if (res) {
                        this.#visibilityEl.text = "Set Room To Visible";
                        this.#visibilityEl.icon = "eye";
                    }
                } else {
                    const res = await rtcPeer.setRoomVisibility(true);
                    if (res) {
                        this.#visibilityEl.text = "Set Room To Invisible";
                        this.#visibilityEl.icon = "eye-striked";
                    }
                }
            }
        });
    }

    initRoomVisibility() {
        const rtcPeer = MultiplayerControllerInst.getPeer();
        if (rtcPeer instanceof MultiplayerHost) {
            if (rtcPeer.isRoomVisible()) {
                this.#visibilityEl.text = "Set Room To Invisible";
                this.#visibilityEl.icon = "eye-striked";
            } else {
                this.#visibilityEl.text = "Set Room To Visible";
                this.#visibilityEl.icon = "eye";
            }
        }
    }

    refreshRoomName() {
        const rtcPeer = MultiplayerControllerInst.getPeer();
        if (rtcPeer instanceof MultiplayerHost) {
            this.#roomNameEl.innerText = rtcPeer.roomName;
        }
    }

    updateRoom(data) {
        this.innerHTML = "";
        this.#clientEventManager.clear();
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
                this.#clientEventManager.set(el, "kick", () => {
                    this.#kickUser(inst);
                });
                this.#clientEventManager.set(el, "role", (event) => {
                    this.#updateRole(inst, event.data);
                });
                this.append(el);
            }
        }
        if (data.spectators) {
            for (const inst of data.spectators) {
                const el = document.createElement("ootrt-multiplayer-user-managed");
                el.name = inst;
                el.role = "spectator";
                this.#clientEventManager.set(el, "kick", () => {
                    this.#kickUser(inst);
                });
                this.#clientEventManager.set(el, "role", (event) => {
                    this.#updateRole(inst, event.data);
                });
                this.append(el);
            }
        }
    }

    #kickUser(name) {
        const rtcPeer = MultiplayerControllerInst.getPeer();
        if (rtcPeer instanceof MultiplayerHost) {
            rtcPeer.kick(name);
        }
    }

    #updateRole(name, role) {
        const rtcPeer = MultiplayerControllerInst.getPeer();
        if (rtcPeer instanceof MultiplayerHost) {
            rtcPeer.updateRole(name, role);
        }
    }

}

customElements.define("ootrt-multiplayer-room-host", MultiplayerRoomHost);
