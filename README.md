# FIRE Calculator

## Overview
The FIRE (Financial Independence, Retire Early) Calculator is a web and CLI application designed to help users calculate their savings goals and withdrawal rates for achieving financial independence and early retirement. 

## Features
- Calculate savings goals based on desired retirement age and expenses.
- Determine safe withdrawal rates to ensure sustainable income during retirement.
- Manage and evaluate financial portfolios, including investments and expenses.
- User-friendly command-line interface and web application.

## Project Structure
```
fire-calculator
├── src
│   ├── index.js               # Entry point of the application
│   ├── calculators
│   │   └── fireCalculator.js   # Contains the FireCalculator class
│   ├── models
│   │   └── portfolio.js        # Contains the Portfolio class
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
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd fire-calculator
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
### CLI
To use the CLI version of the FIRE calculator, run:
```
node src/ui/cli.js
```

### Web
To start the web application, run:
```
node src/ui/web/app.js
```
Then, navigate to `http://localhost:3000` in your web browser.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.