import {mix} from "@emcjs/core/mixin/Mixin.js";
import "@emcjs/fe/ui/icon/LabeledIcon.js";
import OptionsObserver from "gametrackerjs/util/observer/OptionsObserver.js";
import UIRegistry from "gametrackerjs/registry/UIRegistry.js";
import WorldListElement from "gametrackerjs/ui/panel/worldlist/components/abstract/Element.js";
import AccessTextMarkerMixin from "gametrackerjs/ui/panel/worldlist/components/mixin/AccessTextMarkerMixin.js";
import Language from "gametrackerjs/util/Language.js";
import MetaObserver from "gametrackerjs/util/observer/MetaObserver.js";
import "gametrackerjs/ui/panel/worldlist/components/entries/Location.js";
import {shopItemChoiceModal} from "../../../../modal/shopitem/ShopItemChoiceModal.js";
import ShopSlotContextMenu from "../../../../ctxmenu/ShopSlotContextMenu.js";
import LogicViewerModal from "../../../../modal/LogicViewerModal.js";
import APHintLocations from "../../../../../resource/APHintLocations.js";
import TPL from "./ShopSlot.js.html" assert {type: "html"};
import STYLE from "./ShopSlot.js.css" assert {type: "css"};

const archipelagoActiveObserver = new MetaObserver("archipelago");
const apHintLocations = APHintLocations.get();

const shopsanityObserver = new OptionsObserver("shopsanity");

function applyElements(target) {
    const textEl = target.getElementById("text");
    const tpl = TPL.generate();
    const itemEl = tpl.getElementById("item");
    textEl.insertAdjacentElement("afterend", itemEl);
}

const BaseClass = mix(WorldListElement).with(AccessTextMarkerMixin);

export default class WorldListShopSlot extends BaseClass {

    #itemEl;

    constructor() {
        super();
        applyElements(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#itemEl = this.shadowRoot.getElementById("item");
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        badgeEl.hideValues = true;
        /* observer */
        shopsanityObserver.onChange(() => {
            const state = this.getState();
            this.#applyItem(state?.itemData);
        });
        /* state handler */
        this.registerStateHandler("item", () => {
            const state = this.getState();
            this.#applyItem(state?.itemData);
        });
        this.registerStateHandler("value", () => {
            const state = this.getState();
            this.#applyItem(state?.itemData);
        });
        this.registerStateHandler("price", () => {
            const state = this.getState();
            this.#applyItem(state?.itemData);
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
        this.addDefaultContextMenuHandler("show_logic", () => {
            const state = this.getState();
            if (state != null) {
                const title = Language.generateLabel(`location[${this.ref}]`);
                LogicViewerModal.show(state.props.logicAccess ?? "", title);
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
        if (this.#itemEl != null) {
            if (itemData != null) {
                this.#itemEl.src = itemData.image;
                this.#itemEl.text = itemData.price;
            } else {
                this.#itemEl.src = "/images/items/unknown.png";
                this.#itemEl.text = "?";
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
        return "Location";
    }

}

customElements.define("ootrt-worldlist-shopslot", WorldListShopSlot);
UIRegistry.get("worldlist-location").register("shopslot", WorldListShopSlot);
