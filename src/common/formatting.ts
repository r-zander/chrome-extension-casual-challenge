export function formatBudgetPoints(budgetPoints: number) {
    const str = String(budgetPoints);

    let result = '';

    let numberPos = str.length;
    for (let i = 0; i < str.length; i++) {
        if (numberPos !== 0 && numberPos % 2 === 0) {
            result += '&hairsp;&hairsp;';
        }

        result += str.charAt(i);
        numberPos--;
    }

    return result;
}
