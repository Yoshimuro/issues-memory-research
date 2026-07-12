// Сгенерировано demos/03-gen-many-functions.js — не редактировать руками.
// 100 функций средней горячести, по 940 вызовов каждая (вперемешку).
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
const out = typeof print === 'function' ? print : console.log;
const obj = { v0: 1, v1: 2, v2: 3, v3: 4, v4: 5 };
function fn0(a, b, o) { let s = 0; for (let i = 0; i < 40; i++) { s = (s + (a * 19 + i)) + ((b - i) % 16) + o.v0; } return s | 0; }
function fn1(a, b, o) { let s = 0; for (let i = 0; i < 41; i++) { s = (s ^ (a * 29 + i)) + ((b - i) % 21) + o.v1; } return s | 0; }
function fn2(a, b, o) { let s = 0; for (let i = 0; i < 42; i++) { s = (s | (a * 24 + i)) + ((b - i) % 20) + o.v2; } return s | 0; }
function fn3(a, b, o) { let s = 0; for (let i = 0; i < 43; i++) { s = (s - (a * 18 + i)) + ((b - i) % 8) + o.v3; } return s | 0; }
function fn4(a, b, o) { let s = 0; for (let i = 0; i < 44; i++) { s = (s + (a * 4 + i)) + ((b - i) % 10) + o.v4; } return s | 0; }
function fn5(a, b, o) { let s = 0; for (let i = 0; i < 45; i++) { s = (s ^ (a * 11 + i)) + ((b - i) % 27) + o.v0; } return s | 0; }
function fn6(a, b, o) { let s = 0; for (let i = 0; i < 46; i++) { s = (s | (a * 23 + i)) + ((b - i) % 20) + o.v1; } return s | 0; }
function fn7(a, b, o) { let s = 0; for (let i = 0; i < 47; i++) { s = (s - (a * 13 + i)) + ((b - i) % 10) + o.v2; } return s | 0; }
function fn8(a, b, o) { let s = 0; for (let i = 0; i < 48; i++) { s = (s + (a * 6 + i)) + ((b - i) % 25) + o.v3; } return s | 0; }
function fn9(a, b, o) { let s = 0; for (let i = 0; i < 49; i++) { s = (s ^ (a * 27 + i)) + ((b - i) % 24) + o.v4; } return s | 0; }
function fn10(a, b, o) { let s = 0; for (let i = 0; i < 50; i++) { s = (s | (a * 16 + i)) + ((b - i) % 11) + o.v0; } return s | 0; }
function fn11(a, b, o) { let s = 0; for (let i = 0; i < 51; i++) { s = (s - (a * 27 + i)) + ((b - i) % 6) + o.v1; } return s | 0; }
function fn12(a, b, o) { let s = 0; for (let i = 0; i < 52; i++) { s = (s + (a * 25 + i)) + ((b - i) % 27) + o.v2; } return s | 0; }
function fn13(a, b, o) { let s = 0; for (let i = 0; i < 53; i++) { s = (s ^ (a * 26 + i)) + ((b - i) % 7) + o.v3; } return s | 0; }
function fn14(a, b, o) { let s = 0; for (let i = 0; i < 54; i++) { s = (s | (a * 12 + i)) + ((b - i) % 19) + o.v4; } return s | 0; }
function fn15(a, b, o) { let s = 0; for (let i = 0; i < 55; i++) { s = (s - (a * 4 + i)) + ((b - i) % 11) + o.v0; } return s | 0; }
function fn16(a, b, o) { let s = 0; for (let i = 0; i < 56; i++) { s = (s + (a * 17 + i)) + ((b - i) % 22) + o.v1; } return s | 0; }
function fn17(a, b, o) { let s = 0; for (let i = 0; i < 40; i++) { s = (s ^ (a * 10 + i)) + ((b - i) % 16) + o.v2; } return s | 0; }
function fn18(a, b, o) { let s = 0; for (let i = 0; i < 41; i++) { s = (s | (a * 3 + i)) + ((b - i) % 18) + o.v3; } return s | 0; }
function fn19(a, b, o) { let s = 0; for (let i = 0; i < 42; i++) { s = (s - (a * 19 + i)) + ((b - i) % 19) + o.v4; } return s | 0; }
function fn20(a, b, o) { let s = 0; for (let i = 0; i < 43; i++) { s = (s + (a * 23 + i)) + ((b - i) % 24) + o.v0; } return s | 0; }
function fn21(a, b, o) { let s = 0; for (let i = 0; i < 44; i++) { s = (s ^ (a * 26 + i)) + ((b - i) % 10) + o.v1; } return s | 0; }
function fn22(a, b, o) { let s = 0; for (let i = 0; i < 45; i++) { s = (s | (a * 27 + i)) + ((b - i) % 14) + o.v2; } return s | 0; }
function fn23(a, b, o) { let s = 0; for (let i = 0; i < 46; i++) { s = (s - (a * 29 + i)) + ((b - i) % 8) + o.v3; } return s | 0; }
function fn24(a, b, o) { let s = 0; for (let i = 0; i < 47; i++) { s = (s + (a * 27 + i)) + ((b - i) % 11) + o.v4; } return s | 0; }
function fn25(a, b, o) { let s = 0; for (let i = 0; i < 48; i++) { s = (s ^ (a * 3 + i)) + ((b - i) % 16) + o.v0; } return s | 0; }
function fn26(a, b, o) { let s = 0; for (let i = 0; i < 49; i++) { s = (s | (a * 3 + i)) + ((b - i) % 8) + o.v1; } return s | 0; }
function fn27(a, b, o) { let s = 0; for (let i = 0; i < 50; i++) { s = (s - (a * 30 + i)) + ((b - i) % 10) + o.v2; } return s | 0; }
function fn28(a, b, o) { let s = 0; for (let i = 0; i < 51; i++) { s = (s + (a * 12 + i)) + ((b - i) % 19) + o.v3; } return s | 0; }
function fn29(a, b, o) { let s = 0; for (let i = 0; i < 52; i++) { s = (s ^ (a * 24 + i)) + ((b - i) % 18) + o.v4; } return s | 0; }
function fn30(a, b, o) { let s = 0; for (let i = 0; i < 53; i++) { s = (s | (a * 26 + i)) + ((b - i) % 18) + o.v0; } return s | 0; }
function fn31(a, b, o) { let s = 0; for (let i = 0; i < 54; i++) { s = (s - (a * 20 + i)) + ((b - i) % 7) + o.v1; } return s | 0; }
function fn32(a, b, o) { let s = 0; for (let i = 0; i < 55; i++) { s = (s + (a * 10 + i)) + ((b - i) % 6) + o.v2; } return s | 0; }
function fn33(a, b, o) { let s = 0; for (let i = 0; i < 56; i++) { s = (s ^ (a * 29 + i)) + ((b - i) % 27) + o.v3; } return s | 0; }
function fn34(a, b, o) { let s = 0; for (let i = 0; i < 40; i++) { s = (s | (a * 9 + i)) + ((b - i) % 23) + o.v4; } return s | 0; }
function fn35(a, b, o) { let s = 0; for (let i = 0; i < 41; i++) { s = (s - (a * 9 + i)) + ((b - i) % 14) + o.v0; } return s | 0; }
function fn36(a, b, o) { let s = 0; for (let i = 0; i < 42; i++) { s = (s + (a * 5 + i)) + ((b - i) % 5) + o.v1; } return s | 0; }
function fn37(a, b, o) { let s = 0; for (let i = 0; i < 43; i++) { s = (s ^ (a * 7 + i)) + ((b - i) % 13) + o.v2; } return s | 0; }
function fn38(a, b, o) { let s = 0; for (let i = 0; i < 44; i++) { s = (s | (a * 18 + i)) + ((b - i) % 27) + o.v3; } return s | 0; }
function fn39(a, b, o) { let s = 0; for (let i = 0; i < 45; i++) { s = (s - (a * 15 + i)) + ((b - i) % 13) + o.v4; } return s | 0; }
function fn40(a, b, o) { let s = 0; for (let i = 0; i < 46; i++) { s = (s + (a * 13 + i)) + ((b - i) % 19) + o.v0; } return s | 0; }
function fn41(a, b, o) { let s = 0; for (let i = 0; i < 47; i++) { s = (s ^ (a * 15 + i)) + ((b - i) % 5) + o.v1; } return s | 0; }
function fn42(a, b, o) { let s = 0; for (let i = 0; i < 48; i++) { s = (s | (a * 24 + i)) + ((b - i) % 14) + o.v2; } return s | 0; }
function fn43(a, b, o) { let s = 0; for (let i = 0; i < 49; i++) { s = (s - (a * 27 + i)) + ((b - i) % 8) + o.v3; } return s | 0; }
function fn44(a, b, o) { let s = 0; for (let i = 0; i < 50; i++) { s = (s + (a * 22 + i)) + ((b - i) % 17) + o.v4; } return s | 0; }
function fn45(a, b, o) { let s = 0; for (let i = 0; i < 51; i++) { s = (s ^ (a * 25 + i)) + ((b - i) % 19) + o.v0; } return s | 0; }
function fn46(a, b, o) { let s = 0; for (let i = 0; i < 52; i++) { s = (s | (a * 17 + i)) + ((b - i) % 14) + o.v1; } return s | 0; }
function fn47(a, b, o) { let s = 0; for (let i = 0; i < 53; i++) { s = (s - (a * 9 + i)) + ((b - i) % 5) + o.v2; } return s | 0; }
function fn48(a, b, o) { let s = 0; for (let i = 0; i < 54; i++) { s = (s + (a * 12 + i)) + ((b - i) % 17) + o.v3; } return s | 0; }
function fn49(a, b, o) { let s = 0; for (let i = 0; i < 55; i++) { s = (s ^ (a * 11 + i)) + ((b - i) % 27) + o.v4; } return s | 0; }
function fn50(a, b, o) { let s = 0; for (let i = 0; i < 56; i++) { s = (s | (a * 26 + i)) + ((b - i) % 18) + o.v0; } return s | 0; }
function fn51(a, b, o) { let s = 0; for (let i = 0; i < 40; i++) { s = (s - (a * 5 + i)) + ((b - i) % 26) + o.v1; } return s | 0; }
function fn52(a, b, o) { let s = 0; for (let i = 0; i < 41; i++) { s = (s + (a * 19 + i)) + ((b - i) % 18) + o.v2; } return s | 0; }
function fn53(a, b, o) { let s = 0; for (let i = 0; i < 42; i++) { s = (s ^ (a * 6 + i)) + ((b - i) % 7) + o.v3; } return s | 0; }
function fn54(a, b, o) { let s = 0; for (let i = 0; i < 43; i++) { s = (s | (a * 27 + i)) + ((b - i) % 20) + o.v4; } return s | 0; }
function fn55(a, b, o) { let s = 0; for (let i = 0; i < 44; i++) { s = (s - (a * 16 + i)) + ((b - i) % 22) + o.v0; } return s | 0; }
function fn56(a, b, o) { let s = 0; for (let i = 0; i < 45; i++) { s = (s + (a * 21 + i)) + ((b - i) % 24) + o.v1; } return s | 0; }
function fn57(a, b, o) { let s = 0; for (let i = 0; i < 46; i++) { s = (s ^ (a * 12 + i)) + ((b - i) % 7) + o.v2; } return s | 0; }
function fn58(a, b, o) { let s = 0; for (let i = 0; i < 47; i++) { s = (s | (a * 16 + i)) + ((b - i) % 6) + o.v3; } return s | 0; }
function fn59(a, b, o) { let s = 0; for (let i = 0; i < 48; i++) { s = (s - (a * 29 + i)) + ((b - i) % 12) + o.v4; } return s | 0; }
function fn60(a, b, o) { let s = 0; for (let i = 0; i < 49; i++) { s = (s + (a * 23 + i)) + ((b - i) % 16) + o.v0; } return s | 0; }
function fn61(a, b, o) { let s = 0; for (let i = 0; i < 50; i++) { s = (s ^ (a * 4 + i)) + ((b - i) % 7) + o.v1; } return s | 0; }
function fn62(a, b, o) { let s = 0; for (let i = 0; i < 51; i++) { s = (s | (a * 18 + i)) + ((b - i) % 15) + o.v2; } return s | 0; }
function fn63(a, b, o) { let s = 0; for (let i = 0; i < 52; i++) { s = (s - (a * 30 + i)) + ((b - i) % 5) + o.v3; } return s | 0; }
function fn64(a, b, o) { let s = 0; for (let i = 0; i < 53; i++) { s = (s + (a * 30 + i)) + ((b - i) % 26) + o.v4; } return s | 0; }
function fn65(a, b, o) { let s = 0; for (let i = 0; i < 54; i++) { s = (s ^ (a * 20 + i)) + ((b - i) % 19) + o.v0; } return s | 0; }
function fn66(a, b, o) { let s = 0; for (let i = 0; i < 55; i++) { s = (s | (a * 18 + i)) + ((b - i) % 15) + o.v1; } return s | 0; }
function fn67(a, b, o) { let s = 0; for (let i = 0; i < 56; i++) { s = (s - (a * 17 + i)) + ((b - i) % 10) + o.v2; } return s | 0; }
function fn68(a, b, o) { let s = 0; for (let i = 0; i < 40; i++) { s = (s + (a * 9 + i)) + ((b - i) % 7) + o.v3; } return s | 0; }
function fn69(a, b, o) { let s = 0; for (let i = 0; i < 41; i++) { s = (s ^ (a * 12 + i)) + ((b - i) % 27) + o.v4; } return s | 0; }
function fn70(a, b, o) { let s = 0; for (let i = 0; i < 42; i++) { s = (s | (a * 21 + i)) + ((b - i) % 10) + o.v0; } return s | 0; }
function fn71(a, b, o) { let s = 0; for (let i = 0; i < 43; i++) { s = (s - (a * 23 + i)) + ((b - i) % 11) + o.v1; } return s | 0; }
function fn72(a, b, o) { let s = 0; for (let i = 0; i < 44; i++) { s = (s + (a * 23 + i)) + ((b - i) % 25) + o.v2; } return s | 0; }
function fn73(a, b, o) { let s = 0; for (let i = 0; i < 45; i++) { s = (s ^ (a * 10 + i)) + ((b - i) % 6) + o.v3; } return s | 0; }
function fn74(a, b, o) { let s = 0; for (let i = 0; i < 46; i++) { s = (s | (a * 18 + i)) + ((b - i) % 22) + o.v4; } return s | 0; }
function fn75(a, b, o) { let s = 0; for (let i = 0; i < 47; i++) { s = (s - (a * 21 + i)) + ((b - i) % 10) + o.v0; } return s | 0; }
function fn76(a, b, o) { let s = 0; for (let i = 0; i < 48; i++) { s = (s + (a * 25 + i)) + ((b - i) % 26) + o.v1; } return s | 0; }
function fn77(a, b, o) { let s = 0; for (let i = 0; i < 49; i++) { s = (s ^ (a * 7 + i)) + ((b - i) % 5) + o.v2; } return s | 0; }
function fn78(a, b, o) { let s = 0; for (let i = 0; i < 50; i++) { s = (s | (a * 10 + i)) + ((b - i) % 9) + o.v3; } return s | 0; }
function fn79(a, b, o) { let s = 0; for (let i = 0; i < 51; i++) { s = (s - (a * 16 + i)) + ((b - i) % 10) + o.v4; } return s | 0; }
function fn80(a, b, o) { let s = 0; for (let i = 0; i < 52; i++) { s = (s + (a * 25 + i)) + ((b - i) % 11) + o.v0; } return s | 0; }
function fn81(a, b, o) { let s = 0; for (let i = 0; i < 53; i++) { s = (s ^ (a * 4 + i)) + ((b - i) % 9) + o.v1; } return s | 0; }
function fn82(a, b, o) { let s = 0; for (let i = 0; i < 54; i++) { s = (s | (a * 12 + i)) + ((b - i) % 6) + o.v2; } return s | 0; }
function fn83(a, b, o) { let s = 0; for (let i = 0; i < 55; i++) { s = (s - (a * 26 + i)) + ((b - i) % 5) + o.v3; } return s | 0; }
function fn84(a, b, o) { let s = 0; for (let i = 0; i < 56; i++) { s = (s + (a * 28 + i)) + ((b - i) % 6) + o.v4; } return s | 0; }
function fn85(a, b, o) { let s = 0; for (let i = 0; i < 40; i++) { s = (s ^ (a * 23 + i)) + ((b - i) % 9) + o.v0; } return s | 0; }
function fn86(a, b, o) { let s = 0; for (let i = 0; i < 41; i++) { s = (s | (a * 25 + i)) + ((b - i) % 12) + o.v1; } return s | 0; }
function fn87(a, b, o) { let s = 0; for (let i = 0; i < 42; i++) { s = (s - (a * 13 + i)) + ((b - i) % 17) + o.v2; } return s | 0; }
function fn88(a, b, o) { let s = 0; for (let i = 0; i < 43; i++) { s = (s + (a * 15 + i)) + ((b - i) % 20) + o.v3; } return s | 0; }
function fn89(a, b, o) { let s = 0; for (let i = 0; i < 44; i++) { s = (s ^ (a * 23 + i)) + ((b - i) % 20) + o.v4; } return s | 0; }
function fn90(a, b, o) { let s = 0; for (let i = 0; i < 45; i++) { s = (s | (a * 14 + i)) + ((b - i) % 12) + o.v0; } return s | 0; }
function fn91(a, b, o) { let s = 0; for (let i = 0; i < 46; i++) { s = (s - (a * 20 + i)) + ((b - i) % 23) + o.v1; } return s | 0; }
function fn92(a, b, o) { let s = 0; for (let i = 0; i < 47; i++) { s = (s + (a * 29 + i)) + ((b - i) % 14) + o.v2; } return s | 0; }
function fn93(a, b, o) { let s = 0; for (let i = 0; i < 48; i++) { s = (s ^ (a * 4 + i)) + ((b - i) % 6) + o.v3; } return s | 0; }
function fn94(a, b, o) { let s = 0; for (let i = 0; i < 49; i++) { s = (s | (a * 28 + i)) + ((b - i) % 17) + o.v4; } return s | 0; }
function fn95(a, b, o) { let s = 0; for (let i = 0; i < 50; i++) { s = (s - (a * 19 + i)) + ((b - i) % 25) + o.v0; } return s | 0; }
function fn96(a, b, o) { let s = 0; for (let i = 0; i < 51; i++) { s = (s + (a * 26 + i)) + ((b - i) % 24) + o.v1; } return s | 0; }
function fn97(a, b, o) { let s = 0; for (let i = 0; i < 52; i++) { s = (s ^ (a * 28 + i)) + ((b - i) % 6) + o.v2; } return s | 0; }
function fn98(a, b, o) { let s = 0; for (let i = 0; i < 53; i++) { s = (s | (a * 14 + i)) + ((b - i) % 14) + o.v3; } return s | 0; }
function fn99(a, b, o) { let s = 0; for (let i = 0; i < 54; i++) { s = (s - (a * 4 + i)) + ((b - i) % 15) + o.v4; } return s | 0; }

const fns = [fn0, fn1, fn2, fn3, fn4, fn5, fn6, fn7, fn8, fn9, fn10, fn11, fn12, fn13, fn14, fn15, fn16, fn17, fn18, fn19, fn20, fn21, fn22, fn23, fn24, fn25, fn26, fn27, fn28, fn29, fn30, fn31, fn32, fn33, fn34, fn35, fn36, fn37, fn38, fn39, fn40, fn41, fn42, fn43, fn44, fn45, fn46, fn47, fn48, fn49, fn50, fn51, fn52, fn53, fn54, fn55, fn56, fn57, fn58, fn59, fn60, fn61, fn62, fn63, fn64, fn65, fn66, fn67, fn68, fn69, fn70, fn71, fn72, fn73, fn74, fn75, fn76, fn77, fn78, fn79, fn80, fn81, fn82, fn83, fn84, fn85, fn86, fn87, fn88, fn89, fn90, fn91, fn92, fn93, fn94, fn95, fn96, fn97, fn98, fn99];
let sink = 0;
const t0 = now();
for (let round = 0; round < 94; round++) {
  for (let f = 0; f < fns.length; f++) {
    for (let c = 0; c < 10; c++) {
      sink += fns[f](round * 7 + c, f * 31 - c, obj);
    }
  }
}
const t1 = now();
out(JSON.stringify({ benchMs: +(t1 - t0).toFixed(3), sink }));
