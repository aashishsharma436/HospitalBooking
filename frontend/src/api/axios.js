import axios from "axios";


const api = axios.create({

    baseURL: "http://127.0.0.1:8000",

    headers: {
        "Content-Type": "application/json",
    }

});


// =========================================================
// JWT TOKEN INTERCEPTOR
// =========================================================

api.interceptors.request.use(

    (config) => {

        const token =
            sessionStorage.getItem("token");


        console.log(
            "TOKEN BEING SENT:",
            token
        );


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


export default api;