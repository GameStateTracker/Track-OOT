import ObservableStorageObserver from "@emcjs/core/util/observer/data/storage/ObservableStorageObserver.js";
import EntityState from "@emcjs/core/data/state/entity/EntityState.js";
import Savestate from "gametrackerjs/savestate/Savestate.js";
import "../../util/registerStorages.js";

const STORAGES = {songNotes: Savestate.getStorage("songNotes")};

const NOTES = new WeakMap();

export default class DefaultSongState extends EntityState {

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        if (props.editable) {
            const songNotesObserver = new ObservableStorageObserver(STORAGES.songNotes, ref);
            NOTES.set(this, songNotesObserver.value);
            songNotesObserver.onChange((event) => {
                this.notes = event.value;
            });
        } else {
            NOTES.set(this, props.notes);
        }
    }

    set notes(value) {
        if (this.props.editable) {
            const ref = this.ref;
            if (value == null) {
                value = this.props.notes;
            }
            if (typeof value == "string") {
                const old = this.notes;
                if (value != old) {
                    NOTES.set(this, value);
                    STORAGES.songNotes.set(ref, value);
                    // external
                    const event = new Event("notes");
                    event.value = value;
                    this.dispatchEvent(event);
                }
            }
        }
    }

    get notes() {
        return NOTES.get(this);
    }

}
