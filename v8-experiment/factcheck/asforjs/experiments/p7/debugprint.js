function doSum(a) { return a + 1; }
doSum(1); doSum(2);
const arr = [1, 2, 3];
%DebugPrint(arr);
%DebugPrint(doSum);
print('HaveSameMap returns:', %HaveSameMap({a:1}, {a:2}), typeof %HaveSameMap({a:1}, {b:2}));
print('Has*Elements:', %HasSmiElements(arr), %HasDoubleElements([1.5]), %HasObjectElements(['a']), %HasHoleyElements([1,,2]), %HasDictionaryElements(arr));
