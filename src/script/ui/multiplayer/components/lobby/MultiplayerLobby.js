import CustomElement from "/emcJS/ui/element/CustomElement.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import MultiplayerControllerInst from "../../../../util/rtc/MultiplayerControllerInst.js";
import MultiplayerHostModal from "../modal/MultiplayerHostModal.js";
import "./MultiplayerLobbyRoom.js";
import "./MultiplayerLobbyRoomDetails.js";
import TPL from "./MultiplayerLobby.js.html" assert {type: "html"};
import STYLE from "./MultiplayerLobby.js.css" assert {type: "css"};

export default class MultiplayerLobby extends CustomElement {

    #refreshEl;

    #hostEl;

    #roomDetailsEl;

    #hostModal = new MultiplayerHostModal();

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#refreshEl = this.shadowRoot.getElementById("refresh");
        this.#hostEl = this.shadowRoot.getElementById("host");
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
                for (const inst of res) {
                    const el = document.createElement("ootrt-multiplayer-lobby-room");
                    el.name = inst.name;
                    el.pass = inst.pass;
                    el.desc = inst.data?.desc;
                    el.version = inst.version;
                    el.addEventListener("click", () => {
                        this.#roomDetailsEl.el.name = inst.name;
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

}

customElements.define("ootrt-multiplayer-lobby", MultiplayerLobby);
