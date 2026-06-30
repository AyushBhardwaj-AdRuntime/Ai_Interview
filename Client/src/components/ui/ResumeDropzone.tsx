import { useDropzone } from "react-dropzone";

function ResumeDropzone() {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer"
    >
      <input {...getInputProps()} />

      <p>Drag & Drop Resume Here</p>
    </div>
  );
}
export  default ResumeDropzone