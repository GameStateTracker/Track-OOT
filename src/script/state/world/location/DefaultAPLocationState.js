import ObservableStorageObserver from "@emcjs/core/util/observer/data/storage/ObservableStorageObserver.js";
import Savestate from "gametrackerjs/savestate/Savestate.js";
import DefaultLocationState from "gametrackerjs/state/world/location/DefaultLocationState.js";
import LocationStateManager from "gametrackerjs/statemanager/world/location/LocationStateManager.js";
import {AP_STORAGES} from "../../../util/archipelago/storage/RegisterAPStorage.js";

const STORAGES = {
    locations: Savestate.getStorage("locations"),
    locationItems: Savestate.getStorage("locationItems")
};

export default class DefaultAPLocationState extends DefaultLocationState {

    #value = false;

    #apValue = false;

    #apLocationsObserver;

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        this.#apLocationsObserver = new ObservableStorageObserver(AP_STORAGES.locations, ref);
        this.#apLocationsObserver.onChange((event) => {
            this.setAPValue(event.value);
        });

        /* EVENT */
        this.addEventListener("excluded", () => {
            this.checkVisibility();
        });

        setTimeout(() => {
            this.#init();
        }, 0);
    }

    #init() {
        this.setAPValue(this.#apLocationsObserver.value, true);
    }

    set value(value) {
        if (typeof value != "boolean") {
            value = !!value;
        }
        if (value != this.#value) {
            const oldResValue = this.value;
            const ref = this.ref;
            this.#value = value;
            STORAGES.locations.set(ref, value);
            const newResValue = this.value;
            if (newResValue != oldResValue) {
                this.refreshAccess();
                // external
                const event = new Event("value");
                event.value = newResValue;
                this.dispatchEvent(event);
            }
        }
    }

    get value() {
        return this.#value || this.#apValue || false;
    }

    setAPValue(value, silent = false) {
        if (typeof value != "boolean") {
            value = !!value;
        }
        if (silent) {
            this.#apValue = value;
        } else {
            const old = this.#apValue;
            if (value != old) {
                const oldResValue = this.value;
                this.#apValue = value;
                const newResValue = this.value;
                if (newResValue != oldResValue) {
                    this.refreshAccess();
                    // external
                    const event = new Event("value");
                    event.value = newResValue;
                    this.dispatchEvent(event);
                }
            }
        }
    }

}

LocationStateManager.setDefaultState(DefaultAPLocationState);
