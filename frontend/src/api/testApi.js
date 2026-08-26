import api from "./axios";

api.get("/")
.then((response)=>{
    console.log(response.data);
})
.catch((error)=>{
    console.log(error);
});