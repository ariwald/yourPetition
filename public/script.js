// let c = $("canvas"),
//   sig = $('input[name="sig"]'),
//   canvas = document.querySelector("canvas"),
//   ctx = canvas.getContext("2d"),
//   rect = canvas.getBoundingClientRect(),
//   x,
//   y;
//
// // draw on mobile
// canvas.ontouchstart = e => {
//   e.preventDefault();
//   ctx.strokeStyle = "#0275d8";
//   x = e.touches[0].clientX - rect.left;
//   y = e.touches[0].clientY - rect.top;
// };
//
// canvas.ontouchmove = e => {
//   e.preventDefault();
//   let newX = e.touches[0].clientX - rect.left,
//     newY = e.touches[0].clientY - rect.top;
//   ctx.beginPath();
//   ctx.moveTo(x, y);
//   ctx.lineTo(newX, newY);
//   ctx.stroke();
//   ctx.closePath();
//   (x = newX), (y = newY);
// };
//
// canvas.ontouchend = () => {
//   let dataURL = canvas.toDataURL();
//   sig.val(dataURL);
// };
