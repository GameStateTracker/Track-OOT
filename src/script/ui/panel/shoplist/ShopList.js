import CSSTemplate from "@emcjs/fe/util/template/CSSTemplate.js";
import Panel from "@emcjs/fe/ui/layout/Panel.js";
import ShopsResource from "../../../resource/ShopsResource.js";
import "./components/ShopField.js";

const STYLE = new CSSTemplate(`
:host {
    width: 300px;
    height: 300px;
    padding: 20px;
    overflow: auto;
}
`);

export default class ShopList extends Panel {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const shops = ShopsResource.get();
        for (const i in shops) {
            const el = document.createElement("ootrt-shopfield");
            el.ref = i;
            this.shadowRoot.append(el);
        }
    }

}

Panel.registerReference("shoplist", ShopList);
customElements.define("ootrt-shoplist", ShopList);
