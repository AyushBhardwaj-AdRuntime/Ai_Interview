import { BACKEND_URL } from "@/lib/config";
import axios from "axios";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

function ResumeDropzone({resume , setResume}) {
  
  const onDrop = async (acceptedFiles) => {

    setResume(acceptedFiles[0])
    

  };


  const { getRootProps, getInputProps } = useDropzone({

    onDrop,

    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    }

  });

  return (

    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer"
    >

      <input {...getInputProps()} />

  
        <p> 
           {
              resume
        ? resume.name
        : "Drag Resume Here"
           }
        </p>
       

    </div>

  );

}

export default ResumeDropzone;