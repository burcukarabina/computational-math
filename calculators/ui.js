(function (app) {
  "use strict";
  const MODAL_ID="matrixCalculatorModal";
  const esc=(v)=>String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  const options=(selected)=>[1,2,3,4,5,6].map(n=>`<option value="${n}"${n===selected?" selected":""}>${n}</option>`).join("");

  function createModal(){
    if(document.getElementById(MODAL_ID))return;
    const modal=document.createElement("div");
    modal.id=MODAL_ID; modal.className="mc-overlay"; modal.setAttribute("role","dialog"); modal.setAttribute("aria-modal","false");
    modal.innerHTML=`<div class="mc-window">
      <div class="mc-header"><h2>Matrix Calculator</h2><button type="button" id="mc-close" aria-label="Close Matrix Calculator">&times;</button></div>
      <div class="mc-controls">
        <div class="mc-dimensions"><span class="mc-dimensions-label">Dimensions:</span><select id="mc-rows" aria-label="Rows">${options(3)}</select><span class="mc-times">&times;</span><select id="mc-columns" aria-label="Columns">${options(3)}</select></div>
        <button type="button" id="mc-build" class="mc-button mc-secondary">Resize Matrix</button>
        <button type="button" id="mc-clear" class="mc-button mc-secondary">Clear Entries</button>
        <label class="mc-show-steps-label"><input type="checkbox" id="mc-show-steps"> Show row operations</label>
      </div>
      <div class="mc-input-section"><div class="mc-matrix-brackets"><div id="mc-grid" class="mc-grid"></div></div></div>
      <div class="mc-operation-buttons">
        <button type="button" id="mc-rref" class="mc-button">RREF</button>
        <button type="button" id="mc-determinant" class="mc-button">Determinant</button>
        <button type="button" id="mc-inverse" class="mc-button">Inverse</button>
        <button type="button" id="mc-characteristic" class="mc-button">Characteristic Polynomial</button>
      </div>
      <div class="mc-result-section"><h3>Result</h3><div id="mc-result" aria-live="polite">Enter a matrix and select an operation.</div></div>
      <p class="mc-note">Enter integers, decimals, or fractions such as <strong>-3</strong>, <strong>0.5</strong>, or <strong>2/7</strong>. Blank entries are treated as zero.</p>
      <div class="mc-footer"><button type="button" id="mc-close-bottom" class="mc-button mc-secondary">Close Calculator</button></div>
    </div>`;
    document.body.appendChild(modal);
    bindEvents(); buildGrid();
  }

  function buildGrid(){
    const rows=Number(document.getElementById("mc-rows").value), cols=Number(document.getElementById("mc-columns").value), grid=document.getElementById("mc-grid");
    grid.innerHTML=""; grid.style.gridTemplateColumns=`repeat(${cols},minmax(58px,76px))`;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const input=document.createElement("input"); input.type="text"; input.autocomplete="off"; input.setAttribute("aria-label",`Entry in row ${r+1}, column ${c+1}`); grid.appendChild(input);
    }
    showMessage("Enter a matrix and select an operation."); grid.querySelector("input")?.focus();
  }
  function clearGrid(){document.querySelectorAll("#mc-grid input").forEach(i=>i.value="");showMessage("Enter a matrix and select an operation.");}
  function readMatrix(){
    const rows=Number(document.getElementById("mc-rows").value),cols=Number(document.getElementById("mc-columns").value),inputs=[...document.querySelectorAll("#mc-grid input")],m=[];let k=0;
    for(let r=0;r<rows;r++){const row=[];for(let c=0;c<cols;c++){try{row.push(app.Fraction.parse(inputs[k].value));}catch(e){inputs[k].focus();throw new Error(`Row ${r+1}, column ${c+1}: ${e.message}`);}k++;}m.push(row);}return m;
  }
  function matrixHTML(matrix){return `<div class="mc-input-section"><div class="mc-matrix-brackets"><div class="mc-result-grid" style="display:grid;grid-template-columns:repeat(${matrix[0].length},minmax(55px,76px));gap:8px">${matrix.flat().map(x=>`<div>${esc(x)}</div>`).join("")}</div></div></div>`;}
  function showMessage(message,error=false){const box=document.getElementById("mc-result");box.textContent=message;box.classList.toggle("mc-error",error);}
  function showMatrix(title,m){const box=document.getElementById("mc-result");box.classList.remove("mc-error");box.innerHTML=`<div class="mc-result-title">${esc(title)}</div>${matrixHTML(m)}`;}
  function showRref(calc){let html=`<div class="mc-result-title">Reduced Row Echelon Form</div>${matrixHTML(calc.matrix)}`;if(document.getElementById("mc-show-steps").checked){html+=`<div class="mc-row-steps"><h4>Row Operations</h4>`;html+=calc.steps.length?calc.steps.map((s,i)=>`<div class="mc-row-step"><div class="mc-row-step-operation"><span class="mc-step-number">${i+1}.</span> ${esc(s.operation)}</div>${matrixHTML(s.matrix)}</div>`).join(""):`<p class="mc-no-steps">The matrix is already in reduced row echelon form.</p>`;html+="</div>";}document.getElementById("mc-result").innerHTML=html;}
  function polyHTML(coeffs){
    const degree=coeffs.length-1;let first=true,out="";
    coeffs.forEach((coef,i)=>{if(coef.isZero())return;const d=degree-i,neg=coef.isNegative(),abs=coef.absoluteValue();out+=first?(neg?"&minus;":""):(neg?" &minus; ":" + ");if(d===0||!abs.isOne())out+=esc(abs);if(d>0)out+="&lambda;"+(d>1?`<sup>${d}</sup>`:"");first=false;});return out||"0";
  }
  function factorHTML(coeffs){
    const {roots,remainder}=app.core.factor(coeffs);const factor=(r)=>r.isZero()?"&lambda;":r.isNegative()?`(&lambda; + ${esc(r.absoluteValue())})`:`(&lambda; &minus; ${esc(r)})`;
    let out=roots.map(factor).join("");
    if(remainder.length===2){const root=remainder[1].negate().divide(remainder[0]);if(!remainder[0].isOne())out+=esc(remainder[0]);out+=factor(root);}else if(remainder.length>1)out+=`(${polyHTML(remainder)})`;
    return out;
  }
  function run(action){try{action(readMatrix());}catch(e){showMessage(e.message,true);}}
  function bindEvents(){
    document.getElementById("mc-close").addEventListener("click",app.close);
    document.getElementById("mc-close-bottom").addEventListener("click",app.close);
    document.getElementById("mc-build").addEventListener("click",buildGrid);
    document.getElementById("mc-clear").addEventListener("click",clearGrid);
    document.getElementById("mc-rref").addEventListener("click",()=>run(m=>showRref(app.core.rref(m))));
    document.getElementById("mc-determinant").addEventListener("click",()=>run(m=>{const d=app.core.determinant(m);document.getElementById("mc-result").innerHTML=`Determinant: ${esc(d)}`;}));
    document.getElementById("mc-inverse").addEventListener("click",()=>run(m=>showMatrix("Inverse Matrix",app.core.inverse(m))));
    document.getElementById("mc-characteristic").addEventListener("click",()=>run(m=>{const c=app.core.characteristicCoefficients(m);document.getElementById("mc-result").innerHTML=`<div class="mc-result-title">Characteristic Polynomial</div><div class="mc-polynomial-convention">p<sub>A</sub>(&lambda;) = det(&lambda;I &minus; A)</div><div class="mc-polynomial-factored">${factorHTML(c)}</div><div class="mc-polynomial-expanded"><strong>Expanded form:</strong> ${polyHTML(c)}</div>`;}));
  }

  app.createModal=createModal;
})(window.MatrixCalculatorApp = window.MatrixCalculatorApp || {});
