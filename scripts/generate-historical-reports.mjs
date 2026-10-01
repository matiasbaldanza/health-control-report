#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function usage() {
  console.log(`Usage:\n  node scripts/generate-historical-reports.mjs <mysugr.csv> --months 2026-06,2026-07,2026-08 [--out reports/historical.html] [--week-gap-mm 1.5]\n\nThe generated HTML is print-ready: open it in a browser and Print -> Save as PDF.`);
}
function parseArgs(argv) {
  if (argv.length < 1 || argv.includes('--help') || argv.includes('-h')) return null;
  const input = argv[0]; let months = []; let out = 'reports/historical.html'; let weekGapMm = 1.5;
  for (let i=1;i<argv.length;i++) {
    if (argv[i] === '--months') months = (argv[++i] ?? '').split(',').map(s=>s.trim()).filter(Boolean);
    else if (argv[i] === '--out') out = argv[++i] ?? out;
    else if (argv[i] === '--week-gap-mm') weekGapMm = Number(argv[++i] ?? weekGapMm);
  }
  if (!months.length) throw new Error('Missing --months YYYY-MM[,YYYY-MM...]');
  if (!Number.isFinite(weekGapMm) || weekGapMm < 0) throw new Error('--week-gap-mm must be a non-negative number');
  return {input, months, out, weekGapMm};
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
function parseDate(s){const m=s.match(/^(\w{3}) (\d{1,2}),? (\d{4})$/);if(!m||!MONTHS[m[1]])throw new Error(`Unsupported date: ${s}`);return {y:+m[3],mo:MONTHS[m[1]],d:+m[2]};}
function parseTime(s){const m=s.match(/^(\d{1,2}):(\d{2}):(\d{2}) ([AP]M)$/);if(!m)throw new Error(`Unsupported time: ${s}`);let h=+m[1];if(m[4]==='AM'&&h===12)h=0;if(m[4]==='PM'&&h!==12)h+=12;return {h,min:+m[2],sec:+m[3]};}
function pad(n){return String(n).padStart(2,'0');}
function loadMeasurements(csv){return parseCsv(csv).flatMap((r,index)=>{const v=Number(r['Blood Sugar Measurement (mg/dL)']);if(!Number.isFinite(v))return[];const d=parseDate(r.Date),t=parseTime(r.Time);return [{row:index+2,date:`${d.y}-${pad(d.mo)}-${pad(d.d)}`,month:`${d.y}-${pad(d.mo)}`,day:d.d,time:`${pad(t.h)}:${pad(t.min)}:${pad(t.sec)}`,minute:t.h*60+t.min,value:v,tag:r.Tags||'',note:r.Note||'',timezone:r.Timezone||''}];}).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));}
const slots=[['fasting',360,719],['lunch',720,1019],['snack',1020,1229],['dinner',1230,1439]];
const noticeLowThreshold=100;
const noticeHighThreshold=200;
const eventFollowupWindowMinutes=120;
function slotOf(m){return slots.find(([,a,b])=>m.minute>=a&&m.minute<=b)?.[0] ?? null;}
function minsBetween(a,b){const da=new Date(`${a.date}T${a.time}`),db=new Date(`${b.date}T${b.time}`);return (db-da)/60000;}
function isNotice(m){return m.value<noticeLowThreshold||m.value>noticeHighThreshold;}
function detectEvents(ms){
  const sorted=[...ms].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const includedRows=new Set();
  const events=[];
  for(let i=0;i<sorted.length;i++){
    const trigger=sorted[i];
    if(includedRows.has(trigger.row)||!isNotice(trigger))continue;
    const firstFollowup=sorted[i+1];
    if(!firstFollowup||minsBetween(trigger,firstFollowup)>eventFollowupWindowMinutes)continue;
    const items=[trigger]; let previous=trigger;
    for(let j=i+1;j<sorted.length;j++){
      const measurement=sorted[j];
      if(minsBetween(previous,measurement)>eventFollowupWindowMinutes)break;
      items.push(measurement); previous=measurement;
    }
    if(items.length<2)continue;
    events.push({id:`E${events.length+1}`,items});
    items.forEach(m=>includedRows.add(m.row));
  }
  return events;
}
const orderedSlots=['fasting','lunch','snack','dinner'];
const contextualAdjacentSlotWindowMinutes=120;
function slotConfidence(m,slot){const anchors={fasting:570,lunch:870,snack:1110,dinner:1290};const fastingTag=(m.tag||'').trim().toLowerCase()==='fasting';if(fastingTag&&slot==='fasting')return .99;if(fastingTag&&slot!=='fasting')return .45;const distance=Math.abs(m.minute-anchors[slot]);return Math.max(.7,.95-(distance/Math.max(1,Math.abs(anchors[slot]-(slot==='fasting'?360:slot==='lunch'?720:slot==='snack'?1020:1230))))*.2);}
function resolveDailyAssignments(ms,events){const excludedRows=new Set();events.forEach(e=>e.items.slice(1).forEach(m=>excludedRows.add(m.row)));const byDay=new Map();ms.filter(m=>!excludedRows.has(m.row)).forEach(m=>{const list=byDay.get(m.date)||[];list.push(m);byDay.set(m.date,list);});const assignments=new Map();
  for(const dayMs of byDay.values()){const bySlot=new Map();dayMs.forEach(m=>{const slot=slotOf(m);if(!slot){assignments.set(m.row,{slot:null,status:'ambiguous'});return;}const list=bySlot.get(slot)||[];list.push(m);bySlot.set(slot,list);});
    for(const [slot,entries] of bySlot){entries.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));const next=orderedSlots[orderedSlots.indexOf(slot)+1];const nextStarts={fasting:360,lunch:720,snack:1020,dinner:1230};const nextEmpty=next&&!bySlot.has(next);const nearBoundary=next&&nextStarts[next]-entries.at(-1).minute<=contextualAdjacentSlotWindowMinutes;if(entries.length===1){assignments.set(entries[0].row,{slot,status:'confirmed',confidence:slotConfidence(entries[0],slot)});continue;}if(entries.length===2&&nextEmpty&&nearBoundary){assignments.set(entries[0].row,{slot,status:'confirmed',confidence:slotConfidence(entries[0],slot)});assignments.set(entries[1].row,{slot:next,status:'inferred',confidence:.65,alternative:slot});continue;}entries.forEach(m=>assignments.set(m.row,{slot,status:'ambiguous',confidence:.5,alternative:next||slot}));}
  }
  return assignments;}
function assignMonth(ms, events){const eventRows=new Map();events.forEach(e=>e.items.forEach(m=>eventRows.set(m.row,e.id)));const classificationStates=resolveDailyAssignments(ms,events);const days=new Map();
  for(const m of ms){if(!days.has(m.day))days.set(m.day,{fasting:[],lunch:[],snack:[],dinner:[],extra:[]});const assignment=classificationStates.get(m.row);const ev=eventRows.get(m.row);if(ev&&eIsFollowup(m,events.find(e=>e.id===ev)))days.get(m.day).extra.push(m);else if(!assignment?.slot)days.get(m.day).extra.push(m);else days.get(m.day)[assignment.slot].push(m);}
  return {days,eventRows,classificationStates};}
function eIsFollowup(m,e){return Boolean(e&&m.row!==e.items[0].row);}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fmt(m,eventRows,events,classificationStates){const notice=isNotice(m)?` <span class="notice-value" title="Valor señalado">•</span>`:'';const eventId=eventRows.get(m.row);const event=events.find(e=>e.id===eventId);const state=classificationStates.get(m.row)?.status;const marker=state==='inferred'?` <span class="classification-marker" title="Horario inferido por contexto diario">*</span>`:state==='ambiguous'?` <span class="classification-marker" title="Asignación ambigua; revisar">?</span>`:'';const followups=event&&event.items[0].row===m.row?` <span class="event-followups">(${event.items.slice(1).map(x=>`${x.value} · ${x.time.slice(0,5)}`).join(' → ')})</span>`:'';return `${m.value}${notice} <span class="time">${m.time.slice(0,5)}</span>${eventId?` <sup>${eventId}</sup>`:''}${marker}${followups}`;}
function stats(ms){const vals=ms.map(m=>m.value);return {n:vals.length,avg:vals.reduce((a,b)=>a+b,0)/vals.length,min:Math.min(...vals),max:Math.max(...vals),low:vals.filter(v=>v<70).length,target:vals.filter(v=>v>=70&&v<=180).length,high:vals.filter(v=>v>=181&&v<=250).length,veryHigh:vals.filter(v=>v>250).length};}
const monthNames=['','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
const weekdayInitials=['D','L','M','M','J','V','S'];
function renderMonth(month, all, weekGapMm){const ms=all.filter(m=>m.month===month);if(!ms.length)return `<section class="page"><h1>${esc(month)}</h1><p>Sin mediciones.</p></section>`;const ev=detectEvents(ms);const {days,eventRows,classificationStates}=assignMonth(ms,ev);const st=stats(ms);const [y,mo]=month.split('-').map(Number);const daysInMonth=new Date(y,mo,0).getDate();
 let rows='';for(let d=1;d<=daysInMonth;d++){const x=days.get(d)??{fasting:[],lunch:[],snack:[],dinner:[],extra:[]};const dateWeekday=new Date(Date.UTC(y,mo-1,d)).getUTCDay();const dayLabel=weekGapMm>0?`<span class="weekday-initial">${weekdayInitials[dateWeekday]}</span> ${d}`:d;const cell=k=>x[k].map(m=>fmt(m,eventRows,ev,classificationStates)).join('<br>');rows+=`<tr><td>${dayLabel}</td><td>${cell('fasting')}</td><td>${cell('lunch')}</td><td>${cell('snack')}</td><td>${cell('dinner')}</td></tr>`;const isSunday=dateWeekday===0;if(weekGapMm>0&&isSunday&&d<daysInMonth)rows+=`<tr class="week-gap" aria-hidden="true"><td colspan="5"></td></tr>`;}
 const eventHtml=ev.length?ev.map(e=>{const first=e.items[0],last=e.items.at(-1);const firstDate=`${first.date.slice(8,10)}/${first.date.slice(5,7)}`;const lastDate=`${last.date.slice(8,10)}/${last.date.slice(5,7)}`;const dateLabel=firstDate===lastDate?firstDate:`${first.date.slice(8,10)}–${last.date.slice(8,10)}/${last.date.slice(5,7)}`;return `<div><b>${e.id} · ${dateLabel}:</b> ${e.items.map((m,i)=>`${i===0?`${m.value} mg/dL`:`${m.value}`} (${m.time.slice(0,5)})`).join(' → ')}</div>`;}).join(''):'<div>Sin eventos de seguimiento detectados.</div>';
 return `<section class="page"><header><div><h1>${monthNames[mo]} ${y}</h1><div class="patient">Control de glucemia</div></div><div class="summary"><b>${st.n}</b> mediciones · Prom. <b>${st.avg.toFixed(0)}</b> · Mín. <b>${st.min}</b> · Máx. <b>${st.max}</b></div></header><table style="--week-gap-mm:${weekGapMm}mm"><thead><tr><th>Día</th><th>Ayunas / desayuno</th><th>Almuerzo</th><th>Merienda</th><th>Cena</th></tr></thead><tbody>${rows}</tbody></table><div class="metrics"><span>&lt;70: <b>${st.low}</b></span><span>70–180: <b>${st.target}</b></span><span>181–250: <b>${st.high}</b></span><span>&gt;250: <b>${st.veryHigh}</b></span></div><div class="events"><h2>Eventos / mediciones adicionales</h2>${eventHtml}<div class="classification-legend">* horario inferido por contexto diario · ? asignación ambigua; revisar</div></div></section>`;}
function html(months,all,weekGapMm){return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Control de glucemia</title><style>@page{size:A4 portrait;margin:0}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#111;margin:0;background:#eee}.page{width:210mm;min-height:297mm;margin:10mm auto;background:white;padding:12mm;break-after:page;page-break-after:always}header{display:flex;justify-content:space-between;align-items:end;margin-bottom:4mm}h1{margin:0;font-size:20pt;letter-spacing:.2pt}.patient{font-size:10pt}.summary{font-size:10pt;text-align:right}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:11.5pt;line-height:1.15}th,td{border:1px solid #444;padding:1.25mm 1mm;vertical-align:middle;text-align:center;height:7.1mm;overflow-wrap:anywhere}th{font-size:10pt;line-height:1.1;padding:2mm 1mm;height:11mm}th:first-child,td:first-child{width:13mm}.weekday-initial{display:inline-block;margin-right:.4mm;font-size:8.5pt;font-weight:600;color:#666}.time{font-size:9pt;color:#444;white-space:nowrap}.notice-value{color:#8a5a00;font-weight:bold;font-size:10pt}.classification-marker{color:#666;font-weight:bold;font-size:8.5pt}.event-followups{display:block;margin-top:.5mm;font-size:8.5pt;line-height:1.1;font-weight:normal;color:#333}sup{font-weight:bold;font-size:8.5pt}.week-gap td{height:var(--week-gap-mm);padding:0;border:0;background:white}.metrics{display:flex;flex-wrap:wrap;gap:3mm 7mm;margin-top:3mm;font-size:10pt}.events{margin-top:3mm;font-size:9pt;line-height:1.35}.events h2{font-size:11pt;margin:0 0 1mm}.classification-legend{font-size:7.5pt;color:#666;margin-top:1mm}@media print{body{background:white}.page{margin:0;width:auto;min-height:0;padding:12mm}}@media screen{.page{box-shadow:0 2px 12px #999}}</style></head><body>${months.map(m=>renderMonth(m,all,weekGapMm)).join('')}</body></html>`;}
try{const args=parseArgs(process.argv.slice(2));if(!args){usage();process.exit(0);}const csv=fs.readFileSync(args.input,'utf8');const all=loadMeasurements(csv);const output=html(args.months,all,args.weekGapMm);fs.mkdirSync(path.dirname(args.out),{recursive:true});fs.writeFileSync(args.out,output);console.log(`Generated ${args.out}`);for(const m of args.months){const x=all.filter(r=>r.month===m);if(x.length){const s=stats(x);console.log(`${m}: ${s.n} readings, avg ${s.avg.toFixed(1)}, min ${s.min}, max ${s.max}`);}else console.log(`${m}: no readings`);}}
catch(e){console.error(e instanceof Error?e.message:e);usage();process.exit(1);}
