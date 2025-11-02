class RetirementIncomeCalculator {
    constructor() {
        this.agePensionMaxSingle = 1116.30; // Per fortnight (2024-25)
        this.agePensionMaxCouple = 1682.80; // Per fortnight combined (2024-25)
        this.agePensionAge = 67; // Current age pension eligibility
        this.assetsTestThresholdSingle = 301750; // Homeowner
        this.assetsTestThresholdCouple = 451500; // Homeowner
    }

    /**
     * Calculate safe withdrawal rate with sequence of returns risk
     * @param {number} portfolioValue - Current portfolio value
     * @param {number} annualExpenses - Annual living expenses
     * @param {number} yearsInRetirement - Expected years in retirement
     * @param {number} expectedReturn - Expected average return
     * @param {number} inflationRate - Expected inflation rate
     * @param {number} successRate - Desired success rate (e.g., 0.95 for 95%)
     * @returns {object} Safe withdrawal analysis
     */
    calculateSafeWithdrawal(
        portfolioValue,
        annualExpenses,
        yearsInRetirement = 30,
        expectedReturn = 0.07,
        inflationRate = 0.025,
        successRate = 0.95
    ) {
        // Classic 4% rule adjusted for Australian context
        const safeWithdrawalRate4Percent = 0.04;
        const safeWithdrawal4Percent = portfolioValue * safeWithdrawalRate4Percent;
        
        // Dynamic withdrawal rate based on portfolio size and timeframe
        let dynamicRate = 0.04;
        if (yearsInRetirement > 40) {
            dynamicRate = 0.035; // More conservative for longer retirement
        } else if (yearsInRetirement < 20) {
            dynamicRate = 0.045; // Can afford higher rate for shorter period
        }
        
        const dynamicSafeWithdrawal = portfolioValue * dynamicRate;
        
        // Calculate probability of success
        const requiredWithdrawal = annualExpenses;
        const actualRate = requiredWithdrawal / portfolioValue;
        
        // Simplified Monte Carlo approach - lower rate = higher success
        let estimatedSuccessRate = 1.0;
        if (actualRate > 0.06) {
            estimatedSuccessRate = 0.50;
        } else if (actualRate > 0.05) {
            estimatedSuccessRate = 0.70;
        } else if (actualRate > 0.04) {
            estimatedSuccessRate = 0.90;
        } else if (actualRate > 0.03) {
            estimatedSuccessRate = 0.95;
        }
        
        // Project portfolio depletion
        const timeline = [];
        let remainingBalance = portfolioValue;
        let adjustedExpenses = annualExpenses;
        
        for (let year = 1; year <= yearsInRetirement; year++) {
            // Withdraw at start of year
            remainingBalance -= adjustedExpenses;
            
            // Apply return
            if (remainingBalance > 0) {
                remainingBalance *= (1 + expectedReturn);
            } else {
                remainingBalance = 0;
            }
            
            // Adjust expenses for inflation
            adjustedExpenses *= (1 + inflationRate);
            
            timeline.push({
                year: year,
                withdrawal: Math.round(adjustedExpenses),
                portfolioValue: Math.round(Math.max(0, remainingBalance)),
                withdrawalRate: remainingBalance > 0 ? 
                    Math.round((adjustedExpenses / remainingBalance) * 10000) / 100 : 0
            });
            
            if (remainingBalance <= 0) break;
        }
        
        return {
            portfolioValue: Math.round(portfolioValue),
            safeWithdrawal4Percent: Math.round(safeWithdrawal4Percent),
            dynamicSafeWithdrawal: Math.round(dynamicSafeWithdrawal),
            recommendedRate: Math.round(dynamicRate * 100 * 10) / 10,
            requestedWithdrawal: Math.round(requiredWithdrawal),
            actualRate: Math.round(actualRate * 1000) / 10,
            estimatedSuccessRate: Math.round(estimatedSuccessRate * 100),
            yearsUntilDepletion: timeline[timeline.length - 1]?.year || yearsInRetirement,
            timeline: timeline
        };
    }

    /**
     * Calculate age pension entitlement
     * @param {number} age - Current age
     * @param {number} assessableAssets - Assets for pension assessment
     * @param {number} annualIncome - Annual income from investments
     * @param {boolean} isCouple - Whether applicant is part of a couple
     * @param {boolean} isHomeowner - Whether applicant owns home
     * @returns {object} Age pension calculation
     */
    calculateAgePension(age, assessableAssets, annualIncome, isCouple = false, isHomeowner = true) {
        if (age < this.agePensionAge) {
            return {
                eligible: false,
                reason: `Must be ${this.agePensionAge} or older`,
                currentAge: age,
                yearsUntilEligible: this.agePensionAge - age
            };
        }
        
        const maxPension = isCouple ? this.agePensionMaxCouple : this.agePensionMaxSingle;
        const assetsThreshold = isCouple ? this.assetsTestThresholdCouple : this.assetsTestThresholdSingle;
        
        // Assets test - $1 reduction per fortnight for every $1,000 over threshold
        let assetsTestPension = maxPension;
        if (assessableAssets > assetsThreshold) {
            const excessAssets = assessableAssets - assetsThreshold;
            const reduction = (excessAssets / 1000) * 3; // $3 per fortnight per $1000
            assetsTestPension = Math.max(0, maxPension - reduction);
        }
        
        // Income test - $0.50 reduction for every $1 over free area
        const incomeFreeArea = isCouple ? 336 : 190; // Per fortnight
        const fortnightlyIncome = annualIncome / 26;
        let incomeTestPension = maxPension;
        if (fortnightlyIncome > incomeFreeArea) {
            const excessIncome = fortnightlyIncome - incomeFreeArea;
            const reduction = excessIncome * 0.50;
            incomeTestPension = Math.max(0, maxPension - reduction);
        }
        
        // Take lower of two tests
        const fortnightlyPension = Math.min(assetsTestPension, incomeTestPension);
        const annualPension = fortnightlyPension * 26;
        
        return {
            eligible: fortnightlyPension > 0,
            fortnightlyAmount: Math.round(fortnightlyPension * 100) / 100,
            annualAmount: Math.round(annualPension),
            maxPension: Math.round(maxPension * 26),
            reductionReason: assetsTestPension < incomeTestPension ? 'assets' : 'income',
            assetsTest: {
                assessableAssets: Math.round(assessableAssets),
                threshold: assetsThreshold,
                pensionAmount: Math.round(assetsTestPension * 26)
            },
            incomeTest: {
                annualIncome: Math.round(annualIncome),
                pensionAmount: Math.round(incomeTestPension * 26)
            }
        };
    }

    /**
     * Compare annuity vs account-based pension
     * @param {number} superBalance - Superannuation balance
     * @param {number} annuityRate - Annuity payment rate (as decimal)
     * @param {number} investmentReturn - Expected return on account-based pension
     * @param {number} yearsInRetirement - Expected retirement years
     * @param {number} inflationRate - Expected inflation rate
     * @returns {object} Comparison results
     */
    compareAnnuityVsAccountBased(
        superBalance,
        annuityRate = 0.05,
        investmentReturn = 0.06,
        yearsInRetirement = 30,
        inflationRate = 0.025
    ) {
        const annualAnnuityPayment = superBalance * annuityRate;
        
        // Annuity timeline - fixed payments
        const annuityTimeline = [];
        let totalAnnuityReceived = 0;
        
        for (let year = 1; year <= yearsInRetirement; year++) {
            totalAnnuityReceived += annualAnnuityPayment;
            annuityTimeline.push({
                year: year,
                payment: Math.round(annualAnnuityPayment),
                totalReceived: Math.round(totalAnnuityReceived),
                remainingValue: 0 // Annuity has no residual value
            });
        }
        
        // Account-based pension timeline
        const accountTimeline = [];
        let accountBalance = superBalance;
        let totalAccountReceived = 0;
        const minimumDrawdown = 0.05; // 5% minimum at age 65-74
        
        for (let year = 1; year <= yearsInRetirement; year++) {
            const withdrawal = accountBalance * minimumDrawdown;
            accountBalance -= withdrawal;
            accountBalance *= (1 + investmentReturn);
            totalAccountReceived += withdrawal;
            
            accountTimeline.push({
                year: year,
                payment: Math.round(withdrawal),
                totalReceived: Math.round(totalAccountReceived),
                remainingValue: Math.round(Math.max(0, accountBalance))
            });
            
            if (accountBalance <= 0) {
                // Fill remaining years with zero
                for (let y = year + 1; y <= yearsInRetirement; y++) {
                    accountTimeline.push({
                        year: y,
                        payment: 0,
                        totalReceived: Math.round(totalAccountReceived),
                        remainingValue: 0
                    });
                }
                break;
            }
        }
        
        const finalAccountBalance = accountTimeline[accountTimeline.length - 1].remainingValue;
        
        return {
            initialBalance: Math.round(superBalance),
            annuity: {
                annualPayment: Math.round(annualAnnuityPayment),
                totalReceived: Math.round(totalAnnuityReceived),
                residualValue: 0,
                guaranteedIncome: true,
                timeline: annuityTimeline
            },
            accountBased: {
                initialPayment: Math.round(accountTimeline[0].payment),
                totalReceived: Math.round(totalAccountReceived),
                residualValue: finalAccountBalance,
                guaranteedIncome: false,
                timeline: accountTimeline
            },
            comparison: {
                totalDifference: Math.round((totalAccountReceived + finalAccountBalance) - totalAnnuityReceived),
                better: (totalAccountReceived + finalAccountBalance) > totalAnnuityReceived ? 'accountBased' : 'annuity',
                flexibilityAdvantage: 'accountBased',
                securityAdvantage: 'annuity'
            }
        };
    }

    /**
     * Calculate retirement income from multiple sources
     * @param {number} superBalance - Superannuation balance
     * @param {number} otherInvestments - Other investment portfolio
     * @param {number} rentalIncome - Annual rental income
     * @param {number} age - Current age
     * @param {object} agePensionDetails - Age pension calculation inputs
     * @returns {object} Total retirement income breakdown
     */
    calculateTotalRetirementIncome(
        superBalance,
        otherInvestments,
        rentalIncome,
        age,
        agePensionDetails = {}
    ) {
        // Super drawdown (5% minimum)
        const superDrawdown = superBalance * 0.05;
        
        // Investment income (4% safe withdrawal)
        const investmentIncome = otherInvestments * 0.04;
        
        // Calculate age pension if eligible
        const totalAssets = superBalance + otherInvestments;
        const totalInvestmentIncome = (superBalance + otherInvestments) * 0.04;
        
        const agePension = this.calculateAgePension(
            age,
            totalAssets,
            totalInvestmentIncome,
            agePensionDetails.isCouple || false,
            agePensionDetails.isHomeowner !== false
        );
        
        const totalAnnualIncome = 
            superDrawdown + 
            investmentIncome + 
            rentalIncome + 
            (agePension.eligible ? agePension.annualAmount : 0);
        
        return {
            totalAnnualIncome: Math.round(totalAnnualIncome),
            monthlyIncome: Math.round(totalAnnualIncome / 12),
            breakdown: {
                superannuation: Math.round(superDrawdown),
                investments: Math.round(investmentIncome),
                rentalIncome: Math.round(rentalIncome),
                agePension: agePension.eligible ? Math.round(agePension.annualAmount) : 0
            },
            agePensionDetails: agePension,
            percentages: {
                super: Math.round((superDrawdown / totalAnnualIncome) * 100),
                investments: Math.round((investmentIncome / totalAnnualIncome) * 100),
                rental: Math.round((rentalIncome / totalAnnualIncome) * 100),
                agePension: agePension.eligible ? 
                    Math.round((agePension.annualAmount / totalAnnualIncome) * 100) : 0
            }
        };
    }
}

export default RetirementIncomeCalculator;
