/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

// Set up DOM elements required by script.js
document.body.innerHTML = '<input type="text" id="result" />';

// Define missing degree-based trig functions the calculator normalizes to
globalThis.sinDeg = (x) => Math.sin((x * Math.PI) / 180);
globalThis.cosDeg = (x) => Math.cos((x * Math.PI) / 180);
globalThis.tanDeg = (x) => Math.tan((x * Math.PI) / 180);
globalThis.asinDeg = (x) => Math.asin(x) * (180 / Math.PI);
globalThis.acosDeg = (x) => Math.acos(x) * (180 / Math.PI);
globalThis.atanDeg = (x) => Math.atan(x) * (180 / Math.PI);

// Evaluate script.js in the current scope so function/variable declarations
// become accessible from test blocks
const scriptPath = path.resolve(__dirname, "../assets/js/script.js");
eval(fs.readFileSync(scriptPath, "utf8"));

// ---------------------------------------------------------------------------
// normalizeExpression
// ---------------------------------------------------------------------------
describe("normalizeExpression", () => {
  test("converts sin to sinDeg", () => {
    expect(normalizeExpression("sin(30)")).toBe("sinDeg(30)");
  });

  test("converts cos to cosDeg", () => {
    expect(normalizeExpression("cos(60)")).toBe("cosDeg(60)");
  });

  test("converts tan to tanDeg", () => {
    expect(normalizeExpression("tan(45)")).toBe("tanDeg(45)");
  });

  test("converts asin to asinDeg", () => {
    expect(normalizeExpression("asin(0.5)")).toBe("asinDeg(0.5)");
  });

  test("converts acos to acosDeg", () => {
    expect(normalizeExpression("acos(0.5)")).toBe("acosDeg(0.5)");
  });

  test("converts atan to atanDeg", () => {
    expect(normalizeExpression("atan(1)")).toBe("atanDeg(1)");
  });

  test("does NOT convert asinh", () => {
    expect(normalizeExpression("asinh(1)")).toBe("asinh(1)");
  });

  test("does NOT convert sinh", () => {
    expect(normalizeExpression("sinh(1)")).toBe("sinh(1)");
  });

  test("replaces 'e' with Math.E", () => {
    expect(normalizeExpression("e")).toBe("Math.E");
  });

  test("replaces 'pi' with Math.PI", () => {
    expect(normalizeExpression("pi")).toBe("Math.PI");
  });

  test("only replaces whole-word 'e', not inside digits", () => {
    expect(normalizeExpression("exp(1)")).toBe("exp(1)");
  });

  test("handles complex expressions with multiple replacements", () => {
    const result = normalizeExpression("sin(30)+cos(60)+pi");
    expect(result).toBe("sinDeg(30)+cosDeg(60)+Math.PI");
  });

  test("passes through plain arithmetic unchanged", () => {
    expect(normalizeExpression("2+3*4")).toBe("2+3*4");
  });
});

// ---------------------------------------------------------------------------
// calculateExpression
// ---------------------------------------------------------------------------
describe("calculateExpression", () => {
  beforeEach(() => {
    LAST_RESULT = 0;
  });

  test("adds two numbers", () => {
    expect(calculateExpression("2+2")).toBe(4);
  });

  test("subtracts two numbers", () => {
    expect(calculateExpression("10-3")).toBe(7);
  });

  test("multiplies two numbers", () => {
    expect(calculateExpression("4*5")).toBe(20);
  });

  test("divides two numbers", () => {
    expect(calculateExpression("10/2")).toBe(5);
  });

  test("respects order of operations", () => {
    expect(calculateExpression("2+3*4")).toBe(14);
  });

  test("handles parentheses", () => {
    expect(calculateExpression("(2+3)*4")).toBe(20);
  });

  test("handles decimal numbers", () => {
    expect(calculateExpression("3.5+2.1")).toBeCloseTo(5.6);
  });

  test("handles exponentiation with **", () => {
    expect(calculateExpression("2**3")).toBe(8);
  });

  test("evaluates sin in degrees", () => {
    expect(calculateExpression("sin(30)")).toBeCloseTo(0.5);
  });

  test("evaluates cos in degrees", () => {
    expect(calculateExpression("cos(60)")).toBeCloseTo(0.5);
  });

  test("evaluates tan in degrees", () => {
    expect(calculateExpression("tan(45)")).toBeCloseTo(1);
  });

  test("evaluates pi", () => {
    expect(calculateExpression("pi")).toBeCloseTo(Math.PI);
  });

  test("substitutes ans with LAST_RESULT", () => {
    LAST_RESULT = 10;
    expect(calculateExpression("ans+5")).toBe(15);
  });

  test("returns Error for invalid expression", () => {
    expect(calculateExpression("invalid")).toBe("Error");
  });

  test("returns Error for division by zero", () => {
    expect(calculateExpression("1/0")).toBe("Error");
  });
});

// ---------------------------------------------------------------------------
// backspace
// ---------------------------------------------------------------------------
describe("backspace", () => {
  test("removes the last character from currentExpression", () => {
    currentExpression = "123";
    backspace();
    expect(currentExpression).toBe("12");
  });

  test("handles empty string", () => {
    currentExpression = "";
    backspace();
    expect(currentExpression).toBe("");
  });
});

// ---------------------------------------------------------------------------
// clearResult
// ---------------------------------------------------------------------------
describe("clearResult", () => {
  test("clears currentExpression to empty string", () => {
    currentExpression = "123+456";
    clearResult();
    expect(currentExpression).toBe("");
  });
});

// ---------------------------------------------------------------------------
// appendToResult
// ---------------------------------------------------------------------------
describe("appendToResult", () => {
  test("appends a value to currentExpression", () => {
    currentExpression = "";
    appendToResult(5);
    expect(currentExpression).toBe("5");
  });

  test("appends multiple values consecutively", () => {
    currentExpression = "";
    appendToResult(1);
    appendToResult(2);
    appendToResult(3);
    expect(currentExpression).toBe("123");
  });
});

// ---------------------------------------------------------------------------
// bracketToResult
// ---------------------------------------------------------------------------
describe("bracketToResult", () => {
  test("appends an opening bracket", () => {
    currentExpression = "";
    bracketToResult("(");
    expect(currentExpression).toBe("(");
  });

  test("appends a closing bracket", () => {
    currentExpression = "(";
    bracketToResult(")");
    expect(currentExpression).toBe("()");
  });
});

// ---------------------------------------------------------------------------
// operatorToResult
// ---------------------------------------------------------------------------
describe("operatorToResult", () => {
  test("appends a regular operator", () => {
    currentExpression = "2";
    operatorToResult("+");
    expect(currentExpression).toBe("2+");
  });

  test("converts ^ to ** for exponentiation", () => {
    currentExpression = "2";
    operatorToResult("^");
    expect(currentExpression).toBe("2**");
  });

  test("appends a minus operator", () => {
    currentExpression = "5";
    operatorToResult("-");
    expect(currentExpression).toBe("5-");
  });
});
