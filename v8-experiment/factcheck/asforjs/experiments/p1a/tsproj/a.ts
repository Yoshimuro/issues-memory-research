interface User { id: number; name: string; tags?: string[] }
export function greet(u: User): string { return `hi ${u.name} ${(u.tags ?? []).join(',')}`; }
export class Repo<T extends { id: number }> { private items = new Map<number, T>(); add(x: T) { this.items.set(x.id, x); return this; } get(id: number) { return this.items.get(id); } }
const r = new Repo<User>().add({ id: 1, name: 'a' }); console.log(greet(r.get(1)!));
