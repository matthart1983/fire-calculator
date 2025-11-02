class NetWorthCalculator {
    constructor() {
        // Categories for assets and liabilities
        this.assetCategories = [
            'Cash & Savings',
            'Investments',
            'Superannuation',
            'Real Estate',
            'Vehicles',
            'Other Assets'
        ];
        
        this.liabilityCategories = [
            'Mortgage',
            'Car Loans',
            'Credit Cards',
            'Student Loans',
            'Personal Loans',
            'Other Debts'
        ];
    }

    /**
     * Calculate net worth from assets and liabilities
     * @param {object} assets - Object with asset categories and amounts
     * @param {object} liabilities - Object with liability categories and amounts
     * @returns {object} Net worth calculation with breakdown
     */
    calculateNetWorth(assets = {}, liabilities = {}) {
        // Calculate total assets
        const totalAssets = Object.values(assets).reduce((sum, value) => {
            return sum + (parseFloat(value) || 0);
        }, 0);

        // Calculate total liabilities
        const totalLiabilities = Object.values(liabilities).reduce((sum, value) => {
            return sum + (parseFloat(value) || 0);
        }, 0);

        // Calculate net worth
        const netWorth = totalAssets - totalLiabilities;

        // Calculate percentages
        const assetBreakdown = {};
        for (const [category, amount] of Object.entries(assets)) {
            const value = parseFloat(amount) || 0;
            if (value > 0) {
                assetBreakdown[category] = {
                    amount: value,
                    percentage: totalAssets > 0 ? (value / totalAssets) * 100 : 0
                };
            }
        }

        const liabilityBreakdown = {};
        for (const [category, amount] of Object.entries(liabilities)) {
            const value = parseFloat(amount) || 0;
            if (value > 0) {
                liabilityBreakdown[category] = {
                    amount: value,
                    percentage: totalLiabilities > 0 ? (value / totalLiabilities) * 100 : 0
                };
            }
        }

        return {
            netWorth: Math.round(netWorth),
            totalAssets: Math.round(totalAssets),
            totalLiabilities: Math.round(totalLiabilities),
            assetBreakdown,
            liabilityBreakdown,
            debtToAssetRatio: totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0,
            liquidityRatio: this.calculateLiquidityRatio(assets, totalAssets)
        };
    }

    /**
     * Calculate liquidity ratio (liquid assets / total assets)
     * @param {object} assets - Object with asset categories and amounts
     * @param {number} totalAssets - Total assets amount
     * @returns {number} Liquidity ratio as percentage
     */
    calculateLiquidityRatio(assets, totalAssets) {
        const liquidAssets = (parseFloat(assets['Cash & Savings']) || 0) + 
                            (parseFloat(assets['Investments']) || 0);
        
        return totalAssets > 0 ? (liquidAssets / totalAssets) * 100 : 0;
    }

    /**
     * Project net worth growth over time
     * @param {number} currentNetWorth - Current net worth
     * @param {number} monthlySavings - Monthly savings amount
     * @param {number} investmentReturn - Expected annual return rate (as decimal)
     * @param {number} years - Number of years to project
     * @returns {array} Yearly projection of net worth
     */
    projectNetWorthGrowth(currentNetWorth, monthlySavings, investmentReturn = 0.07, years = 10) {
        const projection = [];
        let netWorth = currentNetWorth;
        const monthlyReturn = investmentReturn / 12;

        projection.push({
            year: 0,
            netWorth: Math.round(currentNetWorth),
            totalContributions: 0,
            totalReturns: 0
        });

        let totalContributions = 0;
        let totalReturns = 0;

        for (let year = 1; year <= years; year++) {
            for (let month = 1; month <= 12; month++) {
                const returns = netWorth * monthlyReturn;
                netWorth += returns + monthlySavings;
                totalContributions += monthlySavings;
                totalReturns += returns;
            }

            projection.push({
                year,
                netWorth: Math.round(netWorth),
                totalContributions: Math.round(totalContributions),
                totalReturns: Math.round(totalReturns)
            });
        }

        return projection;
    }
}

export default NetWorthCalculator;
