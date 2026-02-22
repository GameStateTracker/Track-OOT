import DataList from "/emcJS/ui/dataview/datalist/DataList.js";
import ChatListEntry from "./components/ChatListEntry.js";
import STYLE from "./ChatList.js.css" assert {type: "css"};

export default class ChatList extends DataList {

    #scrollContainerEl;

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        this.setListEntryClass(ChatListEntry);
        /* --- */
        this.#scrollContainerEl = this.shadowRoot.getElementById("scroll-container");
        this.#scrollContainerEl.addEventListener("scrollend", () => {
            const ev = new Event("scrollend", event);
            this.dispatchEvent(ev);
        });
        this.#scrollContainerEl.addEventListener("afterrender", () => {
            this.#applyAutoScroll();
        });
    }

    resizeCallback() {
        this.#applyAutoScroll();
    }

    set autoscroll(val) {
        this.setBooleanAttribute("autoscroll", val);
    }

    get autoscroll() {
        return this.getBooleanAttribute("autoscroll");
    }

    static get observedAttributes() {
        return ["autoscroll"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "autoscroll": {
                    this.#applyAutoScroll();
                } break;
            }
        }
    }

    getVerticalScrollFactor() {
        const scrollHeight = this.#scrollContainerEl.scrollHeight;
        const clientHeight = this.#scrollContainerEl.clientHeight;
        const scrollTop = this.#scrollContainerEl.scrollTop;
        const currentScrollPosition = clientHeight + scrollTop;

        if (scrollHeight <= clientHeight) {
            return 1;
        }

        if (scrollHeight <= 0) {
            return 0;
        }

        return currentScrollPosition / scrollHeight;
    }

    #applyAutoScroll() {
        if (this.autoscroll) {
            const scrollHeight = this.#scrollContainerEl.scrollHeight;
            this.#scrollContainerEl.scroll({top: scrollHeight});
        }
    }

}

customElements.define("ootrt-ap-chatlist", ChatList);
