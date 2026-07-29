(function (app) {
  "use strict";
  app.makeDraggable = function (windowElement, header) {
    if (!windowElement || !header || header.dataset.dragReady === "true") return;
    header.dataset.dragReady = "true";
    let dragging=false,startX=0,startY=0,startLeft=0,startTop=0;
    header.addEventListener("mousedown", function(event){
      if(event.target.closest("button,select,input,label"))return;
      dragging=true;
      const rect=windowElement.getBoundingClientRect();
      startX=event.clientX; startY=event.clientY; startLeft=rect.left; startTop=rect.top;
      windowElement.style.right="auto";
      windowElement.style.left=`${startLeft}px`;
      windowElement.style.top=`${startTop}px`;
      document.body.style.userSelect="none";
      event.preventDefault();
    });
    document.addEventListener("mousemove", function(event){
      if(!dragging)return;
      const visible=80;
      const minLeft=-windowElement.offsetWidth+visible;
      const maxLeft=window.innerWidth-visible;
      const maxTop=Math.max(0,window.innerHeight-visible);
      const left=Math.min(maxLeft,Math.max(minLeft,startLeft+event.clientX-startX));
      const top=Math.min(maxTop,Math.max(0,startTop+event.clientY-startY));
      windowElement.style.left=`${left}px`;
      windowElement.style.top=`${top}px`;
    });
    document.addEventListener("mouseup", function(){
      if(!dragging)return;
      dragging=false;
      document.body.style.userSelect="";
    });
  };
})(window.MatrixCalculatorApp = window.MatrixCalculatorApp || {});
