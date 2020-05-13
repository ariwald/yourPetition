var canvas = $("#canvas")[0];

if ($("#canvas")[0]) {
    var signing = $("#canvas")[0].getContext("2d");
    signing.strokeStyle = "black";
    signing.lineWidth = 3;
    let isSigning = false;
    let lastX = 0;
    let lastY = 0;
    $("#canvas").on("mousedown", e => {
        isSigning = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });
    $("#canvas").on("mousemove", sign);
    $("#canvas").on("mouseup", () => {
        let signature = $("#canvas")[0].toDataURL();
        isSigning = false;
        $("#input-sign").attr("value", signature);
    });
    $("#canvas").on("mouseout", () => (isSigning = false));
    function sign(e) {
        if (!isSigning) return;
        signing.beginPath();
        signing.moveTo(lastX, lastY);
        signing.lineTo(e.offsetX, e.offsetY);
        signing.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
        var dataURL = canvas.toDataURL();
        console.log(canvas);
        console.log(dataURL);
        var hiddenField = $("#hiddenField");
        hiddenField.val(dataURL);
    }
}
