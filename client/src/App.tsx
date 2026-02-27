import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Game from "./pages/Game";
import Host from "./pages/Host";
import JoinPrivate from "./pages/JoinPrivate";
import JoinPublic from "./pages/JoinPublic";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/host" element={<Host />} />
        <Route path="/join-public" element={<JoinPublic />} />
        <Route path="/join-private" element={<JoinPrivate />} />
        //Delete the line below and uncomment the ProtectedRoute version
        <Route path = "/game" element={<Game />} />
        {/* <Route
          path="/game"
          element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          }
        /> */}

      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
