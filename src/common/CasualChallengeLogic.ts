interface HasName {
    name: string
}

export function isBasicLand(card: HasName): boolean {
    switch (card.name) {
        case 'Plains':
        case 'Island':
        case 'Swamp':
        case 'Mountain':
        case 'Forest':
        case 'Wastes':
            return true;
    }

    return false;
}
