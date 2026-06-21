import AdminRoot from "@admin/pages/AdminRoot"
import Home from "@src/pages/Home"
import {  Route, Routes } from "react-router-dom"

const App = () => {
  return (
    <div>
      <Routes>
        {/* UI */}
        <Route path="/" element={<Home />} />
          
        {/* Admin */}
        <Route path="/admin" element={<AdminRoot />} />
      </Routes>
    </div>
  )
}

export default App