#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function usage() {
  console.log(`Usage:\n  node scripts/generate-historical-reports.mjs <mysugr.csv> --months 2026-06,2026-07,2026-08 [--out reports/historical.html]\n\nThe generated HTML is print-ready: open it in a browser and Print -> Save as PDF.`);
}
function parseArgs(argv) {
  if (argv.length < 1 || argv.includes('--help') || argv.includes('-h')) return null;
  const input = argv[0]; let months = []; let out = 'reports/historical.html';
  for (let i=1;i<argv.length;i++) {
    if (argv[i] === '--months') months = (argv[++i] ?? '').split(',').map(s=>s.trim()).filter(Boolean);
    else if (argv[i] === '--out') out = argv[++i] ?? out;
  }
  if (!months.length) throw new Error('Missing --months YYYY-MM[,YYYY-MM...]');
  return {input, months, out};
}
function parseCsv(text) {
  const rows=[]; let row=[], field='', quoted=false;
  for(let i=0;i<text.length;i++) { const c=text[i];
    if(quoted){ if(c==='"' && text[i+1]==='"'){field+='"';i++;} else if(c==='"') quoted=false; else field+=c; }
    else if(c==='"') quoted=true; else if(c===','){row.push(field);field='';} else if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';} else field+=c;
  }
  if(field || row.length){row.push(field.replace(/\r$/,''));rows.push(row);} const headers=rows.shift() ?? [];
  return rows.filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??''])));
}
const MONTHS={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};
function parseDate(s){const m=s.match(/^(\w{3}) (\d{1,2}), (\d{4})$/);if(!m||!MONTHS[m[1]])throw new Error(`Unsupported date: ${s}`);return {y:+m[3],mo:MONTHS[m[1]],d:+m[2]};}
function parseTime(s){const m=s.match(/^(\d{1,2}):(\d{2}):(\d{2}) ([AP]M)$/);if(!m)throw new Error(`Unsupported time: ${s}`);let h=+m[1];if(m[4]==='AM'&&h===12)h=0;if(m[4]==='PM'&&h!==12)h+=12;return {h,min:+m[2],sec:+m[3]};}
function pad(n){return String(n).padStart(2,'0');}
function loadMeasurements(csv){return parseCsv(csv).flatMap((r,index)=>{const v=Number(r['Blood Sugar Measurement (mg/dL)']);if(!Number.isFinite(v))return[];const d=parseDate(r.Date),t=parseTime(r.Time);return [{row:index+2,date:`${d.y}-${pad(d.mo)}-${pad(d.d)}`,month:`${d.y}-${pad(d.mo)}`,day:d.d,time:`${pad(t.h)}:${pad(t.min)}:${pad(t.sec)}`,minute:t.h*60+t.min,value:v,tag:r.Tags||'',note:r.Note||'',timezone:r.Timezone||''}];}).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));}
const slots=[['fasting',360,719],['lunch',720,1019],['snack',1020,1229],['dinner',1230,1439]];
function slotOf(m){return slots.find(([,a,b])=>m.minute>=a&&m.minute<=b)?.[0] ?? null;}
function minsBetween(a,b){const da=new Date(`${a.date}T${a.time}`),db=new Date(`${b.date}T${b.time}`);return (db-da)/60000;}
function detectEvents(ms){
  const candidates=[];
  // Build connected clusters around extreme readings or dense rechecks. Deliberately conservative.
  for(let i=0;i<ms.length;i++){
    const extreme=ms[i].value<70||ms[i].value>250;
    const nearby=[];for(let j=Math.max(0,i-4);j<Math.min(ms.length,i+8);j++){if(Math.abs(minsBetween(ms[i],ms[j]))<=240)nearby.push(j);}
    const dense=nearby.length>=3;
    if(extreme||dense)candidates.push(...nearby);
  }
  const idx=[...new Set(candidates)].sort((a,b)=>a-b); const groups=[];
  for(const i of idx){const last=groups.at(-1);if(!last||minsBetween(ms[last.at(-1)],ms[i])>240)groups.push([i]);else last.push(i);}
  return groups.filter(g=>g.length>=2 && (g.length>=3 || g.some(i=>ms[i].value<70||ms[i].value>250))).map((g,k)=>({id:`E${k+1}`,items:g.map(i=>ms[i])}));
}
function assignMonth(ms, events){const eventRows=new Map();events.forEach(e=>e.items.forEach(m=>eventRows.set(m.row,e.id)));const days=new Map();
  for(const m of ms){if(!days.has(m.day))days.set(m.day,{fasting:[],lunch:[],snack:[],dinner:[],extra:[]});const s=slotOf(m);const ev=eventRows.get(m.row);if(!s)days.get(m.day).extra.push(m);else if(ev && eIsFollowup(m,events.find(e=>e.id===ev)))days.get(m.day).extra.push(m);else days.get(m.day)[s].push(m);}
  return {days,eventRows};}
function eIsFollowup(m,e){if(!e)return false;const normal=e.items.filter(x=>slotOf(x)); if(normal.length<=1)return false; const first=e.items[0]; return m.row!==first.row && minsBetween(first,m)<=240;}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fmt(m,eventRows){return `${m.value} <span class="time">${m.time.slice(0,5)}</span>${eventRows.get(m.row)?` <sup>${eventRows.get(m.row)}</sup>`:''}`;}
function stats(ms){const vals=ms.map(m=>m.value);return {n:vals.length,avg:vals.reduce((a,b)=>a+b,0)/vals.length,min:Math.min(...vals),max:Math.max(...vals),low:vals.filter(v=>v<70).length,target:vals.filter(v=>v>=70&&v<=180).length,high:vals.filter(v=>v>=181&&v<=250).length,veryHigh:vals.filter(v=>v>250).length};}
const monthNames=['','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
function renderMonth(month, all){const ms=all.filter(m=>m.month===month);if(!ms.length)return `<section class="page"><h1>${esc(month)}</h1><p>Sin mediciones.</p></section>`;const ev=detectEvents(ms);const {days,eventRows}=assignMonth(ms,ev);const st=stats(ms);const [y,mo]=month.split('-').map(Number);
 let rows='';for(let d=1;d<=new Date(y,mo,0).getDate();d++){const x=days.get(d)??{fasting:[],lunch:[],snack:[],dinner:[],extra:[]};const cell=k=>x[k].map(m=>fmt(m,eventRows)).join('<br>');rows+=`<tr><td>${d}</td><td>${cell('fasting')}</td><td>${cell('lunch')}</td><td>${cell('snack')}</td><td>${cell('dinner')}</td></tr>`;}
 const eventHtml=ev.length?ev.map(e=>`<div><b>${e.id} · ${e.items[0].date.slice(8,10)}/${e.items[0].date.slice(5,7)}:</b> ${e.items.map(m=>`${m.value} mg/dL (${m.time.slice(0,5)})`).join(' → ')}</div>`).join(''):'<div>Sin eventos automáticos detectados.</div>';
 return `<section class="page"><header><div><h1>${monthNames[mo]} ${y}</h1><div class="patient">Control de glucemia</div></div><div class="summary"><b>${st.n}</b> mediciones · Prom. <b>${st.avg.toFixed(0)}</b> · Mín. <b>${st.min}</b> · Máx. <b>${st.max}</b></div></header><table><thead><tr><th>Día</th><th>Ayunas / desayuno</th><th>Almuerzo</th><th>Merienda</th><th>Cena</th></tr></thead><tbody>${rows}</tbody></table><div class="metrics"><span>&lt;70: <b>${st.low}</b></span><span>70–180: <b>${st.target}</b></span><span>181–250: <b>${st.high}</b></span><span>&gt;250: <b>${st.veryHigh}</b></span></div><div class="events"><h2>Eventos / mediciones adicionales</h2>${eventHtml}<p class="notice">Detección automática para revisión. Confirmar contexto y notas manualmente; no constituye interpretación clínica.</p></div></section>`;}
function html(months,all){return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Control de glucemia</title><style>@page{size:A4 landscape;margin:8mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#111;margin:0;background:#eee}.page{width:281mm;min-height:194mm;margin:10mm auto;background:white;padding:5mm;break-after:page;page-break-after:always}header{display:flex;justify-content:space-between;align-items:end;margin-bottom:3mm}h1{margin:0;font-size:19pt}.patient{font-size:9pt}.summary{font-size:10pt}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:8.5pt}th,td{border:1px solid #555;padding:1.1mm;vertical-align:middle;text-align:center;height:4.25mm}th:first-child,td:first-child{width:8mm}.time{font-size:7pt;color:#444}sup{font-weight:bold}.metrics{display:flex;gap:7mm;margin-top:2.5mm;font-size:9pt}.events{margin-top:2mm;font-size:8pt;line-height:1.35}.events h2{font-size:9pt;margin:0 0 1mm}.notice{font-size:7pt;color:#555;margin:.8mm 0 0}@media print{body{background:white}.page{margin:0;width:auto;min-height:0;padding:0}}@media screen{.page{box-shadow:0 2px 12px #999}}</style></head><body>${months.map(m=>renderMonth(m,all)).join('')}</body></html>`;}
try{const args=parseArgs(process.argv.slice(2));if(!args){usage();process.exit(0);}const csv=fs.readFileSync(args.input,'utf8');const all=loadMeasurements(csv);const output=html(args.months,all);fs.mkdirSync(path.dirname(args.out),{recursive:true});fs.writeFileSync(args.out,output);console.log(`Generated ${args.out}`);for(const m of args.months){const x=all.filter(r=>r.month===m);if(x.length){const s=stats(x);console.log(`${m}: ${s.n} readings, avg ${s.avg.toFixed(1)}, min ${s.min}, max ${s.max}`);}else console.log(`${m}: no readings`);}}
catch(e){console.error(e instanceof Error?e.message:e);usage();process.exit(1);}
