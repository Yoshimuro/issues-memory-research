let src='this.p0=0;'; for(let i=1;i<300;i++) src+=`this.p${i}=${i};`; const Big = new Function(src); %DebugPrint(new Big());
let lit='({'; for(let i=0;i<300;i++) lit+=`p${i}:${i},`; lit+='})'; %DebugPrint(eval(lit));
let lit2='({'; for(let i=0;i<100;i++) lit2+=`p${i}:${i},`; lit2+='})'; %DebugPrint(eval(lit2));
