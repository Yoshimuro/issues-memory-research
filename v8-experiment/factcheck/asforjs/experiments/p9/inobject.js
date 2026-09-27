let body = ''; for (let i = 0; i < 300; i++) body += 'this.q' + i + '=' + i + ';';
const F = new Function(body);
const objs = []; for (let i = 0; i < 20; i++) objs.push(new F());
%DebugPrint(objs[19]);
