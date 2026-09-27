// Early error inside a never-called function, after return
function neverCalled() {
  return 1;
  let a = 1;
  let a = 2;
}
print_or_log("loaded without error");
function print_or_log(s) { (typeof print === 'function' ? print : console.log)(s) }
