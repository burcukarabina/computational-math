(function () {
  "use strict";

  const MODAL_ID = "matrixCalculatorModal";
  const CSS_ID = "matrixCalculatorCSS";

  /*
   * Exact fraction arithmetic
   */

  class Fraction {
    constructor(numerator, denominator) {
      let n = BigInt(numerator);
      let d =
        denominator === undefined
          ? 1n
          : BigInt(denominator);

      if (d === 0n) {
        throw new Error(
          "A fraction cannot have denominator zero."
        );
      }

      if (d < 0n) {
        n = -n;
        d = -d;
      }

      const divisor = Fraction.gcd(
        Fraction.absoluteValue(n),
        d
      );

      this.numerator = n / divisor;
      this.denominator = d / divisor;
    }

    static absoluteValue(value) {
      return value < 0n ? -value : value;
    }

    static gcd(a, b) {
      while (b !== 0n) {
        const remainder = a % b;
        a = b;
        b = remainder;
      }

      return a === 0n ? 1n : a;
    }

    static zero() {
      return new Fraction(0n, 1n);
    }

    static one() {
      return new Fraction(1n, 1n);
    }

    static parse(rawValue) {
      let value = String(rawValue).trim();

      /*
       * Blank entries are treated as zero.
       */

      if (value === "") {
        return Fraction.zero();
      }

      value = value.replace(/\s+/g, "");

      /*
       * Fraction input, such as -3/5.
       */

      if (/^[+-]?\d+\/[+-]?\d+$/.test(value)) {
        const pieces = value.split("/");

        const numerator = BigInt(pieces[0]);
        const denominator = BigInt(pieces[1]);

        if (denominator === 0n) {
          throw new Error(
            "The denominator cannot be zero."
          );
        }

        return new Fraction(
          numerator,
          denominator
        );
      }

      /*
       * Integer input, such as -7.
       */

      if (/^[+-]?\d+$/.test(value)) {
        return new Fraction(
          BigInt(value),
          1n
        );
      }

      /*
       * Decimal input, such as -1.25.
       */

      if (
        /^[+-]?(\d+\.\d*|\d*\.\d+)$/.test(value)
      ) {
        let sign = 1n;

        if (value.startsWith("-")) {
          sign = -1n;
          value = value.substring(1);
        } else if (value.startsWith("+")) {
          value = value.substring(1);
        }

        const pieces = value.split(".");
        const wholePart = pieces[0] || "0";
        const decimalPart = pieces[1] || "";

        const denominator =
          10n ** BigInt(decimalPart.length);

        const numerator =
          BigInt(wholePart) * denominator +
          BigInt(decimalPart || "0");

        return new Fraction(
          sign * numerator,
          denominator
        );
      }

      throw new Error(
        'Invalid entry "' +
          rawValue +
          '". Use an integer, decimal, or fraction.'
      );
    }

    add(other) {
      return new Fraction(
        this.numerator * other.denominator +
          other.numerator * this.denominator,
        this.denominator * other.denominator
      );
    }

    subtract(other) {
      return new Fraction(
        this.numerator * other.denominator -
          other.numerator * this.denominator,
        this.denominator * other.denominator
      );
    }

    multiply(other) {
      return new Fraction(
        this.numerator * other.numerator,
        this.denominator * other.denominator
      );
    }

    divide(other) {
      if (other.isZero()) {
        throw new Error(
          "Division by zero occurred."
        );
      }

      return new Fraction(
        this.numerator * other.denominator,
        this.denominator * other.numerator
      );
    }

    negate() {
      return new Fraction(
        -this.numerator,
        this.denominator
      );
    }

    isZero() {
      return this.numerator === 0n;
    }
    equals(other) {
  return (
    this.numerator === other.numerator &&
    this.denominator === other.denominator
  );
}

isOne() {
  return (
    this.numerator === 1n &&
    this.denominator === 1n
  );
}

isNegativeOne() {
  return (
    this.numerator === -1n &&
    this.denominator === 1n
  );
}

isNegative() {
  return this.numerator < 0n;
}

absoluteValue() {
  return new Fraction(
    Fraction.absoluteValue(this.numerator),
    this.denominator
  );
}

    toString() {
      if (this.denominator === 1n) {
        return this.numerator.toString();
      }

      return (
        this.numerator.toString() +
        "/" +
        this.denominator.toString()
      );
    }
  }

  /*
   * Page and modal setup
   */

  function loadCSS() {
    if (document.getElementById(CSS_ID)) {
      return;
    }

    const link = document.createElement("link");

    link.id = CSS_ID;
    link.rel = "stylesheet";
    link.href =
  "https://burcukarabina.github.io/computational-math/css/calculators.css?v=7";

    document.head.appendChild(link);
  }

  function createDimensionOptions(
    selectedValue
  ) {
    let options = "";

    for (let value = 1; value <= 6; value++) {
      const selected =
        value === selectedValue
          ? " selected"
          : "";

      options +=
        '<option value="' +
        value +
        '"' +
        selected +
        ">" +
        value +
        "</option>";
    }

    return options;
  }

  function createModal() {
    if (document.getElementById(MODAL_ID)) {
      return;
    }

    const modal = document.createElement("div");

    modal.id = MODAL_ID;
    modal.className = "mc-overlay";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute(
      "aria-labelledby",
      "matrixCalculatorTitle"
    );

    modal.innerHTML = `
      <div class="mc-window">
        <div class="mc-header">
          <h2 id="matrixCalculatorTitle">
            Matrix Calculator
          </h2>

          <button
            type="button"
            id="mc-close"
            aria-label="Close Matrix Calculator"
          >
            &times;
          </button>
        </div>

       <div class="mc-controls">
  <div class="mc-dimensions">
    <span class="mc-dimensions-label">Dimensions:</span>

    <select id="mc-rows" aria-label="Number of rows">
      ${createDimensionOptions(3)}
    </select>

    <span class="mc-times" aria-hidden="true">&times;</span>

    <select id="mc-columns" aria-label="Number of columns">
      ${createDimensionOptions(3)}
    </select>
  </div>

  <button
    type="button"
    id="mc-build"
    class="mc-button mc-secondary"
  >
    Resize Matrix
  </button>

  <button
    type="button"
    id="mc-clear"
    class="mc-button mc-secondary"
  >
    Clear Entries
  </button>

  <label class="mc-show-steps-label">
    <input type="checkbox" id="mc-show-steps">
    Show row operations
  </label>
</div>

        <div class="mc-input-section">
          <div class="mc-matrix-brackets">
            <div
              id="mc-grid"
              class="mc-grid"
              aria-label="Matrix entries"
            ></div>
          </div>
        </div>

      <div class="mc-operation-buttons">
  <button
    type="button"
    id="mc-rref"
    class="mc-button"
  >
    RREF
  </button>

  <button
    type="button"
    id="mc-determinant"
    class="mc-button"
  >
    Determinant
  </button>

  <button
    type="button"
    id="mc-inverse"
    class="mc-button"
  >
    Inverse
  </button>

  <button
    type="button"
    id="mc-characteristic"
    class="mc-button"
  >
    Characteristic Polynomial
  </button>
</div>

        <div class="mc-result-section">
          <h3>Result</h3>

          <div id="mc-result" aria-live="polite">
            Enter a matrix and select an operation.
          </div>
        </div>

        <p class="mc-note">
          You may enter integers, decimals, or fractions such as
          <strong>-3</strong>, <strong>0.5</strong>, or
          <strong>2/7</strong>. Blank entries will be treated
          as zero.
        </p>

        <div class="mc-footer">
          <button
            type="button"
            id="mc-close-bottom"
            class="mc-button mc-secondary"
          >
            Close Calculator
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    bindModalEvents();
    buildGrid();
  }

  /*
   * Matrix input
   */

  function buildGrid() {
    const rows = Number(
      document.getElementById("mc-rows").value
    );

    const columns = Number(
      document.getElementById(
        "mc-columns"
      ).value
    );

    const grid =
      document.getElementById("mc-grid");

    grid.innerHTML = "";

    grid.style.gridTemplateColumns =
      "repeat(" +
      columns +
      ", minmax(58px, 76px))";

    for (let row = 0; row < rows; row++) {
      for (
        let column = 0;
        column < columns;
        column++
      ) {
        const input =
          document.createElement("input");

        input.type = "text";
        input.inputMode = "text";
        input.autocomplete = "off";

        input.setAttribute(
          "aria-label",
          "Entry in row " +
            (row + 1) +
            ", column " +
            (column + 1)
        );

        input.dataset.row = row;
        input.dataset.column = column;

        grid.appendChild(input);
      }
    }

    showMessage(
      "Enter a matrix and select an operation."
    );

    grid.querySelector("input")?.focus();
  }

  function clearGrid() {
    document
      .querySelectorAll("#mc-grid input")
      .forEach(function (input) {
        input.value = "";
      });

    showMessage(
      "Enter a matrix and select an operation."
    );

    document
      .querySelector("#mc-grid input")
      ?.focus();
  }

  function readMatrix() {
    const rows = Number(
      document.getElementById("mc-rows").value
    );

    const columns = Number(
      document.getElementById(
        "mc-columns"
      ).value
    );

    const inputs = Array.from(
      document.querySelectorAll(
        "#mc-grid input"
      )
    );

    const matrix = [];
    let inputIndex = 0;

    for (let row = 0; row < rows; row++) {
      const currentRow = [];

      for (
        let column = 0;
        column < columns;
        column++
      ) {
        try {
          currentRow.push(
            Fraction.parse(
              inputs[inputIndex].value
            )
          );
        } catch (error) {
          inputs[inputIndex].focus();

          throw new Error(
            "Row " +
              (row + 1) +
              ", column " +
              (column + 1) +
              ": " +
              error.message
          );
        }

        inputIndex++;
      }

      matrix.push(currentRow);
    }

    return matrix;
  }

  /*
   * Matrix utility functions
   */

  function cloneMatrix(matrix) {
    return matrix.map(function (row) {
      return row.slice();
    });
  }

  function swapRows(
    matrix,
    firstRow,
    secondRow
  ) {
    const temporaryRow = matrix[firstRow];

    matrix[firstRow] =
      matrix[secondRow];

    matrix[secondRow] =
      temporaryRow;
  }

  function createIdentityMatrix(size) {
    const identity = [];

    for (let row = 0; row < size; row++) {
      const currentRow = [];

      for (
        let column = 0;
        column < size;
        column++
      ) {
        currentRow.push(
          row === column
            ? Fraction.one()
            : Fraction.zero()
        );
      }

      identity.push(currentRow);
    }

    return identity;
  }

  function requireSquareMatrix(
    matrix,
    operation
  ) {
    const rows = matrix.length;
    const columns = matrix[0].length;

    if (rows !== columns) {
      throw new Error(
        operation +
          " requires a square matrix."
      );
    }
  }

  /*
   * RREF
   */


  function formatRowReplacement(
  targetRow,
  pivotRow,
  multiplier
) {
  const target =
    "R" + (targetRow + 1);

  const pivot =
    "R" + (pivotRow + 1);

  const value =
    multiplier.toString();

  if (value === "1") {
    return (
      target +
      " \u2190 " +
      target +
      " \u2212 " +
      pivot
    );
  }

  if (value === "-1") {
    return (
      target +
      " \u2190 " +
      target +
      " + " +
      pivot
    );
  }

  if (value.startsWith("-")) {
    return (
      target +
      " \u2190 " +
      target +
      " + (" +
      value.substring(1) +
      ")" +
      pivot
    );
  }

  return (
    target +
    " \u2190 " +
    target +
    " \u2212 (" +
    value +
    ")" +
    pivot
  );
}

  
 function calculateRREF(originalMatrix) {
  const matrix = cloneMatrix(originalMatrix);
  const steps = [];

  const rowCount = matrix.length;
  const columnCount = matrix[0].length;

  let pivotRow = 0;

  function recordStep(operation) {
    steps.push({
      operation: operation,
      matrix: cloneMatrix(matrix)
    });
  }

  for (
    let pivotColumn = 0;
    pivotColumn < columnCount &&
    pivotRow < rowCount;
    pivotColumn++
  ) {
    let selectedRow = pivotRow;

    while (
      selectedRow < rowCount &&
      matrix[selectedRow][pivotColumn].isZero()
    ) {
      selectedRow++;
    }

    if (selectedRow === rowCount) {
      continue;
    }

    /*
     * Move a nonzero entry into the pivot position.
     */

    if (selectedRow !== pivotRow) {
      swapRows(
        matrix,
        selectedRow,
        pivotRow
      );

      recordStep(
        "R" +
          (pivotRow + 1) +
          " \u2194 R" +
          (selectedRow + 1)
      );
    }

    /*
     * Scale the pivot row so that the pivot is 1.
     */

    const pivotValue =
      matrix[pivotRow][pivotColumn];

    if (pivotValue.toString() !== "1") {
      for (
        let column = 0;
        column < columnCount;
        column++
      ) {
        matrix[pivotRow][column] =
          matrix[pivotRow][column].divide(
            pivotValue
          );
      }

      recordStep(
        "R" +
          (pivotRow + 1) +
          " \u2190 R" +
          (pivotRow + 1) +
          " / (" +
          pivotValue.toString() +
          ")"
      );
    }

    /*
     * Eliminate the remaining entries in the pivot column.
     */

    for (
      let row = 0;
      row < rowCount;
      row++
    ) {
      if (row === pivotRow) {
        continue;
      }

      const multiplier =
        matrix[row][pivotColumn];

      if (multiplier.isZero()) {
        continue;
      }

      for (
        let column = 0;
        column < columnCount;
        column++
      ) {
        matrix[row][column] =
          matrix[row][column].subtract(
            multiplier.multiply(
              matrix[pivotRow][column]
            )
          );
      }

      recordStep(
        formatRowReplacement(
          row,
          pivotRow,
          multiplier
        )
      );
    }

    pivotRow++;
  }

  return {
    matrix: matrix,
    steps: steps
  };
}

  /*
   * Determinant
   */

  function calculateDeterminant(
    originalMatrix
  ) {
    const matrix =
      cloneMatrix(originalMatrix);

    const size = matrix.length;

    let determinant = Fraction.one();
    let rowSwapCount = 0;

    for (
      let pivotColumn = 0;
      pivotColumn < size;
      pivotColumn++
    ) {
      let selectedRow = pivotColumn;

      while (
        selectedRow < size &&
        matrix[selectedRow][
          pivotColumn
        ].isZero()
      ) {
        selectedRow++;
      }

      if (selectedRow === size) {
        return Fraction.zero();
      }

      if (selectedRow !== pivotColumn) {
        swapRows(
          matrix,
          selectedRow,
          pivotColumn
        );

        rowSwapCount++;
      }

      const pivotValue =
        matrix[pivotColumn][
          pivotColumn
        ];

      determinant =
        determinant.multiply(pivotValue);

      for (
        let row = pivotColumn + 1;
        row < size;
        row++
      ) {
        if (
          matrix[row][
            pivotColumn
          ].isZero()
        ) {
          continue;
        }

        const multiplier =
          matrix[row][
            pivotColumn
          ].divide(pivotValue);

        for (
          let column = pivotColumn;
          column < size;
          column++
        ) {
          matrix[row][column] =
            matrix[row][column].subtract(
              multiplier.multiply(
                matrix[pivotColumn][column]
              )
            );
        }
      }
    }

    if (rowSwapCount % 2 !== 0) {
      determinant =
        determinant.negate();
    }

    return determinant;
  }

  /*
   * Inverse
   */

  function calculateInverse(
    originalMatrix
  ) {
    const size =
      originalMatrix.length;

    const left =
      cloneMatrix(originalMatrix);

    const right =
      createIdentityMatrix(size);

    for (
      let pivotColumn = 0;
      pivotColumn < size;
      pivotColumn++
    ) {
      let selectedRow = pivotColumn;

      while (
        selectedRow < size &&
        left[selectedRow][
          pivotColumn
        ].isZero()
      ) {
        selectedRow++;
      }

      if (selectedRow === size) {
        throw new Error(
          "This matrix is singular, so it does not have an inverse."
        );
      }

      if (selectedRow !== pivotColumn) {
        swapRows(
          left,
          selectedRow,
          pivotColumn
        );

        swapRows(
          right,
          selectedRow,
          pivotColumn
        );
      }

      const pivotValue =
        left[pivotColumn][
          pivotColumn
        ];

      for (
        let column = 0;
        column < size;
        column++
      ) {
        left[pivotColumn][column] =
          left[pivotColumn][
            column
          ].divide(pivotValue);

        right[pivotColumn][column] =
          right[pivotColumn][
            column
          ].divide(pivotValue);
      }

      for (
        let row = 0;
        row < size;
        row++
      ) {
        if (row === pivotColumn) {
          continue;
        }

        const multiplier =
          left[row][pivotColumn];

        if (multiplier.isZero()) {
          continue;
        }

        for (
          let column = 0;
          column < size;
          column++
        ) {
          left[row][column] =
            left[row][column].subtract(
              multiplier.multiply(
                left[pivotColumn][column]
              )
            );

          right[row][column] =
            right[row][column].subtract(
              multiplier.multiply(
                right[pivotColumn][column]
              )
            );
        }
      }
    }

    return right;
  }


  /*
 * Characteristic polynomial
 *
 * Convention:
 * p_A(lambda) = det(lambda I - A)
 *
 * Exact support:
 * 1x1, 2x2, and 3x3 matrices.
 */

function characteristicPolynomialCoefficients(matrix) {
  requireSquareMatrix(
    matrix,
    "The characteristic polynomial"
  );

  const size = matrix.length;

  if (size > 3) {
    throw new Error(
      "Characteristic polynomial is currently supported " +
      "for matrices up to 3 × 3."
    );
  }

  if (size === 1) {
    /*
     * lambda - a
     */
    return [
      Fraction.one(),
      matrix[0][0].negate()
    ];
  }

  if (size === 2) {
    const a = matrix[0][0];
    const b = matrix[0][1];
    const c = matrix[1][0];
    const d = matrix[1][1];

    const trace = a.add(d);

    const determinant =
      a.multiply(d).subtract(
        b.multiply(c)
      );

    /*
     * lambda^2 - trace(A)lambda + det(A)
     */
    return [
      Fraction.one(),
      trace.negate(),
      determinant
    ];
  }

  /*
   * For a 3x3 matrix:
   *
   * p(lambda)
   * = lambda^3
   * - tr(A) lambda^2
   * + c_2 lambda
   * - det(A),
   *
   * where c_2 is the sum of the three principal
   * 2x2 minors.
   */

  const a = matrix[0][0];
  const b = matrix[0][1];
  const c = matrix[0][2];

  const d = matrix[1][0];
  const e = matrix[1][1];
  const f = matrix[1][2];

  const g = matrix[2][0];
  const h = matrix[2][1];
  const i = matrix[2][2];

  const trace =
    a.add(e).add(i);

  const principalMinor1 =
    a.multiply(e).subtract(
      b.multiply(d)
    );

  const principalMinor2 =
    a.multiply(i).subtract(
      c.multiply(g)
    );

  const principalMinor3 =
    e.multiply(i).subtract(
      f.multiply(h)
    );

  const secondCoefficient =
    principalMinor1
      .add(principalMinor2)
      .add(principalMinor3);

  const determinant =
    calculateDeterminant(matrix);

  return [
    Fraction.one(),
    trace.negate(),
    secondCoefficient,
    determinant.negate()
  ];
}

/*
 * Evaluate a polynomial at x.
 *
 * Coefficients are stored in descending order.
 * For example:
 *
 * [1, -5, 6]
 *
 * represents lambda^2 - 5lambda + 6.
 */

function evaluatePolynomial(
  coefficients,
  x
) {
  let result = Fraction.zero();

  coefficients.forEach(function (
    coefficient
  ) {
    result =
      result.multiply(x).add(coefficient);
  });

  return result;
}

/*
 * Synthetic division by lambda - root.
 */

function syntheticDivide(
  coefficients,
  root
) {
  const quotient = [];
  let current = coefficients[0];

  quotient.push(current);

  for (
    let index = 1;
    index < coefficients.length - 1;
    index++
  ) {
    current =
      coefficients[index].add(
        current.multiply(root)
      );

    quotient.push(current);
  }

  const remainder =
    coefficients[
      coefficients.length - 1
    ].add(
      current.multiply(root)
    );

  if (!remainder.isZero()) {
    throw new Error(
      "Polynomial division produced a nonzero remainder."
    );
  }

  return quotient;
}

function bigintGCD(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;

  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return a;
}

function bigintLCM(a, b) {
  if (a === 0n || b === 0n) {
    return 0n;
  }

  return (
    (a / bigintGCD(a, b)) * b
  );
}

function positiveDivisors(value) {
  let number =
    value < 0n ? -value : value;

  if (number === 0n) {
    return [0n];
  }

  const divisors = [];

  for (
    let divisor = 1n;
    divisor * divisor <= number;
    divisor++
  ) {
    if (number % divisor === 0n) {
      divisors.push(divisor);

      const paired =
        number / divisor;

      if (paired !== divisor) {
        divisors.push(paired);
      }
    }
  }

  return divisors;
}

/*
 * Convert rational coefficients into proportional
 * integer coefficients by clearing denominators.
 */

function clearPolynomialDenominators(
  coefficients
) {
  let commonDenominator = 1n;

  coefficients.forEach(function (
    coefficient
  ) {
    commonDenominator =
      bigintLCM(
        commonDenominator,
        coefficient.denominator
      );
  });

  return coefficients.map(function (
    coefficient
  ) {
    return (
      coefficient.numerator *
      (
        commonDenominator /
        coefficient.denominator
      )
    );
  });
}

/*
 * Rational Root Theorem.
 *
 * For a monic polynomial with rational coefficients,
 * clear denominators first. Candidate roots are p/q,
 * where p divides the constant term and q divides the
 * leading coefficient.
 */

function findRationalRoot(
  coefficients
) {
  const degree =
    coefficients.length - 1;

  if (degree < 1) {
    return null;
  }

  const integerCoefficients =
    clearPolynomialDenominators(
      coefficients
    );

  const leading =
    integerCoefficients[0];

  const constant =
    integerCoefficients[
      integerCoefficients.length - 1
    ];

  if (constant === 0n) {
    return Fraction.zero();
  }

  const numeratorCandidates =
    positiveDivisors(constant);

  const denominatorCandidates =
    positiveDivisors(leading);

  for (
    let pIndex = 0;
    pIndex < numeratorCandidates.length;
    pIndex++
  ) {
    for (
      let qIndex = 0;
      qIndex < denominatorCandidates.length;
      qIndex++
    ) {
      const numerator =
        numeratorCandidates[pIndex];

      const denominator =
        denominatorCandidates[qIndex];

      const positiveCandidate =
        new Fraction(
          numerator,
          denominator
        );

      if (
        evaluatePolynomial(
          coefficients,
          positiveCandidate
        ).isZero()
      ) {
        return positiveCandidate;
      }

      const negativeCandidate =
        positiveCandidate.negate();

      if (
        evaluatePolynomial(
          coefficients,
          negativeCandidate
        ).isZero()
      ) {
        return negativeCandidate;
      }
    }
  }

  return null;
}

/*
 * Return a readable factor lambda - root.
 */

function linearFactorToHTML(root) {
  if (root.isZero()) {
    return "&lambda;";
  }

  if (root.isNegative()) {
    return (
      "(&lambda; + " +
      escapeHTML(
        root.absoluteValue().toString()
      ) +
      ")"
    );
  }

  return (
    "(&lambda; &minus; " +
    escapeHTML(root.toString()) +
    ")"
  );
}

function formatPolynomialTerm(
  coefficient,
  degree,
  isFirstTerm
) {
  if (coefficient.isZero()) {
    return "";
  }

  const isNegative =
    coefficient.isNegative();

  const absolute =
    coefficient.absoluteValue();

  let sign = "";

  if (isFirstTerm) {
    sign = isNegative ? "&minus;" : "";
  } else {
    sign = isNegative
      ? " &minus; "
      : " + ";
  }

  let variablePart = "";

  if (degree === 1) {
    variablePart = "&lambda;";
  } else if (degree > 1) {
    variablePart =
      "&lambda;<sup>" +
      degree +
      "</sup>";
  }

  let coefficientPart = "";

  if (
    degree === 0 ||
    !absolute.isOne()
  ) {
    coefficientPart =
      escapeHTML(
        absolute.toString()
      );
  }

  if (
    degree > 0 &&
    coefficientPart !== ""
  ) {
    coefficientPart += "";
  }

  return (
    sign +
    coefficientPart +
    variablePart
  );
}

function polynomialToHTML(
  coefficients
) {
  const degree =
    coefficients.length - 1;

  let html = "";
  let firstTerm = true;

  coefficients.forEach(function (
    coefficient,
    index
  ) {
    const currentDegree =
      degree - index;

    const term =
      formatPolynomialTerm(
        coefficient,
        currentDegree,
        firstTerm
      );

    if (term !== "") {
      html += term;
      firstTerm = false;
    }
  });

  return html || "0";
}

/*
 * Factor a polynomial over the rational numbers.
 *
 * Linear rational factors are extracted repeatedly.
 * Any remaining irreducible quadratic or cubic is
 * displayed as one factor.
 */

function factorPolynomialToHTML(
  originalCoefficients
) {
  let coefficients =
    originalCoefficients.slice();

  const factors = [];

  while (
    coefficients.length > 2
  ) {
    const root =
      findRationalRoot(coefficients);

    if (root === null) {
      break;
    }

    factors.push(
      linearFactorToHTML(root)
    );

    coefficients =
      syntheticDivide(
        coefficients,
        root
      );
  }

  /*
   * Handle the remaining linear polynomial.
   */

  if (coefficients.length === 2) {
    const leading =
      coefficients[0];

    const constant =
      coefficients[1];

    const root =
      constant
        .negate()
        .divide(leading);

    if (!leading.isOne()) {
      factors.push(
        escapeHTML(
          leading.toString()
        )
      );
    }

    factors.push(
      linearFactorToHTML(root)
    );
  } else if (
    coefficients.length > 1
  ) {
    /*
     * Remaining quadratic or cubic has no rational
     * linear root and is irreducible over Q according
     * to the rational-root search.
     */

    factors.push(
      "(" +
      polynomialToHTML(coefficients) +
      ")"
    );
  }

  return factors.join("");
}
  /*
   * Result display
   */

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function matrixToHTML(matrix) {
    let html =
      '<div class="mc-input-section">' +
      '<div class="mc-matrix-brackets">' +
      '<div class="mc-result-grid" style="' +
      "display:grid;" +
      "grid-template-columns:repeat(" +
      matrix[0].length +
      ",minmax(55px,76px));" +
      "gap:8px;" +
      '">';

    matrix.forEach(function (row) {
      row.forEach(function (entry) {
        html +=
          '<div style="' +
          "padding:8px 5px;" +
          "text-align:center;" +
          "font-size:16px;" +
          '">' +
          escapeHTML(entry.toString()) +
          "</div>";
      });
    });

    html +=
      "</div>" +
      "</div>" +
      "</div>";

    return html;
  }

  function showCharacteristicPolynomial(
  coefficients
) {
  const result =
    document.getElementById("mc-result");

  result.classList.remove("mc-error");

  const expanded =
    polynomialToHTML(coefficients);

  const factored =
    factorPolynomialToHTML(
      coefficients
    );

  result.innerHTML =
    '<div class="mc-result-title">' +
      "Characteristic Polynomial" +
    "</div>" +

    '<div class="mc-polynomial-convention">' +
      "p<sub>A</sub>(&lambda;) = " +
      "det(&lambda;I &minus; A)" +
    "</div>" +

    '<div class="mc-polynomial-factored">' +
      factored +
    "</div>" +

    '<div class="mc-polynomial-expanded">' +
      "<strong>Expanded form:</strong> " +
      expanded +
    "</div>";
}

  function showMessage(
    message,
    isError
  ) {
    const result =
      document.getElementById("mc-result");

    result.textContent = message;

    result.classList.toggle(
      "mc-error",
      Boolean(isError)
    );
  }

  function showMatrixResult(
    title,
    matrix
  ) {
    const result =
      document.getElementById("mc-result");

    result.classList.remove("mc-error");

    result.innerHTML =
      "<div>" +
      escapeHTML(title) +
      "</div>" +
      matrixToHTML(matrix);
  }

  function showScalarResult(
    title,
    value
  ) {
    const result =
      document.getElementById("mc-result");

    result.classList.remove("mc-error");

    result.innerHTML =
      escapeHTML(title) +
      ": " +
      escapeHTML(value.toString());
  }

  function showRREFResult(
  calculation,
  showSteps
) {
  const result =
    document.getElementById("mc-result");

  result.classList.remove("mc-error");

  let html =
    '<div class="mc-result-title">' +
    "Reduced Row Echelon Form" +
    "</div>" +
    matrixToHTML(calculation.matrix);

  if (showSteps) {
    html +=
      '<div class="mc-row-steps">' +
      "<h4>Row Operations</h4>";

    if (calculation.steps.length === 0) {
      html +=
        '<p class="mc-no-steps">' +
        "The matrix is already in reduced row echelon form." +
        "</p>";
    } else {
      calculation.steps.forEach(
        function (step, index) {
          html +=
            '<div class="mc-row-step">' +
            '<div class="mc-row-step-operation">' +
            '<span class="mc-step-number">' +
            (index + 1) +
            ".</span> " +
            escapeHTML(step.operation) +
            "</div>" +
            matrixToHTML(step.matrix) +
            "</div>";
        }
      );
    }

    html += "</div>";
  }

  result.innerHTML = html;
}

  /*
   * Button actions
   */

  function handleRREF() {
  try {
    const matrix = readMatrix();

    const calculation =
      calculateRREF(matrix);

    const showSteps =
      document.getElementById(
        "mc-show-steps"
      ).checked;

    showRREFResult(
      calculation,
      showSteps
    );
  } catch (error) {
    showMessage(
      error.message,
      true
    );
  }
}

  function handleDeterminant() {
    try {
      const matrix = readMatrix();

      requireSquareMatrix(
        matrix,
        "The determinant"
      );

      const result =
        calculateDeterminant(matrix);

      showScalarResult(
        "Determinant",
        result
      );
    } catch (error) {
      showMessage(
        error.message,
        true
      );
    }
  }

  function handleInverse() {
    try {
      const matrix = readMatrix();

      requireSquareMatrix(
        matrix,
        "Finding an inverse"
      );

      const result =
        calculateInverse(matrix);

      showMatrixResult(
        "Inverse Matrix",
        result
      );
    } catch (error) {
      showMessage(
        error.message,
        true
      );
    }
  }
function handleCharacteristicPolynomial() {
  try {
    const matrix = readMatrix();

    requireSquareMatrix(
      matrix,
      "The characteristic polynomial"
    );

    const coefficients =
      characteristicPolynomialCoefficients(
        matrix
      );

    showCharacteristicPolynomial(
      coefficients
    );
  } catch (error) {
    showMessage(
      error.message,
      true
    );
  }
}
  /*
   * Open, close, and event handling
   */

  function makeCalculatorDraggable() {
  const windowElement =
    document.querySelector("#matrixCalculatorModal .mc-window");

  const header =
    document.querySelector("#matrixCalculatorModal .mc-header");

  if (!windowElement || !header) {
    return;
  }

  if (header.dataset.draggingInitialized === "true") {
    return;
  }

  header.dataset.draggingInitialized = "true";

  let isDragging = false;
  let startingMouseX = 0;
  let startingMouseY = 0;
  let startingLeft = 0;
  let startingTop = 0;

  header.addEventListener("mousedown", function (event) {
    /*
     * Do not start dragging when the close button is clicked.
     */
    if (event.target.closest("button")) {
      return;
    }

    isDragging = true;

    const rectangle =
      windowElement.getBoundingClientRect();

    startingMouseX = event.clientX;
    startingMouseY = event.clientY;
    startingLeft = rectangle.left;
    startingTop = rectangle.top;

    /*
     * Switch from right-positioning to left-positioning.
     */
    windowElement.style.right = "auto";
    windowElement.style.left =
      startingLeft + "px";
    windowElement.style.top =
      startingTop + "px";

    document.body.style.userSelect = "none";

    event.preventDefault();
  });

  document.addEventListener("mousemove", function (event) {
    if (!isDragging) {
      return;
    }

    const horizontalChange =
      event.clientX - startingMouseX;

    const verticalChange =
      event.clientY - startingMouseY;

    const windowWidth =
      windowElement.offsetWidth;

    const windowHeight =
      windowElement.offsetHeight;

    /*
     * Keep part of the calculator visible on screen.
     */
    const minimumVisibleAmount = 80;

    const minimumLeft =
      -windowWidth + minimumVisibleAmount;

    const maximumLeft =
      window.innerWidth - minimumVisibleAmount;

    const minimumTop = 0;

    const maximumTop =
      Math.max(
        0,
        window.innerHeight - minimumVisibleAmount
      );

    const newLeft =
      Math.min(
        maximumLeft,
        Math.max(
          minimumLeft,
          startingLeft + horizontalChange
        )
      );

    const newTop =
      Math.min(
        maximumTop,
        Math.max(
          minimumTop,
          startingTop + verticalChange
        )
      );

    windowElement.style.left =
      newLeft + "px";

    windowElement.style.top =
      newTop + "px";
  });

  document.addEventListener("mouseup", function () {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    document.body.style.userSelect = "";
  });
} 
  function openCalculator() {
  loadCSS();
  createModal();
  makeCalculatorDraggable();

  const modal =
    document.getElementById(MODAL_ID);

  modal.classList.add(
    "mc-overlay-visible"
  );

  document
    .querySelector("#mc-grid input")
    ?.focus();
}

  function closeCalculator() {
    const modal =
      document.getElementById(MODAL_ID);

    if (modal) {
      modal.classList.remove(
        "mc-overlay-visible"
      );
    }
  }

  function bindModalEvents() {
  
    document
      .getElementById(
        "mc-close-bottom"
      )
      .addEventListener(
        "click",
        closeCalculator
      );

    document
      .getElementById("mc-build")
      .addEventListener(
        "click",
        buildGrid
      );

    document
      .getElementById("mc-clear")
      .addEventListener(
        "click",
        clearGrid
      );

    document
      .getElementById("mc-rref")
      .addEventListener(
        "click",
        handleRREF
      );

    document
      .getElementById(
        "mc-determinant"
      )
      .addEventListener(
        "click",
        handleDeterminant
      );

    document
      .getElementById("mc-inverse")
      .addEventListener(
        "click",
        handleInverse
      );

    document
      .getElementById(MODAL_ID)
      .addEventListener(
        "click",
        function (event) {
          if (
            event.target.id === MODAL_ID
          ) {
            closeCalculator();
          }
        }
      );
  }

  document
  .getElementById(
    "mc-characteristic"
  )
  .addEventListener(
    "click",
    handleCharacteristicPolynomial
  );

  function bindLaunchButtons() {
    document
      .querySelectorAll(
        ".matrixCalculator"
      )
      .forEach(function (button) {
        if (
          button.dataset
            .matrixCalculatorBound
        ) {
          return;
        }

        button.dataset
          .matrixCalculatorBound =
          "true";

        button.addEventListener(
          "click",
          openCalculator
        );
      });
  }

  window.MatrixCalculator = {
    open: openCalculator,
    close: closeCalculator
  };

  loadCSS();
  bindLaunchButtons();

  const observer =
    new MutationObserver(function () {
      bindLaunchButtons();
    });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  document.addEventListener(
    "keydown",
    function (event) {
      if (event.key === "Escape") {
        closeCalculator();
      }
    }
  );
})();
