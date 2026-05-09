import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import ContextMenuManagerMixin from "@emcjs/fe/ui/mixin/ContextMenuManagerMixin.js";
import "@emcjs/fe/ui/i18n/I18nTooltip.js";
import ItemsResource from "gametrackerjs/data/resource/ItemsResource.js";
import StateDataEventManagerMixin from "gametrackerjs/ui/mixin/StateDataEventManagerMixin.js";
import ItemPickerContextMenu from "gametrackerjs/ui/ctxmenu/ItemPickerContextMenu.js";
import DungeonstateStates from "../../../../state/dungeon/DungeonStateManager.js";
import TPL from "./DungeonReward.js.html" assert {type: "html"};
import STYLE from "./DungeonReward.js.css" assert {type: "css"};

const REWARDS = [
    {
        "type": "item",
        "value": "stone_forest",
        "visible": true
    },
    {
        "type": "item",
        "value": "stone_fire",
        "visible": true
    },
    {
        "type": "item",
        "value": "stone_water",
        "visible": true
    },
    {
        "type": "item",
        "value": "medallion_forest",
        "visible": true
    },
    {
        "type": "item",
        "value": "medallion_fire",
        "visible": true
    },
    {
        "type": "item",
        "value": "medallion_water",
        "visible": true
    },
    {
        "type": "item",
        "value": "medallion_spirit",
        "visible": true
    },
    {
        "type": "item",
        "value": "medallion_shadow",
        "visible": true
    },
    {
        "type": "item",
        "value": "medallion_light",
        "visible": true
    }
];
const TAKEN_REWARDS = new Map();

function resolveIcon(icon) {
    if (icon == null) {
        return null;
    }
    if (typeof icon == "object") {
        return icon[0];
    }
    return icon;
}

export default class DungeonReward extends ContextMenuManagerMixin(StateDataEventManagerMixin(CustomElement)) {

    #optionEls =  new Map();

    #selectedEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("reward", (event) => {
            this.value = event.value;
        });

        /* context menu */
        this.setContextMenu("itempicker", ItemPickerContextMenu);
        this.addContextMenuHandler("itempicker", "pick", (event) => {
            const value = event.item;
            const state = this.getState();
            if (state != null) {
                state.reward = value;
            }
        });

        /* mouse events */
        this.addEventListener("click", (event) => {
            const mnu_itm = this.getContextMenu("itempicker");
            const filteredRewards = REWARDS.filter((el) => !TAKEN_REWARDS.has(el.value));
            if (filteredRewards.length) {
                mnu_itm.show(event.clientX, event.clientY, [filteredRewards]);
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", (event) => this.revert(event));
    }

    applyDefaultValues() {
        this.value = "";
    }

    applyStateValues(state) {
        if (state != null) {
            this.value = state.reward;
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    static get observedAttributes() {
        return ["ref", "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    // state
                    const state = DungeonstateStates.get(newValue);
                    if (state != null) {
                        this.append(this.#createOption("", "/images/items/unknown.png"));
                        const items = ItemsResource.get();
                        for (const reward of REWARDS) {
                            const name = reward.value;
                            const icon = resolveIcon(items[name].icon);
                            this.append(this.#createOption(name, icon));
                        }
                    }
                    if (newValue === "") {
                        this.innerHTML = "";
                    }
                    this.switchState(state);
                } break;
                case "value": {
                    if (this.#selectedEl) {
                        this.#selectedEl.classList.remove("active");
                        this.#selectedEl = null;
                    }
                    const ne = this.#optionEls.get(newValue);
                    if (ne) {
                        ne.classList.add("active");
                        this.#selectedEl = ne;
                    }
                    if (oldValue != "" && TAKEN_REWARDS.get(oldValue) == this) {
                        TAKEN_REWARDS.delete(oldValue);
                    }
                    if (newValue != "") {
                        TAKEN_REWARDS.set(newValue, this);
                    }

                    const ev = new Event("change");
                    ev.oldValue = oldValue;
                    ev.value = newValue;
                    this.dispatchEvent(ev);
                } break;
            }
        }
    }

    revert(ev) {
        const state = this.getState();
        if (state != null) {
            state.reward = "";
        }
        ev.preventDefault();
        return false;
    }

    #createOption(value, icon) {
        const el = document.createElement("emc-i18n-tooltip");
        el.classList.add("option");
        if (value) {
            el.i18nTooltip = `item[${value}]`;
        } else {
            el.i18nTooltip = `dungeon_reward_item_unknown`;
        }
        const iconEl = document.createElement("DIV");
        iconEl.style.display = "inline-flex";
        iconEl.style.alignItems = "center";
        iconEl.style.justifyContent = "center";
        iconEl.style.width = "100%";
        iconEl.style.height = "100%";
        iconEl.style.color = "white";
        iconEl.style.fontSize = "1em";
        iconEl.style.textShadow = "-1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black";
        iconEl.style.backgroundImage = "var(--default-unknown-back-image)";
        iconEl.style.backgroundSize = "contain";
        iconEl.style.backgroundRepeat = "no-repeat";
        iconEl.style.backgroundPosition = "center";
        iconEl.style.backgroundOrigin = "content-box";
        iconEl.style.flexGrow = 0;
        iconEl.style.flexShrink = 0;
        iconEl.style.minHeight = 0;
        iconEl.style.whiteSpace = "normal";
        iconEl.style.padding = 0;
        iconEl.style.lineHeight = "0.7em";
        if (icon != null) {
            iconEl.style.backgroundImage = `url('${icon}')`;
        }
        el.classList.add("icon");
        el.append(iconEl);
        this.#optionEls.set(value, el);
        return el;
    }

}

customElements.define("ootrt-dungeonreward", DungeonReward);
