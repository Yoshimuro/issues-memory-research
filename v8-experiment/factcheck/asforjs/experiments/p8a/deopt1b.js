function add3(a, b) { return a + b; }
%PrepareFunctionForOptimization(add3); add3(1,2); add3(3,4); %OptimizeFunctionOnNextCall(add3); add3(1,2);
print('status before', %GetOptimizationStatus(add3).toString(2));
print(add3(2**29, 2**29), %IsSmi(add3(2**29, 2**29)));
print('status after 2^30 result', %GetOptimizationStatus(add3).toString(2));
for (let i=0;i<5;i++) add3(2**29, 2**29);
print('status after 5 more', %GetOptimizationStatus(add3).toString(2));
