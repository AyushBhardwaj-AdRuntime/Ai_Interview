import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const InterviewPanel = ({
  candidate,
  permissionGranted,
  interviewStarted,
}) => {
  return (
    <main className="col-span-9 p-6">

      {/* Before permission */}
      {!permissionGranted && (
        <Card className="h-full flex items-center justify-center">
          <CardContent className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">
              Camera & Microphone Required
            </h2>

            <p className="text-zinc-500">
              Please allow camera and microphone access from the left panel.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Permission granted but interview not started */}
      {permissionGranted && !interviewStarted && (
        <Card className="h-full flex items-center justify-center">
          <CardContent className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">
              Ready to Begin
            </h2>

            <p className="text-zinc-500">
              Click <strong>Start Interview</strong> from the left panel.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Interview Started */}
      {permissionGranted && interviewStarted && (
        <div className="space-y-6">

          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle>
                AI Interview
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Video Section */}
          <div className="grid grid-cols-2 gap-6">

            {/* Candidate */}
            <Card className="h-[350px]">
              <CardHeader>
                <CardTitle>
                  {candidate.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex h-[250px] items-center justify-center bg-zinc-900 rounded-md">
                <p className="text-zinc-400">
                  Candidate Camera
                </p>

                {/* Later */}
                {/* <video autoPlay playsInline /> */}
              </CardContent>
            </Card>

            {/* AI Interviewer */}
            <Card className="h-[350px]">
              <CardHeader>
                <CardTitle>
                  AI Interviewer
                </CardTitle>
              </CardHeader>

              <CardContent className="flex h-[250px] items-center justify-center bg-zinc-900 rounded-md">
                <p className="text-zinc-400">
                  AI Avatar
                </p>

                {/* Later */}
                {/* AI Video / Avatar */}
              </CardContent>
            </Card>

          </div>

          {/* Current Question */}
          <Card>
            <CardHeader>
              <CardTitle>
                Current Question
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-lg">
                Waiting for AI to ask the first question...
              </p>
            </CardContent>
          </Card>

          {/* Transcript */}
          <Card>
            <CardHeader>
              <CardTitle>
                Live Transcript
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-zinc-500">
                Transcript will appear here...
              </p>
            </CardContent>
          </Card>

        </div>
      )}

    </main>
  );
};

export default InterviewPanel;