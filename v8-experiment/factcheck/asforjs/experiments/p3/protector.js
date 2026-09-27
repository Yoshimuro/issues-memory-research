const log = typeof print === 'function' ? print : console.log;
log('before');
Array.prototype[3] = 1;
log('after Array.prototype[3]=1');
