import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import "@emcjs/fe/ui/i18n/I18nLabel.js";
import ShopItemsResource from "../../../../resource/ShopItemsResource.js";
import TPL from "./ShopEditItem.js.html" assert {type: "html"};
import STYLE from "./ShopEditItem.js.css" assert {type: "css"};

export default class ShopEditItem extends CustomElement {

    #category;

    #imageEl;

    #titleEl;

    #priceEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#imageEl = this.shadowRoot.getElementById("image");
        this.#titleEl = this.shadowRoot.getElementById("title");
        this.#priceEl = this.shadowRoot.getElementById("price");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set price(val) {
        this.setAttribute("price", val);
    }

    get price() {
        return this.getAttribute("price");
    }

    set category(value) {
        this.#category = value;
    }

    get category() {
        return this.#category;
    }

    static get observedAttributes() {
        return ["ref", "price"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "ref":
                if (oldValue != newValue) {
                    this.#titleEl.i18nValue = `item[${newValue}]`;
                    const shop_item = ShopItemsResource.get(this.ref);
                    this.#imageEl.style.backgroundImage = `url("${shop_item.image}")`;
                }
                break;
            case "price":
                if (oldValue != newValue) {
                    this.#priceEl.innerHTML = newValue;
                }
                break;
        }
    }

}

customElements.define("tootr-modal-shop-item-choice-item", ShopEditItem);
