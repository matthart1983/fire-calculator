class SuperannuationCalculator {
    constructor() {
        // Default superannuation guarantee rate (as of 2025)
        this.defaultSGRate = 0.115; // 11.5%
        // Tax rates for superannuation
        this.contributionsTaxRate = 0.15; // 15% on concessional contributions
        this.earningsTaxRate = 0.15; // 15% on fund earnings
        this.medicareLevyRate = 0.02; // 2% Medicare levy
    }

    /**
     * Calculate Australian income tax based on 2024-25 tax brackets
     * @param {number} income - Annual taxable income
     * @returns {number} Total income tax including Medicare levy
     */
    calculateIncomeTax(income) {
        let tax = 0;
        
        // 2024-25 Australian tax brackets
        if (income <= 18200) {
            tax = 0;
        } else if (income <= 45000) {
            tax = (income - 18200) * 0.19;
        } else if (income <= 135000) {
            tax = 5092 + (income - 45000) * 0.325;
        } else if (income <= 190000) {
            tax = 34342 + (income - 135000) * 0.37;
        } else {
            tax = 54692 + (income - 190000) * 0.45;
        }
        
        // Add Medicare levy (2%)
        const medicareLevy = income * this.medicareLevyRate;
        
        return tax + medicareLevy;
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
        
        // Calculate annual employer contribution
        let employerContribution = annualIncome * employerContributionRate;
        let personalContribution = annualIncome * personalContributionRate;
        let currentIncome = annualIncome;
        
        let totalEmployerContributions = 0;
        let totalPersonalContributions = 0;
        let totalReturns = 0;
        let totalFees = 0;
        let totalContributionsTax = 0;
        let totalEarningsTax = 0;

        for (let year = 0; year < years; year++) {
            const currentYear = currentAge + year;
            
            // Apply contributions tax (15% on concessional contributions - employer + salary sacrifice)
            const contributionsTax = (employerContribution + personalContribution) * this.contributionsTaxRate;
            const netEmployerContribution = employerContribution * (1 - this.contributionsTaxRate);
            const netPersonalContribution = personalContribution * (1 - this.contributionsTaxRate);
            
            // Add net contributions to balance
            balance += netEmployerContribution + netPersonalContribution;
            
            // Calculate gross returns for the year
            const grossYearReturn = balance * returnRate;
            
            // Apply earnings tax (15% on investment returns)
            const earningsTax = grossYearReturn * this.earningsTaxRate;
            const netYearReturn = grossYearReturn * (1 - this.earningsTaxRate);
            
            // Apply fees
            const yearFees = balance * feeRate;
            
            // Add net returns and deduct fees
            balance += netYearReturn - yearFees;
            
            // Track totals
            totalEmployerContributions += netEmployerContribution;
            totalPersonalContributions += netPersonalContribution;
            totalReturns += netYearReturn;
            totalFees += yearFees;
            totalContributionsTax += contributionsTax;
            totalEarningsTax += earningsTax;
            
            // Store yearly data
            yearlyData.push({
                age: currentYear + 1,
                balance: Math.round(balance),
                employerContribution: Math.round(netEmployerContribution),
                personalContribution: Math.round(netPersonalContribution),
                returns: Math.round(netYearReturn),
                fees: Math.round(yearFees),
                contributionsTax: Math.round(contributionsTax),
                earningsTax: Math.round(earningsTax)
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
            totalContributionsTax: Math.round(totalContributionsTax),
            totalEarningsTax: Math.round(totalEarningsTax),
            totalTax: Math.round(totalContributionsTax + totalEarningsTax),
            totalContributions: Math.round(totalEmployerContributions + totalPersonalContributions),
            years: years,
            yearlyData: yearlyData,
            assumptions: {
                returnRate: returnRate * 100,
                inflationRate: inflationRate * 100,
                feeRate: feeRate * 100,
                employerContributionRate: employerContributionRate * 100,
                personalContributionRate: personalContributionRate * 100,
                contributionsTaxRate: this.contributionsTaxRate * 100,
                earningsTaxRate: this.earningsTaxRate * 100
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
