import React, { useState, useEffect } from 'react';
import './services/firebase-config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { App as CapApp } from '@capacitor/app';

import LoginPage from './pages/LoginPage';
import SignUp from './pages/SignUp';
import HomePage from './pages/HomePage';
import AlphabetCards from './pages/content/AlphabetCards';
import AlphabetQuiz from './pages/quiz/AlphabetQuiz';
import NumberCards from './pages/content/NumberCards';
import NumberQuiz from './pages/quiz/NumberQuiz';
import ColoursCards from './pages/content/ColoursCards';
import ColoursQuiz from './pages/quiz/ColoursQuiz';
import AnimalCards from './pages/content/AnimalsCards';
import AnimalQuiz from './pages/quiz/AnimalsQuiz';
import GreetingsCards from './pages/content/GreetingCards';
import GreetingsQuiz from './pages/quiz/GreetingsQuiz';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Leaderboard from './pages/Leaderboard';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';  

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Check if user is authenticated + listen for changes to allow for back button functionality
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // user is null if not logged in, use !! to convert to boolean
    });
    const registerBackButton = async () => {
      CapApp.addListener('backButton', () => {
        if (window.location.pathname === '/home' || window.location.pathname === '/') {
          CapApp.exitApp();
        } else {
          window.history.back();
        }
      });
    };
    registerBackButton();
    return () => { 
    unsubscribe(); // unsubscribe from the listener when unmounting
    CapApp.removeAllListeners();
  }
  }, []);

  // user will be redirected to login page if not authenticated
  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />  {/* Redirecting from base route */}
            <Route path="*" element={<Navigate to="/login" />} />  {/* Catch-all route */}

            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUp />} />
            
            <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
              
            {/*learn and quiz routes*/}
              <Route path="/learn-alphabet" element={<PrivateRoute><AlphabetCards /></PrivateRoute>} />
              <Route path="/quiz-alphabet" element={<PrivateRoute><AlphabetQuiz /></PrivateRoute>} />

              <Route path="/learn-numbers" element={<PrivateRoute><NumberCards /></PrivateRoute>} />
              <Route path="/quiz-numbers" element={<PrivateRoute><NumberQuiz /></PrivateRoute>} />

              <Route path="/learn-colours" element={<PrivateRoute><ColoursCards /></PrivateRoute>} />
              <Route path="/quiz-colours" element={<PrivateRoute><ColoursQuiz /></PrivateRoute>} />

              <Route path="/learn-animals" element={<PrivateRoute><AnimalCards /></PrivateRoute>} />
              <Route path="/quiz-animals" element={<PrivateRoute><AnimalQuiz /></PrivateRoute>} />

              <Route path="/learn-greetings" element={<PrivateRoute><GreetingsCards /></PrivateRoute>} />
              <Route path="/quiz-greetings" element={<PrivateRoute><GreetingsQuiz /></PrivateRoute>} />
        </Routes>
    </Router>
  );
}
export default App;