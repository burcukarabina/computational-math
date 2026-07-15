(function () {
  "use strict";

  const MODAL_ID = "matrixCalculatorModal";
  const CSS_ID = "matrixCalculatorCSS";

  function loadCSS() {
    if (document.getElementById(CSS_ID)) {
      return;
    }

    const link = document.createElement("link");

    link.id = CSS_ID;
    link.rel = "stylesheet";
    link.href =
      "https://burcukarabina.github.io/computational-math/css/calculators.css";

    document.head.appendChild(link);
  }

  function createDimensionOptions(selectedValue) {
    let options = "";

    for (let value = 1; value <= 6; value++) {
      const selected =
        value === selectedValue ? " selected" : "";

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
          <label>
            Rows:
            <select id="mc-rows">
              ${createDimensionOptions(3)}
            </select>
          </label>

          <label>
            Columns:
            <select id="mc-columns">
              ${createDimensionOptions(3)}
            </select>
          </label>

          <button
            type="button"
            id="mc-build"
            class="mc-button"
          >
            Build Matrix
          </button>

          <button
            type="button"
            id="mc-clear"
            class="mc-button mc-secondary"
          >
            Clear Entries
          </button>
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

  function buildGrid() {
    const rows = Number(
      document.getElementById("mc-rows").value
    );

    const columns = Number(
      document.getElementById("mc-columns").value
    );

    const grid = document.getElementById("mc-grid");

    grid.innerHTML = "";
    grid.style.gridTemplateColumns =
      "repeat(" + columns + ", minmax(58px, 76px))";

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const input = document.createElement("input");

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

  function showMessage(message, isError) {
    const result = document.getElementById("mc-result");

    result.textContent = message;
    result.classList.toggle(
      "mc-error",
      Boolean(isError)
    );
  }

  function showNotImplemented(operation) {
    showMessage(
      operation +
        " will be activated in the next step.",
      false
    );
  }

  function openCalculator() {
    loadCSS();
    createModal();

    const modal = document.getElementById(MODAL_ID);

    modal.classList.add("mc-overlay-visible");

    document
      .querySelector("#mc-grid input")
      ?.focus();
  }

  function closeCalculator() {
    const modal = document.getElementById(MODAL_ID);

    if (modal) {
      modal.classList.remove("mc-overlay-visible");
    }
  }

  function bindModalEvents() {
    document
      .getElementById("mc-close")
      .addEventListener("click", closeCalculator);

    document
      .getElementById("mc-close-bottom")
      .addEventListener("click", closeCalculator);

    document
      .getElementById("mc-build")
      .addEventListener("click", buildGrid);

    document
      .getElementById("mc-clear")
      .addEventListener("click", clearGrid);

    document
      .getElementById("mc-rref")
      .addEventListener("click", function () {
        showNotImplemented("RREF");
      });

    document
      .getElementById("mc-determinant")
      .addEventListener("click", function () {
        showNotImplemented("Determinant");
      });

    document
      .getElementById("mc-inverse")
      .addEventListener("click", function () {
        showNotImplemented("Inverse");
      });

    document
      .getElementById(MODAL_ID)
      .addEventListener("click", function (event) {
        if (event.target.id === MODAL_ID) {
          closeCalculator();
        }
      });
  }

  function bindLaunchButtons() {
    document
      .querySelectorAll(".matrixCalculator")
      .forEach(function (button) {
        if (button.dataset.matrixCalculatorBound) {
          return;
        }

        button.dataset.matrixCalculatorBound = "true";

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

  /*
   * Möbius may add question content after the external
   * script has loaded, so watch for additional buttons.
   */
  const observer = new MutationObserver(function () {
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
