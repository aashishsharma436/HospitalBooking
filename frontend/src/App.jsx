import { useEffect, useState } from 'react';
import './App.css';
import SuperAdmin from './SuperAdmin.jsx';
import HospitalLogin from './HospitalLogin.jsx';

const API=(import.meta.env.VITE_API_BASE_URL||'https://hospital-booking-backend-tv9o.onrender.com').replace(/\/$/,'');

const doctors = [
  { name: 'Dr. Ananya Rao', specialty: 'Cardiology', mode: 'Appointment', next: '10:30 AM', wait: 'By appointment' },
  { name: 'Dr. Vikram Shah', specialty: 'General Medicine', mode: 'Queue', next: 'Token 18', wait: '15–20 min' },
  { name: 'Dr. Meera Iyer', specialty: 'Dermatology', mode: 'Hybrid', next: '11:15 AM', wait: '8–12 min' }
];

const appointments = [
  ['10:30', 'Riya Menon', 'Dr. Ananya Rao', 'Cardiology', 'Confirmed'],
  ['10:45', 'Rahul Verma', 'Dr. Meera Iyer', 'Dermatology', 'Checked in'],
  ['11:00', 'Priya Nair', 'Dr. Vikram Shah', 'General Medicine', 'Waiting'],
  ['11:15', 'Arjun Kumar', 'Dr. Meera Iyer', 'Dermatology', 'Confirmed']
];

function HospitalDashboard({onLogout}) {
  const [active,setActive]=useState('Overview');
  const [appointments,setAppointments]=useState([
    {id:1,time:'10:30',patient:'Riya Menon',doctor:'Dr. Ananya Rao',service:'Cardiology',status:'Confirmed'},
    {id:2,time:'10:45',patient:'Rahul Verma',doctor:'Dr. Meera Iyer',service:'Dermatology',status:'Checked in'},
    {id:3,time:'11:00',patient:'Priya Nair',doctor:'Dr. Vikram Shah',service:'General Medicine',status:'Waiting'},
    {id:4,time:'11:15',patient:'Arjun Kumar',doctor:'Dr. Meera Iyer',service:'Dermatology',status:'Confirmed'}
  ]);
  const [queue,setQueue]=useState({now:17,next:18,waiting:6});
  const [doctors,setDoctors]=useState([
    {name:'Dr. Ananya Rao',specialty:'Cardiology',mode:'Appointment',next:'10:30 AM',wait:'By appointment',available:true},
    {name:'Dr. Vikram Shah',specialty:'General Medicine',mode:'Queue',next:'Token 18',wait:'15–20 min',available:true},
    {name:'Dr. Meera Iyer',specialty:'Dermatology',mode:'Hybrid',next:'11:15 AM',wait:'8–12 min',available:true}
  ]);
  const [patients,setPatients]=useState([]),[team,setTeam]=useState([]);
  const [patientError,setPatientError]=useState(''),[teamError,setTeamError]=useState('');
  const [username,setUsername]=useState(''),[usernameCheck,setUsernameCheck]=useState(null),[checkingUsername,setCheckingUsername]=useState(false);
  const [modal,setModal]=useState(false),[teamModal,setTeamModal]=useState(false),[toast,setToast]=useState(''),[search,setSearch]=useState('');
  const currentUser=JSON.parse(sessionStorage.getItem('hospitalUser')||'null');
  const isHospitalAdmin=currentUser?.role==='HOSPITAL_ADMIN';
  useEffect(()=>{
    if(active!=='Patients') return;
    const token=sessionStorage.getItem('hospitalAccessToken');
    fetch(API+'/api/v1/patients',{headers:{Authorization:'Bearer '+token}})
      .then(async r=>{if(!r.ok) throw new Error((await r.text())||'Unable to load patients');return r.json();})
      .then(setPatients).catch(e=>setPatientError(e.message));
  },[active]);
  useEffect(()=>{
    if(active!=='Team'||!isHospitalAdmin) return;
    const token=sessionStorage.getItem('hospitalAccessToken');
    fetch(API+'/api/v1/hospital/users',{headers:{Authorization:'Bearer '+token}})
      .then(async r=>{if(!r.ok) throw new Error((await r.text())||'Unable to load team');return r.json();})
      .then(setTeam).catch(e=>setTeamError(e.message));
  },[active,isHospitalAdmin]);
  const notify=x=>{setToast(x);setTimeout(()=>setToast(''),2200)};
  const checkUsername=async value=>{
    const prefix=value.trim().toLowerCase();
    setUsername(prefix); setUsernameCheck(null);
    if(!/^[a-z0-9][a-z0-9._-]{1,63}$/.test(prefix)) return;
    setCheckingUsername(true);
    try{
      const token=sessionStorage.getItem('hospitalAccessToken');
      const r=await fetch(API+'/api/v1/hospital/users/username-availability?username='+encodeURIComponent(prefix),{headers:{Authorization:'Bearer '+token}});
      const d=await r.json();
      if(!r.ok) throw new Error(d.message||'Unable to check username');
      setUsernameCheck(d);
    }catch(e){setUsernameCheck({available:false,error:e.message})}
    finally{setCheckingUsername(false)}
  };
  const createAppointment=e=>{e.preventDefault();const f=new FormData(e.currentTarget);setAppointments(a=>[...a,{id:Date.now(),time:f.get('time'),patient:f.get('patient'),doctor:f.get('doctor'),service:f.get('service'),status:'Confirmed'}].sort((a,b)=>a.time.localeCompare(b.time)));setModal(false);notify('Appointment created')};
  const issueToken=()=>{setQueue(q=>({...q,next:q.next+1,waiting:q.waiting+1}));notify('Token '+queue.next+' issued')};
  const callNext=()=>{setQueue(q=>({...q,now:q.next,next:q.next+1,waiting:Math.max(0,q.waiting-1)}));notify('Token '+queue.next+' is now serving')};
  const toggleDoctor=name=>{setDoctors(ds=>ds.map(d=>d.name===name?{...d,available:!d.available}:d));notify('Doctor availability updated')};
  const createTeamMember=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const token=sessionStorage.getItem('hospitalAccessToken');if(!usernameCheck?.available){notify('Choose an available username first');return}try{const r=await fetch(API+'/api/v1/hospital/users',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({fullName:f.get('fullName'),emailPrefix:f.get('emailPrefix'),role:f.get('role'),phone:f.get('phone'),recoveryEmail:f.get('recoveryEmail')||undefined})});if(!r.ok)throw new Error((await r.text())||'Unable to create employee');const d=await r.json();setTeam(t=>[...t,{...d,fullName:f.get('fullName'),mailStatus:d.mailboxStatus}]);setTeamModal(false);setUsername('');setUsernameCheck(null);notify(d.email+' created.');}catch(e){notify(e.message)}};
  const filtered=appointments.filter(a=>[a.patient,a.doctor,a.service].join(' ').toLowerCase().includes(search.toLowerCase()));
  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">C</div><div><strong>CareFlow</strong><span>Hospital Booking</span></div></div>
      <nav>{['Overview','Appointments','Live Queue','Doctors','Patients','Team','Reports'].filter(item=>item!=='Team'||isHospitalAdmin).map((item,i)=><button key={item} className={active===item?'nav-item active':'nav-item'} onClick={()=>setActive(item)}><span>{['⌂','▣','◉','♧','♡','♙','▥'][i]}</span>{item}</button>)}</nav>
      <div className="sidebar-footer"><div className="mini-avatar">AS</div><div><strong>Hospital Admin</strong><span>Current hospital</span></div><button className="text-button" onClick={onLogout}>Sign out</button></div>
    </aside>
    <main className="main"><header className="topbar"><div><span className="eyebrow">TUESDAY · 3 OCTOBER 2026</span><h1>{active==='Overview'?'Good morning, Admin':active}</h1></div><div className="top-actions"><div className="search-wrap">⌕<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."/></div><button className="icon-button" onClick={()=>notify('No new notifications')}>♢</button><button className="profile" onClick={()=>notify('Hospital Admin')}>AS</button></div></header>
      {active==='Overview'&&<><section className="hero"><div><span className="eyebrow">TODAY AT CITYCARE</span><h2>Keep every patient moving.</h2><p>Appointments, walk-ins and live queue management in one workflow.</p></div><button className="primary-button" onClick={()=>setModal(true)}>+ New appointment</button></section>
      <section className="stats-grid"><Stat label="Today's appointments" value={appointments.length} delta="Live schedule" tone="teal"/><Stat label="Patients waiting" value={queue.waiting} delta="Live queue" tone="amber"/><Stat label="Completed today" value="31" delta="65% of total" tone="blue"/><Stat label="Avg. wait time" value="18 min" delta="Live estimate" tone="green"/></section>
      <section className="content-grid"><DoctorPanel doctors={doctors} onToggle={toggleDoctor}/><QueuePanel queue={queue} onIssue={issueToken} onCall={callNext}/></section><AppointmentPanel appointments={appointments}/></>}
      {active==='Appointments'&&<section className="page-stack"><Toolbar title="Appointments" onAction={()=>setModal(true)} action="+ New appointment"/><AppointmentPanel appointments={filtered} full/></section>}
      {active==='Live Queue'&&<section className="page-stack"><Toolbar title="Live Queue" onAction={issueToken} action="+ Walk-in token"/><QueuePanel queue={queue} onIssue={issueToken} onCall={callNext} large/></section>}
      {active==='Doctors'&&<section className="page-stack"><Toolbar title="Doctors"/><DoctorPanel doctors={doctors} onToggle={toggleDoctor} full/></section>}
      {active==='Patients'&&<section className="page-stack"><Toolbar title="Patients"/><div className="panel"><div className="patient-list">{patientError&&<div className="patient-row"><strong>{patientError}</strong></div>}{patients.filter(p=>(p.fullName||'').toLowerCase().includes(search.toLowerCase())).map(p=><div className="patient-row" key={p.id}><div className="patient-avatar">{(p.fullName||'P').split(' ').map(x=>x[0]).join('')}</div><strong>{p.fullName}</strong><span>{p.patientNumber}</span><button className="text-button" onClick={()=>notify('Patient profile opened')}>View →</button></div>)}{!patientError&&!patients.length&&<div className="patient-row"><span>No patients available for your role.</span></div>}</div></div></section>}
      {active==='Team'&&isHospitalAdmin&&<section className="page-stack"><Toolbar title="Hospital team" onAction={()=>setTeamModal(true)} action="+ Add employee"/><div className="panel"><div className="panel-header"><div><span className="eyebrow">EMAIL IDENTITY</span><h3>Employees and hospital mailboxes</h3></div></div>{teamError&&<div className="patient-row"><strong>{teamError}</strong></div>}{team.map(u=><div className="patient-row" key={u.id}><div className="patient-avatar">{(u.fullName||'U').split(' ').map(x=>x[0]).join('')}</div><div><strong>{u.fullName}</strong><small style={{display:'block',color:'#829693',marginTop:3}}>{u.email}</small></div><span>{u.role}</span><span>{u.mailStatus}</span></div>)}{!teamError&&!team.length&&<div className="patient-row"><span>No employees yet.</span></div>}</div></section>}\n      {active==='Reports'&&<section className="page-stack"><Toolbar title="Reports"/><div className="stats-grid"><Stat label="Appointments" value={appointments.length} delta="Today" tone="teal"/><Stat label="Queue served" value="31" delta="Today" tone="blue"/><Stat label="No-shows" value="3" delta="6.2%" tone="amber"/><Stat label="Avg. wait" value="18 min" delta="Today" tone="green"/></div></section>}
      {toast&&<div className="toast">{toast}</div>}
    </main>
    {teamModal&&<div className="modal-backdrop"><form className="modal" onSubmit={createTeamMember} onMouseDown={e=>e.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">TEAM</span><h3>Add employee</h3></div><button type="button" className="close-button" onClick={()=>{setTeamModal(false);setUsername('');setUsernameCheck(null)}}>×</button></div><label>Full name<input name="fullName" required placeholder="Rahul Sharma"/></label><label>Username<input name="emailPrefix" required pattern="[a-z0-9][a-z0-9._-]{1,63}" value={username} onChange={e=>checkUsername(e.target.value)} placeholder="rahul" autoComplete="off"/><small style={{display:'block',marginTop:5,color:usernameCheck?.available?'#2d8757':'#829693'}}>{checkingUsername?'Checking availability…':usernameCheck?.error||(!username?'Choose the login name. CareFlow will add the hospital domain automatically.':usernameCheck?.available?'✓ Username available':'✕ Username unavailable')}</small></label>{usernameCheck?.email&&<div style={{padding:'11px 12px',borderRadius:9,background:'#f1f7f5',color:'#245b54',fontSize:12,marginBottom:13}}>Email: <strong>{usernameCheck.email}</strong></div>}<div className="form-grid"><label>Role<select name="role"><option value="RECEPTIONIST">Receptionist</option><option value="DOCTOR">Doctor</option></select></label><label>Phone<input name="phone" placeholder="+91..."/></label></div><label>Recovery email<input name="recoveryEmail" type="email" placeholder="personal@example.com"/></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>{setTeamModal(false);setUsername('');setUsernameCheck(null)}}>Cancel</button><button className="primary-button" disabled={!usernameCheck?.available||checkingUsername}>Create employee</button></div></form></div>}{modal&&<div className="modal-backdrop" onMouseDown={()=>setModal(false)}><form className="modal" onSubmit={createAppointment} onMouseDown={e=>e.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">BOOKING</span><h3>New appointment</h3></div><button type="button" className="close-button" onClick={()=>setModal(false)}>×</button></div><label>Patient name<input name="patient" required autoFocus placeholder="Enter patient name"/></label><div className="form-grid"><label>Time<input name="time" type="time" defaultValue="11:30" required/></label><label>Doctor<select name="doctor"><option>Dr. Ananya Rao</option><option>Dr. Vikram Shah</option><option>Dr. Meera Iyer</option></select></label></div><label>Service<input name="service" defaultValue="General Consultation"/></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setModal(false)}>Cancel</button><button className="primary-button">Create appointment</button></div></form></div>}
  </div>;
}

function Toolbar({title,onAction,action}){return <div className="page-toolbar"><div><span className="eyebrow">CARE OPERATIONS</span><h2 className="page-title">{title}</h2></div>{onAction&&<button className="primary-button compact" onClick={onAction}>{action}</button>}</div>}
function DoctorPanel({doctors,onToggle}){return <div className="panel"><div className="panel-header"><div><span className="eyebrow">DOCTOR AVAILABILITY</span><h3>Today's consultations</h3></div></div><div className="doctor-list">{doctors.map(d=><article className="doctor-row" key={d.name}><div className="doctor-avatar">{d.name.split(' ').slice(1).map(n=>n[0]).join('')}</div><div className="doctor-main"><strong>{d.name}</strong><span>{d.specialty}</span></div><span className={'mode '+d.mode.toLowerCase()}>{d.mode}</span><div className="doctor-next"><strong>{d.available?d.next:'Unavailable'}</strong><span>{d.available?d.wait:'Off duty'}</span></div><button className="row-arrow" onClick={()=>onToggle(d.name)}>{d.available?'✓':'×'}</button></article>)}</div></div>}
function QueuePanel({queue,onIssue,onCall,large}){return <div className={'panel queue-panel'+(large?' large':'')}><div className="panel-header"><div><span className="eyebrow">LIVE QUEUE</span><h3>General Medicine</h3></div><span className="live"><i/> Live</span></div><div className="queue-number"><span>NOW SERVING</span><strong>{queue.now}</strong><p>Token {queue.next} is next</p></div><div className="progress"><span style={{width:Math.max(10,100-queue.waiting*5)+'%'}}/></div><div className="queue-meta"><span>Waiting <strong>{queue.waiting}</strong></span><span>Avg. wait <strong>18 min</strong></span></div><div className="queue-actions"><button className="secondary-button" onClick={onIssue}>+ Issue token</button><button className="primary-button" onClick={onCall}>Call next</button></div></div>}
function AppointmentPanel({appointments,full}){return <section className={'panel appointments-panel'+(full?' full-panel':'')}><div className="panel-header"><div><span className="eyebrow">UPCOMING</span><h3>Next appointments</h3></div></div><div className="appointment-table">{appointments.map(a=><div className="appointment-row" key={a.id}><strong>{a.time}</strong><span>{a.patient}</span><span>{a.doctor}</span><span>{a.service}</span><span className={'status '+a.status.toLowerCase().replace(' ','-')}>{a.status}</span></div>)}</div></section>}
function Stat({ label, value, delta, tone }) {
  return <div className={'stat-card ' + tone}><span>{label}</span><strong>{value}</strong><small>{delta}</small></div>;
}

function App(){
 const [route,setRoute]=useState(()=>window.location.pathname);
 const [authenticated,setAuthenticated]=useState(()=>!!sessionStorage.getItem('hospitalAccessToken'));

 useEffect(()=>{
   const onPopState=()=>setRoute(window.location.pathname);
   window.addEventListener('popstate',onPopState);
   return ()=>window.removeEventListener('popstate',onPopState);
 },[]);

 if(route.startsWith('/super-admin')) return <SuperAdmin />;

 if(!authenticated) {
   return <HospitalLogin onLogin={()=>setAuthenticated(true)} onOpenSuperAdmin={()=>{
     window.history.pushState({},'', '/super-admin');
     setRoute('/super-admin');
   }} />;
 }

 return <HospitalDashboard onLogout={()=>{
   sessionStorage.removeItem('hospitalAccessToken');
   sessionStorage.removeItem('hospitalUser');
   setAuthenticated(false);
 }} />;
}

export default App;
