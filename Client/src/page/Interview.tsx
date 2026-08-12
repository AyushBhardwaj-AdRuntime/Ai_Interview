import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import { BACKEND_URL, WS_URL } from "@/lib/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import MediaHandler from "@/Services/mediaHandler";


const Interview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [error, setError] = useState(null);
  const mediaRef = useRef(new MediaHandler());
  const socketRef = useRef(null)

  useEffect(() => {
    async function fetchInterview() {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/v1/interview/${id}`
        );

        setInterview(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load interview. Please try again or check the URL.");
      }
    }

    fetchInterview();
    return () => {
      mediaRef.current.stopAudio();
      mediaRef.current.stopAudioPlayback();
    };
  }, [id]);


  function connectSocket() {
    return new Promise<void>((resolve, reject) => {
      socketRef.current = new WebSocket(`${WS_URL}?id=${id}`);

      receiveAudioData();

      socketRef.current.onopen = () => {

        resolve();
      };

      socketRef.current.onclose = () => {

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

  async function sendAudioData() {
    await mediaRef.current.startAudio((pcmBuffer) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        const base64 = arrayBufferToBase64(pcmBuffer);
        socketRef.current.send(JSON.stringify({
          type: "audio",
          data: base64
        }))
      }
    });
  }

  function receiveAudioData() {
    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data)
      const content = message.serverContent;
      const parts = content?.modelTurn?.parts || [];

      for (const part of parts) {
        if (part?.inlineData) {
          const base64 = part.inlineData.data;
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);

          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          mediaRef.current.playAudio(bytes.buffer);
        }
      }
    }
  }


  const startInterview = async () => {
    try {
      await connectSocket()
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
    } catch (err) {
      console.error(err);
    }
  };

  const finishInterview = () => {
    stopInterview();
    navigate(`/result/${id}`);
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium">Loading interview workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {interview?.candidateProfile?.name || "Candidate Interview"}
            </h1>
            <p className="mt-1 text-sm text-slate-500 font-medium">
              {interview?.candidateProfile?.email || "Ready for interview session"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={startInterview}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Session
            </Button>
            <Button
              onClick={stopInterview}
              variant="outline"
            >
              Pause
            </Button>
            <Button
              onClick={finishInterview}
              variant="secondary"
            >
              Finish & View Results
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-8">

          {/* Candidate */}
          <Card className="col-span-5 h-[550px] bg-white border-slate-200 shadow-sm p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              Candidate View
            </h2>
            <div className="flex h-[420px] items-center justify-center rounded-lg border border-slate-100 bg-slate-50">
              <p className="text-slate-400 text-sm">Camera feed (optional)</p>
            </div>
          </Card>

          {/* HR Interviewer */}
          <Card className="col-span-7 h-[550px] bg-white border-slate-200 shadow-sm p-6 flex flex-col">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              Interviewer
            </h2>
            <div className="flex-1 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                </div>
                <p className="text-slate-500 font-medium">Voice channel open</p>
                <p className="text-slate-400 text-sm mt-1">Interviewer will speak automatically</p>
              </div>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default Interview;
