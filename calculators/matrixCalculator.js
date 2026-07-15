(function () {

function injectCSS() {

    if (document.getElementById("matrixCalculatorCSS"))
        return;
    
    const link = document.createElement("link");

    link.id = "matrixCalculatorCSS";
    link.rel = "stylesheet";
    link.href =
        "https://burcukarabina.github.io/computational-math/css/calculators.css";

    document.head.appendChild(link);

}

function createModal() {

    if (document.getElementById("matrixCalculatorModal"))
        return;

    const modal = document.createElement("div");

    modal.id = "matrixCalculatorModal";

    modal.innerHTML = `

<div class="mc-overlay">

<div class="mc-window">

<div class="mc-header">

<h2>Matrix Calculator</h2>

<button id="mc-close">&times;</button>

</div>

<div class="mc-body">

<p>

This is the reusable Matrix Calculator.

</p>

<p>

In the next step we'll create the matrix entry grid.

</p>

</div>

</div>

</div>

`;

    document.body.appendChild(modal);

    document
        .getElementById("mc-close")
        .onclick = close;

}

function open() {

    injectCSS();

    createModal();

    document
        .querySelector(".mc-overlay")
        .style.display = "flex";

}

function close() {

    document
        .querySelector(".mc-overlay")
        .style.display = "none";

}

window.MatrixCalculator = {

    open : open,

    close : close

};

document.querySelectorAll(".matrixCalculator")
.forEach(function(button){

    button.onclick = open;

});

})();
