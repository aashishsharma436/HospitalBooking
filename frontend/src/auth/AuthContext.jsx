import { createContext, useState } from "react";

export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {


  // =========================================================
  // LOAD USER FROM SESSION STORAGE
  // =========================================================

  const [user, setUser] = useState(() => {

    try {

      const savedUser =
        sessionStorage.getItem("user");


      if (savedUser) {

        return JSON.parse(savedUser);

      }


      return null;


    } catch (error) {

      console.error(
        "USER LOAD ERROR:",
        error
      );

      return null;

    }

  });


  // =========================================================
  // LOGIN
  // =========================================================

  const login = (data) => {

    console.log(
      "AUTH LOGIN DATA:",
      data
    );


    // =======================================================
    // COMPLETE USER DATA
    // =======================================================

    const userData = {

      user_id:
        data.user_id || null,

      hospital_id:
        data.hospital_id || null,

      doctor_id:
        data.doctor_id || null,

      role:
        data.role || null,

      name:
        data.name || ""

    };


    // =======================================================
    // SAVE USER IN CURRENT TAB SESSION
    // =======================================================

    sessionStorage.setItem(
      "user",
      JSON.stringify(userData)
    );


    // =======================================================
    // SAVE JWT IN CURRENT TAB SESSION
    // =======================================================

    sessionStorage.setItem(
      "token",
      data.access_token
    );


    // =======================================================
    // UPDATE REACT STATE
    // =======================================================

    setUser(userData);


    // =======================================================
    // DEBUG
    // =======================================================

    console.log(
      "TOKEN SAVED FROM AUTH:",
      sessionStorage.getItem("token")
    );


    console.log(
      "USER SAVED FROM AUTH:",
      sessionStorage.getItem("user")
    );

  };


  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {

    setUser(null);


    sessionStorage.removeItem(
      "user"
    );


    sessionStorage.removeItem(
      "token"
    );

  };


  // =========================================================
  // PROVIDER
  // =========================================================

  return (

    <AuthContext.Provider
      value={{
        user,
        login,
        logout
      }}
    >

      {children}

    </AuthContext.Provider>

  );

};