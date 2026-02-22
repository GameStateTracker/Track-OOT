import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import ShopItemsResource from "/script/resource/ShopItemsResource.js";
import "./components/ShopEditItem.js";
import TPL from "./ShopItemChoiceModal.js.html" assert {type: "html"};
import STYLE from "./ShopItemChoiceModal.js.css" assert {type: "css"};

export default class ShopItemChoiceModal extends ModalDialog {

    #categoriesEl;

    #priceContainerEl;

    #priceEl;

    #selectedItem;

    constructor(caption = "Item Choice", options = {}) {
        super(caption, {
            submit: true,
            cancel: true,
            ...options
        });
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const contentEl = this.shadowRoot.getElementById("content");
        const footerEl = this.shadowRoot.getElementById("footer");
        this.#categoriesEl = els.getElementById("categories");
        this.#priceContainerEl = els.getElementById("price-container");
        contentEl.append(this.#categoriesEl);
        footerEl.prepend(this.#priceContainerEl);
        this.#priceEl = this.shadowRoot.getElementById("price");
        this.#priceEl.addEventListener("submit", () => this.submit());

        const items = ShopItemsResource.get();
        for (const item in items) {
            const values = items[item];
            if (values.visible == null || values.visible === true) {
                this.#addItem(values.category, item, values.price || "???");
            }
        }
    }

    async show(value, price) {
        price = parseInt(price);
        if (isNaN(price)) {
            price = 0;
        }
        this.#selectItem(value);
        this.#priceEl.value = price;
        return await super.show();
    }

    getSubmitValue() {
        return {
            item: this.#selectedItem?.ref,
            price: this.#priceEl.value
        };
    }

    #getTab(category) {
        const tabEl = this.#categoriesEl.getTab(category);
        if (tabEl != null) {
            const containerEl = tabEl.querySelector(".container");
            return containerEl;
        } else {
            const tabEl = this.#categoriesEl.setTab(category);
            const containerEl = document.createElement("div");
            containerEl.className = "container";
            containerEl.id = `panel_${category}`;
            tabEl.append(containerEl);
            return containerEl;
        }
    }

    #addItem(category, ref, price) {
        const item = document.createElement("tootr-modal-shop-item-choice-item");
        item.ref = ref;
        item.price = price;
        item.category = category;
        item.addEventListener("click", (event) => {
            const target = event.target;
            this.#selectItem(target.ref);
        });
        this.#getTab(category).append(item);
    }

    #selectItem(ref) {
        const nextItem = this.shadowRoot.querySelector(`[ref="${ref}"]`);
        if (this.#selectedItem != nextItem) {
            if (this.#selectedItem != null) {
                this.#selectedItem.classList.remove("active");
            }
            if (nextItem != null) {
                nextItem.classList.add("active");
            }
            this.#selectedItem = nextItem;
        }
        this.#categoriesEl.active = this.#selectedItem?.category ?? "";
        // price
        if (this.#selectedItem == null) {
            this.#priceEl.value = 0;
            this.#priceEl.readOnly = true;
        } else {
            const price = parseInt(this.#selectedItem.price);
            if (!isNaN(price)) {
                this.#priceEl.value = price;
                this.#priceEl.readOnly = true;
            } else {
                this.#priceEl.value = 0;
                this.#priceEl.readOnly = false;
            }
        }
        this.#priceEl.focus();
    }

}

customElements.define("tootr-modal-shop-item-choice", ShopItemChoiceModal);

export const shopItemChoiceModal = new ShopItemChoiceModal();
