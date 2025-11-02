export function calculateCompoundInterest(principal, rate, time, compoundingFrequency) {
    const amount = principal * Math.pow((1 + rate / compoundingFrequency), compoundingFrequency * time);
    return amount - principal; // Returns the interest earned
}

export function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`; // Formats the amount as currency
}