// frameworks
import HTMLTemplate from "/emcJS/util/html/template/HTMLTemplate.js";
import CustomElement from "/emcJS/ui/element/CustomElement.js";
import MultiplayerClient from "/GameTrackerJS/util/rtc/multiplayer/peer/MultiplayerClient.js";

// Track-OOT
import MultiplayerControllerInst from "../../util/rtc/MultiplayerControllerInst.js";
import "./MPUser.js";
import "./MPLogger.js";

const TPL = new HTMLTemplate(`
    <style>
        :host {
            display: flex;
            flex-direction: column;
        }
        #content {
            position: relative;
            display: flex;
            flex: 1;
            flex-direction: column;
            padding: 0 0 20px;
            overflow-y: auto;
            overflow-x: hidden;
        }
        .empty-message {
            display: flex;
            justify-content: center;
            align-items: center;
            flex: 1;
            height: 100%;
            color: #ffffff;
        }
    </style>
    <div id="room-list" class="view-container-title">Room (proof of concept) <button id="leave_button">leave</button></div>
    <div id="content">
        <slot id="room-peer-list">
            <div class="empty-message">The room is empty</div>
        </slot>
    </div>
`);

class HTMLMultiplayerRoomClient extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());

        const leave_button = this.shadowRoot.getElementById("leave_button");

        leave_button.addEventListener("click", async () => {
            const rtcPeer = MultiplayerControllerInst.getPeer();
            if (rtcPeer instanceof MultiplayerClient) {
                await rtcPeer.disconnect();
            }
            this.dispatchEvent(new Event("leave"));
        });
    }

    updateRoom(data) {
        this.innerHTML = "";
        if (data.host) {
            const el = document.createElement("ootrt-mpuser");
            el.name = data.host;
            el.role = "host";
            this.append(el);
        }
        if (data.players) {
            for (const inst of data.players) {
                const el = document.createElement("ootrt-mpuser");
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
                const el = document.createElement("ootrt-mpuser");
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

customElements.define("ootrt-multiplayerroomclient", HTMLMultiplayerRoomClient);
