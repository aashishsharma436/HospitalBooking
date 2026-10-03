import { useState } from 'react';
import './App.css';

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

function App() {
  const [active, setActive] = useState('Overview');

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">C</div>
          <div><strong>CareFlow</strong><span>Hospital Booking</span></div>
        </div>

        <nav>
          {['Overview', 'Appointments', 'Live Queue', 'Doctors', 'Patients', 'Reports'].map((item, index) => (
            <button key={item} className={active === item ? 'nav-item active' : 'nav-item'} onClick={() => setActive(item)}>
              <span>{['⌂', '▣', '◉', '♧', '♡', '▥'][index]}</span>{item}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="mini-avatar">AS</div>
          <div><strong>Hospital Admin</strong><span>CityCare Hospital</span></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">TUESDAY · 3 OCTOBER 2026</span>
            <h1>{active === 'Overview' ? 'Good morning, Admin' : active}</h1>
          </div>
          <div className="top-actions">
            <button className="icon-button">⌕</button>
            <button className="icon-button">♢</button>
            <button className="profile">AS</button>
          </div>
        </header>

        <section className="hero">
          <div>
            <span className="eyebrow">TODAY AT CITYCARE</span>
            <h2>Keep every patient moving.</h2>
            <p>Appointments, walk-ins and live queue management in one workflow.</p>
          </div>
          <button className="primary-button">+ New appointment</button>
        </section>

        <section className="stats-grid">
          <Stat label="Today's appointments" value="48" delta="+12%" tone="teal" />
          <Stat label="Patients waiting" value="17" delta="4 critical" tone="amber" />
          <Stat label="Completed today" value="31" delta="65% of total" tone="blue" />
          <Stat label="Avg. wait time" value="14 min" delta="↓ 6 min" tone="green" />
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <div><span className="eyebrow">DOCTOR AVAILABILITY</span><h3>Today's consultations</h3></div>
              <button className="text-button">View all →</button>
            </div>
            <div className="doctor-list">
              {doctors.map((doctor) => (
                <article className="doctor-row" key={doctor.name}>
                  <div className="doctor-avatar">{doctor.name.split(' ').slice(1).map(n => n[0]).join('')}</div>
                  <div className="doctor-main"><strong>{doctor.name}</strong><span>{doctor.specialty}</span></div>
                  <span className={'mode ' + doctor.mode.toLowerCase()}>{doctor.mode}</span>
                  <div className="doctor-next"><strong>{doctor.next}</strong><span>{doctor.wait}</span></div>
                  <button className="row-arrow">→</button>
                </article>
              ))}
            </div>
          </div>

          <div className="panel queue-panel">
            <div className="panel-header">
              <div><span className="eyebrow">LIVE QUEUE</span><h3>General Medicine</h3></div>
              <span className="live"><i /> Live</span>
            </div>
            <div className="queue-number">
              <span>NOW SERVING</span><strong>17</strong><p>Token 18 is next</p>
            </div>
            <div className="progress"><span /></div>
            <div className="queue-meta"><span>Waiting <strong>6</strong></span><span>Avg. wait <strong>18 min</strong></span></div>
            <button className="secondary-button">Open queue board</button>
          </div>
        </section>

        <section className="panel appointments-panel">
          <div className="panel-header">
            <div><span className="eyebrow">UPCOMING</span><h3>Next appointments</h3></div>
            <button className="text-button">Manage schedule →</button>
          </div>
          <div className="appointment-table">
            {appointments.map(([time, patient, doctor, service, status]) => (
              <div className="appointment-row" key={time + patient}>
                <strong>{time}</strong><span>{patient}</span><span>{doctor}</span><span>{service}</span>
                <span className={'status ' + status.toLowerCase().replace(' ', '-')}>{status}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, delta, tone }) {
  return <div className={'stat-card ' + tone}><span>{label}</span><strong>{value}</strong><small>{delta}</small></div>;
}

export default App;
