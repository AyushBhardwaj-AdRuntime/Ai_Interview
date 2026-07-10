import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { BACKEND_URL } from "@/lib/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import MediaHandler from "@/Services/MediaHandler"
import {GeminiLive}  from "@/Services/GeminiLive"
 

const Interview = () => {
  const { id } = useParams();
 const interviewState = useRef({
   currentQuestion : "",
    currentAnswer : "",
      questions : [],

 })
  const [interview, setInterview] = useState(null);
  const [transcript, setTranscript] = useState("");
    
  const mediaRef = useRef(new MediaHandler());
  const geminiRef = useRef(new GeminiLive());

  useEffect(() => {
    async function fetchInterview() {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/v1/interview/${id}`
        );

        setInterview(response.data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchInterview();

    geminiRef.current.onOpen = () => {
      console.log(" Gemini Connected");
    };

    geminiRef.current.onClose = () => {
      console.log(" Gemini Disconnected");
    };

    geminiRef.current.onMessage = (message) => {
      console.log(message);
       const content = message.serverContent
        console.log(content)
  

   
        if (content?.inputTranscription) {
               console.log("User:", content.inputTranscription.text);
            interviewState.current.currentAnswer +=  " "  + content.inputTranscription.text
          
}
      
      if (content.outputTranscription?.text) {
         console.log( JSON.stringify(content.outputTranscription))
      interviewState.current.currentQuestion = content.outputTranscription.text
        }

      // Audio from Gemini
        const part =
        content.modelTurn?.parts?.[0];

       if (part?.inlineData) {
        const base64 = part.inlineData.data;

        const binary = atob(base64);

        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
console.log("Playing audio");
        mediaRef.current.playAudio(bytes.buffer);
      }
    };

    return ()=>{
      mediaRef.current.stopAudio();
       mediaRef.current.stopAudioPlayback(); 
       geminiRef.current.disconnect();
    };
  }, [id]);
    
  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);

    let binary = "";

    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
  }

  const startInterview = async () => {
    try {

      // Connect to Gemini
      await geminiRef.current.connect();
   geminiRef.current.sendText(`
You are an experienced interviewer  a HR of a Company.

Candidate Summary:
${interview?.candidateProfile?.interviewSummary}
// Candidate Profile: 
// ${JSON.stringify(interview?.candidateProfile, null, 2)}
Conduct a professional interview.

Rules:
- voice will be of male
- Introduce yourself.
- Explain the interview format.
- Ask exactly 6 questions.
- Ask only one question at a time.
- Ask follow-up questions when necessary.
- Focus on the candidate's skills, experience and projects.
- Do not reveal answers.
- End the interview after the sixth question.
`);
      console.log("Gemini Session Started");

      
      await mediaRef.current.startAudio((pcmBuffer) => {

        const base64 = arrayBufferToBase64(pcmBuffer);

        geminiRef.current.sendAudio(base64);

      });

      console.log("Microphone Streaming...");

    } catch (err) {
      console.error(err);
    }
  };
  const   stopInterview = async () => {
    try {
      // Stop microphone
      mediaRef.current.stopAudio();
      mediaRef.current.stopAudioPlayback();
      geminiRef.current.disconnect();
    }
      catch (err) {
      console.error(err);
    }
  }

  if (!interview) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }
    return (
       <>
       <div className="min-h-screen bg-zinc-950 p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-white">
              {interview?.candidateProfile?.name}
              
            </h1>

            <p className="mt-2 text-zinc-400">
              {interview?.candidateProfile?.email}
            </p>
          </div>
   <div className="">
<Button 
            onClick={startInterview}
            variant="destructive"
          >
            Start Interview
          </Button>
   </div>
          
           
          <Button
            onClick={stopInterview}
            
          >   
            Stop Interview
          </Button>
           
 
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-8">

          {/* Candidate */}
          <Card className="col-span-5 h-[550px] bg-zinc-900 border-zinc-800 p-6">

            <h2 className="mb-4 text-xl font-semibold text-white">
              {interview?.candidateProfile?.name}
            </h2>

            <div className="flex h-[420px] items-center justify-center rounded-lg border border-zinc-700">

             

            </div>

          </Card>

          {/* AI Interviewer */}
          <Card className="col-span-7 h-[550px] bg-zinc-900 border-zinc-800 p-6">

            <h2 className="mb-4 text-xl font-semibold text-white">
              HR
            </h2>

            <div className="mb-5 h-[320px] overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-950 p-4">

              <p className="whitespace-pre-wrap text-zinc-200">

                {transcript }

              </p>

            </div>
 
  <div> 
      
       {transcript}
  </div>
          

          </Card>

        </div>

      </div>
    </div>
 </>
     );
};


export default Interview