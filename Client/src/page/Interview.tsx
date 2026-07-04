import { BACKEND_URL } from "@/lib/config"
import axios from "axios"
import { useState , useEffect } from "react"
import { useParams } from "react-router-dom"

const Interview = () => {
     console.log("Interview page rendered");
     const {id} = useParams()
      const [interview , setInterview] =   useState()
     useEffect(() => {
    async function fetchInterview() {
        try {
            const response = await axios.get(
                `${BACKEND_URL}/interview/${id}`
            );

            setInterview(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    fetchInterview();
}, [id]);
      
   
  return (
    <div>
        {interview} 
        ayush
    </div>
  )
}

export default Interview
