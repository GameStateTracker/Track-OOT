import CustomElement from "/emcJS/ui/element/CustomElement.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import "/emcJS/ui/icon/FontIcon.js";
import MultiplayerClient from "/GameTrackerJS/util/rtc/multiplayer/peer/MultiplayerClient.js";
import MultiplayerControllerInst from "../../../../../util/rtc/MultiplayerControllerInst.js";
import "./entry/MultiplayerUser.js";
import "../logger/MultiplayerLogger.js";
import TPL from "./MultiplayerRoomClient.js.html" assert {type: "html"};
import STYLE from "./MultiplayerRoomClient.js.css" assert {type: "css"};

const PING_DEBOUNCE_TIME = 10000;
const PING_TIMEOUT_TIME = 1000;

const PING_LOWER_THRESHOLD = 50;
const PING_HIGHER_THRESHOLD = 1000;

export default class MultiplayerRoomClient extends CustomElement {

    #pingTimestamp;

    #pingTimeout;

    #pingScheduleTimer;

    #roomNameEl;

    #disconnectEl;

    #signalIconEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#roomNameEl = this.shadowRoot.getElementById("room-name");
        this.#disconnectEl = this.shadowRoot.getElementById("disconnect");
        this.#signalIconEl = this.shadowRoot.getElementById("signal-icon");

        this.#disconnectEl.addEventListener("click", async () => {
            const rtcPeer = MultiplayerControllerInst.getPeer();
            if (rtcPeer instanceof MultiplayerClient) {
                await rtcPeer.disconnect();
            }
            this.dispatchEvent(new Event("disconnected"));
        });
        MultiplayerControllerInst.addEventListener("disconnected", () => {
            Toast.warn("Multiplayer: Connection lost");
            this.dispatchEvent(new Event("disconnected"));
        });
        MultiplayerControllerInst.addEventListener("ping", (event) => {
            const {
                time, sendTime
            } = event.data;
            if (this.#pingTimestamp === sendTime) {
                clearTimeout(this.#pingTimeout);
                this.#pingTimeout = null;
                this.#pingTimestamp = null;
                this.#shedulePing();
                // update icon
                this.#signalIconEl.title = `Ping: ${time}ms`;
                if (time < PING_LOWER_THRESHOLD) {
                    this.#signalIconEl.icon = "signal-full";
                } else if (time > PING_HIGHER_THRESHOLD) {
                    this.#signalIconEl.icon = "signal-low";
                } else {
                    this.#signalIconEl.icon = "signal-medium";
                }
            }
        });
    }

    #shedulePing() {
        if (MultiplayerControllerInst.isConnected() && this.#pingTimestamp == null && this.#pingScheduleTimer == null) {
            this.#pingScheduleTimer = setTimeout(() => {
                this.#pingScheduleTimer = null;
                this.#ping();
            }, PING_DEBOUNCE_TIME);
        }
    }

    #ping() {
        this.#pingTimestamp = MultiplayerControllerInst.ping();
        if (this.#pingTimestamp != null) {
            this.#pingTimeout = setTimeout(() => {
                this.#pingTimeout = null;
                this.#pingTimestamp = null;
                this.#signalIconEl.icon = "signal-low";
                this.#signalIconEl.title = "Ping: failed";
                this.#shedulePing();
            }, PING_TIMEOUT_TIME);
        }
    }

    initRoom() {
        const rtcPeer = MultiplayerControllerInst.getPeer();
        if (rtcPeer instanceof MultiplayerClient) {
            this.#roomNameEl.innerText = rtcPeer.roomName;
            this.#ping();
        }
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
