import Modal from "/emcJS/ui/modal/Modal.js";
import EventManager from "/emcJS/util/event/EventManager.js";
import LogicUIAbstractElement from "/emcJS/ui/logic/abstract/AbstractElement.js";
import Logic from "/GameTrackerJS/util/logic/Logic.js";
import "../../content/logic/LogicElementsLoader.js";
import {getEdgeLogic} from "../../util/logic/LogicExtractor.js";
import TPL from "./LogicViewerModal.js.html" assert {type: "html"};
import STYLE from "./LogicViewerModal.js.css" assert {type: "css"};

export default class LogicViewerModal extends Modal {

    static #logicViewerModal;

    #logicContainerEl;

    #ref;

    #parentEventManager = new EventManager(false);

    constructor(ref, caption = ref ?? "") {
        super(caption);
        this.setIcon({
            type: "url",
            content: "/images/icons/logic.svg",
            style: {shadow: true}
        });
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const contentEl = this.shadowRoot.getElementById("content");
        this.#logicContainerEl = els.getElementById("logic-container");
        contentEl.append(this.#logicContainerEl);
        /* --- */
        this.#ref = ref;
        this.#renderLogic();
    }

    connectedCallback() {
        this.#parentEventManager.active = true;
        super.connectedCallback?.();
    }

    disconnectedCallback() {
        this.#parentEventManager.active = false;
        super.disconnectedCallback?.();
    }

    show(ref, caption = ref) {
        if (ref != null) {
            this.ref = ref;
            super.caption = caption;
        }
        super.show();
    }

    set ref(value) {
        if (this.#ref != value) {
            this.#ref = value;
            this.#renderLogic();
        }
    }

    get ref() {
        return this.#ref;
    }

    async #renderLogic() {
        this.#parentEventManager.clear();
        this.#logicContainerEl.innerHTML = "";
        const edgeList = await getEdgeLogic(this.#ref);
        for (const edge of edgeList) {
            const {
                logic, parent
            } = edge;
            if (logic) {
                const edgeEl = document.createElement("div");
                edgeEl.className = "edge";
                if (parent) {
                    const parentEl = document.createElement("button");
                    parentEl.className = "parent";
                    parentEl.innerHTML = `From:<br>${parent}`;
                    this.#parentEventManager.set(parentEl, "click", () => {
                        this.show(parent);
                    });
                    edgeEl.append(parentEl);
                }
                const logicEl = LogicUIAbstractElement.buildLogic(logic);
                logicEl.className = "logic";
                logicEl.readonly = true;
                edgeEl.append(logicEl);
                this.#logicContainerEl.append(edgeEl);
                logicEl.calculate(Logic.getMemory());
            }
        }
    }

    static #getGlobalLogicViewerModal() {
        if (this.#logicViewerModal == null) {
            this.#logicViewerModal = new LogicViewerModal();
        }
        return this.#logicViewerModal;
    }

    static show(ref, caption) {
        const logicViewerModal = this.#getGlobalLogicViewerModal();
        logicViewerModal.show(ref, caption);
    }

}

customElements.define("tootr-modal-logicviewer", LogicViewerModal);
