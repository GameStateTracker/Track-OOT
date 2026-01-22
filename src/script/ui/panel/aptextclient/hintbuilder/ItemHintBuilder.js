import CustomElement from "/emcJS/ui/element/CustomElement.js";
import TPL from "./ItemHintBuilder.js.html" assert {type: "html"};
import STYLE from "./ItemHintBuilder.js.css" assert {type: "css"};

/*
Missing items (junk)

Deku Stick (1)
Deku Nuts (5)
Deku Nuts (10)
Deku Seeds (30)
Bombs (5)
Bombs (10)
Bombs (20)

Recovery Heart
Arrows (5)
Arrows (10)
Arrows (30)
Bombchus (5)
Bombchus (10)
Bombchus (20)

Rupee (1)
Rupee (Treasure Chest Game)
Rupees (5)
Rupees (20)
Rupees (50)
Rupees (200)
Ice Trap
 */

export default class ItemHintBuilder extends CustomElement {

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        const hintItemPickerEl = this.shadowRoot.getElementById("hint-item-picker");
        this.registerTargetEventHandler(hintItemPickerEl, "iconclick", (event) => {
            const {value} = event;
            const ev = new Event("hint");
            ev.value = value;
            this.dispatchEvent(ev);
        });
    }

}

customElements.define("ootrt-ap-item-hint-builder", ItemHintBuilder);
