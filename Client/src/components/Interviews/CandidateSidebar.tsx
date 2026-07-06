import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Candidate = {
  name: string;
  email: string;
  skill: string;
};

type CandidateSidebarProps = {
  candidate: Candidate;
  permissionGranted: boolean;
  setPermissionGranted: React.Dispatch<React.SetStateAction<boolean>>;
  interviewStarted: boolean;
  setInterviewStarted: React.Dispatch<React.SetStateAction<boolean>>;
};

const CandidateSidebar = ({
  candidate,
  permissionGranted,
  setPermissionGranted,
  interviewStarted,
  setInterviewStarted,
}: CandidateSidebarProps) => {

  const requestPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setPermissionGranted(true);

    } catch (error) {
      console.log(error);
      alert("Camera/Microphone permission denied.");
    }
  };

  return (
    <aside className="col-span-3 border-r border-zinc-800 p-5">

      <Card className="border-zinc-800">

        <CardHeader>
          <CardTitle>Candidate</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">

          <div>
            <p className="text-sm text-zinc-400">Name</p>
            <p>{candidate.name}</p>
          </div>

          <div>
            <p className="text-sm text-zinc-400">Email</p>
            <p>{candidate.email}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-zinc-400">Skill</p>
            <p>{candidate.skill}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-zinc-400">
              Camera & Microphone
            </p>

            <p
              className={
                permissionGranted
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {permissionGranted
                ? "Permission Granted ✅"
                : "Permission Required ❌"}
            </p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-zinc-400">
              Duration
            </p>

            <p>20 Minutes</p>
          </div>

          <div className="space-y-3">

            <button
              onClick={requestPermissions}
              disabled={permissionGranted}
              className="w-full rounded bg-blue-600 py-2 text-white disabled:bg-zinc-500"
            >
              {permissionGranted
                ? "Permission Granted"
                : "Allow Camera & Mic"}
            </button>

            <button
              onClick={() => setInterviewStarted(true)}
              disabled={!permissionGranted}
              className="w-full rounded bg-green-600 py-2 text-white disabled:bg-zinc-500"
            >
              {interviewStarted
                ? "Interview Started"
                : "Start Interview"}
            </button>

          </div>

        </CardContent>

      </Card>

    </aside>
  );
};

export default CandidateSidebar;