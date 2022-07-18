import {SerializableMap} from "./SerializableMap";

export function deserialize<I, O>(raw: I): O {
    if (typeof raw !== 'object') {
        return raw as unknown as O;
    }

    if (raw === null) {
        return null;
    }

    const record = raw as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(record, 'type') &&
        record['type'] === 'SerializableMap' &&
        Object.prototype.hasOwnProperty.call(record, 'entries')) {
        return new SerializableMap(Object.entries(record['entries'])) as unknown as O;
    }


    for (const [key, value] of Object.entries(record)) {
        record[key] = deserialize(value as Record<string, unknown>);
    }

    return (record as O);
}

export function serialize<I, O>(input: I): O {
    if (typeof input !== 'object') {
        return input as unknown as O;
    }

    if (input === null) {
        return null;
    }

    const record = input as Record<string, unknown>;
    if ('toJSON' in record &&
        typeof record['toJSON'] === 'function') {
        return record.toJSON() as O;
    }

    for (const [key, value] of Object.entries(record)) {
        record[key] = serialize(value);
    }

    return (record as O);
}
