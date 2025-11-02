class InvestmentPortfolioCalculator {
    constructor() {
        this.defaultAssetAllocation = {
            stocks: 0.60,
            bonds: 0.30,
            property: 0.05,
            cash: 0.05
        };
        
        this.defaultReturns = {
            stocks: 0.10,      // 10% average annual return
            bonds: 0.04,       // 4% average annual return
            property: 0.08,    // 8% average annual return
            cash: 0.02         // 2% average annual return
        };
        
        this.defaultVolatility = {
            stocks: 0.18,      // 18% standard deviation
            bonds: 0.06,       // 6% standard deviation
            property: 0.12,    // 12% standard deviation
            cash: 0.01         // 1% standard deviation
        };
    }

    /**
     * Calculate portfolio performance and projections
     * @param {number} initialInvestment - Starting portfolio value
     * @param {number} monthlyContribution - Monthly contribution amount
     * @param {object} allocation - Asset allocation percentages
     * @param {object} expectedReturns - Expected returns by asset class
     * @param {number} years - Investment timeframe in years
     * @param {number} inflationRate - Annual inflation rate
     * @returns {object} Portfolio projections
     */
    calculatePortfolioGrowth(
        initialInvestment,
        monthlyContribution,
        allocation = this.defaultAssetAllocation,
        expectedReturns = this.defaultReturns,
        years = 30,
        inflationRate = 0.025
    ) {
        // Calculate weighted average return
        const weightedReturn = 
            allocation.stocks * expectedReturns.stocks +
            allocation.bonds * expectedReturns.bonds +
            allocation.property * expectedReturns.property +
            allocation.cash * expectedReturns.cash;

        // Year-by-year projection
        const timeline = [];
        let portfolioValue = initialInvestment;
        let totalContributions = initialInvestment;
        
        for (let year = 1; year <= years; year++) {
            // Add monthly contributions with compound growth
            for (let month = 1; month <= 12; month++) {
                portfolioValue += monthlyContribution;
                portfolioValue *= (1 + weightedReturn / 12);
                totalContributions += monthlyContribution;
            }

            const gainLoss = portfolioValue - totalContributions;
            const realValue = portfolioValue / Math.pow(1 + inflationRate, year);

            timeline.push({
                year: year,
                portfolioValue: Math.round(portfolioValue),
                totalContributions: Math.round(totalContributions),
                gainLoss: Math.round(gainLoss),
                realValue: Math.round(realValue),
                breakdown: {
                    stocks: Math.round(portfolioValue * allocation.stocks),
                    bonds: Math.round(portfolioValue * allocation.bonds),
                    property: Math.round(portfolioValue * allocation.property),
                    cash: Math.round(portfolioValue * allocation.cash)
                }
            });
        }

        return {
            finalValue: Math.round(portfolioValue),
            totalContributions: Math.round(totalContributions),
            totalGains: Math.round(portfolioValue - totalContributions),
            realValue: Math.round(portfolioValue / Math.pow(1 + inflationRate, years)),
            weightedReturn: Math.round(weightedReturn * 10000) / 100,
            timeline: timeline
        };
    }

    /**
     * Optimize asset allocation based on risk tolerance and timeframe
     * @param {number} age - Current age
     * @param {number} retirementAge - Target retirement age
     * @param {string} riskTolerance - Risk level: 'conservative', 'moderate', 'aggressive'
     * @returns {object} Recommended allocation
     */
    optimizeAllocation(age, retirementAge, riskTolerance = 'moderate') {
        const yearsToRetirement = retirementAge - age;
        
        // Rule of thumb: stock allocation = 100 - age (adjusted for risk tolerance)
        let baseStockAllocation = (100 - age) / 100;
        
        // Adjust for risk tolerance
        const riskAdjustments = {
            conservative: -0.20,
            moderate: 0,
            aggressive: 0.20
        };
        
        let stockAllocation = Math.max(0.20, Math.min(0.90, 
            baseStockAllocation + (riskAdjustments[riskTolerance] || 0)));
        
        // Allocate remainder between bonds, property, and cash
        let bondAllocation = 0;
        let propertyAllocation = 0;
        let cashAllocation = 0;
        
        if (yearsToRetirement < 5) {
            // Close to retirement - more conservative
            bondAllocation = (1 - stockAllocation) * 0.60;
            cashAllocation = (1 - stockAllocation) * 0.30;
            propertyAllocation = (1 - stockAllocation) * 0.10;
        } else if (yearsToRetirement < 15) {
            // Mid-range - balanced
            bondAllocation = (1 - stockAllocation) * 0.50;
            propertyAllocation = (1 - stockAllocation) * 0.30;
            cashAllocation = (1 - stockAllocation) * 0.20;
        } else {
            // Long-term - growth focused
            bondAllocation = (1 - stockAllocation) * 0.40;
            propertyAllocation = (1 - stockAllocation) * 0.50;
            cashAllocation = (1 - stockAllocation) * 0.10;
        }
        
        return {
            stocks: Math.round(stockAllocation * 100) / 100,
            bonds: Math.round(bondAllocation * 100) / 100,
            property: Math.round(propertyAllocation * 100) / 100,
            cash: Math.round(cashAllocation * 100) / 100,
            riskLevel: riskTolerance,
            yearsToRetirement: yearsToRetirement
        };
    }

    /**
     * Calculate rebalancing requirements
     * @param {object} currentAllocation - Current dollar amounts by asset class
     * @param {object} targetAllocation - Target percentages by asset class
     * @returns {object} Rebalancing instructions
     */
    calculateRebalancing(currentAllocation, targetAllocation) {
        const totalValue = 
            currentAllocation.stocks + 
            currentAllocation.bonds + 
            currentAllocation.property + 
            currentAllocation.cash;

        const currentPercentages = {
            stocks: currentAllocation.stocks / totalValue,
            bonds: currentAllocation.bonds / totalValue,
            property: currentAllocation.property / totalValue,
            cash: currentAllocation.cash / totalValue
        };

        const targetAmounts = {
            stocks: totalValue * targetAllocation.stocks,
            bonds: totalValue * targetAllocation.bonds,
            property: totalValue * targetAllocation.property,
            cash: totalValue * targetAllocation.cash
        };

        const adjustments = {
            stocks: targetAmounts.stocks - currentAllocation.stocks,
            bonds: targetAmounts.bonds - currentAllocation.bonds,
            property: targetAmounts.property - currentAllocation.property,
            cash: targetAmounts.cash - currentAllocation.cash
        };

        const rebalancingNeeded = Object.values(adjustments).some(adj => Math.abs(adj) > totalValue * 0.05);

        return {
            totalValue: Math.round(totalValue),
            currentPercentages: {
                stocks: Math.round(currentPercentages.stocks * 100),
                bonds: Math.round(currentPercentages.bonds * 100),
                property: Math.round(currentPercentages.property * 100),
                cash: Math.round(currentPercentages.cash * 100)
            },
            targetAmounts: {
                stocks: Math.round(targetAmounts.stocks),
                bonds: Math.round(targetAmounts.bonds),
                property: Math.round(targetAmounts.property),
                cash: Math.round(targetAmounts.cash)
            },
            adjustments: {
                stocks: Math.round(adjustments.stocks),
                bonds: Math.round(adjustments.bonds),
                property: Math.round(adjustments.property),
                cash: Math.round(adjustments.cash)
            },
            rebalancingNeeded: rebalancingNeeded
        };
    }

    /**
     * Calculate tax-efficient withdrawal strategy
     * @param {number} portfolioValue - Current portfolio value
     * @param {number} annualWithdrawal - Desired annual withdrawal
     * @param {object} allocation - Current allocation
     * @param {number} capitalGainsTaxRate - Capital gains tax rate
     * @returns {object} Tax-efficient withdrawal strategy
     */
    calculateTaxEfficientWithdrawal(
        portfolioValue,
        annualWithdrawal,
        allocation,
        capitalGainsTaxRate = 0.25 // 50% discount applied to 50% rate
    ) {
        // Priority: 1. Cash, 2. Bonds, 3. Property, 4. Stocks (to minimize tax)
        const withdrawalPlan = [];
        let remaining = annualWithdrawal;
        let totalTax = 0;

        const assetPriority = [
            { name: 'cash', value: portfolioValue * allocation.cash, taxRate: 0 },
            { name: 'bonds', value: portfolioValue * allocation.bonds, taxRate: 0.15 }, // Interest taxed lower
            { name: 'property', value: portfolioValue * allocation.property, taxRate: capitalGainsTaxRate },
            { name: 'stocks', value: portfolioValue * allocation.stocks, taxRate: capitalGainsTaxRate }
        ];

        for (const asset of assetPriority) {
            if (remaining <= 0) break;
            
            const withdrawAmount = Math.min(remaining, asset.value);
            const taxOnWithdrawal = withdrawAmount * 0.5 * asset.taxRate; // Assume 50% is capital gain
            
            withdrawalPlan.push({
                asset: asset.name,
                amount: Math.round(withdrawAmount),
                tax: Math.round(taxOnWithdrawal),
                afterTax: Math.round(withdrawAmount - taxOnWithdrawal)
            });
            
            totalTax += taxOnWithdrawal;
            remaining -= withdrawAmount;
        }

        return {
            requestedWithdrawal: Math.round(annualWithdrawal),
            totalTax: Math.round(totalTax),
            netWithdrawal: Math.round(annualWithdrawal - totalTax),
            effectiveTaxRate: Math.round((totalTax / annualWithdrawal) * 100),
            withdrawalPlan: withdrawalPlan
        };
    }

    /**
     * Simulate dollar-cost averaging vs lump sum
     * @param {number} totalAmount - Total amount to invest
     * @param {number} monthlyAmount - Monthly investment amount (for DCA)
     * @param {number} expectedReturn - Expected annual return
     * @param {number} volatility - Annual volatility (standard deviation)
     * @param {number} years - Investment period
     * @returns {object} Comparison results
     */
    calculateDCAvsLumpSum(totalAmount, monthlyAmount, expectedReturn = 0.08, volatility = 0.15, years = 10) {
        // Simplified comparison
        const monthlyReturn = expectedReturn / 12;
        const months = years * 12;
        
        // Lump sum scenario
        const lumpSumFinal = totalAmount * Math.pow(1 + expectedReturn, years);
        
        // DCA scenario
        let dcaValue = 0;
        const dcaMonths = Math.min(months, Math.floor(totalAmount / monthlyAmount));
        
        for (let month = 0; month < dcaMonths; month++) {
            const remainingMonths = months - month;
            dcaValue += monthlyAmount * Math.pow(1 + monthlyReturn, remainingMonths);
        }
        
        // If there's remaining amount after DCA period, invest it as lump sum
        const remainingAmount = totalAmount - (monthlyAmount * dcaMonths);
        if (remainingAmount > 0) {
            const remainingMonths = months - dcaMonths;
            dcaValue += remainingAmount * Math.pow(1 + monthlyReturn, remainingMonths);
        }
        
        return {
            lumpSum: {
                initialInvestment: Math.round(totalAmount),
                finalValue: Math.round(lumpSumFinal),
                gain: Math.round(lumpSumFinal - totalAmount)
            },
            dollarCostAveraging: {
                totalInvested: Math.round(totalAmount),
                monthlyAmount: Math.round(monthlyAmount),
                investmentPeriod: dcaMonths,
                finalValue: Math.round(dcaValue),
                gain: Math.round(dcaValue - totalAmount)
            },
            comparison: {
                difference: Math.round(lumpSumFinal - dcaValue),
                better: lumpSumFinal > dcaValue ? 'lumpSum' : 'dca',
                percentageDifference: Math.round(((lumpSumFinal - dcaValue) / dcaValue) * 100)
            }
        };
    }
}

export default InvestmentPortfolioCalculator;
