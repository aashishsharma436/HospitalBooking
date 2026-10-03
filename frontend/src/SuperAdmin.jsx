import { useEffect, useState } from 'react';
import './SuperAdmin.css';

const API=(import.meta.env.VITE_API_BASE_URL||'').replace(/\/$/,'');
const saved=()=>sessionStorage.getItem('platformBasicAuth')||'';

export default function SuperAdmin(){
 const [auth,setAuth]=useState(saved()),[login,setLogin]=useState({u:'',p:''}),[data,setData]=useState(null),[tenants,setTenants]=useState([]),[modal,setModal]=useState(false),[toast,setToast]=useState(''),[loading,setLoading]=useState(!!saved()),[error,setError]=useState('');
 const notify=x=>{setToast(x);setTimeout(()=>setToast(''),2200)};
 const request=async(path,options={})=>{
  const r=await fetch(API+path,{...options,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Basic '+auth}:{})}});
  if(r.status===401) throw new Error('Invalid Super Admin username or password');
  if(!r.ok) throw new Error((await r.text())||'Request failed');
  return r.json();
 };
 const load=async(currentAuth=auth)=>{
  try{
   setLoading(true); setError('');
   const headers={Authorization:'Basic '+currentAuth,'Content-Type':'application/json'};
   const [dr,tr]=await Promise.all([
    fetch(API+'/api/v1/platform/dashboard',{headers}),
    fetch(API+'/api/v1/platform/tenants',{headers})
   ]);
   if(dr.status===401||tr.status===401) throw new Error('Invalid Super Admin username or password');
   if(!dr.ok) throw new Error((await dr.text())||'Unable to load platform dashboard');
   if(!tr.ok) throw new Error((await tr.text())||'Unable to load hospitals');
   const [d,t]=await Promise.all([dr.json(),tr.json()]);
   setData(d); setTenants(t); setAuth(currentAuth); sessionStorage.setItem('platformBasicAuth',currentAuth);
  }catch(e){
   sessionStorage.removeItem('platformBasicAuth'); setAuth(''); setData(null); setTenants([]); setError(e.message||'Unable to sign in');
  }finally{setLoading(false)}
 };
 useEffect(()=>{const current=saved(); if(current) load(current);},[]);
 const signIn=async e=>{
  e.preventDefault();
  const username=login.u.trim(),password=login.p;
  if(!username||!password){setError('Enter both username and password');return;}
  const token=btoa(username+':'+password);
  setError('');
  await load(token);
 };
 const approve=async id=>{await request('/api/v1/platform/tenants/'+id+'/approve',{method:'POST'});notify('Hospital approved and provisioning started');load()};
 const activate=async id=>{await request('/api/v1/platform/tenants/'+id+'/activate',{method:'POST'});notify('Hospital activated');load()};
 const onboard=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);await request('/api/v1/platform/tenants',{method:'POST',body:JSON.stringify({hospitalName:f.get('name'),hospitalCode:f.get('code'),email:f.get('email'),phone:f.get('phone'),city:f.get('city')})});setModal(false);notify('Hospital added to onboarding queue');load()};

 if(!auth)return <div className="sa-login"><div className="sa-login-card"><div className="sa-logo">C</div><span className="sa-kicker">CAREFLOW PLATFORM</span><h1>Super Admin</h1><p>Manage hospitals, onboarding and the CareFlow SaaS platform.</p>{error&&<div className="sa-login-error">{error}</div>}<form onSubmit={signIn}><input autoComplete="username" placeholder="Username" value={login.u} onChange={e=>setLogin({...login,u:e.target.value})}/><input autoComplete="current-password" type="password" placeholder="Password" value={login.p} onChange={e=>setLogin({...login,p:e.target.value})}/><button disabled={loading}>{loading?'Signing in…':'Sign in'}</button></form><a href="/">← Hospital portal</a></div></div>;
 if(loading&&!data)return <div className="sa-login"><div className="sa-login-card"><div className="sa-logo">C</div><span className="sa-kicker">CAREFLOW PLATFORM</span><h1>Loading dashboard…</h1><p>Verifying your Super Admin session.</p></div></div>;
 return <div className="sa-shell"><aside className="sa-sidebar"><div className="sa-brand"><div className="sa-logo">C</div><div><b>CareFlow</b><span>SaaS Platform</span></div></div><nav>{['Dashboard','Hospitals','Onboarding','Subscriptions','Platform Users','Audit Logs'].map((x,i)=><button className={i===0?'active':''} key={x}>{['⌂','▣','＋','◇','♙','≡'][i]} {x}</button>)}</nav><div className="sa-side-foot"><b>Super Admin</b><span>Platform control</span><button onClick={()=>{sessionStorage.removeItem('platformBasicAuth');setAuth('');setData(null);setTenants([])}}>Sign out</button></div></aside>
 <main className="sa-main"><header className="sa-header"><div><span className="sa-kicker">PLATFORM CONTROL PLANE</span><h1>Good morning, Super Admin</h1><p>Monitor every hospital using CareFlow.</p></div><button className="sa-primary" onClick={()=>setModal(true)}>+ Onboard hospital</button></header>
 <section className="sa-stats"><Card label="Total hospitals" value={data?.total??'—'} tone="green"/><Card label="Pending review" value={data?.pending??'—'} tone="amber"/><Card label="Active hospitals" value={data?.active??'—'} tone="blue"/><Card label="Trial hospitals" value={data?.trial??'—'} tone="purple"/></section>
 <section className="sa-panel"><div className="sa-panel-head"><div><span className="sa-kicker">TENANT DIRECTORY</span><h2>Hospitals</h2></div><button onClick={()=>load()}>↻ Refresh</button></div><div className="sa-table-head"><span>Hospital</span><span>Code</span><span>Location</span><span>Status</span><span>Action</span></div>{tenants.map(t=><div className="sa-row" key={t.id}><div><b>{t.hospitalName}</b><small>{t.email}</small></div><span>{t.hospitalCode}</span><span>{t.city||'—'}</span><span className={'sa-status '+t.status.toLowerCase()}>{t.status.replaceAll('_',' ')}</span><div>{t.status==='PENDING_REVIEW'?<button className="sa-action" onClick={()=>approve(t.id)}>Approve</button>:t.status==='PROVISIONING'?<button className="sa-action" onClick={()=>activate(t.id)}>Activate</button>:<button className="sa-link" onClick={()=>notify('Hospital details selected')}>View →</button>}</div></div>)}{!tenants.length&&<div className="sa-empty">No hospitals onboarded yet. Start by adding your first hospital.</div>}</section>
 {modal&&<div className="sa-backdrop"><form className="sa-modal" onSubmit={onboard}><div className="sa-panel-head"><div><span className="sa-kicker">ONBOARDING</span><h2>Add hospital</h2></div><button type="button" onClick={()=>setModal(false)}>×</button></div><label>Hospital name<input name="name" required placeholder="CityCare Hospital"/></label><div className="sa-grid"><label>Hospital code<input name="code" required placeholder="CITYCARE-001"/></label><label>City<input name="city" placeholder="Bengaluru"/></label></div><label>Admin email<input name="email" type="email" required placeholder="admin@hospital.com"/></label><label>Phone<input name="phone" placeholder="+91..."/></label><div className="sa-modal-actions"><button type="button" onClick={()=>setModal(false)}>Cancel</button><button className="sa-primary">Add to review queue</button></div></form></div>}{toast&&<div className="sa-toast">{toast}</div>}</main></div>
}
function Card({label,value,tone}){return <div className={'sa-card '+tone}><span>{label}</span><b>{value}</b><small>Current platform count</small></div>}