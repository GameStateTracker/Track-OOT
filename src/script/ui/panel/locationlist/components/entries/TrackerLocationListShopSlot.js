import {mix} from "@emcjs/core/mixin/Mixin.js";
import "@emcjs/fe/ui/icon/LabeledIcon.js";
import OptionsObserver from "gametrackerjs/util/observer/OptionsObserver.js";
import UIRegistry from "gametrackerjs/registry/UIRegistry.js";
import LocationListEntry from "gametrackerjs/ui/panel/locationlist/components/abstract/LocationListEntry.js";
import AccessTextMarkerMixin from "gametrackerjs/ui/panel/worldlist/components/mixin/AccessTextMarkerMixin.js";
import MetaObserver from "gametrackerjs/util/observer/MetaObserver.js";
import "gametrackerjs/ui/panel/locationlist/components/entries/LocationListLocation.js";
import {shopItemChoiceModal} from "../../../../modal/shopitem/ShopItemChoiceModal.js";
import ShopSlotContextMenu from "../../../../ctxmenu/ShopSlotContextMenu.js";
import APHintLocations from "../../../../../resource/APHintLocations.js";
import TPL from "./TrackerLocationListShopSlot.js.html" assert {type: "html"};
import STYLE from "./TrackerLocationListShopSlot.js.css" assert {type: "css"};

const archipelagoActiveObserver = new MetaObserver("archipelago");
const apHintLocations = APHintLocations.get();

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tpl = TPL.generate();
    const itemEl = tpl.getElementById("item");
    textEl.insertAdjacentElement("afterend", itemEl);
}

const shopsanityObserver = new OptionsObserver("shopsanity");

const BaseClass = mix(LocationListEntry).with(AccessTextMarkerMixin);

export default class TrackerLocationListShopSlot extends BaseClass {

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        badgeEl.hideValues = true;
        /* item */
        const itemEl = this.shadowRoot.getElementById("item");
        itemEl.valign = "end";
        itemEl.halign = "end";
        /* observer */
        shopsanityObserver.onChange(() => {
            const state = this.getState();
            this.#applyItem(state?.itemData, state?.price);
        });
        /* state handler */
        this.registerStateHandler("item", () => {
            const state = this.getState();
            this.#applyItem(state?.itemData, state?.price);
        });
        this.registerStateHandler("bought", () => {
            const state = this.getState();
            this.#applyItem(state?.itemData, state?.price);
        });
        this.registerStateHandler("price", () => {
            const state = this.getState();
            this.#applyItem(state?.itemData, state?.price);
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
        this.addDefaultContextMenuHandler("hint_ap_location", () => {
            const apHintLocation = apHintLocations[this.ref];
            if (apHintLocation != null) {
                const viewchoiceEl = document.getElementById("main-content");
                viewchoiceEl.active = "ap";
                const apTextClient = document.getElementById("ap-textclient");
                apTextClient.setLocationHintMessage(apHintLocation);
            }
        });
        /* AP */
        if (!archipelagoActiveObserver.value) {
            this.toggleDefaultContextMenuGroupActive("ap", false);
        }
        archipelagoActiveObserver.onChange((event) => {
            const {value} = event;
            this.toggleDefaultContextMenuGroupActive("ap", !!value);
        });
    }

    clickHandler(event) {
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
    }

    applyDefaultValues() {
        super.applyDefaultValues("/images/icons/shops.svg");
        this.#applyItem();
    }

    applyStateValues(state) {
        super.applyStateValues(state, "/images/icons/shops.svg");
        this.#applyItem(state.itemData);
    }

    #applyItem(itemData) {
        const itemEl = this.shadowRoot.getElementById("item");
        if (itemEl != null) {
            if (itemData != null) {
                itemEl.src = itemData.image;
                itemEl.text = itemData.price;
            } else {
                itemEl.src = "/images/items/unknown.png";
                itemEl.text = "?";
            }
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

    get type() {
        return "location";
    }

}

customElements.define("ootrt-locationlist-shopslot", TrackerLocationListShopSlot);
UIRegistry.get("locationlist-location")
    .register("shopslot", TrackerLocationListShopSlot);
