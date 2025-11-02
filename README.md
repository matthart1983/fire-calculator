# FinanceFlow

💰 **Live Demo: [https://financeflow.up.railway.app](https://financeflow.up.railway.app)**

## Overview
FinanceFlow is a comprehensive financial planning web application designed to help users make informed decisions about savings, retirement, investments, taxes, and loans. Calculate your path to financial independence with multiple specialized calculators and beautiful visualizations. 

## Features
- Interactive web interface with real-time calculations
- Beautiful data visualizations with Chart.js
- Savings growth projection over time
- Calculate savings goals based on desired retirement age and expenses.
- Determine safe withdrawal rates to ensure sustainable income during retirement.
- User-friendly command-line interface and web application.

## Calculators Included
- **FIRE Calculator** - Financial Independence, Retire Early planning
- **Superannuation Calculator** - Australian retirement savings projections
- **Net Worth Calculator** - Track assets and liabilities
- **Savings Calculator** - Compound interest and growth projections
- **Loan Calculator** - Repayment schedules and borrowing capacity
- **Mortgage vs Rent** - Compare buying vs renting costs
- **Retirement Income** - Safe withdrawal rates and age pension estimates
- **Tax Calculator** - Australian tax calculations with 2024-25 rates

## Project Structure
```
financeflow
├── src
│   ├── index.js               # Entry point of the application
│   ├── calculators
│   │   └── fireCalculator.js   # Contains the FireCalculator class
│   ├── models
│   ├── utils
│   │   └── finance.js          # Utility functions for financial calculations
│   └── ui
│       ├── cli.js              # CLI interface for user interactions
│       └── web
│           ├── app.js          # Web application setup
│           └── routes.js       # Web routes for the application
├── test
│   └── fireCalculator.test.js   # Unit tests for the FireCalculator class
├── package.json                 # npm configuration file
├── .gitignore                   # Files and directories to ignore by Git
├── .eslintrc.json               # ESLint configuration
└── .prettierrc                  # Prettier configuration
```

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/matthart1983/fire-calculator.git
   ```
2. Navigate to the project directory:
   ```bash
   cd fire-calculator
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Usage
### Web Application (Recommended)
Start the web application:
```bash
npm start
```
Then navigate to `http://localhost:3000` in your web browser.

### CLI
To use the CLI version:
```bash
npm run cli
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.