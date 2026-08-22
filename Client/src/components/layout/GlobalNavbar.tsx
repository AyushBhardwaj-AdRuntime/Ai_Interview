import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function GlobalNavbar() {
  const location = useLocation();
  const isInterview = location.pathname.startsWith("/interview/");
  
  if (isInterview) return null;
  return <Navbar />;
}
