// field representation of an accumulator initialised with 0 vs -0
const a = {sum: 0}; const b = {sum: -0};
print('--- {sum: 0}'); %DebugPrint(a);
print('--- {sum: -0}'); %DebugPrint(b);
const a2 = {sum: 0}; a2.sum += 0.5;
print('--- {sum:0} after += 0.5: old map deprecated? same map as fresh {sum:0}: ' + %HaveSameMap(a2, {sum: 0}));
print('is -0 a Smi: ' + %IsSmi(-0) + ', is 0 a Smi: ' + %IsSmi(0));
