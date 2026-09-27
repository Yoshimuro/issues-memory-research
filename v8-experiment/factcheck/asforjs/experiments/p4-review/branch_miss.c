// Branch misprediction cost: same loop over random vs sorted bytes; branch kept (asm barrier prevents cmov)
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <x86intrin.h>
#define N (1<<20)
static unsigned char d[N];
static int cmp(const void*a,const void*b){return *(unsigned char*)a-*(unsigned char*)b;}
static uint64_t run(void){ uint64_t s=0; uint64_t t=__rdtsc();
  for(int r=0;r<20;r++) for(int i=0;i<N;i++){ if(d[i]<128){ s+=d[i]; __asm__ volatile(""); } }
  t=__rdtsc()-t; if(s==42) puts(""); return t; }
int main(){ srand(1); for(int i=0;i<N;i++) d[i]=rand()&255;
  for(int k=0;k<3;k++){ uint64_t r=run(); qsort(d,N,1,cmp); uint64_t s=run();
    for(int i=0;i<N;i++) d[i]=rand()&255;
    double per_iter_diff=(double)(r-s)/(20.0*N);
    // about half of the random-case branches mispredict
    printf("round %d: random %.2f ref-cycles/iter, sorted %.2f, penalty per mispredict ~ %.1f ref-cycles\n",k,(double)r/(20.0*N),(double)s/(20.0*N),per_iter_diff/0.5); }
  return 0; }
