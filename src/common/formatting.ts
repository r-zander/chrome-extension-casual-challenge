import {MAX_BUDGET_POINTS} from "./constants";

const shortPercentageFormat = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumSignificantDigits: 2,
});

export function formatBudgetPoints(budgetPoints: number) {
    const str = String(budgetPoints);

    let result = '';

    let numberPos = str.length;
    for (let i = 0; i < str.length; i++) {
        if (numberPos !== str.length && numberPos % 2 === 0) {
            result += '&hairsp;&hairsp;';
        }

        result += str.charAt(i);
        numberPos--;
    }

    return result;
}

export function formatBudgetPointsShare(budgetPoints: number) {
    return formatShortPercentage(budgetPoints / MAX_BUDGET_POINTS);
}

/**
 *
 * @param ratio 0.0 to 1.0
 */
export function formatShortPercentage(ratio: number) {
    return shortPercentageFormat.format(ratio);
}
