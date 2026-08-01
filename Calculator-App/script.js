// ==========================================================
// DOM elements
// ==========================================================
const currentOperandEl = document.getElementById("currentOperand");
const previousOperandEl = document.getElementById("previousOperand");
const modeToggleBtn = document.getElementById("modeToggle");

// ==========================================================
// STATE
// expression   = pura input string, jemon "sin(30)+2^3"
// lastAnswer   = "Ans" button er jonno - shesh calculate kora result
// isDegreeMode = trig function (sin/cos/tan) degree e hisheb hobe
//                naki radian e, seta track kore
// ==========================================================
let expression = "0";
let lastAnswer = 0;
let isDegreeMode = true;

// ==========================================================
// EVENT DELEGATION - dutu grid (.sci-grid, .main-grid) e
// alada listener na diye, document e ekta listener - button
// er data-action dekhe kaj kori
// ==========================================================
document.querySelector(".calculator").addEventListener("click", (e) => {
  const button = e.target.closest(".btn");
  if (!button) return;

  const action = button.dataset.action;

  switch (action) {
    case "number":
      insertText(button.textContent);
      break;
    case "decimal":
      insertDecimal();
      break;
    case "operator":
      insertOperator(button.dataset.operator);
      break;
    case "paren":
      insertText(button.dataset.value);
      break;
    case "function":
      insertFunction(button.dataset.fn);
      break;
    case "constant":
      insertText(button.dataset.value);
      break;
    case "factorial":
      insertText("!");
      break;
    case "negate":
      toggleSign();
      break;
    case "ans":
      insertText(formatNumber(lastAnswer));
      break;
    case "mode":
      toggleMode();
      break;
    case "equals":
      evaluateExpression();
      break;
    case "clear":
      clearAll();
      break;
    case "delete":
      deleteLast();
      break;
  }

  updateDisplay();
});

// ==========================================================
// INSERT HELPERS
// ==========================================================

// Shadharon text (digit, paren, constant) expression e jog kora.
// "0" thakle seta replace kore dei, na hole shudhu jog kori.
// Implicit multiplication o handle kori: "5(" -> "5×(" er moto,
// karon real calculator e eta expected behavior.
function insertText(text) {
  const lastChar = expression.slice(-1);
  const needsMultiply =
    /[0-9)!πe]/.test(lastChar) && /[(πe]/.test(text[0]);

  if (expression === "0") {
    expression = text;
  } else if (needsMultiply) {
    expression += "×" + text;
  } else {
    expression += text;
  }
}

function insertDecimal() {
  // Expression er shesh number segment e already '.' ache kina check kori
  // Regex: shesh e joto digit/decimal ache tader ber kore ani
  const match = expression.match(/(\d*\.?\d*)$/);
  if (match && match[0].includes(".")) return; // already decimal thakle skip

  if (expression === "0") {
    expression = "0.";
  } else {
    expression += ".";
  }
}

function insertOperator(op) {
  const lastChar = expression.slice(-1);
  // Operator er por abar operator chaple, purono ta replace kori
  // (double operator type kora thekano)
  if ("+-×÷^%".includes(lastChar)) {
    expression = expression.slice(0, -1) + op;
  } else {
    expression += op;
  }
}

function insertFunction(fn) {
  const lastChar = expression.slice(-1);
  const needsMultiply = /[0-9)!πe]/.test(lastChar);

  const prefix = expression === "0" ? "" : expression;
  expression = (needsMultiply ? prefix + "×" : prefix) + fn + "(";
}

function toggleSign() {
  // Shesh number segment ta khuje ber kore, tar age '-' thakle
  // shoriye dei, na thakle jog kore dei
  const match = expression.match(/(-?\d*\.?\d+)$/);
  if (!match) return;

  const numberPart = match[0];
  const start = expression.length - numberPart.length;

  if (numberPart.startsWith("-")) {
    expression = expression.slice(0, start) + numberPart.slice(1);
  } else {
    expression = expression.slice(0, start) + "-" + numberPart;
  }
}

function toggleMode() {
  isDegreeMode = !isDegreeMode;
  modeToggleBtn.textContent = isDegreeMode ? "DEG" : "RAD";
}

function clearAll() {
  expression = "0";
}

function deleteLast() {
  expression = expression.length > 1 ? expression.slice(0, -1) : "0";
}

// ==========================================================
// TOKENIZER
// Expression string ke chhoto chhoto "token" e bhag kori:
// number, identifier (function/constant name), ba symbol
// ==========================================================
function tokenize(input) {
  // Display symbol গুলো standard math symbol e convert kori
  const clean = input.replace(/×/g, "*").replace(/÷/g, "/").replace(/√/g, "sqrt");

  const tokens = [];
  let i = 0;

  while (i < clean.length) {
    const char = clean[i];

    if (char === " ") {
      i++;
      continue;
    }

    // Number: digit ba decimal point
    if (/[0-9.]/.test(char)) {
      let num = "";
      while (i < clean.length && /[0-9.]/.test(clean[i])) {
        num += clean[i];
        i++;
      }
      tokens.push({ type: "number", value: parseFloat(num) });
      continue;
    }

    // Identifier: function name (sin, cos, log...) ba constant (pi, e)
    if (/[a-zA-Z]/.test(char)) {
      let word = "";
      while (i < clean.length && /[a-zA-Z]/.test(clean[i])) {
        word += clean[i];
        i++;
      }
      tokens.push({ type: "identifier", value: word });
      continue;
    }

    if (char === "π") {
      tokens.push({ type: "identifier", value: "pi" });
      i++;
      continue;
    }

    // Operator/paren/factorial symbols
    if ("+-*/%^()!".includes(char)) {
      tokens.push({ type: "symbol", value: char });
      i++;
      continue;
    }

    // Chena na emon character pele error
    throw new Error("Invalid character: " + char);
  }

  return tokens;
}

// ==========================================================
// PARSER (Recursive Descent)
// Grammar (low precedence -> high precedence):
//   expression := term (('+' | '-') term)*
//   term       := unary (('*' | '/' | '%') unary)*
//   unary      := '-' unary | power
//   power      := postfix ('^' unary)?      (right-associative)
//   postfix    := primary ('!')*
//   primary    := NUMBER | CONSTANT | FUNCTION '(' expression ')'
//                 | '(' expression ')'
//
// Ei recursive function গুলো ekta "parse tree" onujayi calculation
// kore - এটাই real-world calculators/compilers e expression
// evaluate korar standard technique.
// ==========================================================
function parse(tokens) {
  let pos = 0;

  function peek() {
    return tokens[pos];
  }

  function consume() {
    return tokens[pos++];
  }

  function parseExpression() {
    let left = parseTerm();

    while (peek() && peek().type === "symbol" && (peek().value === "+" || peek().value === "-")) {
      const op = consume().value;
      const right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }

    return left;
  }

  function parseTerm() {
    let left = parseUnary();

    while (
      peek() &&
      peek().type === "symbol" &&
      (peek().value === "*" || peek().value === "/" || peek().value === "%")
    ) {
      const op = consume().value;
      const right = parseUnary();

      if (op === "*") left = left * right;
      else if (op === "/") {
        if (right === 0) throw new Error("Division by zero");
        left = left / right;
      } else left = left % right;
    }

    return left;
  }

  function parseUnary() {
    if (peek() && peek().type === "symbol" && peek().value === "-") {
      consume();
      return -parseUnary();
    }
    return parsePower();
  }

  function parsePower() {
    let base = parsePostfix();

    // '^' right-associative - tai recursively parseUnary abar call kori,
    // parseTerm/parseExpression na kore (mane power operator division/plus er
    // theke shakti-e boro precedence pay)
    if (peek() && peek().type === "symbol" && peek().value === "^") {
      consume();
      const exponent = parseUnary();
      base = Math.pow(base, exponent);
    }

    return base;
  }

  function parsePostfix() {
    let value = parsePrimary();

    // '!' factorial - jotokkhon '!' ashte thakbe, ততক্ষণ apply korte thakbo
    while (peek() && peek().type === "symbol" && peek().value === "!") {
      consume();
      value = factorial(value);
    }

    return value;
  }

  function parsePrimary() {
    const token = peek();

    if (!token) throw new Error("Unexpected end of expression");

    // Number literal
    if (token.type === "number") {
      consume();
      return token.value;
    }

    // Parenthesis: '(' expression ')'
    if (token.type === "symbol" && token.value === "(") {
      consume();
      const value = parseExpression();
      if (!peek() || peek().value !== ")") throw new Error("Missing closing parenthesis");
      consume();
      return value;
    }

    // Identifier: function call ba constant
    if (token.type === "identifier") {
      consume();
      const name = token.value.toLowerCase();

      // Constant - kono argument lage na
      if (name === "pi") return Math.PI;
      if (name === "e") return Math.E;

      // Function - পরে অবশ্যই '(' expression ')' thakte hobe
      if (!peek() || peek().value !== "(") {
        throw new Error(`Expected '(' after ${name}`);
      }
      consume(); // '(' khaoya holo
      const arg = parseExpression();
      if (!peek() || peek().value !== ")") throw new Error("Missing closing parenthesis");
      consume(); // ')' khaoya holo

      return applyFunction(name, arg);
    }

    throw new Error("Unexpected token: " + token.value);
  }

  const result = parseExpression();

  if (pos < tokens.length) {
    throw new Error("Unexpected token at end: " + tokens[pos].value);
  }

  return result;
}

// ==========================================================
// FUNCTION APPLICATION
// Trig function গুলোতে DEG mode hole age radian e convert kore nei,
// karon JavaScript er Math.sin/cos/tan always radian expect kore
// ==========================================================
function applyFunction(name, arg) {
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const angle = isDegreeMode ? toRadians(arg) : arg;

  switch (name) {
    case "sin":
      return Math.sin(angle);
    case "cos":
      return Math.cos(angle);
    case "tan":
      return Math.tan(angle);
    case "log":
      if (arg <= 0) throw new Error("log of non-positive number");
      return Math.log10(arg);
    case "ln":
      if (arg <= 0) throw new Error("ln of non-positive number");
      return Math.log(arg);
    case "sqrt":
      if (arg < 0) throw new Error("sqrt of negative number");
      return Math.sqrt(arg);
    default:
      throw new Error("Unknown function: " + name);
  }
}

// Factorial - shudhu non-negative integer er jonno defined
function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) throw new Error("Factorial needs a non-negative integer");
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

// ==========================================================
// EVALUATE - tokenize + parse + display result
// Jodi kono missing closing paren thake, auto-balance kore dei
// (user experience shohoj korar jonno)
// ==========================================================
function evaluateExpression() {
  try {
    const openCount = (expression.match(/\(/g) || []).length;
    const closeCount = (expression.match(/\)/g) || []).length;
    const balanced = expression + ")".repeat(Math.max(0, openCount - closeCount));

    const tokens = tokenize(balanced);
    const result = parse(tokens);

    if (!isFinite(result)) throw new Error("Result is not finite");

    lastAnswer = roundResult(result);
    expression = lastAnswer.toString();
  } catch (error) {
    expression = "Error";
  }
}

function roundResult(number) {
  return Math.round(number * 100000000) / 100000000;
}

// ==========================================================
// DISPLAY
// ==========================================================
function updateDisplay() {
  currentOperandEl.textContent = expression;
  previousOperandEl.textContent = isDegreeMode ? "DEG" : "RAD";
}

function formatNumber(num) {
  return Number(num).toString();
}

// ==========================================================
// KEYBOARD SUPPORT (basic operators + digits)
// ==========================================================
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    insertText(e.key);
  } else if (e.key === ".") {
    insertDecimal();
  } else if (e.key === "+" || e.key === "-") {
    insertOperator(e.key);
  } else if (e.key === "*") {
    insertOperator("×");
  } else if (e.key === "/") {
    e.preventDefault();
    insertOperator("÷");
  } else if (e.key === "^") {
    insertOperator("^");
  } else if (e.key === "(" || e.key === ")") {
    insertText(e.key);
  } else if (e.key === "Enter" || e.key === "=") {
    evaluateExpression();
  } else if (e.key === "Backspace") {
    deleteLast();
  } else if (e.key === "Escape") {
    clearAll();
  } else {
    return; // onno kono key hole display update na kore return
  }

  updateDisplay();
});

// Initial render
updateDisplay();