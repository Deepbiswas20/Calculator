let currentValue = '0';
let previousValue = '';
let operation = '';
let shouldResetDisplay = false;

const display = document.getElementById('display');
const expression = document.getElementById('expression');
const status = document.getElementById('status');

// Update display
function updateDisplay() {
    display.value = currentValue;
}

// Update expression display
function updateExpression() {
    if (previousValue && operation) {
        expression.textContent = `${previousValue} ${getOperatorSymbol(operation)}`;
    } else {
        expression.textContent = '';
    }
}

// Get operator symbol for display
function getOperatorSymbol(op) {
    const symbols = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷',
        'pow': '^',
        'mod': 'mod'
    };
    return symbols[op] || op;
}

// Append number to display
function appendNumber(num) {
    if (shouldResetDisplay) {
        currentValue = num;
        shouldResetDisplay = false;
    } else {
        if (num === '.' && currentValue.includes('.')) return;
        currentValue = currentValue === '0' && num !== '.' ? num : currentValue + num;
    }
    updateDisplay();
    clearStatus();
}

// Set operation
function setOperation(op) {
    if (previousValue && !shouldResetDisplay) {
        calculate();
    }
    operation = op;
    previousValue = currentValue;
    shouldResetDisplay = true;
    updateExpression();
    clearStatus();
}

// Calculate result
async function calculate() {
    if (!previousValue || !operation) return;

    const a = parseFloat(previousValue);
    const b = parseFloat(currentValue);

    if (isNaN(a) || isNaN(b)) {
        showStatus('Invalid input', 'error');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                a: a,
                b: b,
                operation: operation
            })
        });

        const data = await response.json();

        if (data.error) {
            showStatus(data.error, 'error');
            currentValue = '0';
        } else {
            currentValue = formatResult(data.result);
            showStatus('Calculated successfully', 'success');
        }
    } catch (error) {
        showStatus('Connection error - Check if Flask server is running', 'error');
        console.error('Error:', error);
    }

    previousValue = '';
    operation = '';
    shouldResetDisplay = true;
    updateDisplay();
    updateExpression();
}

// Scientific calculations
async function scientificCalc(func) {
    const value = parseFloat(currentValue);

    if (isNaN(value)) {
        showStatus('Invalid input', 'error');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/scientific', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                value: value,
                function: func
            })
        });

        const data = await response.json();

        if (data.error) {
            showStatus(data.error, 'error');
        } else {
            currentValue = formatResult(data.result);
            showStatus(`${func}(${value}) calculated`, 'success');
        }
    } catch (error) {
        showStatus('Connection error - Check if Flask server is running', 'error');
        console.error('Error:', error);
    }

    shouldResetDisplay = true;
    updateDisplay();
    clearStatus();
}

// Format result
function formatResult(num) {
    if (num === null || num === undefined) return '0';
    
    // Handle very large or very small numbers with scientific notation
    if (Math.abs(num) > 1e10 || (Math.abs(num) < 1e-6 && num !== 0)) {
        return num.toExponential(6);
    }
    
    // Round to 10 decimal places to avoid floating point errors
    const rounded = Math.round(num * 1e10) / 1e10;
    return rounded.toString();
}

// Clear display
function clearDisplay() {
    currentValue = '0';
    previousValue = '';
    operation = '';
    shouldResetDisplay = false;
    updateDisplay();
    updateExpression();
    clearStatus();
}

// Clear entry
function clearEntry() {
    currentValue = '0';
    shouldResetDisplay = false;
    updateDisplay();
    clearStatus();
}

// Backspace
function backspace() {
    if (shouldResetDisplay) return;
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
    updateDisplay();
}

// Toggle sign
function toggleSign() {
    currentValue = (parseFloat(currentValue) * -1).toString();
    updateDisplay();
}

// Insert constants
function insertConstant(constant) {
    if (constant === 'pi') {
        currentValue = Math.PI.toString();
    } else if (constant === 'e') {
        currentValue = Math.E.toString();
    }
    shouldResetDisplay = true;
    updateDisplay();
}

// Show status message
function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    setTimeout(clearStatus, 3000);
}

// Clear status message
function clearStatus() {
    setTimeout(() => {
        status.textContent = '';
        status.className = 'status';
    }, 3000);
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
    if (e.key === '.') appendNumber('.');
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        setOperation(e.key);
    }
    if (e.key === 'Enter' || e.key === '=') calculate();
    if (e.key === 'Escape') clearDisplay();
    if (e.key === 'Backspace') backspace();
});

// Initialize
updateDisplay();
