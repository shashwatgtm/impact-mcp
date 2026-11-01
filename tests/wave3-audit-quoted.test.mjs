import test from 'node:test';import assert from 'node:assert/strict';import {auditReader} from '../dist/audit-reader.js';
test('quoted escaped input retains terminal punctuation without a dangling escape and bounds repeated long quotes',()=>{
 const base='> **Who** old\n> **We** old';
 const result=auditReader(base,{problem_solved:'Teams ship faster\\!',key_differentiation:'An audit trail\\!'});
 assert.ok(result.includes('"Teams ship faster\\!"'));
 assert.ok(result.includes('"An audit trail\\!"'));
 const long=auditReader(base,{problem_solved:'a'.repeat(279)+'\\'+'!tail',key_differentiation:'b'.repeat(3000)});
 assert.ok(long.length<750);assert.ok(!long.includes('\\...'));assert.ok(long.includes('..."'));
});
