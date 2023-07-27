export const uuidPattern: string = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
export const uuidRegex: RegExp = new RegExp('^' + uuidPattern + '$');

export function isUUID(candidate: string): boolean {
    return candidate.match(uuidRegex) !== null;
}
