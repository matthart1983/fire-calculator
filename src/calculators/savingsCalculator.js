class SavingsCalculator {
    constructor() {
        // Default values
        this.defaultInterestRate = 0.03; // 3% savings account rate
        this.compoundingFrequencies = {
            daily: 365,
            monthly: 12,
            quarterly: 4,
            annually: 1
        };
    }

    /**
     * Calculate future value of savings with regular contributions
     * @param {number} initialBalance - Starting balance
     * @param {number} monthlyContribution - Regular monthly contribution
     * @param {number} annualInterestRate - Annual interest rate as decimal (e.g., 0.05 for 5%)
     * @param {number} years - Number of years to save
     * @param {string} compoundingFrequency - How often interest compounds (daily, monthly, quarterly, annually)
     * @returns {object} Detailed savings projection
     */
    calculateSavingsGrowth(
        initialBalance,
        monthlyContribution,
        annualInterestRate,
        years,
        compoundingFrequency = 'monthly'
    ) {
        if (years <= 0) {
            throw new Error("Years must be greater than zero.");
        }

        const compoundsPerYear = this.compoundingFrequencies[compoundingFrequency] || 12;
        const ratePerPeriod = annualInterestRate / compoundsPerYear;
        const totalPeriods = years * compoundsPerYear;
        const contributionPerPeriod = monthlyContribution * (12 / compoundsPerYear);

        let balance = initialBalance;
        let totalContributions = 0;
        let totalInterest = 0;
        const yearlyData = [];

        // Initial state
        yearlyData.push({
            year: 0,
            balance: Math.round(initialBalance),
            contributions: 0,
            interest: 0,
            totalContributions: 0,
            totalInterest: 0
        });

        let yearContributions = 0;
        let yearInterest = 0;
        let periodCounter = 0;

        for (let period = 1; period <= totalPeriods; period++) {
            periodCounter++;

            // Add contribution
            balance += contributionPerPeriod;
            totalContributions += contributionPerPeriod;
            yearContributions += contributionPerPeriod;

            // Calculate and add interest
            const interestEarned = balance * ratePerPeriod;
            balance += interestEarned;
            totalInterest += interestEarned;
            yearInterest += interestEarned;

            // Store data at end of each year
            if (periodCounter === compoundsPerYear || period === totalPeriods) {
                yearlyData.push({
                    year: Math.ceil(period / compoundsPerYear),
                    balance: Math.round(balance),
                    contributions: Math.round(yearContributions),
                    interest: Math.round(yearInterest),
                    totalContributions: Math.round(totalContributions),
                    totalInterest: Math.round(totalInterest)
                });
                yearContributions = 0;
                yearInterest = 0;
                periodCounter = 0;
            }
        }

        return {
            finalBalance: Math.round(balance),
            initialBalance: Math.round(initialBalance),
            totalContributions: Math.round(totalContributions),
            totalInterest: Math.round(totalInterest),
            years: years,
            effectiveRate: annualInterestRate * 100,
            yearlyData: yearlyData
        };
    }

    /**
     * Calculate how long it takes to reach a savings goal
     * @param {number} initialBalance - Starting balance
     * @param {number} targetAmount - Goal amount to reach
     * @param {number} monthlyContribution - Regular monthly contribution
     * @param {number} annualInterestRate - Annual interest rate as decimal
     * @returns {object} Time to reach goal and details
     */
    calculateTimeToGoal(initialBalance, targetAmount, monthlyContribution, annualInterestRate) {
        if (targetAmount <= initialBalance) {
            return {
                months: 0,
                years: 0,
                achieved: true,
                message: "Goal already achieved!"
            };
        }

        if (monthlyContribution <= 0 && annualInterestRate <= 0) {
            return {
                months: null,
                years: null,
                achieved: false,
                message: "Cannot reach goal without contributions or interest"
            };
        }

        const monthlyRate = annualInterestRate / 12;
        let balance = initialBalance;
        let months = 0;
        const maxMonths = 1200; // 100 years max

        while (balance < targetAmount && months < maxMonths) {
            months++;
            balance += monthlyContribution;
            balance += balance * monthlyRate;
        }

        if (months >= maxMonths) {
            return {
                months: null,
                years: null,
                achieved: false,
                message: "Goal will take more than 100 years to achieve"
            };
        }

        return {
            months: months,
            years: (months / 12).toFixed(1),
            achieved: true,
            finalBalance: Math.round(balance),
            totalContributions: Math.round(monthlyContribution * months),
            totalInterest: Math.round(balance - initialBalance - (monthlyContribution * months))
        };
    }

    /**
     * Calculate required monthly contribution to reach a goal
     * @param {number} initialBalance - Starting balance
     * @param {number} targetAmount - Goal amount to reach
     * @param {number} years - Time frame in years
     * @param {number} annualInterestRate - Annual interest rate as decimal
     * @returns {number} Required monthly contribution
     */
    calculateRequiredContribution(initialBalance, targetAmount, years, annualInterestRate) {
        if (targetAmount <= initialBalance) {
            return 0;
        }

        const months = years * 12;
        const monthlyRate = annualInterestRate / 12;

        if (monthlyRate === 0) {
            // Simple case without interest
            return (targetAmount - initialBalance) / months;
        }

        // Future value of initial balance
        const futureValueOfInitial = initialBalance * Math.pow(1 + monthlyRate, months);

        // Remaining amount needed from contributions
        const remainingNeeded = targetAmount - futureValueOfInitial;

        // Calculate required monthly payment using annuity formula
        // FV = PMT * [((1 + r)^n - 1) / r]
        const requiredPayment = remainingNeeded / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));

        return Math.round(requiredPayment);
    }

    /**
     * Compare different savings scenarios
     * @param {number} initialBalance - Starting balance
     * @param {array} scenarios - Array of {contribution, rate, label} objects
     * @param {number} years - Number of years to compare
     * @returns {array} Comparison results
     */
    compareScenarios(initialBalance, scenarios, years) {
        return scenarios.map(scenario => {
            const result = this.calculateSavingsGrowth(
                initialBalance,
                scenario.contribution,
                scenario.rate,
                years
            );
            return {
                label: scenario.label,
                finalBalance: result.finalBalance,
                totalContributions: result.totalContributions,
                totalInterest: result.totalInterest
            };
        });
    }
}

export default SavingsCalculator;
