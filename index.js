
(function () {
'use strict';

const ID='st_quick_commands_cat';
const KEY='st_quick_commands_v1';
const POS='st_quick_commands_cat_pos_v1';

const defaults={
 enabled:true,
 restoreInputAfterSend:true,
 rules:[
  {id:'r1',title:'不代赵语璃',enabled:true,text:'$指令：只对赵语璃以外角色进行角色扮演\n$指令：禁止替赵语璃进行对话、发言、表情、动作和内心想法的描写，禁止以赵语璃发的话做描写'},
  {id:'r2',title:'NPC推剧情',enabled:true,text:'$若有其他人物在场时，{{char}}需要赋予他们语言或者动作神态，用以推动剧情'},
  {id:'r3',title:'反史诗化',enabled:false,text:'$避免无意义夸张描写与史诗化套语。\n$禁止频繁使用「排山倒海」「海啸般」「洪流般」「撕裂神魂」「毁天灭地」「震碎虚空」等夸张表达。优先使用符合场景与人物能力的描写。'},
  {id:'r4',title:'能力一致',enabled:false,text:'$禁止为戏剧效果临时提升或降低角色、神器、NPC能力。\n$所有力量、武功、内力、神器效果必须与既有设定一致。'},
  {id:'r5',title:'少AI句式',enabled:false,text:'$避免重复使用固定推进句式。\n$少用「没有时间」「来不及」「顾不上」「某种」「彷佛」「似乎」「不由得」「下意识」等高频AI表达。'}
 ]
};

const clone=o=>JSON.parse(JSON.stringify(o));
function load(){
 try{
  const p=JSON.parse(localStorage.getItem(KEY)||'null');
  return p ? Object.assign(clone(defaults),p,{rules:Array.isArray(p.rules)?p.rules:clone(defaults.rules)}) : clone(defaults);
 }catch{return clone(defaults)}
}
let state=load(), injecting=false, oldText='', sentText='';
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));

function active(){
 if(!state.enabled)return '';
 return state.rules.filter(x=>x.enabled&&String(x.text||'').trim()).map(x=>x.text.trim()).join('\n');
}
function ta(){
 return document.querySelector('#send_textarea')||document.querySelector('textarea#send_textarea')||document.querySelector('textarea[name="text"]');
}
function setv(el,v){
 const p=Object.getPrototypeOf(el),s=Object.getOwnPropertyDescriptor(p,'value')?.set;
 if(s)s.call(el,v); else el.value=v;
 el.dispatchEvent(new Event('input',{bubbles:true}));
}
function inject(){
 if(injecting)return;
 const el=ta(), cmd=active();
 if(!el||!cmd||!el.value.trim()||el.value.includes('<!-- ST_QUICK_COMMANDS -->'))return;
 oldText=el.value;
 sentText=`<!-- ST_QUICK_COMMANDS -->\n${cmd}\n\n${oldText}`;
 injecting=true; setv(el,sentText);
 setTimeout(()=>{
  const x=ta();
  if(state.restoreInputAfterSend&&x&&x.value===sentText)setv(x,oldText);
  injecting=false; oldText=''; sentText='';
 },1000);
}

function catSVG(){
 return `<svg viewBox="0 0 100 100" aria-hidden="true">
 <path d="M18 40 L13 12 L37 28 Q50 22 63 28 L87 12 L82 41 Q91 51 88 66 Q84 87 50 89 Q16 87 12 66 Q9 51 18 40Z" fill="#fff" stroke="#5f7194" stroke-width="4" stroke-linejoin="round"/>
 <path d="M18 18 L34 31 L20 36Z" fill="#dce8ff"/><path d="M82 18 L66 31 L80 36Z" fill="#dce8ff"/>
 <ellipse cx="34" cy="55" rx="7" ry="9" fill="#34445f"/><ellipse cx="66" cy="55" rx="7" ry="9" fill="#34445f"/>
 <path d="M46 65 Q50 69 54 65" fill="none" stroke="#5f7194" stroke-width="3" stroke-linecap="round"/>
 <path d="M50 62 L46 59 Q50 56 54 59Z" fill="#e9a9b6"/>
 <path d="M25 66 L7 62 M25 72 L8 74 M75 66 L93 62 M75 72 L92 74" stroke="#5f7194" stroke-width="2.5" stroke-linecap="round"/>
 </svg>`;
}
function pos(){
 try{return JSON.parse(localStorage.getItem(POS)||'null')}catch{return null}
}
function place(b,x,y){
 const s=54;
 x=Math.max(8,Math.min(innerWidth-s-8,x));
 y=Math.max(8,Math.min(innerHeight-s-8,y));
 b.style.left=x+'px';b.style.top=y+'px';
 localStorage.setItem(POS,JSON.stringify({x,y}));
}

function panel(){
 if(document.getElementById(ID+'_panel'))return;
 const p=document.createElement('div'); p.id=ID+'_panel';
 p.innerHTML=`
 <div class="sq-head"><b>🐾 快捷指令</b><button class="sq-close">×</button></div>
 <label><input id="sq-enabled" type="checkbox"> 啟用自動附加</label>
 <label><input id="sq-restore" type="checkbox"> 發送後還原輸入框</label>
 <div class="sq-actions"><button id="sq-add">＋新增</button><button id="sq-export">匯出</button><button id="sq-import">匯入</button></div>
 <textarea id="sq-importbox" placeholder="貼上 JSON，再按一次匯入"></textarea>
 <div id="sq-list"></div>`;
 document.body.appendChild(p);
 p.querySelector('.sq-close').onclick=()=>p.classList.remove('open');
 p.querySelector('#sq-enabled').onchange=e=>{state.enabled=e.target.checked;save()};
 p.querySelector('#sq-restore').onchange=e=>{state.restoreInputAfterSend=e.target.checked;save()};
 p.querySelector('#sq-add').onclick=()=>{state.rules.push({id:String(Date.now()),title:'新指令',enabled:true,text:'$指令：'});save();render()};
 p.querySelector('#sq-export').onclick=async()=>{
  const t=JSON.stringify(state,null,2);
  try{await navigator.clipboard.writeText(t);alert('已複製到剪貼簿')}catch{prompt('複製以下 JSON：',t)}
 };
 p.querySelector('#sq-import').onclick=()=>{
  const b=p.querySelector('#sq-importbox');
  if(!b.classList.contains('open')){b.classList.add('open');b.focus();return}
  try{
   const q=JSON.parse(b.value);if(!Array.isArray(q.rules))throw 0;
   state=Object.assign(clone(defaults),q,{rules:q.rules});save();b.value='';b.classList.remove('open');render();alert('匯入完成');
  }catch{alert('JSON 格式錯誤')}
 };
 render();
}
function render(){
 const p=document.getElementById(ID+'_panel');if(!p)return;
 p.querySelector('#sq-enabled').checked=!!state.enabled;
 p.querySelector('#sq-restore').checked=!!state.restoreInputAfterSend;
 const l=p.querySelector('#sq-list');l.innerHTML='';
 state.rules.forEach((r,i)=>{
  const n=document.createElement('div');n.className='sq-rule';
  n.innerHTML=`<div class="sq-row"><label><input class="en" type="checkbox"> 用</label><input class="title"><button class="up">↑</button><button class="down">↓</button><button class="del">刪</button></div><textarea class="txt"></textarea>`;
  n.querySelector('.en').checked=!!r.enabled;n.querySelector('.title').value=r.title||'';n.querySelector('.txt').value=r.text||'';
  n.querySelector('.en').onchange=e=>{r.enabled=e.target.checked;save()};
  n.querySelector('.title').oninput=e=>{r.title=e.target.value;save()};
  n.querySelector('.txt').oninput=e=>{r.text=e.target.value;save()};
  n.querySelector('.del').onclick=()=>{if(confirm('刪除這條指令？')){state.rules.splice(i,1);save();render()}};
  n.querySelector('.up').onclick=()=>{if(i){const [a]=state.rules.splice(i,1);state.rules.splice(i-1,0,a);save();render()}};
  n.querySelector('.down').onclick=()=>{if(i<state.rules.length-1){const [a]=state.rules.splice(i,1);state.rules.splice(i+1,0,a);save();render()}};
  l.appendChild(n);
 });
}
function toggle(){
 const p=document.getElementById(ID+'_panel');if(p){p.classList.toggle('open');render()}
}
function button(){
 if(document.getElementById(ID+'_button'))return;
 panel();
 const b=document.createElement('button');b.id=ID+'_button';b.type='button';b.innerHTML=catSVG();document.body.appendChild(b);
 const q=pos();place(b,q?.x??innerWidth-70,q?.y??Math.max(100,innerHeight-250));

 let dragging=false, moved=false, sx=0,sy=0,bx=0,by=0, suppressClick=false;
 b.addEventListener('pointerdown',e=>{
  dragging=true;moved=false;suppressClick=false;sx=e.clientX;sy=e.clientY;
  const r=b.getBoundingClientRect();bx=r.left;by=r.top;
  try{b.setPointerCapture(e.pointerId)}catch{}
 });
 b.addEventListener('pointermove',e=>{
  if(!dragging)return;
  const dx=e.clientX-sx,dy=e.clientY-sy;
  if(Math.abs(dx)>5||Math.abs(dy)>5)moved=true;
  if(moved){place(b,bx+dx,by+dy);e.preventDefault()}
 });
 b.addEventListener('pointerup',e=>{
  if(!dragging)return;dragging=false;
  try{b.releasePointerCapture(e.pointerId)}catch{}
  if(moved){suppressClick=true;setTimeout(()=>suppressClick=false,250)}
 });
 // v1.2 fix: real click handler, separate from dragging.
 b.addEventListener('click',e=>{
  if(suppressClick||moved){moved=false;return}
  e.preventDefault();e.stopPropagation();toggle();
 });
}

function bind(){
 document.addEventListener('click',e=>{
  if(e.target?.closest?.('#send_but,#send_button,.send_but,[data-testid="send-button"]'))inject();
 },true);
 document.addEventListener('keydown',e=>{
  const x=ta();if(x&&e.target===x&&e.key==='Enter'&&!e.shiftKey&&!e.ctrlKey&&!e.altKey&&!e.metaKey)inject();
 },true);
}
function boot(){
 button();bind();
 new MutationObserver(()=>button()).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
