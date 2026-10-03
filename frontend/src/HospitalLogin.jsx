import { useState } from 'react';
import './HospitalLogin.css';

const API=(import.meta.env.VITE_API_BASE_URL||'').replace(/\/$/,'');

export default function HospitalLogin({onLogin,onOpenSuperAdmin}){
 const [form,setForm]=useState({hospitalCode:'',email:'',password:''});
 const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
 const submit=async e=>{
  e.preventDefault(); setError(''); setLoading(true);
  try{
   const r=await fetch(API+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
   if(!r.ok) throw new Error((await r.text())||'Invalid login details');
   const data=await r.json();
   sessionStorage.setItem('hospitalAccessToken',data.accessToken);
   sessionStorage.setItem('hospitalUser',JSON.stringify(data));
   onLogin();
  }catch(err){setError(err.message||'Unable to sign in');}
  finally{setLoading(false);}
 };
 return <div className="hospital-login"><div className="hospital-login-card">
  <div className="hospital-login-logo">C</div><span className="hospital-login-kicker">CAREFLOW HOSPITAL PORTAL</span>
  <h1>Welcome back</h1><p>Sign in to manage your hospital operations.</p>
  <form onSubmit={submit}>
   <label>Hospital code<input required value={form.hospitalCode} onChange={e=>setForm({...form,hospitalCode:e.target.value})} placeholder="CITYCARE-001"/></label>
   <label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="admin@hospital.com"/></label>
   <label>Password<input required type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Your password"/></label>
   {error&&<div className="hospital-login-error">{error}</div>}
   <button disabled={loading}>{loading?'Signing in…':'Sign in to hospital'}</button>
  </form>
  <a href="/super-admin" onClick={e=>{e.preventDefault();onOpenSuperAdmin?.();}}>CareFlow platform owner →</a>
 </div></div>;
}
