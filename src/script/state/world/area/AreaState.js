import AreaStateManager from "gametrackerjs/statemanager/world/area/AreaStateManager.js";
import DefaultAreaState from "gametrackerjs/state/world/area/DefaultAreaState.js";
import OptionsObserver from "gametrackerjs/util/observer/OptionsObserver.js";

const mixedEntrancePoolObserver = new OptionsObserver("mixed_entrance_pool");

export default class AreaState extends DefaultAreaState {

    constructor(ref, props) {
        super(ref, props);
        mixedEntrancePoolObserver.onChange(() => {
            this.onListEntriesChange();
        });
    }

    get listContents() {
        return !mixedEntrancePoolObserver.value && super.listContents;
    }

}

AreaStateManager.setDefaultState(AreaState);
