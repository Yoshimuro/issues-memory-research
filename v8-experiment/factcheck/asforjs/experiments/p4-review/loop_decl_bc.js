// Is the bytecode different for `for (var i = 0; ...)` vs `var i; ... for (i = 0; ...)`?
function header(arr) { let s = 0; for (var i = 0; i < arr.length; i++) { s += arr[i]; } return s; }
function above(arr) { let s = 0; var i; for (i = 0; i < arr.length; i++) { s += arr[i]; } return s; }
header([1, 2]); above([1, 2]);
