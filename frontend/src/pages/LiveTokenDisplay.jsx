import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../api";

import "../css/livetokendisplay.css";


function LiveTokenDisplay() {

    const {
        hospital_id,
        doctor_id
    } = useParams();


    const [doctor, setDoctor] =
        useState(null);

    const [currentPatient, setCurrentPatient] =
        useState(null);

    const [nextPatient, setNextPatient] =
        useState(null);


    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================================
    // LOAD LIVE TOKEN
    // =====================================================

    const loadLiveToken = async () => {

        try {

            setError("");


            const response = await api.get(

                `/tokens/public/${hospital_id}/${doctor_id}`

            );


            const data =
                response.data || {};


            // =================================================
            // DOCTOR INFORMATION
            // =================================================

            setDoctor(

                data.doctor || null

            );


            // =================================================
            // CURRENT PATIENT
            // =================================================

            setCurrentPatient(

                data.current_token || null

            );


            // =================================================
            // NEXT PATIENT
            // =================================================

            setNextPatient(

                data.next_token || null

            );


        } catch (error) {

            console.error(

                "LIVE TOKEN DISPLAY ERROR:",

                error

            );


            setError(

                error.response?.data?.detail ||

                "Unable to load token information."

            );


        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // INITIAL LOAD + AUTO REFRESH
    // =====================================================

    useEffect(() => {


        if (
            !hospital_id ||
            !doctor_id
        ) {

            setError(

                "Hospital or doctor information is missing."

            );

            setLoading(false);

            return;

        }


        loadLiveToken();


        const interval = setInterval(() => {

            loadLiveToken();

        }, 3000);


        return () => {

            clearInterval(interval);

        };


    }, [
        hospital_id,
        doctor_id
    ]);


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="live-token-display">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="live-token-header">


                <div className="live-token-logo">

                    SARITEC Healthcare

                </div>


                <div className="live-token-live">

                    <span className="live-dot"></span>

                    LIVE

                </div>


            </div>


            {/* =================================================
                MAIN
            ================================================= */}

            <div className="live-token-content">


                {/* =================================================
                    DOCTOR INFORMATION
                ================================================= */}

                <div className="live-token-title">

                    <h1>
                        Patient Token
                    </h1>


                    {doctor ? (

                        <>

                            <h2>

                                👨‍⚕️ Dr.{" "}

                                {doctor.full_name}

                            </h2>


                            {doctor.qualification && (

                                <p>

                                    {doctor.qualification}

                                </p>

                            )}

                        </>

                    ) : (

                        <p>
                            Doctor Information
                        </p>

                    )}


                    <p>
                        Please wait for your token number
                    </p>

                </div>


                {/* =================================================
                    CURRENT PATIENT
                ================================================= */}

                <div className="current-token-card">


                    <span className="current-token-label">

                        NOW SERVING

                    </span>


                    {loading ? (

                        <div className="token-loading">

                            Loading...

                        </div>

                    ) : error ? (

                        <div className="token-error">

                            {error}

                        </div>

                    ) : currentPatient ? (

                        <>


                            {/* TOKEN NUMBER */}

                            <div className="current-token-number">

                                {
                                    currentPatient.token_number
                                }

                            </div>


                            {/* PATIENT NAME */}

                            <div className="current-patient-name">

                                👤{" "}

                                {
                                    currentPatient.patient_name ||
                                    "Patient"
                                }

                            </div>


                            {/* DOCTOR NAME */}

                            <div className="current-doctor-name">

                                👨‍⚕️ Dr.{" "}

                                {
                                    currentPatient.doctor_name ||
                                    doctor?.full_name ||
                                    "Doctor"
                                }

                            </div>


                        </>

                    ) : (

                        <div className="no-current-token">

                            No Patient

                        </div>

                    )}


                </div>


                {/* =================================================
                    NEXT PATIENT
                ================================================= */}

                <div className="next-token-card">


                    <div>


                        <span>

                            NEXT PATIENT

                        </span>


                        <strong>

                            {

                                nextPatient

                                    ? nextPatient.token_number

                                    : "—"

                            }

                        </strong>


                        {nextPatient ? (

                            <>

                                {/* NEXT PATIENT NAME */}

                                <div className="next-patient-name">

                                    👤{" "}

                                    {
                                        nextPatient.patient_name ||
                                        "Patient"
                                    }

                                </div>


                                {/* NEXT DOCTOR NAME */}

                                <div className="next-doctor-name">

                                    👨‍⚕️ Dr.{" "}

                                    {
                                        nextPatient.doctor_name ||
                                        doctor?.full_name ||
                                        "Doctor"
                                    }

                                </div>

                            </>

                        ) : (

                            <div className="next-patient-name">

                                No waiting patient

                            </div>

                        )}


                    </div>


                </div>


                {/* =================================================
                    MESSAGE
                ================================================= */}

                <div className="live-token-message">


                    {currentPatient ? (

                        <>

                            <span>
                                🔔
                            </span>


                            Please proceed to the doctor's room
                            when your token is called.


                        </>

                    ) : (

                        <>

                            👨‍⚕️


                            Please wait.
                            The next patient will be called shortly.


                        </>

                    )}


                </div>


            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="live-token-footer">

                Please keep your token number with you

            </div>


        </div>

    );

}


export default LiveTokenDisplay;