class TaxCalculator {
    constructor() {
        // 2024-25 Australian tax brackets
        this.taxBrackets = [
            { min: 0, max: 18200, rate: 0, baseAmount: 0 },
            { min: 18201, max: 45000, rate: 0.19, baseAmount: 0 },
            { min: 45001, max: 120000, rate: 0.325, baseAmount: 5092 },
            { min: 120001, max: 180000, rate: 0.37, baseAmount: 29467 },
            { min: 180001, max: Infinity, rate: 0.45, baseAmount: 51667 }
        ];

        // Medicare levy
        this.medicareRate = 0.02; // 2%
        this.medicareThreshold = 24276; // Single, no dependents
        
        // Low and Middle Income Tax Offset (LMITO) - ended 2021-22
        // Low Income Tax Offset (LITO)
        this.litoMax = 700;
        this.litoThreshold = 37500;
        this.litoPhaseOutRate = 0.05;
        this.litoPhaseOutEnd = 66667;
    }

    /**
     * Calculate income tax based on Australian tax brackets
     * @param {number} annualIncome - Annual gross income
     * @returns {number} Income tax amount
     */
    calculateIncomeTax(annualIncome) {
        let tax = 0;

        for (const bracket of this.taxBrackets) {
            if (annualIncome > bracket.min) {
                const taxableInBracket = Math.min(annualIncome, bracket.max) - bracket.min + 1;
                tax = bracket.baseAmount + (taxableInBracket * bracket.rate);
            }
        }

        return tax;
    }

    /**
     * Calculate Low Income Tax Offset (LITO)
     * @param {number} annualIncome - Annual gross income
     * @returns {number} LITO offset amount
     */
    calculateLITO(annualIncome) {
        if (annualIncome <= this.litoThreshold) {
            return this.litoMax;
        } else if (annualIncome < this.litoPhaseOutEnd) {
            const reduction = (annualIncome - this.litoThreshold) * this.litoPhaseOutRate;
            return Math.max(0, this.litoMax - reduction);
        }
        return 0;
    }

    /**
     * Calculate Medicare Levy
     * @param {number} annualIncome - Annual gross income
     * @returns {number} Medicare levy amount
     */
    calculateMedicareLevy(annualIncome) {
        if (annualIncome <= this.medicareThreshold) {
            return 0;
        }
        
        // Shading in threshold (between threshold and threshold + $3,740)
        const shadingMax = this.medicareThreshold + 3740;
        if (annualIncome <= shadingMax) {
            return (annualIncome - this.medicareThreshold) * 0.10;
        }
        
        return annualIncome * this.medicareRate;
    }

    /**
     * Calculate superannuation contribution
     * @param {number} annualIncome - Annual gross income
     * @param {number} superRate - Super contribution rate (default 11.5% for 2024-25)
     * @returns {number} Super contribution amount
     */
    calculateSuper(annualIncome, superRate = 0.115) {
        return annualIncome * superRate;
    }

    /**
     * Calculate net salary from gross annual salary
     * @param {number} annualSalary - Annual gross salary
     * @param {boolean} includeSuperInPackage - Whether super is included in package
     * @param {number} superRate - Super contribution rate
     * @param {number} preTaxDeductions - Pre-tax deductions (salary sacrifice, etc.)
     * @param {number} postTaxDeductions - Post-tax deductions
     * @returns {object} Detailed breakdown of salary calculations
     */
    calculateNetSalary(
        annualSalary,
        includeSuperInPackage = false,
        superRate = 0.115,
        preTaxDeductions = 0,
        postTaxDeductions = 0
    ) {
        // Calculate base salary (excluding super if it's included in package)
        let baseSalary = annualSalary;
        let superContribution = 0;
        
        if (includeSuperInPackage) {
            // Super is included in the package, so we need to back-calculate
            baseSalary = annualSalary / (1 + superRate);
            superContribution = annualSalary - baseSalary;
        } else {
            // Super is on top of salary
            superContribution = this.calculateSuper(annualSalary, superRate);
        }

        // Apply pre-tax deductions
        const taxableIncome = baseSalary - preTaxDeductions;

        // Calculate income tax
        const incomeTax = this.calculateIncomeTax(taxableIncome);
        
        // Calculate LITO
        const lito = this.calculateLITO(taxableIncome);
        
        // Calculate Medicare levy
        const medicareLevy = this.calculateMedicareLevy(taxableIncome);
        
        // Total tax
        const totalTax = Math.max(0, incomeTax - lito + medicareLevy);
        
        // Net income
        const netIncome = taxableIncome - totalTax - postTaxDeductions;
        
        // Effective tax rate
        const effectiveTaxRate = (totalTax / taxableIncome) * 100;
        
        // Marginal tax rate
        const marginalTaxRate = this.getMarginalTaxRate(taxableIncome);

        return {
            gross: {
                annualSalary: Math.round(annualSalary),
                monthlySalary: Math.round(annualSalary / 12),
                fortnightlySalary: Math.round(annualSalary / 26),
                weeklySalary: Math.round(annualSalary / 52)
            },
            superannuation: {
                annual: Math.round(superContribution),
                monthly: Math.round(superContribution / 12),
                rate: Math.round(superRate * 100 * 10) / 10,
                includedInPackage: includeSuperInPackage
            },
            taxableIncome: Math.round(taxableIncome),
            tax: {
                incomeTax: Math.round(incomeTax),
                lito: Math.round(lito),
                medicareLevy: Math.round(medicareLevy),
                totalTax: Math.round(totalTax),
                effectiveRate: Math.round(effectiveTaxRate * 10) / 10,
                marginalRate: marginalTaxRate
            },
            deductions: {
                preTax: Math.round(preTaxDeductions),
                postTax: Math.round(postTaxDeductions),
                total: Math.round(preTaxDeductions + postTaxDeductions)
            },
            net: {
                annualIncome: Math.round(netIncome),
                monthlyIncome: Math.round(netIncome / 12),
                fortnightlyIncome: Math.round(netIncome / 26),
                weeklyIncome: Math.round(netIncome / 52),
                dailyIncome: Math.round(netIncome / 365)
            },
            takeHomePercentage: Math.round((netIncome / annualSalary) * 100 * 10) / 10
        };
    }

    /**
     * Get marginal tax rate for given income
     * @param {number} taxableIncome - Taxable income
     * @returns {number} Marginal tax rate as percentage
     */
    getMarginalTaxRate(taxableIncome) {
        for (const bracket of this.taxBrackets) {
            if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
                const baseRate = bracket.rate * 100;
                // Add Medicare levy to marginal rate (for most earners)
                return Math.round((baseRate + 2) * 10) / 10;
            }
        }
        return 47; // Top rate + Medicare
    }

    /**
     * Calculate how much salary increase is needed to achieve desired take-home pay increase
     * @param {number} currentSalary - Current annual salary
     * @param {number} desiredTakeHomeIncrease - Desired increase in take-home pay
     * @returns {object} Required salary increase and breakdown
     */
    calculateRequiredSalaryIncrease(currentSalary, desiredTakeHomeIncrease) {
        const currentNet = this.calculateNetSalary(currentSalary);
        const targetTakeHome = currentNet.net.annualIncome + desiredTakeHomeIncrease;
        
        // Binary search for required gross salary
        let low = currentSalary;
        let high = currentSalary * 3; // Reasonable upper bound
        let targetSalary = currentSalary;
        
        while (high - low > 1) {
            const mid = (low + high) / 2;
            const result = this.calculateNetSalary(mid);
            
            if (result.net.annualIncome < targetTakeHome) {
                low = mid;
            } else {
                high = mid;
                targetSalary = mid;
            }
        }
        
        const newNet = this.calculateNetSalary(targetSalary);
        const salaryIncrease = targetSalary - currentSalary;
        
        return {
            currentSalary: Math.round(currentSalary),
            requiredSalary: Math.round(targetSalary),
            salaryIncrease: Math.round(salaryIncrease),
            salaryIncreasePercentage: Math.round((salaryIncrease / currentSalary) * 100 * 10) / 10,
            currentTakeHome: currentNet.net.annualIncome,
            newTakeHome: newNet.net.annualIncome,
            takeHomeIncrease: newNet.net.annualIncome - currentNet.net.annualIncome,
            taxOnIncrease: Math.round(salaryIncrease - (newNet.net.annualIncome - currentNet.net.annualIncome))
        };
    }

    /**
     * Compare multiple salary scenarios
     * @param {array} salaries - Array of salary amounts to compare
     * @returns {array} Array of calculations for each salary
     */
    compareSalaries(salaries) {
        return salaries.map(salary => {
            const result = this.calculateNetSalary(salary);
            return {
                salary: salary,
                ...result
            };
        });
    }

    /**
     * Calculate salary needed to achieve target take-home pay
     * @param {number} targetTakeHome - Desired annual take-home pay
     * @returns {object} Required gross salary and breakdown
     */
    calculateRequiredGrossSalary(targetTakeHome) {
        // Binary search for required gross salary
        let low = targetTakeHome;
        let high = targetTakeHome * 2;
        let requiredSalary = targetTakeHome;
        
        while (high - low > 1) {
            const mid = (low + high) / 2;
            const result = this.calculateNetSalary(mid);
            
            if (result.net.annualIncome < targetTakeHome) {
                low = mid;
            } else {
                high = mid;
                requiredSalary = mid;
            }
        }
        
        const result = this.calculateNetSalary(requiredSalary);
        
        return {
            targetTakeHome: Math.round(targetTakeHome),
            requiredGrossSalary: Math.round(requiredSalary),
            actualTakeHome: result.net.annualIncome,
            taxPayable: result.tax.totalTax,
            superannuation: result.superannuation.annual
        };
    }
}

export default TaxCalculator;
