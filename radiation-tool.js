(()=>{
 const form=document.getElementById('rad-lookup'),zip=document.getElementById('rad-zip'),find=document.getElementById('rad-find'),choose=document.getElementById('rad-city'),check=document.getElementById('rad-check'),status=document.getElementById('rad-status'),result=document.getElementById('rad-result'),near=document.getElementById('rad-near');
 let stations=[],zips=null,load=null,request=0;
 const date=t=>new Date(t).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
 const distance=(a,b)=>{const r=Math.PI/180,dlat=(b.lat-a[0])*r,dlon=(b.lon-a[1])*r;const h=Math.sin(dlat/2)**2+Math.cos(a[0]*r)*Math.cos(b.lat*r)*Math.sin(dlon/2)**2;return 3958.8*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));};
 async function directory(){
  if(stations.length)return;
  if(!load)load=fetch('./assets/radiation-stations.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
   stations=data;choose.replaceChildren(new Option('Choose a monitoring city',''));
   for(const s of stations)choose.add(new Option(s.city+', '+s.state,s.id));
   choose.disabled=false;
  }).catch(e=>{load=null;throw e;});
  await load;
 }
 function reset(){request++;result.replaceChildren();check.disabled=!choose.value;status.textContent='';}
 function paragraph(text,className){const p=document.createElement('p');p.textContent=text;if(className)p.className=className;result.append(p);return p;}
 async function reading(){
  const station=stations.find(s=>s.id===choose.value);if(!station)return;
  const token=++request;result.replaceChildren();status.textContent='Checking EPA’s published readings…';check.disabled=true;
  try{
   const response=await fetch('./api/radiation?comparison=1&station='+encodeURIComponent(station.id),{signal:AbortSignal.timeout(25000)});
   const data=await response.json();if(token!==request)return;
   if(!response.ok)throw Error(data.error||'Readings unavailable.');
   paragraph(station.city+', '+station.state,'rad-monitor-name');
   if(!data.latest){paragraph('No approved readings available in this year’s export.','rad-caution');}
   else{
    const age=(Date.now()-Date.parse(data.latest.time))/3600000;
    paragraph(age>24?'OLD DATA — not a current reading':'Latest available sample — not a safety assessment','rad-caution');
    paragraph(data.latest.dose===null?'Dose rate unavailable for the latest sample.':data.latest.dose.toLocaleString()+' nSv/h','rad-value');
    if(data.latest.dose!==null){
     if(data.baseline){
      const b=data.baseline,v=data.latest.dose,index=v<b.low?0:v>b.high?2:1;
      paragraph('Usual recorded range for this monitor: '+b.low+'–'+b.high+' nSv/h.');
      const scale=document.createElement('div');scale.className='rad-scale';scale.setAttribute('role','group');scale.setAttribute('aria-label','Historical comparison, not safety thresholds');
      ['Below usual','Usual recorded range','Above usual'].forEach((label,i)=>{const segment=document.createElement('span');segment.textContent=(index===i?'● This sample: ':'')+label;if(index===i)segment.className='rad-scale-selected';scale.append(segment);});result.append(scale);
      paragraph('Historical comparison only — not a safe/unsafe rating.'+(age>24?' This sample is old; current conditions are unknown.':''));
      const details=document.createElement('details'),summary=document.createElement('summary'),note=document.createElement('p');
      summary.textContent='How this range is calculated';
      note.textContent='ReadyEnough calculates the middle 90% (5th–95th percentiles) of '+b.samples+' approved dose readings on '+b.days+' dates, from '+date(b.start)+' to '+date(b.end)+'. We use the preceding 30-day window ending 24 hours before the latest sample, with at least 168 readings across 7 dates. This describes recorded variation, not an EPA normal range or health limit. Sustained changes or gaps can affect it. Weather, altitude and local geology change background levels. Check the EPA dashboard and official guidance if concerned.';
      details.append(summary,note);result.append(details);
     }else paragraph('Usual range unavailable: not enough recent dose measurements to make a reliable comparison.');
    }
    paragraph('Sample: '+date(data.latest.time)+' ('+data.latest.time.replace('T',' ').replace('.000Z',' UTC')+').');
    paragraph('Sample age: '+(age>=48?Math.floor(age/24)+' days':Math.max(0,Math.floor(age))+' hours')+'.');
    if(age>24)paragraph('Do not use this old measurement to assess present conditions. Check EPA’s dashboard for newer information.');
   }
   paragraph('Export retrieved: '+date(data.retrievedAt)+'. Responses may be cached for up to one hour. No automatic monitoring or alerts.');
   const a=document.createElement('a');a.textContent='EPA source CSV ('+data.sourceYear+')';a.href=data.source;a.target='_blank';a.rel='noopener noreferrer';result.append(a);
   status.textContent='Check complete. A station reading does not establish conditions at your home.';
  }catch(e){if(token===request){paragraph('Readings unavailable — no safety conclusion can be drawn.','rad-caution');status.textContent='Try again later or open EPA’s dashboard. Offline copies do not provide live readings.';}}
  finally{if(token===request)check.disabled=false;}
 }
 form.addEventListener('submit',async e=>{
  e.preventDefault();reset();const token=request;near.textContent='';const value=zip.value.trim();
  if(!/^\d{5}$/.test(value)){status.textContent='Enter a five-digit U.S. ZIP code, including any leading zero.';zip.focus();return;}
  find.disabled=true;status.textContent='Finding nearby monitoring cities…';
  try{
   await directory();
   if(!zips){const r=await fetch('./assets/radiation-zips.json');if(!r.ok)throw Error();zips=await r.json();}
   if(token!==request)return;
   const point=zips[value];
   if(!point){status.textContent='ZIP not found in the local directory. Choose a monitoring city instead.';return;}
   const closest=stations.map(s=>({...s,miles:distance(point,s)})).sort((a,b)=>a.miles-b.miles).slice(0,3);
   choose.value=closest[0].id;check.disabled=false;
   near.textContent='Nearby monitoring cities: '+closest.map(s=>s.city+', '+s.state+' (~'+Math.round(s.miles)+' miles)').join(' · ')+'. Distances use approximate ZIP and city centers, not exact monitor locations.';
   status.textContent='City selected. Choose Check latest available reading when ready.';
  }catch{status.textContent='The lookup directory could not load. Try again online, or use EPA’s dashboard below.';}
  finally{find.disabled=false;}
 });
 choose.addEventListener('change',()=>{reset();status.textContent=choose.value?'Choose Check latest available reading when ready.':'';});
 check.addEventListener('click',reading);
 document.getElementById('rad-clear').addEventListener('click',()=>{reset();zip.value='';choose.value='';check.disabled=true;near.textContent='';zip.focus();});
 const panel=document.getElementById('rad-panel');
 panel.addEventListener('toggle',()=>{if(panel.open)directory().catch(()=>{status.textContent='City list unavailable. Try again online or use EPA’s dashboard.';});});
})();