import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import ResumeDropzone from "@/components/ui/ResumeDropzone";
import { BACKEND_URL } from "@/lib/config";
import { useNavigate } from "react-router-dom";


const Form = () => {
  const [linkdin, setLinkdin] = useState("")
  const [github, setGithub] = useState("")
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(false);
   const navigation = useNavigate()
  async function handleSubmit() {
    const formData = new FormData();
    try {
      setLoading(true)

      const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/;

      const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/;

      if (!resume && !github && !linkdin) {
        return toast("Please provide at least one source (Resume, GitHub, or LinkedIn).");
      }
      if (github && !githubRegex.test(github)) {
        return toast("GitHub link is not valid");
      }

      if (linkdin && !linkedinRegex.test(linkdin)) {
        return toast("LinkedIn link is not valid");
      }
      if (resume) {
        formData.append("resume", resume, resume.name);
      }


      // formData.append("linkedin", linkdin);
      // formData.append("github", github);

       const response =   await axios.post(`${BACKEND_URL}/api/v1/pre-interview`,
        formData
      )
      toast.success("Uploaded successfully");
      navigation(`/interview/${response.data.id}`);
    }
    catch (err) {

      toast.error("Upload failed");
    }
    finally {
      setLoading(false)
    }

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle className="text-3xl text-center">
            <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
              AI Interview
            </h1>
          </CardTitle>

          <CardDescription className="text-center">
            Generate personalized interview questions from your GitHub and
            LinkedIn profile.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input placeholder="LinkedIn Profile URL" onChange={e => setLinkdin(e.target.value)} />

          <Input placeholder="GitHub Profile URL" onChange={e => setGithub(e.target.value)} />
          <h6 className="scroll-m-20 text-center text-3xl font-extrabold tracking-tight text-balance">
            Optional
          </h6>
          <ResumeDropzone setResume={setResume} resume={resume} />
          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? "Uploading..." : "Start Interview"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Form;