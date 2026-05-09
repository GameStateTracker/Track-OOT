import ContextMenu from "@emcjs/fe/ui/overlay/ctxmenu/ContextMenu.js";

export default class APHintStatusContextMenu extends ContextMenu {

    initItems() {
        super.setItems([
            {
                menuAction: "no-priority",
                content: "No Priority"
            },
            {
                menuAction: "priority",
                content: "Priority"
            },
            {
                menuAction: "avoid",
                content: "Avoid"
            }
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("ootrt-ctxmenu-aphintstatus", APHintStatusContextMenu);
