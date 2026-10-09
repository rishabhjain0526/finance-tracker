let transactions = [];
let editIndex = null;

const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");
const typeInput = document.getElementById("type");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");
const transactionList = document.getElementById("transactionList");
const form = document.getElementById("transactionForm");
const button = document.getElementById("button");

const balanceCard = document.getElementById("balanceCard");
const incomeCard = document.getElementById("incomeCard");
const expenseCard = document.getElementById("expenseCard");
const currentBalance = document.querySelector("#balance span");

const expenseCategories = [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Rent",
    "Entertainment",
    "Medical",
];

const incomeCategories = [
    "Salary",
    "Freelance",
    "Business",
    "Interest",
    "Other Income",
];

typeInput.addEventListener("change", updateCategories);
form.addEventListener("submit", handleSubmit);
searchInput.addEventListener("input", displayTransactions);
typeFilter.addEventListener("change", displayTransactions);
categoryFilter.addEventListener("change", displayTransactions);

function updateCategories() {
    const categories = typeInput.value === "Income"
        ? incomeCategories
        : expenseCategories;

    categoryInput.replaceChildren(
        ...categories.map((category) => new Option(category, category)),
    );
}

function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(amountInput.value);
    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Amount must be greater than 0");
        amountInput.focus();
        return;
    }

    if (!dateInput.value) {
        alert("Please select a date");
        dateInput.focus();
        return;
    }

    const [year, month, day] = dateInput.value.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isValidDate = selectedDate.getFullYear() === year
        && selectedDate.getMonth() === month - 1
        && selectedDate.getDate() === day;

    if (!isValidDate || year < 2000 || year > today.getFullYear()) {
        alert("Please enter a valid date");
        dateInput.focus();
        return;
    }

    if (selectedDate > today) {
        alert("Please select a date in the past or present");
        dateInput.focus();
        return;
    }

    if (!descriptionInput.value.trim()) {
        alert("Please enter description");
        descriptionInput.focus();
        return;
    }

    const transaction = {
        amount,
        category: categoryInput.value,
        date: dateInput.value,
        type: typeInput.value,
        description: descriptionInput.value.trim(),
    };

    if (editIndex === null) {
        transactions.push(transaction);
    } else {
        transactions[editIndex] = transaction;
    }

    editIndex = null;
    button.textContent = "Add Transaction";
    form.reset();
    updateCategories();
    updateDashboard();
    displayTransactions();
}

function displayTransactions() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedType = typeFilter.value;
    const selectedCategory = categoryFilter.value;

    const filteredTransactions = transactions
        .map((transaction, index) => ({ transaction, index }))
        .filter(({ transaction }) => {
            const matchesSearch = transaction.description
                .toLowerCase()
                .includes(searchText);
            const matchesType = selectedType === "All"
                || transaction.type === selectedType;
            const matchesCategory = selectedCategory === "All"
                || transaction.category === selectedCategory;

            return matchesSearch && matchesType && matchesCategory;
        });

    transactionList.replaceChildren();

    if (filteredTransactions.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-state";
        emptyMessage.textContent = transactions.length === 0
            ? "No transactions yet. Add one using the form above."
            : "No transactions match these filters.";
        transactionList.append(emptyMessage);
        return;
    }

    filteredTransactions.forEach(({ transaction, index }) => {
        const item = document.createElement("article");
        item.className = "transaction-item";

        const details = document.createElement("div");
        details.className = "transaction-details";

        const title = document.createElement("span");
        title.className = "transaction-title";
        title.textContent = transaction.description;

        const meta = document.createElement("span");
        meta.className = "transaction-meta";
        meta.textContent = `${transaction.category} · ${transaction.type} · ${transaction.date}`;

        const amount = document.createElement("span");
        amount.className = `transaction-amount ${transaction.type.toLowerCase()}`;
        amount.textContent = `${transaction.type === "Income" ? "+" : "−"}₹${transaction.amount}`;

        const actions = document.createElement("div");
        actions.className = "transaction-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editTransaction(index));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteTransaction(index));

        details.append(title, meta);
        actions.append(editButton, deleteButton);
        item.append(details, amount, actions);
        transactionList.append(item);
    });
}

function deleteTransaction(index) {
    transactions.splice(index, 1);

    if (editIndex === index) {
        editIndex = null;
        form.reset();
        updateCategories();
        button.textContent = "Add Transaction";
    } else if (editIndex !== null && index < editIndex) {
        editIndex -= 1;
    }

    updateDashboard();
    displayTransactions();
}

function editTransaction(index) {
    editIndex = index;
    const transaction = transactions[index];

    typeInput.value = transaction.type;
    updateCategories();
    amountInput.value = transaction.amount;
    categoryInput.value = transaction.category;
    dateInput.value = transaction.date;
    descriptionInput.value = transaction.description;
    button.textContent = "Update Transaction";
    form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateDashboard() {
    const totalIncome = transactions
        .filter((transaction) => transaction.type === "Income")
        .reduce((total, transaction) => total + transaction.amount, 0);
    const totalExpense = transactions
        .filter((transaction) => transaction.type === "Expense")
        .reduce((total, transaction) => total + transaction.amount, 0);
    const balance = totalIncome - totalExpense;

    currentBalance.textContent = `₹${balance}`;
    balanceCard.querySelector("p").textContent = `₹${balance}`;
    incomeCard.querySelector("p").textContent = `₹${totalIncome}`;
    expenseCard.querySelector("p").textContent = `₹${totalExpense}`;
}

updateCategories();
displayTransactions();
