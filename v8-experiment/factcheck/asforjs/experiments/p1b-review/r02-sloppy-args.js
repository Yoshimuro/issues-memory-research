// p1b-15: does sloppy `arguments` force parameters into the context?
function sloppyArgs(a, b) { return a + b + arguments.length; }
function strictArgs(a, b) { 'use strict'; return a + b + arguments.length; }
function noArgs(a, b) { return a + b; }
sloppyArgs(1, 2); strictArgs(1, 2); noArgs(1, 2);
