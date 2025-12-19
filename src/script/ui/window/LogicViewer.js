import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import LogicUIAbstractElement from "/emcJS/ui/logic/abstract/AbstractElement.js";
import Logic from "/GameTrackerJS/util/logic/Logic.js";
import "../logic/LogicElementsLoader.js";
import {getEdgeLogic} from "../../util/logic/LogicExtractor.js";

class LogicViewer {

    async show(ref, title = ref) {
        const d = new Dialog({
            title: title,
            submit: "OK"
        });
        d.value = ref;
        const el = document.createElement("div");
        el.style.display = "flex";
        const result = await getEdgeLogic(ref);
        for (const {
            logic, parent
        } of result) {
            if (logic) {
                const c = document.createElement("div");
                c.style.padding = "5px";
                c.style.border = "1px #00000033";
                c.style.borderStyle = "none solid";
                if (parent) {
                    const p = document.createElement("button");
                    p.innerHTML = `From:<br>${parent}`;
                    p.addEventListener("click", () => {
                        d.close();
                        this.show(parent);
                    });
                    c.append(p);
                }
                const l = LogicUIAbstractElement.buildLogic(logic);
                l.readonly = true;
                c.append(l);
                el.append(c);
                l.calculate(Logic.getMemory());
            }
        }
        d.append(el);
        d.show();
    }

}

export default new LogicViewer();
