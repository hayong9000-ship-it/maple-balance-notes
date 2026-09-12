'use strict';
const D = window.PATCH_DATA;
const main = document.getElementById('main');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId = id => D.jobs.find(j => j.id === id);
const groupName = id => D.groups.find(g => g.id === id)?.name || '전 직업 공통';
const href = (id, skill) => '#job/' + id + (skill ? '/' + skill : '');
const allSkills = j => j.sections.flatMap(s => s.skills);
let activeJob = null;

function orderedSections(j) {
  const rank = s => s.title.replaceAll(' ','') === j.name.replaceAll(' ','') ? 0 : s.title.includes('공통') ? 1 : 2;
  return [...j.sections].sort((a,b) => rank(a)-rank(b));
}
function sectionLabel(s,j) { return s.title.replaceAll(' ','') === j.name.replaceAll(' ','') ? '직업 스킬' : s.title; }
function jobCard(id) {
  const j = byId(id);
  return `<a class="job-card" href="${href(id)}"><img src="${esc(j.portrait)}" alt="" width="58" height="58" loading="lazy"><span><span class="name">${esc(j.name)}</span><span class="count">${j.count}개 변경 항목</span></span><span class="card-arrow" aria-hidden="true">›</span></a>`;
}
function groupSection(g) {
  const content = g.id === 'adventurer'
    ? ['전사','마법사','궁수','도적','해적'].map((n,i) => `<div class="job-subgroup"><h3 class="subgroup">${n}</h3><div class="job-grid">${g.jobs.slice(i*3,i*3+3).map(jobCard).join('')}</div></div>`).join('')
    : `<div class="job-grid">${g.jobs.map(jobCard).join('')}</div>`;
  return `<section class="job-group" id="group-${g.id}"><div class="group-heading"><h2>${esc(g.name)}</h2><span>${g.jobs.length}개 직업</span></div>${content}</section>`;
}
function home(selected='all') {
  const groups = selected === 'all' ? D.groups : D.groups.filter(g => g.id === selected);
  main.className = 'shell home-page';
  main.innerHTML = `<section class="intro"><div><p class="eyebrow">${esc(D.meta.dateLabel)} · TEST WORLD</p><h1>스킬 변경 사항</h1><p class="lede">직업을 고르고, 스킬의 변경 전·후를 비교하세요.</p></div><div class="patch-stamp"><b>${esc(D.meta.patch)}</b><span>${D.jobs.length-1}개 직업 · ${D.groups.length}개 직업군</span></div></section>
    <a class="common-link" href="#job/common"><span><strong>전 직업 공통 변경</strong><small>${esc(D.meta.commonSummary.replace('전 직업 공통 · ',''))}</small></span><span class="arrow" aria-hidden="true">→</span></a>
    <nav class="group-tabs" aria-label="직업군"><a href="#" class="${selected==='all'?'active':''}" ${selected==='all'?'aria-current="page"':''}>전체 직업</a>${D.groups.map(g=>`<a href="#group/${g.id}" class="${selected===g.id?'active':''}" ${selected===g.id?'aria-current="page"':''}>${esc(g.name)}</a>`).join('')}</nav>
    <div id="job-directory">${groups.map(groupSection).join('')}</div>`;
  document.title = `${selected==='all'?'전 직업':groupName(selected)} · ${D.meta.title}`;
}
function comparisonTable(k) {
  if (!k.comparisons.length) return '';
  return `<div class="comparison-wrap"><table class="comparison"><caption class="sr-only">${esc(k.name)} 변경 전후 비교</caption><thead><tr><th scope="col">변경 항목</th><th scope="col"><span class="column-label before-label">변경 전</span></th><th scope="col"><span class="column-label after-label">변경 후</span></th></tr></thead><tbody>${k.comparisons.map(c=>`<tr><th scope="row">${esc(c.label)}${c.condition?`<small>${esc(c.condition)}</small>`:''}</th><td class="before-value ${c.kind==='relative'?'unlisted':''}">${esc(c.before)}</td><td class="after-value">${esc(c.after)}</td></tr>`).join('')}</tbody></table></div>`;
}
function cropMarkup(t,c,label,zoom=true) {
  const image = `<span class="crop-window" style="aspect-ratio:${c.width}/${c.height}"><img src="${esc(t.src)}" alt="${esc(label)}" width="${t.width}" height="${t.height}" style="width:${t.width/c.width*100}%;left:${-c.x/c.width*100}%;top:0" ${zoom?'loading="lazy"':''} decoding="async"></span>`;
  return zoom ? `<button class="crop-button" type="button" data-zoom="${esc(t.src)}" data-crop="${esc(JSON.stringify(c))}" data-title="${esc(label)}" aria-label="${esc(label)} 확대">${image}<span class="image-zoom-hint">확대 ↗</span></button>` : image;
}
function galleryMarkup(k,index) {
  const t=k.tips[index];
  const title=t.alt==='스킬 툴팁'?k.name:t.alt.replace(/ 툴팁$/,'');
  const side=(role,c)=>`<section class="tooltip-side ${role}"><div class="side-heading"><strong>${role==='before'?'변경 전':'변경 후'}</strong><span>${role==='before'?'패치 적용 전':esc(D.meta.shortDate)+' 테스트월드'}</span></div><div class="side-image">${c?cropMarkup(t,c,`${title} · ${role==='before'?'변경 전':'변경 후'}`):`<div class="no-tooltip"><b>${role==='before'?'신규 추가 전':'삭제된 툴팁'}</b><span>${role==='before'?'변경 후에 추가된 항목입니다.':'변경 후에는 해당 툴팁이 없습니다.'}</span></div>`}</div></section>`;
  return `<div class="tooltip-entry"><div class="gallery-heading"><h4>스킬 툴팁${k.tips.length>1?` <span>${index+1} / ${k.tips.length}</span>`:''}</h4></div><div class="tooltip-pair">${side('before',t.before)}${side('after',t.after)}</div><div class="gallery-footer"><span>${esc(title)}</span><button class="text-button" type="button" data-zoom="${esc(t.src)}" data-title="${esc(title)} · 원본 전체">${t.supplementary?'부가 수치 포함 원본 보기':'원본 전체 보기'} ↗</button></div></div>`;
}
function skillPanel(j,k) {
  const list=`<ul class="notes">${k.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul>`;
  return `<article class="skill" id="${k.id}"><header class="skill-head"><h3>${esc(k.name)}</h3><span class="change-badge">${k.comparisons.some(c=>c.kind==='number'||c.kind==='relative')?'수치 변경':k.notes.length?'스킬 변경':'툴팁 변경'}</span></header><div class="skill-body">${k.notes.length?`<section class="change-notes"><h4>변경 내용</h4>${list}</section>`:''}${k.comparisons.length?`<section class="skill-comparison"><h4>변경 전후 비교</h4>${comparisonTable(k)}</section>`:''}${k.unnamed?'<p class="source-note">원문 툴팁에 스킬명이 표시되지 않는 항목입니다.</p>':''}${k.tips.length?`<div class="skill-gallery">${k.tips.map((t,i)=>galleryMarkup(k,i)).join('')}</div>`:''}<div class="skill-sources"><a href="${esc(D.meta.official)}" target="_blank" rel="noopener">공식 패치 공지 ↗</a><a href="${esc(j.source)}#${k.id}" target="_blank" rel="noopener">해당 스킬 참고 자료 ↗</a></div></div></article>`;
}
function scrollToAnchor(j,anchor) {
  if(!anchor){window.scrollTo(0,0);return;}
  const resolved=allSkills(j).find(k=>k.id===anchor||k.aliases?.includes(anchor));
  const target=document.getElementById(resolved?.id||anchor);
  if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));else window.scrollTo(0,0);
}
function detail(id,anchor) {
  const j=byId(id);
  if(!j){main.innerHTML='<div class="empty"><h1>직업을 찾을 수 없습니다.</h1><a href="#">전체 직업으로 돌아가기 →</a></div>';return;}
  activeJob=j;
  main.className='shell detail-page';
  main.innerHTML=`<section class="job-intro"><a class="back" href="${j.group==='common'?'#':'#group/'+j.group}">← ${j.group==='common'?'전체 직업':groupName(j.group)}</a><div class="job-title">${j.portrait?`<img src="${j.portrait}" alt="" width="76" height="76">`:''}<div><p class="eyebrow">${esc(groupName(j.group))}</p><h1>${esc(j.name)}</h1><p class="detail-meta">${j.count}개 변경 항목 · ${esc(D.meta.shortDate)} 테스트월드</p></div><div class="detail-version"><b>${esc(D.meta.patch)}</b></div></div></section><div class="job-content">${orderedSections(j).map(s=>`<section class="skill-section" id="${s.id}"><div class="skills-heading"><h2>${esc(sectionLabel(s,j))}</h2><span>${s.skills.length}개 항목</span></div>${s.skills.map(k=>skillPanel(j,k)).join('')}</section>`).join('')}</div><nav class="page-end" aria-label="페이지 이동"><a href="#">← 전체 직업</a><a href="${href(j.id)}" data-page-top>맨 위로 ↑</a></nav>`;
  document.title=`${j.name} 전체 스킬 변경 전후 | ${D.meta.title}`;
  scrollToAnchor(j,anchor);
}
function route() {
  if(location.hash==='#main'){main.focus();return;}
  const [kind,id,anchor]=location.hash.slice(1).split('/');
  if(kind==='job'&&activeJob?.id===id){scrollToAnchor(activeJob,anchor);return;}
  activeJob=null;
  if(kind==='job')detail(id,anchor);else {home(kind==='group'?id:'all');window.scrollTo(0,0);}
}
document.addEventListener('click',e=>{
  if(e.target.closest('[data-page-top]')){e.preventDefault();window.scrollTo(0,0);return;}
  const b=e.target.closest('[data-zoom]');if(!b)return;
  document.getElementById('dialog-title').textContent=b.dataset.title;
  const t=activeJob?allSkills(activeJob).flatMap(k=>k.tips).find(t=>t.src===b.dataset.zoom):null;
  if(b.dataset.crop&&t){const c=JSON.parse(b.dataset.crop);document.querySelector('.dialog-scroll').innerHTML=`<div class="dialog-crop" style="width:${c.width}px">${cropMarkup(t,c,b.dataset.title,false)}</div>`;}
  else document.querySelector('.dialog-scroll').innerHTML=`<img class="original-tooltip" src="${esc(b.dataset.zoom)}" alt="${esc(b.dataset.title)}">`;
  document.getElementById('dialog-note').textContent=b.dataset.crop?'실제 툴팁의 원본 크기입니다.':'원본 전체 이미지입니다. 넓은 이미지는 좌우로 움직여 확인할 수 있습니다.';
  dialog.showModal();
});
const dialog=document.getElementById('tooltip-dialog');
document.getElementById('dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
window.addEventListener('hashchange',route);
if(D){
  document.querySelector('.patch-label b').textContent=D.meta.patch;
  document.querySelector('.footer').innerHTML=`<p>메이플스토리 비공식 패치 정리 · ${esc(D.meta.notice)}</p><p><a href="${esc(D.meta.official)}" target="_blank" rel="noopener">공식 테스트월드 공지 ↗</a></p><p>게임 및 툴팁 이미지의 권리는 NEXON에 있습니다.</p>`;
  route();
}else main.innerHTML='<div class="empty"><h1>패치 자료를 불러오지 못했습니다.</h1><p>페이지를 새로고침해 주세요.</p></div>';
