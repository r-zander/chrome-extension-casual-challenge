export class SerializableMap<Key, Value> extends Map<Key, Value> {
    toJSON() {
        return {
            type: 'SerializableMap',
            entries: Object.fromEntries(this)
        };
    }
}
