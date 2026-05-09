import GlobalStyleVariables from "@emcjs/fe/util/style/GlobalStyleVariables.js";
import SettingsObserver from "gametrackerjs/util/observer/SettingsObserver.js";

export default class StyleVarSettingsHandler {

    constructor(ref, name) {
        const observer = new SettingsObserver(ref);
        observer.addEventListener("change", (event) => {
            GlobalStyleVariables.set(name, event.value);
        });
        GlobalStyleVariables.set(name, observer.value);
    }

}
