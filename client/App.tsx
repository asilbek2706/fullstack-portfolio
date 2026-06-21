import Dashboard from "@admin/pages/Dashboard"
import Home from "@src/pages/Home"
import {  Route, Routes } from "react-router-dom"

const App = () => {
  return (
    <div>
      <Routes>
        {/* UI */}
        <Route path="/" element={<Home />} />
          
        {/* Admin */}
        <Route path="/admin" element={<Dashboard />} />
      </Routes>
    </div>
  )
}

export default App