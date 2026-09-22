const title = document.getElementById("title");
const description = document.getElementById("description");
const lastUpdated = document.getElementById("last-updated");
const form = document.getElementById("currency-converter");
const currencyOne = document.getElementById("currency-one");
const currencyTwo = document.getElementById("currency-two");
const amountOne = document.getElementById("amount-one");
const amountTwo = document.getElementById("amount-two");
const status = document.getElementById("conversion-status");

// Format money: 1.234.567,89 (Indonesian style)
function formatMoney(value, currency) {
    const formatter = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency,
        minimumFractionDigits: 0, // IDR usually 0 decimals
        maximumFractionDigits: 0,
    });
    return formatter.format(value);
}

async function getRate(base, quote) {
    const res = await fetch(`https://api.frankfurter.dev/v2/rate/${base}/${quote}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return { rate: data.rate, date: data.date };
}

async function convertAmount(base, quote, amount) {
    const { rate } = await getRate(base, quote);
    return amount * rate;
}

async function updateHeader(base, quote) {
    const { rate, date } = await getRate(base, quote);
    const now = new Date().toLocaleString("id-ID");

    title.textContent = `1 ${base} = ${formatMoney(rate, quote)} (${quote})`;
    description.textContent = `Last updated: ${now}. Rate: 1 ${base} = ${rate.toFixed(6)} ${quote}.`;
    lastUpdated.textContent = `${now}`;
}

async function updateAll() {
    const base = currencyOne.value;
    const quote = currencyTwo.value;
    const amount = parseFloat(amountOne.value);

    if (isNaN(amount) || amount < 0 || !base || !quote) {
        amountTwo.value = "";
        status.textContent = "Enter a valid amount to convert.";
        return;
    }

    try {
        const result = await convertAmount(base, quote, amount);
        amountTwo.value = formatMoney(result, quote);
        await updateHeader(base, quote);
        status.textContent = "Rates update when you convert.";
    } catch (err) {
        amountTwo.value = "";
        title.textContent = "Error loading rates.";
        description.textContent = err.message;
        lastUpdated.textContent = "";
        status.textContent = "Failed to fetch rates.";
    }
}

async function initDefault() {
    currencyOne.value = "USD";
    currencyTwo.value = "IDR"; // now valid
    amountOne.value = 1;
    await updateHeader("USD", "IDR"); // show on load
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await updateAll();
});

initDefault();