import { FireCalculator } from '../src/calculators/fireCalculator';

describe('FireCalculator', () => {
    let fireCalculator;

    beforeEach(() => {
        fireCalculator = new FireCalculator();
    });

    test('calculateSavingsGoal should return correct savings goal', () => {
        const monthlyExpenses = 3000;
        const withdrawalRate = 0.04;
        const expectedSavingsGoal = monthlyExpenses * 12 / withdrawalRate;

        const result = fireCalculator.calculateSavingsGoal(monthlyExpenses, withdrawalRate);
        expect(result).toBeCloseTo(expectedSavingsGoal);
    });

    test('calculateWithdrawalRate should return correct withdrawal rate', () => {
        const savingsGoal = 720000;
        const monthlyExpenses = 3000;
        const expectedWithdrawalRate = monthlyExpenses * 12 / savingsGoal;

        const result = fireCalculator.calculateWithdrawalRate(savingsGoal, monthlyExpenses);
        expect(result).toBeCloseTo(expectedWithdrawalRate);
    });
});