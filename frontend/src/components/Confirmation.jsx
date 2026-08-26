function Confirmation({ appointment }) {

  return (

    <div className="confirmation">

      <h2>
        ✅ Appointment Confirmed
      </h2>

      <p>
        <strong>Patient:</strong> {appointment.patient_name}
      </p>

      <p>
        <strong>Doctor:</strong> {appointment.doctor_name}
      </p>

      <p>
        <strong>Date:</strong> {appointment.appointment_date}
      </p>

      <p>
        <strong>Token:</strong> {appointment.token_number}
      </p>

      <p>
        Please reach the hospital 10 minutes before your appointment.
      </p>

    </div>

  );

}

export default Confirmation;