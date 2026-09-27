0000000001743a90 <_ZN2v88internal31ArrayIndexOfIncludesSmiOrObjectEmmmm>:
 1743a90:	movabs $0xffffffff00000000,%rax
 1743a9a:	mov    %rdi,%r8
 1743a9d:	mov    %rdx,%rdi
 1743aa0:	test   %rsi,%rsi
 1743aa3:	je     1743aca <_ZN2v88internal31ArrayIndexOfIncludesSmiOrObjectEmmmm+0x3a>
 1743aa5:	cmp    %rdx,%rsi
 1743aa8:	jbe    1743ad0 <_ZN2v88internal31ArrayIndexOfIncludesSmiOrObjectEmmmm+0x40>
 1743aaa:	lea    0xf(%r8,%rdx,8),%rdx
 1743aaf:	mov    %rdi,%rax
 1743ab2:	jmp    1743ac5 <_ZN2v88internal31ArrayIndexOfIncludesSmiOrObjectEmmmm+0x35>
 1743ab4:	nopl   0x0(%rax)
 1743ab8:	add    $0x1,%rax
 1743abc:	add    $0x8,%rdx
 1743ac0:	cmp    %rax,%rsi
 1743ac3:	je     1743ad0 <_ZN2v88internal31ArrayIndexOfIncludesSmiOrObjectEmmmm+0x40>
 1743ac5:	cmp    (%rdx),%rcx
 1743ac8:	jne    1743ab8 <_ZN2v88internal31ArrayIndexOfIncludesSmiOrObjectEmmmm+0x28>
 1743aca:	ret
 1743acb:	nopl   0x0(%rax,%rax,1)
 1743ad0:	mov    $0xffffffffffffffff,%rax
 1743ad7:	ret
 1743ad8:	nopl   0x0(%rax,%rax,1)
