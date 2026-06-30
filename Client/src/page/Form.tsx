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


const Form = () => {
  const [linkdin, setLinkdin] = useState("")
  const [github, setGithub] = useState("")
  async function handleSubmit() {
const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/;

const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/;

    if (!github || !linkdin) {
      return toast("Provide both Linkdin & Github URLS")
    }
    if (!github.match(githubRegex )) {
      return  toast("gitHub link is not valid")
    }
    if (!linkdin.match(linkedinRegex)) {
      return  toast("linkdin link is not valid ")
    }

    await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, {
      linkdin,
      github
    })
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
          <ResumeDropzone />
          <Button className="w-full" onClick={handleSubmit}>
            Start Interview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Form;