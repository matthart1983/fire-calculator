import express from 'express';
import FireCalculator from '../../calculators/fireCalculator.js';

const router = express.Router();
const calculator = new FireCalculator();

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

export default router;