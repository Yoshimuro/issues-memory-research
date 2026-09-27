// "Typical" JSON-like records with strings: heap after full GC, d8 (pointer compression ON) vs node (OFF).
// <engine> --expose-gc --trace-gc pc-mixed.js ; compare the Mark-Compact result after "baseline" and after "built".
var out = (typeof print === 'function') ? print : console.log;
function build() {
  var data = [];
  for (var i = 0; i < 200000; i++) data.push({
    id: i, name: 'user name number ' + i, email: 'user' + i + '@example.com', score: i * 0.37,
    active: i % 2 === 0, tags: ['alpha', 'beta', 'gamma'], bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ' + i,
  });
  for (var j = 0; j < data.length; j++) { data[j].name.charCodeAt(0); data[j].email.charCodeAt(0); data[j].bio.charCodeAt(0); } // flatten cons strings
  return data;
}
gc(); gc(); out('--- baseline');
var d = build();
gc(); gc(); out('--- built ' + d.length);
