(function () {
  "use strict";
  const app=window.MatrixCalculatorApp=window.MatrixCalculatorApp||{};
  const current=document.currentScript;
  const base=current?.src ? current.src.substring(0,current.src.lastIndexOf("/")+1) : "";
  const cssUrl=new URL("../css/calculators.css",base).href;
  const modules=["fraction.js","matrixCore.js","drag.js","ui.js"];

  function loadCSS(){if(document.getElementById("matrixCalculatorCSS"))return;const link=document.createElement("link");link.id="matrixCalculatorCSS";link.rel="stylesheet";link.href=cssUrl;document.head.appendChild(link);}
  function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement("script");script.src=base+src;script.onload=resolve;script.onerror=()=>reject(new Error(`Could not load ${src}`));document.head.appendChild(script);});}
  function open(){app.createModal();const modal=document.getElementById("matrixCalculatorModal");modal.classList.add("mc-overlay-visible");app.makeDraggable(modal.querySelector(".mc-window"),modal.querySelector(".mc-header"));modal.querySelector("#mc-grid input")?.focus();}
  function close(){document.getElementById("matrixCalculatorModal")?.classList.remove("mc-overlay-visible");}
  app.open=open;app.close=close;
  window.MatrixCalculator={open,close};

  async function initialize(){loadCSS();for(const module of modules)await loadScript(module);document.querySelectorAll(".matrixCalculator").forEach(bind);new MutationObserver(()=>document.querySelectorAll(".matrixCalculator").forEach(bind)).observe(document.body,{childList:true,subtree:true});}
  function bind(button){if(button.dataset.matrixCalculatorBound)return;button.dataset.matrixCalculatorBound="true";button.addEventListener("click",open);}
  document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
  initialize().catch(error=>console.error("Matrix Calculator:",error));
})();
