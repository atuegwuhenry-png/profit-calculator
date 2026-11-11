// ===== Part A: Get references to the page elements =====
const form = document.getElementById('margin-form');
const costInput = document.getElementById('cost');
const sellInput = document.getElementById('sell');
// ===== Commas while typing =====
function formatAsYouType(input) {
  const cleaned = input.value.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  const whole = parts[0].replace(/^0+(?=\d)/, '');
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  input.value = parts.length > 1
    ? `${withCommas}.${parts[1].slice(0, 2)}`
    : withCommas;
}

function parseAmount(text) {
  return parseFloat(text.replace(/,/g, ''));
}

// ===== Quantity, total profit and verdict =====
const qtyInput = document.getElementById('qty');
const totalsOutput = document.getElementById('totals-output');
const verdictOutput = document.getElementById('verdict');

qtyInput.addEventListener('input', () => formatAsYouType(qtyInput));

function formatNaira(amount) {
  return '₦' + amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function getVerdict(marginPercent) {
  if (marginPercent < 0) {
    return { text: 'Loss: you are selling below cost. Raise your price.', color: '#c62828' };
  }
  if (marginPercent < 10) {
    return { text: 'Thin: very little room for transport, data, or surprises. Consider a higher price.', color: '#ef6c00' };
  }
  if (marginPercent < 25) {
    return { text: 'Healthy: a reasonable profit for most small businesses.', color: '#2e7d32' };
  }
  return { text: 'Strong: a good margin. Check that your price is still competitive.', color: '#1565c0' };
}

costInput.addEventListener('input', () => formatAsYouType(costInput));
sellInput.addEventListener('input', () => formatAsYouType(sellInput));
const errorEl = document.getElementById('error');
const resultsEl = document.getElementById('results');
const profitEl = document.getElementById('profit');
const marginEl = document.getElementById('margin');
const markupEl = document.getElementById('markup');

// ===== Part B: Naira formatting =====
// Turns 1000 into "₦1,000.00"
const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
});

// ===== Part C: The calculation =====
function calculateMargin(cost, sell) {
  const profit = sell - cost;
  const margin = sell > 0 ? (profit / sell) * 100 : null;
  const markup = cost > 0 ? (profit / cost) * 100 : null;
  return { profit, margin, markup };
}

// ===== Part D: Error helpers =====
function showError(message) {
  errorEl.textContent = message;
  resultsEl.hidden = true;
}

function clearError() {
  errorEl.textContent = '';
}

// ===== Part E: Handle form submission =====
form.addEventListener('submit', (event) => {
  event.preventDefault(); // stop the page from reloading

  const cost = parseAmount(costInput.value);
  const sell = parseAmount(sellInput.value);

  if (Number.isNaN(cost) || Number.isNaN(sell)) {
    showError('Please enter both the cost price and the selling price.');
    return;
  }

  if (cost < 0 || sell < 0) {
    showError('Prices cannot be negative.');
    return;
  }

  if (sell === 0) {
    showError('Selling price must be greater than zero to calculate margin.');
    return;
  }

  clearError();
  const { profit, margin, markup } = calculateMargin(cost, sell);

  profitEl.textContent = nairaFormatter.format(profit);
  marginEl.textContent = margin === null ? 'N/A' : `${margin.toFixed(2)}%`;
  markupEl.textContent = markup === null ? 'N/A (cost is zero)' : `${markup.toFixed(2)}%`;

      const colour = profit >= 0 ? '#1e7b34' : '#c62828';
  profitEl.style.color = colour;
  marginEl.style.color = colour;
  profitEl.style.fontWeight = 'bold';
  marginEl.style.fontWeight = 'bold';

  resultsEl.hidden = false;

  // Quantity and totals
const qty = parseAmount(qtyInput.value);

if (!qty || qty < 1 || !Number.isInteger(qty)) {
  totalsOutput.textContent = 'Enter a quantity of 1 or more, using whole numbers only.';
  verdictOutput.textContent = '';
  return;
}

const profitPerItem = sell - cost;
const totalCost = cost * qty;
const totalRevenue = sell * qty;
const totalProfit = profitPerItem * qty;
const marginPercent = (profitPerItem / sell) * 100;

totalsOutput.innerHTML = `
  <p>Total cost: <strong>${formatNaira(totalCost)}</strong></p>
  <p>Total revenue: <strong>${formatNaira(totalRevenue)}</strong></p>
  <p>Total profit: <strong>${formatNaira(totalProfit)}</strong></p>
`;

const verdict = getVerdict(marginPercent);
verdictOutput.textContent = verdict.text;
verdictOutput.style.color = verdict.color;
});

// ===== Clear button =====
const clearBtn = document.getElementById('clear-btn');

clearBtn.addEventListener('click', () => {
  form.reset();          // empties both inputs
    localStorage.removeItem(STORAGE_KEY);
  clearError();
  resultsEl.hidden = true;
  costInput.focus();     // put the cursor back in the first box
});

// ===== Remember inputs =====
const STORAGE_KEY = 'profitCalc.inputs';

function saveInputs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    cost: costInput.value,
    sell: sellInput.value,
  }));
}

function restoreInputs() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  const { cost, sell } = JSON.parse(saved);
  costInput.value = cost;
  sellInput.value = sell;
}

// Save every time the user types
costInput.addEventListener('input', saveInputs);
sellInput.addEventListener('input', saveInputs);

// Load the saved values when the page opens
restoreInputs();

// ===== Copy results =====
const copyBtn = document.getElementById('copy-btn');

copyBtn.addEventListener('click', async () => {
  const text = `Profit: ${profitEl.textContent}\nMargin: ${marginEl.textContent}\nMarkup: ${markupEl.textContent}`;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
  } catch (error) {
    copyBtn.textContent = 'Copy failed';
  }
  setTimeout(() => (copyBtn.textContent = 'Copy results'), 2000);
});