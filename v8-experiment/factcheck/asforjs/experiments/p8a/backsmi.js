const log = typeof print === 'function' ? print : console.log;
function sub(a, b) { return a - b; }
let x = 2 ** 40; log('2**40 isSmi', %IsSmi(x));
let y = sub(x, 2 ** 40 - 5); log('2**40 - (2**40-5) = ' + y + ' isSmi', %IsSmi(y));
let z = 1.5 + 1.5; log('1.5+1.5 = ' + z + ' isSmi', %IsSmi(z));
function addTen(v) { return v + 10; }
log('addTen(2.5 - 0.5) isSmi', %IsSmi(addTen(2.5 - 0.5)));
const arr = [1, 2, 3]; arr.push(1.5); arr[3] = 4; log('array after 1.5 replaced by 4: double elements still', %HasDoubleElements(arr));
