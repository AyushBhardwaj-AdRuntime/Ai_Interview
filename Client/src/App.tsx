

import Form from "@/page/Form"
import  Interview from "@/page/Interview"
import Result from "@/page/Result"
import { BrowserRouter , Routes  , Route}  from "react-router-dom"
import { Toaster } from "sonner"
const App = () => {
  return (
    <> 
       <BrowserRouter> 
        <Routes>
           <Route        path = "/"  element = {<Form/>}           />
       <Route path="/interview/:id" element={<Interview />} />          
           <Route        path = "/result/:id"  element = {<Result/>}           />
                     
        </Routes>
                    <Toaster position="top-right" />
       </BrowserRouter>

    </>
  )
}
  
export default App
