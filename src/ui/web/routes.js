import express from 'express';
import FireCalculator from '../../calculators/fireCalculator.js';
import SuperannuationCalculator from '../../calculators/superannuationCalculator.js';
import NetWorthCalculator from '../../calculators/netWorthCalculator.js';
import SavingsCalculator from '../../calculators/savingsCalculator.js';

const router = express.Router();
const calculator = new FireCalculator();
const superCalculator = new SuperannuationCalculator();
const netWorthCalculator = new NetWorthCalculator();
const savingsCalculator = new SavingsCalculator();

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

export default router;