class LoanCalculator {
    constructor() {
        // Default values
        this.defaultInterestRate = 0.05; // 5%
    }

    /**
     * Calculate loan repayment details
     * @param {number} loanAmount - Principal loan amount
     * @param {number} annualInterestRate - Annual interest rate as decimal (e.g., 0.05 for 5%)
     * @param {number} loanTermYears - Loan term in years
     * @param {string} paymentFrequency - Payment frequency (weekly, fortnightly, monthly)
     * @returns {object} Loan repayment details
     */
    calculateLoanRepayment(loanAmount, annualInterestRate, loanTermYears, paymentFrequency = 'monthly') {
        if (loanAmount <= 0) {
            throw new Error("Loan amount must be greater than zero.");
        }
        if (loanTermYears <= 0) {
            throw new Error("Loan term must be greater than zero.");
        }

        const frequencies = {
            weekly: 52,
            fortnightly: 26,
            monthly: 12
        };

        const paymentsPerYear = frequencies[paymentFrequency] || 12;
        const totalPayments = loanTermYears * paymentsPerYear;
        const ratePerPeriod = annualInterestRate / paymentsPerYear;

        // Calculate payment using loan payment formula
        let payment = 0;
        if (annualInterestRate === 0) {
            payment = loanAmount / totalPayments;
        } else {
            payment = loanAmount * (ratePerPeriod * Math.pow(1 + ratePerPeriod, totalPayments)) / 
                      (Math.pow(1 + ratePerPeriod, totalPayments) - 1);
        }

        // Generate amortization schedule
        const schedule = this.generateAmortizationSchedule(
            loanAmount,
            payment,
            ratePerPeriod,
            totalPayments,
            paymentFrequency
        );

        const totalPaid = payment * totalPayments;
        const totalInterest = totalPaid - loanAmount;

        return {
            loanAmount: Math.round(loanAmount),
            payment: Math.round(payment * 100) / 100,
            totalPayments: totalPayments,
            totalPaid: Math.round(totalPaid),
            totalInterest: Math.round(totalInterest),
            paymentFrequency: paymentFrequency,
            interestRate: annualInterestRate * 100,
            loanTermYears: loanTermYears,
            schedule: schedule
        };
    }

    /**
     * Generate amortization schedule
     * @param {number} principal - Loan principal
     * @param {number} payment - Payment amount per period
     * @param {number} ratePerPeriod - Interest rate per period
     * @param {number} totalPayments - Total number of payments
     * @param {string} paymentFrequency - Payment frequency
     * @returns {array} Amortization schedule
     */
    generateAmortizationSchedule(principal, payment, ratePerPeriod, totalPayments, paymentFrequency) {
        let balance = principal;
        const schedule = [];
        let cumulativePrincipal = 0;
        let cumulativeInterest = 0;

        const paymentsPerYear = {
            weekly: 52,
            fortnightly: 26,
            monthly: 12
        }[paymentFrequency] || 12;

        for (let i = 1; i <= totalPayments; i++) {
            const interestPayment = balance * ratePerPeriod;
            const principalPayment = payment - interestPayment;
            balance -= principalPayment;
            
            cumulativePrincipal += principalPayment;
            cumulativeInterest += interestPayment;

            // Store yearly snapshots or every 12 payments
            if (i % paymentsPerYear === 0 || i === totalPayments) {
                schedule.push({
                    payment: i,
                    year: Math.ceil(i / paymentsPerYear),
                    principalPayment: Math.round(principalPayment * 100) / 100,
                    interestPayment: Math.round(interestPayment * 100) / 100,
                    totalPayment: Math.round(payment * 100) / 100,
                    remainingBalance: Math.max(0, Math.round(balance)),
                    cumulativePrincipal: Math.round(cumulativePrincipal),
                    cumulativeInterest: Math.round(cumulativeInterest)
                });
            }
        }

        return schedule;
    }

    /**
     * Calculate how much you can borrow based on desired payment
     * @param {number} desiredPayment - What you can afford to pay per period
     * @param {number} annualInterestRate - Annual interest rate as decimal
     * @param {number} loanTermYears - Loan term in years
     * @param {string} paymentFrequency - Payment frequency
     * @returns {number} Maximum loan amount
     */
    calculateBorrowingCapacity(desiredPayment, annualInterestRate, loanTermYears, paymentFrequency = 'monthly') {
        const frequencies = {
            weekly: 52,
            fortnightly: 26,
            monthly: 12
        };

        const paymentsPerYear = frequencies[paymentFrequency] || 12;
        const totalPayments = loanTermYears * paymentsPerYear;
        const ratePerPeriod = annualInterestRate / paymentsPerYear;

        if (annualInterestRate === 0) {
            return desiredPayment * totalPayments;
        }

        // Reverse the loan payment formula to find principal
        const loanAmount = desiredPayment * (Math.pow(1 + ratePerPeriod, totalPayments) - 1) / 
                          (ratePerPeriod * Math.pow(1 + ratePerPeriod, totalPayments));

        return Math.round(loanAmount);
    }

    /**
     * Calculate impact of extra payments
     * @param {number} loanAmount - Principal loan amount
     * @param {number} annualInterestRate - Annual interest rate as decimal
     * @param {number} loanTermYears - Loan term in years
     * @param {number} extraPayment - Additional payment per period
     * @param {string} paymentFrequency - Payment frequency
     * @returns {object} Comparison with and without extra payments
     */
    calculateExtraPaymentImpact(loanAmount, annualInterestRate, loanTermYears, extraPayment, paymentFrequency = 'monthly') {
        // Calculate standard loan
        const standard = this.calculateLoanRepayment(loanAmount, annualInterestRate, loanTermYears, paymentFrequency);

        // Calculate with extra payments
        const frequencies = {
            weekly: 52,
            fortnightly: 26,
            monthly: 12
        };

        const paymentsPerYear = frequencies[paymentFrequency] || 12;
        const ratePerPeriod = annualInterestRate / paymentsPerYear;
        const enhancedPayment = standard.payment + extraPayment;

        let balance = loanAmount;
        let payments = 0;
        let totalInterest = 0;
        const maxPayments = loanTermYears * paymentsPerYear;

        while (balance > 0 && payments < maxPayments * 2) {
            payments++;
            const interestPayment = balance * ratePerPeriod;
            const principalPayment = Math.min(enhancedPayment - interestPayment, balance);
            balance -= principalPayment;
            totalInterest += interestPayment;
        }

        const yearsWithExtra = payments / paymentsPerYear;
        const totalPaidWithExtra = enhancedPayment * payments;

        return {
            standard: {
                payment: standard.payment,
                totalPayments: standard.totalPayments,
                totalPaid: standard.totalPaid,
                totalInterest: standard.totalInterest,
                years: loanTermYears
            },
            withExtra: {
                payment: Math.round(enhancedPayment * 100) / 100,
                totalPayments: payments,
                totalPaid: Math.round(totalPaidWithExtra),
                totalInterest: Math.round(totalInterest),
                years: Math.round(yearsWithExtra * 10) / 10
            },
            savings: {
                interestSaved: Math.round(standard.totalInterest - totalInterest),
                timeSaved: Math.round((loanTermYears - yearsWithExtra) * 10) / 10
            }
        };
    }
}

export default LoanCalculator;
