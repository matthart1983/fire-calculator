class MortgageVsRentCalculator {
    constructor() {
        this.defaultPropertyAppreciationRate = 0.05; // 5% per year
        this.defaultMaintenanceCostRate = 0.01; // 1% of property value per year
        this.defaultInvestmentReturnRate = 0.07; // 7% per year
    }

    /**
     * Calculate mortgage vs rent comparison
     * @param {number} propertyPrice - Purchase price of property
     * @param {number} deposit - Down payment amount
     * @param {number} mortgageRate - Annual mortgage interest rate as decimal
     * @param {number} mortgageTerm - Mortgage term in years
     * @param {number} monthlyRent - Monthly rent amount
     * @param {number} rentIncreaseRate - Annual rent increase rate as decimal
     * @param {number} propertyAppreciationRate - Annual property appreciation rate as decimal
     * @param {number} investmentReturnRate - Return rate on invested deposit as decimal
     * @param {number} years - Number of years to compare
     * @returns {object} Comparison results
     */
    calculateComparison(
        propertyPrice,
        deposit,
        mortgageRate,
        mortgageTerm,
        monthlyRent,
        rentIncreaseRate = 0.03,
        propertyAppreciationRate = this.defaultPropertyAppreciationRate,
        investmentReturnRate = this.defaultInvestmentReturnRate,
        years = 30
    ) {
        const loanAmount = propertyPrice - deposit;
        
        // Calculate monthly mortgage payment
        const monthlyRate = mortgageRate / 12;
        const totalPayments = mortgageTerm * 12;
        const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                                (Math.pow(1 + monthlyRate, totalPayments) - 1);

        // Buying costs
        const stampDuty = this.calculateStampDuty(propertyPrice);
        const otherBuyingCosts = propertyPrice * 0.05; // Solicitor, inspection, etc. (~5%)
        const totalUpfrontCosts = deposit + stampDuty + otherBuyingCosts;

        // Year-by-year comparison
        const buyingTimeline = [];
        const rentingTimeline = [];
        
        let buyingTotalCost = totalUpfrontCosts;
        let rentingTotalCost = 0;
        let rentingInvestmentValue = deposit; // Renting invests the deposit
        let propertyValue = propertyPrice;
        let remainingBalance = loanAmount;
        let currentRent = monthlyRent;

        for (let year = 1; year <= years; year++) {
            // BUYING scenario
            let annualMortgagePayment = monthlyMortgage * 12;
            let maintenanceCost = propertyValue * this.defaultMaintenanceCostRate;
            let councilRates = 2000; // Approximate annual council rates
            let insuranceCost = 1500; // Approximate annual home insurance
            
            // Calculate interest and principal for the year
            let yearlyInterest = 0;
            let yearlyPrincipal = 0;
            for (let month = 1; month <= 12; month++) {
                let interest = remainingBalance * monthlyRate;
                let principal = monthlyMortgage - interest;
                yearlyInterest += interest;
                yearlyPrincipal += principal;
                remainingBalance = Math.max(0, remainingBalance - principal);
            }

            buyingTotalCost += annualMortgagePayment + maintenanceCost + councilRates + insuranceCost;
            propertyValue *= (1 + propertyAppreciationRate);
            
            const buyingNetPosition = propertyValue - remainingBalance - buyingTotalCost;

            buyingTimeline.push({
                year: year,
                totalCost: Math.round(buyingTotalCost),
                propertyValue: Math.round(propertyValue),
                remainingBalance: Math.round(remainingBalance),
                equity: Math.round(propertyValue - remainingBalance),
                netPosition: Math.round(buyingNetPosition),
                annualCost: Math.round(annualMortgagePayment + maintenanceCost + councilRates + insuranceCost)
            });

            // RENTING scenario
            let annualRent = currentRent * 12;
            rentingTotalCost += annualRent;
            
            // Invest the difference (saved deposit + mortgage payment difference)
            let monthlySavings = monthlyMortgage - currentRent;
            if (monthlySavings > 0) {
                // If mortgage is higher, add savings to investment
                for (let month = 1; month <= 12; month++) {
                    rentingInvestmentValue += monthlySavings;
                    rentingInvestmentValue *= (1 + investmentReturnRate / 12);
                }
            } else {
                // If rent is higher, reduce investment
                rentingInvestmentValue += monthlySavings * 12;
            }
            
            // Also grow existing investment
            if (year === 1) {
                rentingInvestmentValue = deposit * (1 + investmentReturnRate) + (monthlySavings * 12);
            }

            const rentingNetPosition = rentingInvestmentValue - rentingTotalCost;

            rentingTimeline.push({
                year: year,
                totalCost: Math.round(rentingTotalCost),
                investmentValue: Math.round(rentingInvestmentValue),
                netPosition: Math.round(rentingNetPosition),
                annualCost: Math.round(annualRent)
            });

            currentRent *= (1 + rentIncreaseRate);
        }

        // Find break-even point
        let breakEvenYear = null;
        for (let i = 0; i < years; i++) {
            if (buyingTimeline[i].netPosition >= rentingTimeline[i].netPosition) {
                breakEvenYear = i + 1;
                break;
            }
        }

        return {
            buying: {
                upfrontCosts: Math.round(totalUpfrontCosts),
                stampDuty: Math.round(stampDuty),
                monthlyPayment: Math.round(monthlyMortgage),
                finalPropertyValue: Math.round(propertyValue),
                finalEquity: Math.round(propertyValue - remainingBalance),
                totalCost: Math.round(buyingTotalCost),
                finalNetPosition: buyingTimeline[years - 1].netPosition,
                timeline: buyingTimeline
            },
            renting: {
                initialInvestment: Math.round(deposit),
                monthlyRent: Math.round(monthlyRent),
                finalInvestmentValue: Math.round(rentingInvestmentValue),
                totalCost: Math.round(rentingTotalCost),
                finalNetPosition: rentingTimeline[years - 1].netPosition,
                timeline: rentingTimeline
            },
            comparison: {
                breakEvenYear: breakEvenYear,
                buyingAdvantage: buyingTimeline[years - 1].netPosition - rentingTimeline[years - 1].netPosition,
                better: buyingTimeline[years - 1].netPosition >= rentingTimeline[years - 1].netPosition ? 'buying' : 'renting'
            }
        };
    }

    /**
     * Calculate stamp duty (NSW rates as example)
     * @param {number} propertyPrice - Property purchase price
     * @returns {number} Stamp duty amount
     */
    calculateStampDuty(propertyPrice) {
        // NSW stamp duty rates (simplified)
        if (propertyPrice <= 14000) return propertyPrice * 0.0125;
        if (propertyPrice <= 32000) return 175 + (propertyPrice - 14000) * 0.015;
        if (propertyPrice <= 85000) return 445 + (propertyPrice - 32000) * 0.0175;
        if (propertyPrice <= 319000) return 1372.50 + (propertyPrice - 85000) * 0.035;
        if (propertyPrice <= 1064000) return 9567.50 + (propertyPrice - 319000) * 0.045;
        return 43072.50 + (propertyPrice - 1064000) * 0.055;
    }

    /**
     * Calculate affordability - maximum property price based on income
     * @param {number} annualIncome - Annual gross income
     * @param {number} monthlyDebts - Monthly debt obligations
     * @param {number} deposit - Available deposit
     * @param {number} interestRate - Mortgage interest rate as decimal
     * @returns {object} Affordability analysis
     */
    calculateAffordability(annualIncome, monthlyDebts, deposit, interestRate = 0.06) {
        // Bank lending criteria: typically allow 28% of gross income for housing
        const monthlyIncome = annualIncome / 12;
        const maxMonthlyPayment = monthlyIncome * 0.28 - monthlyDebts;
        
        // Calculate maximum loan amount
        const monthlyRate = interestRate / 12;
        const loanTerm = 30 * 12; // 30 years
        const maxLoanAmount = maxMonthlyPayment * (Math.pow(1 + monthlyRate, loanTerm) - 1) / 
                              (monthlyRate * Math.pow(1 + monthlyRate, loanTerm));
        
        const maxPropertyPrice = maxLoanAmount + deposit;
        
        return {
            maxPropertyPrice: Math.round(maxPropertyPrice),
            maxLoanAmount: Math.round(maxLoanAmount),
            maxMonthlyPayment: Math.round(maxMonthlyPayment),
            deposit: Math.round(deposit),
            loanToValueRatio: Math.round((maxLoanAmount / maxPropertyPrice) * 100)
        };
    }
}

export default MortgageVsRentCalculator;
