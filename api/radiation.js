const stations = require('../assets/radiation-stations.json');
function fields(line) {
 const out=[];let value='',quoted=false;
 for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quoted&&line[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){out.push(value.trim());value='';}else value+=c;}out.push(value.trim());return out;
}
function parseCSV(text,now=Date.now()){
 const lines=text.trim().split(/\r?\n/);const header=fields(lines.shift()||'');
 const ti=header.indexOf('SAMPLE COLLECTION TIME'),di=header.indexOf('DOSE EQUIVALENT RATE (nSv/h)'),si=header.indexOf('STATUS');
 if(ti<0||si<0)throw Error('Unsupported EPA data format');
 const rows=[];
 for(const line of lines){
  const f=fields(line);if(f[si]!=='APPROVED')continue;
  const m=(f[ti]||'').match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);if(!m)continue;
  const t=Date.UTC(+m[3],+m[1]-1,+m[2],+m[4],+m[5],+m[6]);
  if(!Number.isFinite(t)||t>now+300000)continue;
  const raw=di>=0?f[di]:'';
  const v=raw&&/^\d+(\.\d+)?$/.test(raw)?Number(raw):null;
  rows.push({time:new Date(t).toISOString(),dose:v});
 }
 rows.sort((a,b)=>a.time.localeCompare(b.time));
 const latest=rows.at(-1)||null;
 return {latest,unit:'nSv/h',records:rows.length};
}
async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Use GET'});}
 const station=stations.find(s=>s.id===req.query.station);
 if(!station)return res.status(400).json({error:'Choose a listed monitor.'});
 const year=new Date().getUTCFullYear();
 const source=station.source.replace('/2026/','/'+year+'/');
 try{
  const upstream=await fetch(source,{signal:AbortSignal.timeout(18000),headers:{Accept:'*/*'}});
  if(!upstream.ok)throw Error('EPA HTTP '+upstream.status);
  const text=await upstream.text();if(text.length>4000000)throw Error('Unexpected response size');
  const data=parseCSV(text);
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600');
  return res.status(200).json({...data,station:station.id,source,sourceYear:year,retrievedAt:new Date().toISOString()});
 }catch(error){
  res.setHeader('Cache-Control','no-store');
  return res.status(502).json({sourceYear:year,reason:error.name==='TimeoutError'?'EPA request timed out':error.message==='Unsupported EPA data format'?'EPA data format unavailable':error.message.startsWith('EPA HTTP')?error.message:'EPA connection unavailable',error:'EPA readings are unavailable here. Open the official dashboard below; missing data is not an all-clear.'});
 }
}
module.exports=handler;
module.exports.parseCSV=parseCSV;
