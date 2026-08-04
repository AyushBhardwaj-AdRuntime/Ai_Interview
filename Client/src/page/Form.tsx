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
  const [linkdin, setLinkdin] = useState("");
  const [github, setGithub] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigate();

  async function handleSubmit() {
    const formData = new FormData();
    try {
      setLoading(true);

      const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/;
      const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/;

      if (!resume) {
        toast.error("Please upload a resume to continue.");
        return;
      }
      if (github && !githubRegex.test(github)) {
        toast.error("GitHub link is not valid");
        return;
      }
      if (linkdin && !linkedinRegex.test(linkdin)) {
        toast.error("LinkedIn link is not valid");
        return;
      }
      if (resume) {
        formData.append("resume", resume, resume.name);
      }

      formData.append("linkedin", linkdin);
      formData.append("github", github);

      const response = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, formData);
      toast.success("Profile submitted successfully");
      navigation(`/interview/${response.data.id}`);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || "Submission failed. Please try again."
        : "Submission failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-sm border-slate-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
            Interview Setup
          </CardTitle>
          <CardDescription className="text-slate-500">
            Provide your details below to generate personalized interview questions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">LinkedIn Profile (Optional)</label>
              <Input 
                placeholder="https://linkedin.com/in/username" 
                value={linkdin}
                onChange={e => setLinkdin(e.target.value)} 
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">GitHub Profile (Optional)</label>
              <Input 
                placeholder="https://github.com/username" 
                value={github}
                onChange={e => setGithub(e.target.value)} 
                className="bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Resume Upload</label>
            <ResumeDropzone setResume={setResume} resume={resume} />
          </div>

          <Button className="w-full mt-4" disabled={loading} onClick={handleSubmit}>
            {loading ? "Preparing Interview..." : "Start Interview"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Form;