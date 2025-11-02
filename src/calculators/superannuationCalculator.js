class SuperannuationCalculator {
    constructor() {
        // Default superannuation guarantee rate (as of 2025)
        this.defaultSGRate = 0.115; // 11.5%
    }

    /**
     * Calculate superannuation balance at retirement
     * @param {number} currentAge - Current age
     * @param {number} retirementAge - Target retirement age
     * @param {number} currentSuper - Current superannuation balance
     * @param {number} annualIncome - Annual gross income
     * @param {number} employerContributionRate - Employer contribution rate (default 11.5%)
     * @param {number} personalContributionRate - Personal contribution rate (as % of income)
     * @param {number} returnRate - Expected annual return rate (default 7%)
     * @param {number} inflationRate - Expected inflation rate (default 2.5%)
     * @param {number} feeRate - Annual fees rate (default 0.85%)
     * @returns {object} Detailed breakdown of superannuation projection
     */
    calculateRetirementBalance(
        currentAge,
        retirementAge,
        currentSuper,
        annualIncome,
        employerContributionRate = this.defaultSGRate,
        personalContributionRate = 0,
        returnRate = 0.07,
        inflationRate = 0.025,
        feeRate = 0.0085
    ) {
        if (retirementAge <= currentAge) {
            throw new Error("Retirement age must be greater than current age.");
        }

        const years = retirementAge - currentAge;
        let balance = currentSuper;
        const yearlyData = [];
        
        // Net return rate after fees
        const netReturnRate = returnRate - feeRate;
        
        // Calculate annual employer contribution
        let employerContribution = annualIncome * employerContributionRate;
        let personalContribution = annualIncome * personalContributionRate;
        let currentIncome = annualIncome;
        
        let totalEmployerContributions = 0;
        let totalPersonalContributions = 0;
        let totalReturns = 0;
        let totalFees = 0;

        for (let year = 0; year < years; year++) {
            const currentYear = currentAge + year;
            
            // Calculate returns for the year
            const yearReturn = balance * netReturnRate;
            const yearFees = balance * feeRate;
            
            // Add contributions
            balance += employerContribution + personalContribution;
            
            // Apply returns
            balance += yearReturn;
            
            // Track totals
            totalEmployerContributions += employerContribution;
            totalPersonalContributions += personalContribution;
            totalReturns += yearReturn;
            totalFees += yearFees;
            
            // Store yearly data
            yearlyData.push({
                age: currentYear + 1,
                balance: Math.round(balance),
                employerContribution: Math.round(employerContribution),
                personalContribution: Math.round(personalContribution),
                returns: Math.round(yearReturn),
                fees: Math.round(yearFees)
            });
            
            // Apply wage growth (inflation) for next year
            currentIncome *= (1 + inflationRate);
            employerContribution = currentIncome * employerContributionRate;
            personalContribution = currentIncome * personalContributionRate;
        }

        return {
            finalBalance: Math.round(balance),
            currentSuper: Math.round(currentSuper),
            totalEmployerContributions: Math.round(totalEmployerContributions),
            totalPersonalContributions: Math.round(totalPersonalContributions),
            totalReturns: Math.round(totalReturns),
            totalFees: Math.round(totalFees),
            totalContributions: Math.round(totalEmployerContributions + totalPersonalContributions),
            years: years,
            yearlyData: yearlyData,
            assumptions: {
                returnRate: returnRate * 100,
                inflationRate: inflationRate * 100,
                feeRate: feeRate * 100,
                employerContributionRate: employerContributionRate * 100,
                personalContributionRate: personalContributionRate * 100
            }
        };
    }

    /**
     * Calculate required contributions to reach a target super balance
     * @param {number} currentAge - Current age
     * @param {number} retirementAge - Target retirement age
     * @param {number} currentSuper - Current superannuation balance
     * @param {number} targetBalance - Target balance at retirement
     * @param {number} annualIncome - Annual gross income
     * @param {number} returnRate - Expected annual return rate
     * @returns {number} Required personal contribution rate as percentage of income
     */
    calculateRequiredContributions(
        currentAge,
        retirementAge,
        currentSuper,
        targetBalance,
        annualIncome,
        returnRate = 0.07
    ) {
        if (targetBalance <= currentSuper) {
            return 0;
        }

        // Binary search for the right contribution rate
        let low = 0;
        let high = 0.5; // Max 50% personal contributions
        let iterations = 0;
        const maxIterations = 100;

        while (iterations < maxIterations && (high - low) > 0.0001) {
            const mid = (low + high) / 2;
            const result = this.calculateRetirementBalance(
                currentAge,
                retirementAge,
                currentSuper,
                annualIncome,
                this.defaultSGRate,
                mid,
                returnRate
            );

            if (result.finalBalance < targetBalance) {
                low = mid;
            } else {
                high = mid;
            }
            iterations++;
        }

        return Math.round((low + high) / 2 * 10000) / 100; // Return as percentage
    }
}

export default SuperannuationCalculator;
