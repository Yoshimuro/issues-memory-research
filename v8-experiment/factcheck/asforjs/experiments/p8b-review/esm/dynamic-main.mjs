console.log('dynamic-main: executed');
setTimeout(() => import('./dead.mjs').then(() => console.log('loaded'), e => console.log('import() rejected later: ' + e.name + ': ' + e.message)), 10);
