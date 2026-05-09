import AbstractElement from "@emcjs/fe/ui/logic/abstract/AbstractElement.js";
import AbstractLiteralValueElement from "@emcjs/fe/ui/logic/abstract/AbstractLiteralValueElement.js";
import {getMixinLogic} from "../../../util/logic/LogicExtractor.js";
import TPL from "./LiteralMixin.js.html" assert {type: "html"};
import STYLE from "./LiteralMixin.js.css" assert {type: "css"};

const TPL_CAPTION = "FUNCTION";
const REFERENCE = "function";

export default class LogicElement extends AbstractLiteralValueElement {

    #viewEl;

    constructor() {
        super(REFERENCE, TPL_CAPTION);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.shadowRoot.getElementById("header").append(els);
        this.#viewEl = this.shadowRoot.getElementById("view");
        this.#viewEl.addEventListener("click", () => {
            const ev = new Event("viewlogic");
            ev.logic = this.ref;
            this.dispatchEvent(ev);
        });
    }

    calculate(state = {}) {
        const mixinLogic = getMixinLogic(this.ref);
        const logic = AbstractElement.buildLogic(mixinLogic);
        const value = logic.calculate(state);
        this.logicResult = value;
        return parseInt(value) || 0;
    }

}

AbstractElement.registerReference(REFERENCE, LogicElement);
customElements.define(`ootrt-logic-${REFERENCE}`, LogicElement);
