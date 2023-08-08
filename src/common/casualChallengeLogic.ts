interface HasName {
    name: string
}

export const MAX_BUDGET_POINTS = 2500;

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
