import axios from "axios";


// =========================================================
// AXIOS INSTANCE
// =========================================================

const api = axios.create({

    baseURL: "http://127.0.0.1:8000",

    headers: {
        "Content-Type": "application/json",
    },

});


// =========================================================
// LOGIN API
// =========================================================

export const loginUser = async (email, password) => {

    try {

        const response = await api.post(
            "/users/login",
            {
                email: email,
                password: password,
            }
        );


        console.log(
            "LOGIN API RESPONSE:",
            response.data
        );


        return response.data;

    } catch (error) {

        console.error(
            "LOGIN API ERROR:",
            error
        );


        if (error.response) {

            console.error(
                "SERVER ERROR:",
                error.response.data
            );

        }


        throw error;

    }

};


// =========================================================
// JWT TOKEN INTERCEPTOR
// =========================================================

api.interceptors.request.use(

    (config) => {

        // Current browser TAB ka token
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


// =========================================================
// EXPORT
// =========================================================

export default api;