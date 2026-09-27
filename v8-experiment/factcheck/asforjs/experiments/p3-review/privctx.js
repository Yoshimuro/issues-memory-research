// Doc l.447: "private fields do not create an extra environment"
function makeClassPriv(){ class K { #p = 1; get(){ return this.#p; } } return K; }
function makeClassPub(){ class K { p = 1; get(){ return this.p; } } return K; }
const KP = makeClassPriv(), KQ = makeClassPub();
new KP().get(); new KQ().get();
