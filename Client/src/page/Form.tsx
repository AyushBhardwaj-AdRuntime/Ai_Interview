import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import ResumeDropzone from "@/components/ui/ResumeDropzone";

const Form = () => {
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
          <Input placeholder="LinkedIn Profile URL" />

          <Input placeholder="GitHub Profile URL" />
            <h6 className="scroll-m-20 text-center text-3xl font-extrabold tracking-tight text-balance">
       Optional
    </h6>
           <ResumeDropzone/>
          <Button className="w-full">
            Start Interview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Form;