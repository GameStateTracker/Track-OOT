import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import "./SongStave.js";
import TPL from "./SongBuilder.js.html" assert {type: "html"};
import STYLE from "./SongBuilder.js.css" assert {type: "css"};

export default class SongBuilder extends CustomElement {

    #staveEl;

    #buttonsEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#staveEl = this.shadowRoot.getElementById("stave");
        this.#buttonsEl = this.shadowRoot.getElementById("buttons");
        this.#buttonsEl.addEventListener("click", (event) => this.#buttonClick(event));
    }

    set value(val) {
        this.#staveEl.value = val;
    }

    get value() {
        return this.#staveEl.value;
    }

    #buttonClick(event) {
        switch (event.target.id) {
            case "X":
                if (this.value.length) {
                    this.value = this.value.slice(0, -1);
                }
                break;
            case "A":
            case "D":
            case "R":
            case "L":
            case "U":
                if (this.value.length < 8) {
                    this.value += event.target.id;
                }
                break;
        }
    }

}

customElements.define("ootrt-songbuilder", SongBuilder);
