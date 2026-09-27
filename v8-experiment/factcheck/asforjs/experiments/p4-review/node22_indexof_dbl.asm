0000000001743ae0 <_ZN2v88internal26ArrayIndexOfIncludesDoubleEmmmm>:
 1743ae0:	movabs $0xffffffff00000000,%rax
 1743aea:	test   %rsi,%rsi
 1743aed:	je     1743b5f <_ZN2v88internal26ArrayIndexOfIncludesDoubleEmmmm+0x7f>
 1743aef:	lea    0xf(%rdi),%rax
 1743af3:	test   $0x1,%cl
 1743af6:	je     1743b60 <_ZN2v88internal26ArrayIndexOfIncludesDoubleEmmmm+0x80>
 1743af8:	movsd  0x7(%rcx),%xmm0
 1743afd:	test   $0x7,%al
 1743aff:	je     1743b70 <_ZN2v88internal26ArrayIndexOfIncludesDoubleEmmmm+0x90>
 1743b01:	movabs $0xffffffff00000000,%rax
 1743b0b:	cmp    %rdx,%rsi
 1743b0e:	jbe    1743b5f <_ZN2v88internal26ArrayIndexOfIncludesDoubleEmmmm+0x7f>
 1743b10:	movabs $0xfff7fffffff7ffff,%rcx
 1743b1a:	sub    $0x1,%rdi
 1743b1e:	xchg   %ax,%ax
 1743b20:	lea    0x10(,%rdx,8),%eax
 1743b27:	cltq
 1743b29:	mov    (%rax,%rdi,1),%rax
 1743b2d:	cmp    %rcx,%rax
 1743b30:	je     1743b3d <_ZN2v88internal26ArrayIndexOfIncludesDoubleEmmmm+0x5d>
 1743b32:	movq   %rax,%xmm1
 1743b37:	ucomisd %xmm1,%xmm0
 1743b3b:	jnp    1743ba0 <_ZN2v88internal26ArrayIndexOfIncludesDoubleEmmmm+0xc0>
 1743b3d:	add    $0x1,%rdx
 1743b41:	cmp    %rdx,%rsi
 1743b44:	jne    1743b20 <_ZN2v88internal26ArrayIndexOfIncludesDoubleEmmmm+0x40>
 1743b46:	movabs $0xffffffff00000000,%rax
 1743b50:	ret
 1743b51:	nopl   0x0(%rax)
 1743b58:	mov    $0xffffffffffffffff,%rax
 1743b5f:	ret
 1743b60:	sar    $0x20,%rcx
 1743b64:	pxor   %xmm0,%xmm0
 1743b68:	cvtsi2sd %ecx,%xmm0
 1743b6c:	test   $0x7,%al
 1743b6e:	jne    1743b01 <_ZN2v88internal26ArrayIndexOfIncludesDoubleEmmmm+0x21>
 1743b70:	cmp    %rdx,%rsi
 1743b73:	jbe    1743b58 <_ZN2v88internal26ArrayIndexOfIncludesDoubleEmmmm+0x78>
 1743b75:	lea    0xf(%rdi,%rdx,8),%rcx
 1743b7a:	mov    %rdx,%rax
 1743b7d:	jmp    1743b8d <_ZN2v88internal26ArrayIndexOfIncludesDoubleEmmmm+0xad>
 1743b7f:	nop
 1743b80:	add    $0x1,%rax
 1743b84:	add    $0x8,%rcx
 1743b88:	cmp    %rax,%rsi
 1743b8b:	je     1743b58 <_ZN2v88internal26ArrayIndexOfIncludesDoubleEmmmm+0x78>
 1743b8d:	ucomisd (%rcx),%xmm0
 1743b91:	jp     1743b80 <_ZN2v88internal26ArrayIndexOfIncludesDoubleEmmmm+0xa0>
 1743b93:	jne    1743b80 <_ZN2v88internal26ArrayIndexOfIncludesDoubleEmmmm+0xa0>
 1743b95:	ret
 1743b96:	cs nopw 0x0(%rax,%rax,1)
 1743ba0:	jne    1743b3d <_ZN2v88internal26ArrayIndexOfIncludesDoubleEmmmm+0x5d>
 1743ba2:	mov    %rdx,%rax
 1743ba5:	ret
 1743ba6:	cs nopw 0x0(%rax,%rax,1)

0000000001743bb0 <_ZNSt8_Rb_treeIN2v88internal6HandleINS1_16SourceTextModuleEEES4_St9_IdentityIS4_ENS3_29AsyncEvaluatingOrdinalCompareENS1_13ZoneAllocatorIS4_EEE8_M_eraseEPSt13_Rb_tree_nodeIS4_E.isra.0>:
 1743bb0:	test   %rdi,%rdi
 1743bb3:	je     1743cbc <_ZNSt8_Rb_treeIN2v88internal6HandleINS1_16SourceTextModuleEEES4_St9_IdentityIS4_ENS3_29AsyncEvaluatingOrdinalCompareENS1_13ZoneAllocatorIS4_EEE8_M_eraseEPSt13_Rb_tree_nodeIS4_E.isra.0+0x10c>
 1743bb9:	push   %rbp
 1743bba:	mov    %rsp,%rbp
 1743bbd:	push   %r15
 1743bbf:	mov    %rdi,%r15
 1743bc2:	push   %r14
 1743bc4:	push   %r13
 1743bc6:	push   %r12
 1743bc8:	push   %rbx
 1743bc9:	sub    $0x28,%rsp
 1743bcd:	mov    0x18(%r15),%rdx
 1743bd1:	test   %rdx,%rdx
 1743bd4:	je     1743ca0 <_ZNSt8_Rb_treeIN2v88internal6HandleINS1_16SourceTextModuleEEES4_St9_IdentityIS4_ENS3_29AsyncEvaluatingOrdinalCompareENS1_13ZoneAllocatorIS4_EEE8_M_eraseEPSt13_Rb_tree_nodeIS4_E.isra.0+0xf0>
 1743bda:	mov    0x18(%rdx),%rcx
 1743bde:	test   %rcx,%rcx
 1743be1:	je     1743c93 <_ZNSt8_Rb_treeIN2v88internal6HandleINS1_16SourceTextModuleEEES4_St9_IdentityIS4_ENS3_29AsyncEvaluatingOrdinalCompareENS1_13ZoneAllocatorIS4_EEE8_M_eraseEPSt13_Rb_tree_nodeIS4_E.isra.0+0xe3>
 1743be7:	mov    0x18(%rcx),%rsi
 1743beb:	test   %rsi,%rsi
 1743bee:	je     1743c86 <_ZNSt8_Rb_treeIN2v88internal6HandleINS1_16SourceTextModuleEEES4_St9_IdentityIS4_ENS3_29AsyncEvaluatingOrdinalCompareENS1_13ZoneAllocatorIS4_EEE8_M_eraseEPSt13_Rb_tree_nodeIS4_E.isra.0+0xd6>
 1743bf4:	mov    0x18(%rsi),%rbx
 1743bf8:	test   %rbx,%rbx
 1743bfb:	je     1743c79 <_ZNSt8_Rb_treeIN2v88internal6HandleINS1_16SourceTextModuleEEES4_St9_IdentityIS4_ENS3_29AsyncEvaluatingOrdinalCompareENS1_13ZoneAllocatorIS4_EEE8_M_eraseEPSt13_Rb_tree_nodeIS4_E.isra.0+0xc9>
 1743bfd:	rex.WR
 1743bfe:	.byte 0x8b
 1743bff:	.byte 0x6b
