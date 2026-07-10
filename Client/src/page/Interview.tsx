import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { BACKEND_URL } from "@/lib/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import MediaHandler from "@/Services/mediaHandler";


const Interview = () => {
  const { id } = useParams();

  const [interview, setInterview] = useState(null);
  const mediaRef = useRef(new MediaHandler());
  const socketRef = useRef()
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
    return () => {
      mediaRef.current.stopAudio();
      mediaRef.current.stopAudioPlayback();

    };
  }, [id]);


     function connectSocket() {
    return new Promise((resolve, reject) => {

        socketRef.current = new WebSocket("ws://localhost:8080");

        receiveAudioData();

        socketRef.current.onopen = () => {
            console.log("Connected");
            resolve();
        };

        socketRef.current.onclose = () => {
            console.log("Socket Closed");
        };

        socketRef.current.onerror = (err) => {
            reject(err);
        };
    });
}
                function arrayBufferToBase64(buffer) {
              const bytes = new Uint8Array(buffer);

              let binary = "";

              for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
              }

              return btoa(binary);
            }
              async  function sendAudioData() {
                await mediaRef.current.startAudio((pcmBuffer) => {
              
                  const base64 = arrayBufferToBase64(pcmBuffer);
                    
                socketRef.current.send(JSON.stringify({
                  type: "audio",
                  data: base64
                }))
              })}
             function receiveAudioData() {
                socketRef.current.onmessage = (event) => {
                const message = JSON.parse(event.data)
                const content = message.serverContent;
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
                }
              }


    const startInterview = async () => {
      try {
        
       await  connectSocket()
       await sendAudioData()

 } catch (err) {  
      console.error(err);
    }
  };
  const stopInterview = async () => {
    try {
      // Stop microphone
      mediaRef.current.stopAudio();
      mediaRef.current.stopAudioPlayback();
socketRef.current?.close();
socketRef.current = null;
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



                </p>

              </div>

              <div>


              </div>


            </Card>

          </div>

        </div>
      </div>
    </>
  );
};


export default Interview

// Assuming 'chunk' is a Buffer of raw PCM audio


