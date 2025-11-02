class FireCalculator {
    constructor() {
        // Initialize any necessary properties if needed
    }

    calculateSavingsGoal(monthlyExpenses, withdrawalRate) {
        if (withdrawalRate <= 0) {
            throw new Error("Withdrawal rate must be greater than zero.");
        }
        return monthlyExpenses * 12 / withdrawalRate;
    }

    calculateWithdrawalRate(savingsGoal, monthlyExpenses) {
        if (savingsGoal <= 0) {
            throw new Error("Savings goal must be greater than zero.");
        }
        return (monthlyExpenses * 12) / savingsGoal;
    }
}

export default FireCalculator;