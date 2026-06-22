import Modal from "@emcjs/fe/ui/modal/Modal.js";
import EventManager from "@emcjs/core/util/event/EventManager.js";
import EdgeLogicCompiler from "@emcjs/logic/compiler/EdgeLogicCompiler.js";
import LogicUIAbstractElement from "@emcjs/fe/ui/logic/abstract/AbstractElement.js";
import LogicValueAliasesResource from "gametrackerjs/data/resource/LogicValueAliasesResource.js";
import Logic from "gametrackerjs/util/logic/Logic.js";
import {
    getEdgeLogic,
    getMixinLogic
} from "../../util/logic/LogicExtractor.js";
import TPL from "./LogicViewerModal.js.html" assert {type: "html"};
import STYLE from "./LogicViewerModal.js.css" assert {type: "css"};

const LOGIC_VALUE_ALIASES = new Map();
{ // register logic value aliases
    const logicValueAliases = LogicValueAliasesResource.get();
    for (const key in logicValueAliases) {
        const value = logicValueAliases[key];
        const logic = EdgeLogicCompiler.compile(value);
        LOGIC_VALUE_ALIASES.set(key, logic);
    }
}

function buildLogic(logic) {
    if (logic.params != null) {
        const {
            logic: fnLogic,
            params
        } = logic;
        return EdgeLogicCompiler.compile(fnLogic, params);
    } else {
        return EdgeLogicCompiler.compile(logic);
    }
}

export default class LogicViewerModal extends Modal {

    static #logicViewerModal;

    #logicContainerEl;

    #ref;

    #parentEventManager = new EventManager(false);

    constructor(ref, caption = ref ?? "") {
        super(caption);
        this.setIcon({
            type: "font",
            content: "logic",
            style: {
                color: "#990bc0",
                shadow: true
            }
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

        // EXECUTION HELPER
        const allTargets = Logic.getTargetNodes();
        const state = Logic.getMemory();

        const valueGetter = (key) => {
            if (allTargets.has(key) && key in state) {
                return !!state[key];
            }
            if (LOGIC_VALUE_ALIASES.has(key)) {
                const logic = LOGIC_VALUE_ALIASES.get(key);
                return logic.execute(valueGetter, execute);
            }
            return state[key] ?? false;
        };

        const execute = (name, params) => {
            // const injectedFunction = getInjectedFunction(name);
            // if (injectedFunction != null) {
            //     return injectedFunction.execute(valueGetter, execute, params);
            // }
            const mixinLogic = getMixinLogic(name);
            if (mixinLogic != null) {
                const logicStatement = buildLogic(mixinLogic);
                return logicStatement.execute(valueGetter, execute, params);
            }
            return false;
        };

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
                logicEl.readOnly = true;
                edgeEl.append(logicEl);
                this.#logicContainerEl.append(edgeEl);
                logicEl.calculate({
                    valueGetter,
                    execute
                });
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
