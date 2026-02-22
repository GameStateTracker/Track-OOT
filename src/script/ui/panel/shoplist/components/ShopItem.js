import CustomElement from "/emcJS/ui/element/CustomElement.js";
import ContextMenuManagerMixin from "/emcJS/ui/mixin/ContextMenuManagerMixin.js";
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";
import StateDataEventManagerMixin from "/GameTrackerJS/ui/mixin/StateDataEventManagerMixin.js";
import Language from "/GameTrackerJS/util/Language.js";
import WorldStateManagerRegistry from "/GameTrackerJS/statemanager/WorldStateManagerRegistry.js";
import {shopItemChoiceModal} from "../../../modal/shopitem/ShopItemChoiceModal.js";
import ShopSlotContextMenu from "../../../ctxmenu/ShopSlotContextMenu.js";
import TPL from "./ShopItem.js.html" assert {type: "html"};
import STYLE from "./ShopItem.js.css" assert {type: "css"};

const shopsanityObserver = new OptionsObserver("shopsanity");

function getIcon(itemData, bought) {
    if (itemData == null) {
        return "/images/items/unknown.png";
    }
    if (itemData.refill) {
        return itemData.image;
    }
    if (bought) {
        return "/images/items/sold_out.png";
    }
    return itemData.image ?? "/images/items/unknown.png";
}

export default class ShopItem extends ContextMenuManagerMixin(StateDataEventManagerMixin(CustomElement)) {

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        shopsanityObserver.onChange(() => {
            const state = this.getState();
            if (state != null) {
                // title
                const titleEl = this.shadowRoot.getElementById("title");
                if (titleEl != null) {
                    Language.applyLabel(titleEl, `item[${state.item}]`);
                }
                // cost
                const priceEl = this.shadowRoot.getElementById("price");
                if (priceEl != null) {
                    priceEl.innerHTML = state.price;
                }
            }
            this.#applyItem();
        });
        this.registerStateHandler("item", (event) => {
            const titleEl = this.shadowRoot.getElementById("title");
            if (titleEl != null) {
                Language.applyLabel(titleEl, `item[${event.value}]`);
            }
            this.#applyItem();
        });
        this.registerStateHandler("value", () => {
            this.#applyItem();
        });
        this.registerStateHandler("price", (event) => {
            const priceEl = this.shadowRoot.getElementById("price");
            if (priceEl != null) {
                priceEl.innerHTML = event.value;
            }
        });
        this.registerStateHandler("name", (event) => {
            const nameEl = this.shadowRoot.getElementById("name");
            if (nameEl != null) {
                nameEl.value = event.value;
            }
        });

        /* context menu */
        this.setDefaultContextMenu(ShopSlotContextMenu);
        this.addDefaultContextMenuHandler("check", () => {
            const state = this.getState();
            if (state != null) {
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("uncheck", () => {
            const state = this.getState();
            if (state != null) {
                state.value = false;
            }
        });
        this.addDefaultContextMenuHandler("associate", () => {
            this.#editItem();
        });
        this.addDefaultContextMenuHandler("junk", () => {
            const state = this.getState();
            if (state != null) {
                state.item = "refill_item";
                state.price = "0";
                state.value = true;
            }
        });
        this.addDefaultContextMenuHandler("disassociate", () => {
            const state = this.getState();
            if (state != null) {
                state.reset();
            }
        });

        /* mouse events */
        this.addEventListener("click", (event) => {
            const state = this.getState();
            if (state != null) {
                if (event.ctrlKey) {
                    if (state.item != "refill_item") {
                        state.item = "refill_item";
                        state.price = "0";
                        state.value = true;
                    } else {
                        state.reset();
                    }
                } else if (state.isDefault()) {
                    this.#editItem();
                } else {
                    state.value = !state.value;
                }
            }
            /* --- */
            event.preventDefault();
            event.stopPropagation();
            return false;
        });

        /* mouse events */
        this.addEventListener("contextmenu", (event) => {
            this.showDefaultContextMenu(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        const nameEl = this.shadowRoot.getElementById("name");
        nameEl.addEventListener("change", (event) => {
            const state = this.getState();
            if (state != null) {
                state.name = event.target.value;
            }
        });
        nameEl.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            return false;
        });
    }

    applyDefaultValues() {
        // title
        const titleEl = this.shadowRoot.getElementById("title");
        if (titleEl != null) {
            Language.applyLabel(titleEl, "???");
        }
        // image
        const imageEl = this.shadowRoot.getElementById("image");
        if (imageEl != null) {
            imageEl.style.backgroundImage = `url("/images/items/unknown.png")`;
        }
        // cost
        const priceEl = this.shadowRoot.getElementById("price");
        if (priceEl != null) {
            priceEl.innerHTML = "0";
        }
        // name
        const nameEl = this.shadowRoot.getElementById("name");
        if (nameEl != null) {
            nameEl.value = "";
        }
        // mark
        delete document.body.dataset.mark;
    }

    applyStateValues(state) {
        if (state != null) {
            // title
            const titleEl = this.shadowRoot.getElementById("title");
            if (titleEl != null) {
                Language.applyLabel(titleEl, `item[${state.item}]`);
            }
            // item
            this.#applyItem();
            // cost
            const priceEl = this.shadowRoot.getElementById("price");
            if (priceEl != null) {
                priceEl.innerHTML = state.price;
            }
            // name
            const nameEl = this.shadowRoot.getElementById("name");
            if (nameEl != null) {
                nameEl.value = state.name;
            }
        }
    }

    #applyItem() {
        const state = this.getState();
        const imageEl = this.shadowRoot.getElementById("image");
        const itemData = state?.itemData;
        if (itemData != null) {
            // icon
            if (imageEl != null) {
                const icon = getIcon(itemData, state.value);
                imageEl.style.backgroundImage = `url("${icon}")`;
            }
            // mark
            const mark = itemData.mark;
            if (typeof mark == "string") {
                this.dataset.mark = mark;
            } else {
                this.dataset.mark = "";
            }
        } else {
            // icon
            if (imageEl != null) {
                imageEl.style.backgroundImage = `url("/images/items/unknown.png")`;
            }
            // mark
            this.dataset.mark = "";
        }
    }

    async #editItem() {
        const state = this.getState();
        if (state != null) {
            shopItemChoiceModal.caption = `location[${this.ref}]`;
            const result = await shopItemChoiceModal.show(state.item, state.price);
            if (result) {
                state.item = result.item;
                state.price = result.price;
            }
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    static get observedAttributes() {
        return ["ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = WorldStateManagerRegistry.get("Location").get(this.ref);
                    this.switchState(state);
                } break;
            }
        }
    }

}

customElements.define("ootrt-shopitem", ShopItem);
