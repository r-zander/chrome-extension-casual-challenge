import {MAX_BUDGET_POINTS} from "./casualChallengeLogic";

const shortPercentageFormatGt100 = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumSignificantDigits: 3,
});
const shortPercentageFormatLt100 = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumSignificantDigits: 2,
});

export function formatBudgetPoints(budgetPoints: number) {
    if (budgetPoints === null) {
        return 'unknown';
    }

    const str = String(budgetPoints);

    let result = '';

    let numberPos = str.length;
    for (let i = 0; i < str.length; i++) {
        if (numberPos !== str.length && numberPos % 2 === 0) {
            result += '&thinsp;';
        }

        result += str.charAt(i);
        numberPos--;
    }

    return result;
}

export function formatBudgetPointsShare(budgetPoints: number) {
    if (budgetPoints === null) {
        return '--';
    }
    return formatShortPercentage(budgetPoints / MAX_BUDGET_POINTS);
}

/**
 *
 * @param ratio 0.0 to 1.0
 */
export function formatShortPercentage(ratio: number) {
    // Edge case handling
    if (ratio > 1.0 && ratio < 1.01) {
        ratio = 1.01;
    }
    if (ratio > 1.000) {
        return shortPercentageFormatGt100.format(ratio);
    }
    return shortPercentageFormatLt100.format(ratio);
}
