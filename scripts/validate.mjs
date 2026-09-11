import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { Script, runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..');
const ctx={window:{}};
runInNewContext(readFileSync(resolve(root,'dist/data.js'),'utf8'),ctx);
new Script(readFileSync(resolve(root,'dist/app.js'),'utf8'));
const data=ctx.window.PATCH_DATA;
const members=data.groups.flatMap(g=>g.jobs);
assert.equal(new Set(members).size,members.length,'Duplicate group members');
assert.equal(members.length,data.jobs.length-1,'Every job needs exactly one group');
assert.deepEqual([...data.groups.find(g=>g.id==='demon').jobs],['demonavenger','demonslayer','lethe']);
assert.deepEqual([...data.groups.find(g=>g.id==='other').jobs],['zero','kinesis']);
let cards=0,tipCount=0,comparisons=0;
const files=new Set();
for(const j of data.jobs){
  const skills=j.sections.flatMap(s=>s.skills);
  assert.equal(new Set(skills.map(k=>k.id)).size,skills.length,`${j.id}: duplicate anchors`);
  assert.equal(skills.length,j.count);
  assert.ok(skills.some(k=>k.id===j.defaultSkill),`${j.id}: missing default skill`);
  const anchors=skills.flatMap(k=>[k.id,...(k.aliases||[])]);
  assert.equal(new Set(anchors).size,anchors.length,`${j.id}: duplicate alias`);
  if(j.portrait)files.add(j.portrait);
  for(const k of skills){
    cards++;assert.ok(k.name);
    assert.ok(k.notes.length||k.tips.length,`${j.id}/${k.id}: empty card`);
    for(const t of k.tips){
      tipCount++;files.add(t.src);assert.ok(t.width>0&&t.height>0);
      assert.ok(t.before||t.after,`${j.id}/${k.id}: missing tooltip region`);
      assert.equal(t.status,t.before?(t.after?'changed':'removed'):'added');
      for(const c of [t.before,t.after].filter(Boolean)){
        assert.ok(c.width>0&&c.height>0&&c.x>=0&&c.y===0);
        assert.ok(c.x+c.width<=t.width&&c.y+c.height<=t.height,`${t.src}: crop outside image`);
      }
      if(t.before&&t.after)assert.ok(t.before.x+t.before.width<=t.after.x,`${t.src}: overlapping sides`);
    }
    for(const c of k.comparisons){comparisons++;assert.ok(c.label&&c.before&&c.after);assert.ok(Number.isInteger(c.noteIndex)&&k.notes[c.noteIndex],`${j.id}/${k.id}: comparison has no source sentence`);}
  }
}
for(const f of files){assert.ok(!f.includes('..'));assert.ok(existsSync(resolve(root,'dist',f)),`Missing ${f}`);assert.ok(statSync(resolve(root,'dist',f)).size>0);}
assert.ok(existsSync(resolve(root,'dist/index.html')));
console.log(JSON.stringify({jobs:members.length,groups:data.groups.length,cards,tooltips:tipCount,comparisonRows:comparisons,verifiedLocalAssets:files.size}));
