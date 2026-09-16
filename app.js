
const state={projects:[],done:new Set(JSON.parse(localStorage.getItem('jq.done')||'[]'))};
const app=document.getElementById('app');
const themeBtn=document.getElementById('themeBtn');

async function load(){
 const r=await fetch('projects.json'); state.projects=await r.json(); applyTheme(); render();
}
function applyTheme(){const t=localStorage.getItem('jq.theme')||'light'; document.documentElement.dataset.theme=t; themeBtn.textContent=t==='dark'?'☀':'☾'}
themeBtn.addEventListener('click',()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';localStorage.setItem('jq.theme',t);applyTheme()});
function save(){localStorage.setItem('jq.done',JSON.stringify([...state.done].sort((a,b)=>a-b)))}
function esc(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function path(){return location.hash.replace(/^#/,'')||'/'}
function render(){const p=path(); if(p==='/'){renderHome();return} const m=p.match(/^\/project\/(\d+)$/); if(m){renderProject(Number(m[1]));return} renderHome()}
function renderHome(){
 const phases=[...new Set(state.projects.map(p=>p.phase))];
 app.innerHTML=`<div class="wrap"><section class="hero"><h1>50 Java projects.</h1><p>Hard, real-world builds with a step-by-step manual. Pick a project, build it yourself, then mark it complete.</p></section><div class="controls"><input id="search" class="search" placeholder="Search projects..."><select id="phase" class="select"><option value="">All phases</option>${phases.map(x=>`<option>${esc(x)}</option>`).join('')}</select></div><div id="list" class="grid"></div><div class="section"><div class="notice">Completed projects: <strong>${state.done.size}/${state.projects.length}</strong></div></div></div>`;
 const list=document.getElementById('list'), search=document.getElementById('search'), phase=document.getElementById('phase');
 function update(){const q=search.value.toLowerCase(); const ph=phase.value; const rows=state.projects.filter(p=>(!q||p.title.toLowerCase().includes(q)||p.description.toLowerCase().includes(q))&&(!ph||p.phase===ph)); list.innerHTML=rows.map(p=>`<a class="project-line" href="#/project/${p.id}"><div class="num">${String(p.id).padStart(2,'0')}</div><div><div class="project-title">${esc(p.title)}</div><div class="phase">${esc(p.phase)}</div></div><div class="check">${state.done.has(p.id)?'✓':''}</div></a>`).join('')||'<div class="notice">No projects found.</div>'}
 search.addEventListener('input',update);phase.addEventListener('change',update);update();
}
function renderProject(id){
 const p=state.projects.find(x=>x.id===id); if(!p){renderHome();return}
 const done=state.done.has(id);
 app.innerHTML=`<div class="wrap"><a class="back" href="#/">← All projects</a><section class="detail-head"><div class="phase">Project ${p.id} · ${esc(p.phase)}</div><h1>${esc(p.title)}</h1><p class="desc">${esc(p.description)}</p><div class="skills">${p.skills.map(s=>`<span class="pill">${esc(s)}</span>`).join('')}</div><div class="actions"><button class="btn primary" id="complete">${done?'✓ Completed':'Mark as completed'}</button><a class="btn" href="#/project/${Math.max(1,id-1)}">Previous</a><a class="btn" href="#/project/${Math.min(state.projects.length,id+1)}">Next</a></div></section><section class="section"><h2>Manual · ${p.manual.length} steps</h2>${p.manual.map(s=>`<div class="step"><div class="stepno">${s.step}</div><div><strong>${esc(s.task)}</strong><div class="learn">Learn: ${esc(s.learn)}</div></div></div>`).join('')}</section><section class="section"><h2>Test cases · 5</h2>${p.tests.map(t=>`<div class="test"><b>${t.id}.</b>${esc(t.check)}</div>`).join('')}</section></div>`;
 document.getElementById('complete').addEventListener('click',()=>{if(state.done.has(id))state.done.delete(id);else state.done.add(id);save();renderProject(id)});
}
window.addEventListener('hashchange',render);load();
