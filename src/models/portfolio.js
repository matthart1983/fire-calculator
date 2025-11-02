class Portfolio {
    constructor() {
        this.investments = [];
        this.expenses = 0;
    }

    addInvestment(investment) {
        this.investments.push(investment);
    }

    calculateNetWorth() {
        const totalInvestments = this.investments.reduce((total, investment) => total + investment, 0);
        return totalInvestments - this.expenses;
    }
}

export default Portfolio;