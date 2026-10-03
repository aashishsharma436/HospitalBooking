import { useEffect, useState } from 'react';
import './SuperAdmin.css';

const API=(import.meta.env.VITE_API_BASE_URL||'').replace(/\/$/,'');
const saved=()=>sessionStorage.getItem('platformBasicAuth')||'';

export default function SuperAdmin(){
 const [auth,setAuth]=useState(saved()),[login,setLogin]=useState({u:'',p:''}),[data,setData]=useState(null),[tenants,setTenants]=useState([]);
 const [tab,setTab]=useState('Dashboard'),[loading,setLoading]=useState(!!saved()),[error,setError]=useState(''),[toast,setToast]=useState('');
 const [modal,setModal]=useState(false),[verify,setVerify]=useState(null),[details,setDetails]=useState(null),[credentials,setCredentials]=useState(null);
 const [rows,setRows]=useState({subscriptions:[],users:[],audit:[]});
 const [slugStatus,setSlugStatus]=useState({checking:false,available:null,message:''});

 const notify=x=>{setToast(x);setTimeout(()=>setToast(''),2600)};
 const request=async(path,options={})=>{
  const r=await fetch(API+path,{...options,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Basic '+auth}:{})}});
  if(r.status===401) throw new Error('Invalid Super Admin username or password');
  if(!r.ok){let body='Request failed';try{const d=await r.json();body=d.message||d.error||body}catch{}throw new Error(body)}
  return r.json();
 };
 const load=async(currentAuth=auth)=>{
  try{
   setLoading(true);setError('');
   const h={Authorization:'Basic '+currentAuth,'Content-Type':'application/json'};
   const [dr,tr]=await Promise.all([fetch(API+'/api/v1/platform/dashboard',{headers:h}),fetch(API+'/api/v1/platform/tenants',{headers:h})]);
   if(dr.status===401||tr.status===401) throw new Error('Invalid Super Admin username or password');
   if(!dr.ok||!tr.ok) throw new Error('Unable to load platform data');
   const [d,t]=await Promise.all([dr.json(),tr.json()]);
   setData(d);setTenants(t);setAuth(currentAuth);sessionStorage.setItem('platformBasicAuth',currentAuth);
  }catch(e){sessionStorage.removeItem('platformBasicAuth');setAuth('');setData(null);setTenants([]);setError(e.message||'Unable to sign in')}
  finally{setLoading(false)}
 };
 const loadTab=async name=>{
  try{
   if(name==='Subscriptions'){const d=await request('/api/v1/platform/subscriptions');setRows(r=>({...r,subscriptions:d}))}
   if(name==='Platform Users'){const d=await request('/api/v1/platform/users');setRows(r=>({...r,users:d}))}
   if(name==='Audit Logs'){const d=await request('/api/v1/platform/audit-logs');setRows(r=>({...r,audit:d}))}
  }catch(e){notify(e.message)}
 };
 useEffect(()=>{const a=saved();if(a)load(a)},[]);
 useEffect(()=>{if(auth&&tab!=='Dashboard'&&tab!=='Hospitals'&&tab!=='Onboarding')loadTab(tab)},[tab,auth]);
 const signIn=async e=>{e.preventDefault();const u=login.u.trim(),p=login.p;if(!u||!p){setError('Enter both username and password');return}await load(btoa(u+':'+p))};
 const checkSlug=async value=>{
  const slug=value.trim().toLowerCase();
  if(!slug){setSlugStatus({checking:false,available:null,message:''});return}
  setSlugStatus({checking:true,available:null,message:''});
  try{const d=await request('/api/v1/platform/tenants/slug-availability?slug='+encodeURIComponent(slug));setSlugStatus({checking:false,available:d.available,message:d.available?'Domain is available':'This CareFlow domain already exists. Please choose another.'})}
  catch(e){setSlugStatus({checking:false,available:null,message:e.message})}
 };
 const onboard=async e=>{
  e.preventDefault();const f=new FormData(e.currentTarget);const slug=String(f.get('slug')||'').trim().toLowerCase();
  if(slugStatus.checking||slugStatus.available!==true){setSlugStatus(s=>({...s,message:s.available===false?'This CareFlow domain already exists. Please choose another.':'Check the CareFlow domain before continuing.'}));return}
  try{
   const d=await request('/api/v1/platform/tenants',{method:'POST',body:JSON.stringify({hospitalName:f.get('name'),tenantSlug:f.get('slug'),adminEmail:f.get('adminPrefix')+'@'+f.get('slug')+'.careflow.com',email:f.get('email'),phone:f.get('phone'),city:f.get('city')})});
   setModal(false);setVerify(d);await load();notify('Verification codes sent. Both contacts must be verified before approval.');
  }catch(e){notify(e.message)}
 };
 const refreshVerification=async()=>{
  try{const d=await request('/api/v1/platform/tenants/'+verify.id+'/verification/send',{method:'POST'});setVerify(d);notify('New verification codes sent.')}catch(e){notify(e.message)}
 };
 const verifyOtp=async(type,otp)=>{
  try{const d=await request('/api/v1/platform/tenants/'+verify.id+'/verification/'+type,{method:'POST',body:JSON.stringify({otp})});setVerify(d);await load();notify(type==='email'?'Email verified':'Mobile verified')}catch(e){notify(e.message)}
 };
 const approve=async id=>{
  try{const d=await request('/api/v1/platform/tenants/'+id+'/approve',{method:'POST'});setCredentials({email:d.adminEmail,password:d.temporaryPassword});await load();notify('Hospital provisioned. Save the temporary password.')}catch(e){notify(e.message)}
 };
 const reject=async id=>{try{await request('/api/v1/platform/tenants/'+id+'/reject',{method:'POST'});await load();notify('Hospital rejected')}catch(e){notify(e.message)}};
 const activate=async id=>{try{await request('/api/v1/platform/tenants/'+id+'/activate',{method:'POST'});await load();notify('Hospital activated')}catch(e){notify(e.message)}};
 const viewHospital=async id=>{try{setDetails(await request('/api/v1/platform/tenants/'+id))}catch(e){notify(e.message)}};

 if(!auth)return <div className="sa-login"><div className="sa-login-card"><div className="sa-logo">C</div><span className="sa-kicker">CAREFLOW PLATFORM</span><h1>Super Admin</h1><p>Manage hospitals, onboarding and the CareFlow SaaS platform.</p>{error&&<div className="sa-login-error">{error}</div>}<form onSubmit={signIn}><input autoComplete="username" placeholder="Username" value={login.u} onChange={e=>setLogin({...login,u:e.target.value})}/><input autoComplete="current-password" type="password" placeholder="Password" value={login.p} onChange={e=>setLogin({...login,p:e.target.value})}/><button disabled={loading}>{loading?'Signing in…':'Sign in'}</button></form><a href="/">← Hospital portal</a></div></div>;
 if(loading&&!data)return <div className="sa-login"><div className="sa-login-card"><div className="sa-logo">C</div><span className="sa-kicker">CAREFLOW PLATFORM</span><h1>Loading dashboard…</h1><p>Verifying your Super Admin session.</p></div></div>;

 const nav=['Dashboard','Hospitals','Onboarding','Subscriptions','Platform Users','Audit Logs'];
 return <div className="sa-shell">
  <aside className="sa-sidebar"><div className="sa-brand"><div className="sa-logo">C</div><div><b>CareFlow</b><span>SaaS Platform</span></div></div><nav>{nav.map((x,i)=><button className={tab===x?'active':''} key={x} onClick={()=>setTab(x)}>{['⌂','▣','＋','◇','♙','≡'][i]} {x}</button>)}</nav><div className="sa-side-foot"><b>Super Admin</b><span>Platform control</span><button onClick={()=>{sessionStorage.removeItem('platformBasicAuth');setAuth('');setData(null)}}>Sign out</button></div></aside>
  <main className="sa-main">
   {credentials&&<div className="sa-credentials"><b>New hospital admin</b><span>{credentials.email}</span><code>{credentials.password}</code><button onClick={()=>setCredentials(null)}>Dismiss</button></div>}
   <header className="sa-header"><div><span className="sa-kicker">PLATFORM CONTROL PLANE</span><h1>{tab}</h1><p>{tab==='Dashboard'?'Monitor every hospital using CareFlow.':tab==='Onboarding'?'Verify contacts and review hospital applications.':'Manage '+tab.toLowerCase()+' across the platform.'}</p></div>{(tab==='Dashboard'||tab==='Hospitals'||tab==='Onboarding')&&<button className="sa-primary" onClick={()=>setModal(true)}>+ Onboard hospital</button>}</header>
   {tab==='Dashboard'&&<Dashboard data={data} tenants={tenants} onView={viewHospital}/>}
   {(tab==='Hospitals'||tab==='Onboarding')&&<HospitalTable tenants={tenants} onboarding={tab==='Onboarding'} onVerify={setVerify} onApprove={approve} onReject={reject} onActivate={activate} onView={viewHospital}/>}
   {tab==='Subscriptions'&&<DataTable title="Subscriptions" columns={['Hospital','Plan','Status','Started','Current period']} rows={rows.subscriptions.map(x=>[x.hospital,x.plan,x.status,fmt(x.started_at),fmt(x.current_period_end)])}/>}
   {tab==='Platform Users'&&<DataTable title="Platform Users" columns={['Email','Role','Status']} rows={rows.users.map(x=>[x.email,x.role,x.active?'Active':'Disabled'])}/>}
   {tab==='Audit Logs'&&<DataTable title="Audit Logs" columns={['Time','Action','Entity','Actor']} rows={rows.audit.map(x=>[fmt(x.created_at),x.action,x.entity_type||'—',x.metadata?.actor||'system'])}/>}
   {modal&&<OnboardModal onClose={()=>setModal(false)} onSubmit={onboard}/>}
   {verify&&<VerificationModal data={verify} onClose={()=>setVerify(null)} onVerify={verifyOtp} onResend={refreshVerification}/>}
   {details&&<DetailsModal data={details} onClose={()=>setDetails(null)}/>}
   {toast&&<div className="sa-toast">{toast}</div>}
  </main>
 </div>
}

function Dashboard({data,tenants,onView}){return <><section className="sa-stats"><Card label="Total hospitals" value={data?.total??'—'} tone="green"/><Card label="Pending verification/review" value={(data?.pending??0)+(data?.verifiedPendingReview??0)} tone="amber"/><Card label="Active hospitals" value={data?.active??'—'} tone="blue"/><Card label="Trial hospitals" value={data?.trial??'—'} tone="purple"/></section><HospitalTable tenants={tenants.slice(0,8)} onView={onView}/></>}
function HospitalTable({tenants,onVerify,onApprove,onReject,onActivate,onView,onboarding=false}){return <section className="sa-panel"><div className="sa-panel-head"><div><span className="sa-kicker">{onboarding?'REVIEW QUEUE':'TENANT DIRECTORY'}</span><h2>{onboarding?'Hospital onboarding':'Hospitals'}</h2></div><span className="sa-muted">{tenants.length} records</span></div><div className="sa-table-head"><span>Hospital</span><span>Code</span><span>Contact verification</span><span>Status</span><span>Action</span></div>{tenants.filter(t=>!onboarding||['PENDING_REVIEW','VERIFIED_PENDING_REVIEW','REJECTED'].includes(t.status)).map(t=><div className="sa-row" key={t.id}><div><b>{t.hospitalName}</b><small>{t.email}</small></div><span>{t.hospitalCode}</span><span><b className={t.emailVerified?'sa-ok':'sa-warn'}>{t.emailVerified?'Email ✓':'Email pending'}</b><small className={t.mobileVerified?'sa-ok':'sa-warn'}>{t.mobileVerified?'Mobile ✓':'Mobile pending'}</small></span><span className={'sa-status '+t.status.toLowerCase()}>{t.status.replaceAll('_',' ')}</span><div className="sa-actions">{(t.status==='PENDING_REVIEW'||t.status==='VERIFIED_PENDING_REVIEW')&&onVerify&&<button className="sa-link" onClick={()=>onVerify(t)}>Verify</button>}{t.status==='VERIFIED_PENDING_REVIEW'&&onApprove&&<button className="sa-action" onClick={()=>onApprove(t.id)}>Approve</button>}{t.status==='PENDING_REVIEW'&&onReject&&<button className="sa-danger" onClick={()=>onReject(t.id)}>Reject</button>}{t.status==='PROVISIONING'&&onActivate&&<button className="sa-action" onClick={()=>onActivate(t.id)}>Activate</button>}{onView&&<button className="sa-link" onClick={()=>onView(t.id)}>View</button>}</div></div>)}{!tenants.length&&<div className="sa-empty">No hospitals found.</div>}</section>}
function OnboardModal({onClose,onSubmit}){return <div className="sa-backdrop"><form className="sa-modal" onSubmit={onSubmit}><div className="sa-panel-head"><div><span className="sa-kicker">ONBOARDING</span><h2>Add hospital</h2></div><button type="button" onClick={onClose}>×</button></div><label>Hospital name<input name="name" required placeholder="Apollo Hospital"/></label><label>City<input name="city" placeholder="Bengaluru"/></label><label>CareFlow domain prefix<input name="slug" required pattern="[a-z0-9-]{2,60}" placeholder="apollo" onChange={()=>setSlugStatus({checking:false,available:null,message:""})} onBlur={e=>checkSlug(e.target.value)}/><small className="sa-help">Enter the hospital domain prefix, for example <b>apollo.careflow.com</b>.</small>{slugStatus.checking&&<small className="sa-help">Checking domain availability…</small>}{slugStatus.message&&<small className={slugStatus.available===false?"sa-warn":"sa-ok"}>{slugStatus.message}</small>}</label><label>Admin mailbox prefix<input name="adminPrefix" required pattern="[a-z0-9._-]{2,64}" defaultValue="admin" placeholder="admin"/></label><label>Contact email<input name="email" type="email" required placeholder="owner@hospital.com"/></label><label>Mobile number<input name="phone" required pattern="\+?[0-9]{10,15}" placeholder="+919876543210"/></label><p className="sa-help">Email and mobile will each receive a 6-digit OTP. Approval is blocked until both are verified.</p><div className="sa-modal-actions"><button type="button" onClick={onClose}>Cancel</button><button className="sa-primary">Send verification codes</button></div></form></div>}
function VerificationModal({data,onClose,onVerify,onResend}){const [emailOtp,setEmailOtp]=useState(''),[mobileOtp,setMobileOtp]=useState('');const emailVerified=Boolean(data.email_verified??data.emailVerified),mobileVerified=Boolean(data.mobile_verified??data.mobileVerified);return <div className="sa-backdrop"><div className="sa-modal"><div className="sa-panel-head"><div><span className="sa-kicker">CONTACT VERIFICATION</span><h2>{data.hospital_name||data.hospitalName}</h2></div><button onClick={onClose}>×</button></div><div className="sa-verify-card"><b>Email</b><span>{mask(data.email)}</span><strong className={emailVerified?'sa-ok':'sa-warn'}>{emailVerified?'Verified ✓':'Verification required'}</strong>{!emailVerified&&<div className="sa-otp"><input inputMode="numeric" maxLength="6" placeholder="6-digit OTP" value={emailOtp} onChange={e=>setEmailOtp(e.target.value.replace(/\D/g,''))}/><button className="sa-action" onClick={()=>onVerify('email',emailOtp)}>Verify</button></div>}</div><div className="sa-verify-card"><b>Mobile</b><span>{mask(data.phone)}</span><strong className={mobileVerified?'sa-ok':'sa-warn'}>{mobileVerified?'Verified ✓':'Verification required'}</strong>{!mobileVerified&&<div className="sa-otp"><input inputMode="numeric" maxLength="6" placeholder="6-digit OTP" value={mobileOtp} onChange={e=>setMobileOtp(e.target.value.replace(/\D/g,''))}/><button className="sa-action" onClick={()=>onVerify('mobile',mobileOtp)}>Verify</button></div>}</div><p className="sa-help">Both contacts must be verified before the hospital can be approved.</p><div className="sa-modal-actions"><button type="button" onClick={onResend}>Resend codes</button><button type="button" className="sa-primary" disabled={!(emailVerified&&mobileVerified)} onClick={onClose}>Done</button></div></div></div>}
function DetailsModal({data,onClose}){return <div className="sa-backdrop"><div className="sa-modal"><div className="sa-panel-head"><div><span className="sa-kicker">HOSPITAL</span><h2>{data.hospital_name}</h2></div><button onClick={onClose}>×</button></div><div className="sa-detail-grid">{[['Code',data.hospital_code],['City',data.city],['Domain',data.tenant_domain],['Admin',data.admin_email],['Contact email',data.email],['Mobile',data.phone],['Status',data.status],['Email verified',data.email_verified?'Yes':'No'],['Mobile verified',data.mobile_verified?'Yes':'No']].map(([k,v])=><div key={k}><small>{k}</small><b>{v||'—'}</b></div>)}</div></div></div>}
function DataTable({title,columns,rows}){return <section className="sa-panel"><div className="sa-panel-head"><div><span className="sa-kicker">PLATFORM DATA</span><h2>{title}</h2></div><span className="sa-muted">{rows.length} records</span></div><div className="sa-table-head sa-data-head">{columns.map(c=><span key={c}>{c}</span>)}</div>{rows.map((row,i)=><div className="sa-row sa-data-row" key={i}>{row.map((v,j)=><span key={j}>{String(v??'—')}</span>)}</div>)}{!rows.length&&<div className="sa-empty">No records found.</div>}</section>}
function Card({label,value,tone}){return <div className={'sa-card '+tone}><span>{label}</span><b>{value}</b><small>Current platform count</small></div>}
function fmt(v){return v?new Date(v).toLocaleString():'—'}
function mask(v){if(!v)return '—';if(v.includes('@')){const [a,d]=v.split('@');return a.slice(0,2)+'•••@'+d}return v.slice(0,3)+'••••••'+v.slice(-2)}
