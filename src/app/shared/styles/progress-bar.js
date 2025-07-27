/**
 * Updates the budget usage progress bar based on provided financial data.
 * This function expects to be called by the main application logic
 * with the current monthly limit and total expenses.
 *
 * @param {object} budgetLimit - An object containing the monthly limit, e.g., { limitAmount: 500 }.
 * @param {number} currentExpenses - The total expenses incurred for the current period.
 */
export function updateBudgetProgressBar(budgetLimit, currentExpenses) {
    // Ensure the DOM elements exist before trying to manipulate them
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const noLimitMessage = document.getElementById('noLimitMessage');
    const overBudgetMessage = document.getElementById('overBudgetMessage');

    if (!progressBar || !progressText || !noLimitMessage || !overBudgetMessage) {
        console.warn("Budget progress bar elements not found in DOM. Skipping update.");
        return;
    }

    const monthlyLimit = budgetLimit && typeof budgetLimit.limitAmount === 'number' ? budgetLimit.limitAmount : 0;

    const budgetUsagePercentage = monthlyLimit > 0
        ? (currentExpenses / monthlyLimit) * 100
        : 0;

    progressBar.style.width = `${Math.min(budgetUsagePercentage, 100)}%`;
    progressBar.classList.toggle('over-budget', budgetUsagePercentage > 100);
    progressText.textContent = `${budgetUsagePercentage.toFixed(0)}%`;

    noLimitMessage.classList.toggle('hidden', monthlyLimit > 0);
    overBudgetMessage.classList.toggle('hidden', budgetUsagePercentage <= 100);

    // Adjust text color for visibility on small bars
    if (budgetUsagePercentage < 10 && budgetUsagePercentage > 0) {
        progressText.style.color = '#374151'; // Darker text
    } else {
        progressText.style.color = '#ffffff'; // White text
    }
    if (budgetUsagePercentage === 0) {
        progressText.textContent = ''; // Hide text if 0%
    }
}
