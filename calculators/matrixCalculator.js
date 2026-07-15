console.log("Matrix Calculator JS loaded.");

document.addEventListener("DOMContentLoaded", function () {

    const p = document.getElementById("externalJsTest");

    if (p) {
        p.innerHTML =
            "<span style='color:green;font-weight:bold;'>✓ External JavaScript loaded successfully!</span>";
    }

});
