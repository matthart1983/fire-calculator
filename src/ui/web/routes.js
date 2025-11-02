import express from 'express';
import FireCalculator from '../../calculators/fireCalculator.js';
import SuperannuationCalculator from '../../calculators/superannuationCalculator.js';
import NetWorthCalculator from '../../calculators/netWorthCalculator.js';
import SavingsCalculator from '../../calculators/savingsCalculator.js';
import LoanCalculator from '../../calculators/loanCalculator.js';
import MortgageVsRentCalculator from '../../calculators/mortgageVsRentCalculator.js';
import RetirementIncomeCalculator from '../../calculators/retirementIncomeCalculator.js';
import TaxCalculator from '../../calculators/taxCalculator.js';

const router = express.Router();
const calculator = new FireCalculator();
const superCalculator = new SuperannuationCalculator();
const netWorthCalculator = new NetWorthCalculator();
const savingsCalculator = new SavingsCalculator();
const loanCalculator = new LoanCalculator();
const mortgageVsRentCalculator = new MortgageVsRentCalculator();
const retirementIncomeCalculator = new RetirementIncomeCalculator();
const taxCalculator = new TaxCalculator();

router.get('/savings-goal', (req, res) => {
    try {
        const { monthlyExpenses, withdrawalRate } = req.query;
        const goal = calculator.calculateSavingsGoal(Number(monthlyExpenses), Number(withdrawalRate));
        res.json({ savingsGoal: goal });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/withdrawal-rate', (req, res) => {
    try {
        const { savingsGoal, monthlyExpenses } = req.query;
        const rate = calculator.calculateWithdrawalRate(Number(savingsGoal), Number(monthlyExpenses));
        res.json({ withdrawalRate: rate });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/superannuation/calculate', (req, res) => {
    try {
        const {
            currentAge,
            retirementAge,
            currentSuper,
            annualIncome,
            employerContributionRate,
            personalContributionRate,
            returnRate,
            inflationRate,
            feeRate
        } = req.body;

        const result = superCalculator.calculateRetirementBalance(
            Number(currentAge),
            Number(retirementAge),
            Number(currentSuper),
            Number(annualIncome),
            employerContributionRate ? Number(employerContributionRate) / 100 : undefined,
            personalContributionRate ? Number(personalContributionRate) / 100 : undefined,
            returnRate ? Number(returnRate) / 100 : undefined,
            inflationRate ? Number(inflationRate) / 100 : undefined,
            feeRate ? Number(feeRate) / 100 : undefined
        );

        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/superannuation/required-contributions', (req, res) => {
    try {
        const {
            currentAge,
            retirementAge,
            currentSuper,
            targetBalance,
            annualIncome,
            returnRate
        } = req.body;

        const requiredRate = superCalculator.calculateRequiredContributions(
            Number(currentAge),
            Number(retirementAge),
            Number(currentSuper),
            Number(targetBalance),
            Number(annualIncome),
            returnRate ? Number(returnRate) / 100 : undefined
        );

        res.json({ requiredPersonalContributionRate: requiredRate });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/networth/calculate', (req, res) => {
    try {
        const { assets, liabilities } = req.body;
        const result = netWorthCalculator.calculateNetWorth(assets, liabilities);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/networth/projection', (req, res) => {
    try {
        const { currentNetWorth, monthlySavings, investmentReturn, years } = req.body;
        const projection = netWorthCalculator.projectNetWorthGrowth(
            Number(currentNetWorth),
            Number(monthlySavings),
            investmentReturn ? Number(investmentReturn) / 100 : undefined,
            Number(years) || 10
        );
        res.json({ projection });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/savings/calculate', (req, res) => {
    try {
        const { initialBalance, monthlyContribution, annualInterestRate, years, compoundingFrequency } = req.body;
        const result = savingsCalculator.calculateSavingsGrowth(
            Number(initialBalance),
            Number(monthlyContribution),
            Number(annualInterestRate) / 100,
            Number(years),
            compoundingFrequency || 'monthly'
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/savings/time-to-goal', (req, res) => {
    try {
        const { initialBalance, targetAmount, monthlyContribution, annualInterestRate } = req.body;
        const result = savingsCalculator.calculateTimeToGoal(
            Number(initialBalance),
            Number(targetAmount),
            Number(monthlyContribution),
            Number(annualInterestRate) / 100
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/savings/required-contribution', (req, res) => {
    try {
        const { initialBalance, targetAmount, years, annualInterestRate } = req.body;
        const requiredContribution = savingsCalculator.calculateRequiredContribution(
            Number(initialBalance),
            Number(targetAmount),
            Number(years),
            Number(annualInterestRate) / 100
        );
        res.json({ requiredContribution });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/loan/calculate', (req, res) => {
    try {
        const { loanAmount, interestRate, loanTerm, paymentFrequency } = req.body;
        const result = loanCalculator.calculateLoanRepayment(
            Number(loanAmount),
            Number(interestRate) / 100,
            Number(loanTerm),
            paymentFrequency || 'monthly'
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/loan/borrowing-capacity', (req, res) => {
    try {
        const { desiredPayment, annualInterestRate, loanTermYears, paymentFrequency } = req.body;
        const capacity = loanCalculator.calculateBorrowingCapacity(
            Number(desiredPayment),
            Number(annualInterestRate) / 100,
            Number(loanTermYears),
            paymentFrequency || 'monthly'
        );
        res.json({ borrowingCapacity: capacity });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/loan/extra-payment-impact', (req, res) => {
    try {
        const { loanAmount, annualInterestRate, loanTermYears, extraPayment, paymentFrequency } = req.body;
        const result = loanCalculator.calculateExtraPaymentImpact(
            Number(loanAmount),
            Number(annualInterestRate) / 100,
            Number(loanTermYears),
            Number(extraPayment),
            paymentFrequency || 'monthly'
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Mortgage vs Rent Calculator Routes
router.post('/mortgage-vs-rent/compare', (req, res) => {
    try {
        const {
            propertyPrice,
            deposit,
            mortgageRate,
            mortgageTerm,
            monthlyRent,
            rentIncreaseRate,
            propertyAppreciationRate,
            investmentReturnRate,
            years
        } = req.body;

        const result = mortgageVsRentCalculator.calculateComparison(
            Number(propertyPrice),
            Number(deposit),
            Number(mortgageRate) / 100,
            Number(mortgageTerm),
            Number(monthlyRent),
            rentIncreaseRate ? Number(rentIncreaseRate) / 100 : undefined,
            propertyAppreciationRate ? Number(propertyAppreciationRate) / 100 : undefined,
            investmentReturnRate ? Number(investmentReturnRate) / 100 : undefined,
            years ? Number(years) : undefined
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/mortgage-vs-rent/affordability', (req, res) => {
    try {
        const { annualIncome, monthlyDebts, deposit, interestRate } = req.body;
        const result = mortgageVsRentCalculator.calculateAffordability(
            Number(annualIncome),
            Number(monthlyDebts),
            Number(deposit),
            interestRate ? Number(interestRate) / 100 : undefined
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// (Investment Portfolio calculator removed)

// Retirement Income Calculator Routes
router.post('/retirement/safe-withdrawal', (req, res) => {
    try {
        const {
            portfolioValue,
            annualExpenses,
            yearsInRetirement,
            expectedReturn,
            inflationRate,
            successRate
        } = req.body;

        const result = retirementIncomeCalculator.calculateSafeWithdrawal(
            Number(portfolioValue),
            Number(annualExpenses),
            yearsInRetirement ? Number(yearsInRetirement) : undefined,
            expectedReturn ? Number(expectedReturn) / 100 : undefined,
            inflationRate ? Number(inflationRate) / 100 : undefined,
            successRate ? Number(successRate) / 100 : undefined
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/retirement/age-pension', (req, res) => {
    try {
        const { age, assessableAssets, annualIncome, isCouple, isHomeowner } = req.body;
        const result = retirementIncomeCalculator.calculateAgePension(
            Number(age),
            Number(assessableAssets),
            Number(annualIncome),
            isCouple,
            isHomeowner
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/retirement/annuity-vs-account', (req, res) => {
    try {
        const {
            superBalance,
            annuityRate,
            investmentReturn,
            yearsInRetirement,
            inflationRate
        } = req.body;

        const result = retirementIncomeCalculator.compareAnnuityVsAccountBased(
            Number(superBalance),
            annuityRate ? Number(annuityRate) / 100 : undefined,
            investmentReturn ? Number(investmentReturn) / 100 : undefined,
            yearsInRetirement ? Number(yearsInRetirement) : undefined,
            inflationRate ? Number(inflationRate) / 100 : undefined
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/retirement/total-income', (req, res) => {
    try {
        const {
            superBalance,
            otherInvestments,
            rentalIncome,
            age,
            agePensionDetails
        } = req.body;

        const result = retirementIncomeCalculator.calculateTotalRetirementIncome(
            Number(superBalance),
            Number(otherInvestments),
            Number(rentalIncome),
            Number(age),
            agePensionDetails
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Tax Calculator Routes
router.post('/tax/calculate', (req, res) => {
    try {
        const {
            annualSalary,
            includeSuperInPackage,
            superRate,
            preTaxDeductions,
            postTaxDeductions
        } = req.body;

        const result = taxCalculator.calculateNetSalary(
            Number(annualSalary),
            includeSuperInPackage,
            superRate ? Number(superRate) / 100 : undefined,
            preTaxDeductions ? Number(preTaxDeductions) : undefined,
            postTaxDeductions ? Number(postTaxDeductions) : undefined
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/tax/required-salary', (req, res) => {
    try {
        const { targetTakeHome } = req.body;
        const result = taxCalculator.calculateRequiredGrossSalary(Number(targetTakeHome));
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/tax/salary-increase', (req, res) => {
    try {
        const { currentSalary, desiredTakeHomeIncrease } = req.body;
        const result = taxCalculator.calculateRequiredSalaryIncrease(
            Number(currentSalary),
            Number(desiredTakeHomeIncrease)
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;