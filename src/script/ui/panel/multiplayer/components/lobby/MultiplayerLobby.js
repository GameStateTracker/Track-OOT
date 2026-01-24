import CustomElement from "/emcJS/ui/element/CustomElement.js";
import EventManager from "/emcJS/util/event/EventManager.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import MultiplayerControllerInst from "../../../../../util/rtc/MultiplayerControllerInst.js";
import MultiplayerHostModal from "../modal/MultiplayerHostModal.js";
import "./entry/MultiplayerLobbyRoom.js";
import "./detail/MultiplayerLobbyRoomDetails.js";
import TPL from "./MultiplayerLobby.js.html" assert {type: "html"};
import STYLE from "./MultiplayerLobby.js.css" assert {type: "css"};

function roomDataComparator(a, b) {
    return a.name.localeCompare(b.name);
}

export default class MultiplayerLobby extends CustomElement {

    #containerSwitchEl;

    #refreshEl;

    #hostEl;

    #closeDetailsEl;

    #roomDetailsEl;

    #hostModal = new MultiplayerHostModal();

    #roomEventManager = new EventManager();

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#containerSwitchEl = this.shadowRoot.getElementById("container-switch");
        this.#refreshEl = this.shadowRoot.getElementById("refresh");
        this.#hostEl = this.shadowRoot.getElementById("host");
        this.#closeDetailsEl = this.shadowRoot.getElementById("close-details");
        this.#roomDetailsEl = this.shadowRoot.getElementById("room-details");

        this.#hostEl.addEventListener("click", async () => {
            this.#hostModal.show();
        });

        this.#hostModal.addEventListener("hosting", (event) => {
            const {peer} = event;
            const ev = new Event("hosting");
            ev.peer = peer;
            this.dispatchEvent(ev);
        });

        this.#closeDetailsEl.addEventListener("click", () => {
            this.#containerSwitchEl.removeAttribute("active");
            this.#roomDetailsEl.name = null;
            this.#roomDetailsEl.pass = false;
            this.#roomDetailsEl.desc = null;
            this.#roomDetailsEl.version = null;
        });

        this.#roomDetailsEl.addEventListener("joined", (event) => {
            const {peer} = event;
            const ev = new Event("joined");
            ev.peer = peer;
            this.dispatchEvent(ev);
        });

        const refresh = async (supressError) => {
            const res = await MultiplayerControllerInst.getInstances(supressError);
            if (res != null) {
                this.innerHTML = "";
                this.#roomEventManager.clear();
                res.sort(roomDataComparator);
                for (const inst of res) {
                    const el = document.createElement("ootrt-multiplayer-lobby-room");
                    el.name = inst.name;
                    el.pass = inst.pass;
                    el.desc = inst.data?.desc;
                    el.version = inst.version;
                    this.#roomEventManager.set(el, "click", () => {
                        this.#containerSwitchEl.setAttribute("active", "details");
                        this.#roomDetailsEl.name = inst.name;
                        this.#roomDetailsEl.pass = inst.pass;
                        this.#roomDetailsEl.desc = inst.data?.desc;
                        this.#roomDetailsEl.version = inst.version;
                    });
                    this.append(el);
                }
            }
        };

        this.#refreshEl.addEventListener("click", function() {
            refresh(false);
        });
        refresh(true);
    }

    clearSelection() {
        this.#roomDetailsEl.name = "";
        this.#roomDetailsEl.pass = false;
        this.#roomDetailsEl.desc = "";
        this.#roomDetailsEl.version = "";
    }

}

customElements.define("ootrt-multiplayer-lobby", MultiplayerLobby);
