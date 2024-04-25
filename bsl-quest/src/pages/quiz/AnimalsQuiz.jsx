import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { arrayUnion, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../../services/firebase-config';
import '../../styles/Quiz.css';
import CustomModal from '../../components/CustomModal';
import confetti from 'canvas-confetti';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const AnimalsQuiz = () => {

  const animalsData = [
    {animal: 'Dog', videoLink: '/signs/animals/dog.mp4'},
    {animal: 'Cat', videoLink: '/signs/animals/cat.mp4'},
    {animal: 'Fish', videoLink: '/signs/animals/fish.mp4'},
    {animal: 'Horse', videoLink: '/signs/animals/horse.mp4'},
    {animal: 'Monkey', videoLink: '/signs/animals/monkey.mp4'},
    {animal: 'Cow', videoLink: '/signs/animals/cow.mp4'},
    {animal: 'Sheep', videoLink: '/signs/animals/sheep.mp4'},
    {animal: 'Chicken', videoLink: '/signs/animals/chicken.mp4'},
    {animal: 'Lion', videoLink: '/signs/animals/lion.mp4'},
    {animal: 'Snake', videoLink: '/signs/animals/snake.mp4'}
];

  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(Math.floor(Math.random() * animalsData.length));
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [streak, setStreak] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [correctCounts, setCorrectCounts] = useState({});

  useEffect(() => {
    document.body.classList.add('quiz-background');
    return () => document.body.classList.remove('quiz-background');
}, []);

  const handleModalClose = () => {
      setShowModal(false);
      navigate('/home'); // Navigate back to home
  };

  // these functions are called when the component mounts
  useEffect(() => {
      loadIncorrectAnswers();
      loadCorrectCounts();
  }, []);

  useEffect(() => {
      const newOptions = generateOptions();
      setOptions(newOptions);
      setAnswered(false);
      console.log('answer is', animalsData[currentQuestion].animal)
  }, [currentQuestion]);
  
  // Function to handle option click
  const handleOptionClick = async (option) => {
    if (!answered) {
      setSelectedOption(option);
      const correctLetter = animalsData[currentQuestion].animal;
      if (option === correctLetter) {
        setScore(score + 1);
        setStreak(streak + 1);

        // Only update correct count if the letter was previously incorrect
        if (incorrectAnswers.includes(correctLetter)) {
          const newCounts = { ...correctCounts, [correctLetter]: (correctCounts[correctLetter] || 0) + 1 };
          setCorrectCounts(newCounts);

          // Remove the letter from incorrectAnswers if it has been answered correctly 3 times
          if (newCounts[correctLetter] >= 3) {
              setIncorrectAnswers((prev) => prev.filter((l) => l !== correctLetter));
              // Reset the correct count for the letter after removing it from incorrectAnswers
              const resetCounts = { ...newCounts, [correctLetter]: 0 };
              setCorrectCounts(resetCounts);
              await saveCorrectCounts(resetCounts);
              await removeLetterFromFocus(correctLetter);
          } else {
              // Save updated correct counts to Firestore
              await saveCorrectCounts(newCounts);
            }
          }
        } else {
          setStreak(0);
          if (!incorrectAnswers.includes(correctLetter)) {
            // Add the letter to incorrectAnswers if it's not already there
            setIncorrectAnswers((prev) => [...prev, correctLetter]);
            // Reset the correct count for the letter since it's incorrect again
            const resetCounts = { ...correctCounts, [correctLetter]: 0 };
            setCorrectCounts(resetCounts);
            await saveCorrectCounts(resetCounts);
          }
        }
      setAnswered(true);
    }
  };

  const handleNextClick = () => {
    const totalXP = score * 10; 
    if (!answered) {
      setShowPromptModal(true);
      return; // Exit the function early
    }
    if (questionCount < 9) { // Still within the first 9 questions
      setSelectedOption(null);
      setCurrentQuestion(pickNextQuestion());
      setQuestionCount(prevCount => prevCount + 1); // Use functional update for accuracy
    } 
    else {
      let finalMessage = `Good effort! Keep practicing to improve your score. You earned ${totalXP} XP.`;
      if (score === 10) {
          finalMessage = `Congratulations! You got a perfect score and earned ${totalXP} XP!`;
          triggerSchoolPrideConfetti();
      } else if (score >= 5) {
          triggerConfetti();
          finalMessage = `Great Job! You got ${score}/10 and earned ${totalXP} XP!`;
      }
      setModalMessage(finalMessage);
      setShowModal(true);
      saveQuizScore(score, totalXP).catch(console.error); // Save the score at the end
      adjustFocusForNextQuiz();
    }
  }; 

  const generateOptions = () => {
    let options = [animalsData[currentQuestion].animal];
    while (options.length < 4) {
      const randomIndex = Math.floor(Math.random() * animalsData.length);
      const animal = animalsData[randomIndex].animal;
      if (!options.includes(animal)) {
          options.push(animal);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  };

  const pickNextQuestion = () => {
    // Logic to increase focus on previously incorrect answers
    let nextQuestionIndex = Math.floor(Math.random() * animalsData.length);
    if (incorrectAnswers.length > 0) {
        const focusOnIncorrect = Math.random() < 0.5;
        if (focusOnIncorrect) {
            const incorrectLetter = incorrectAnswers[Math.floor(Math.random() * incorrectAnswers.length)];
            const focusedIndex = animalsData.findIndex(item => item.animal === incorrectLetter);
            if (focusedIndex !== -1) {
                nextQuestionIndex = focusedIndex;
            }
        }
    }
    return nextQuestionIndex;
  };

  const triggerConfetti = () => {
      confetti({
          zIndex: 9999,
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
      });
  };

  const triggerSchoolPrideConfetti = () => {
      const end = Date.now() + (5 * 1000); // 15 seconds
      const colors = ['#bb0000', '#ffffff']; 

      (function frame() {
          confetti({
              particleCount: 2,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: colors,
              zIndex: 9999,
          });
          confetti({
              particleCount: 2,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: colors,
              zIndex: 9999,
          });

          if (Date.now() < end) {
              requestAnimationFrame(frame);
          }
      }());
  };

  const initializeUserScore = async (userId) => {
    const userScoreRef = doc(db, "quizScores", userId);
    try {
        await setDoc(userScoreRef, {
          animalsQuizScores: [] // Initialize as an empty array if not present
        }, { merge: true }); // Use merge to prevent overwriting other fields
    } catch (error) {
        console.error("Error initializing user score:", error);
    }
  };
  
  // Function to save the quiz score to Firestore
  const saveQuizScore = async (score, totalXP) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("No user is authenticated");
      return;
    }
    const userScoreRef = doc(db, "quizScores", user.uid);
    const userXPRef = doc(db, "userXP", user.uid);

    try {
      // check if document exists + has QuizScores field
      const docSnap = await getDoc(userScoreRef);
      if (!docSnap.exists() || !docSnap.data().animalsQuizScores) {
        // initialize document with QuizScores as empty array
        await initializeUserScore(user.uid);
      }

      // update document with server timestamp
      await updateDoc(userScoreRef, {
          lastUpdated: serverTimestamp(),
      });

      // get updated document to get server timestamp
      const updatedDocSnap = await getDoc(userScoreRef);
      const currentTimestamp = updatedDocSnap.data().lastUpdated;
      
      // append the score for quiz to array of scores
      await updateDoc(userScoreRef, {
        animalsQuizScores: arrayUnion({
          score: score,
          total: 10, // each quiz has 10 questions
          timestamp: currentTimestamp
        })
      });
      const userProfileSnap = await getDoc(userXPRef);
      if (userProfileSnap.exists()) {
        const currentXP = userProfileSnap.data().xp || 0;
        await updateDoc(userXPRef, {
          xp: currentXP + totalXP, 
          username: user.displayName || 'Anonymous'
        },{ merge: true });
      } else {
        // If the userProfile doesn't exist, create it with the initial XP
        await setDoc(userXPRef, { xp: totalXP, username: user.displayName || 'Anonymous' });
      }
      console.log(`Score for ${user.uid} saved successfully.`);
    } 
    catch (error) {
      console.error("Error saving score:", error);
    }
  };
  
  // Function to load incorrect answers from Firestore
  const loadIncorrectAnswers = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        console.log("No user is authenticated");
        return;
    }

    const userRef = doc(db, "quizFocus", user.uid);
    try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists() && docSnap.data().incorrectAnswers) {
            const loadedIncorrectAnswers = docSnap.data().incorrectAnswers;
            setIncorrectAnswers(loadedIncorrectAnswers);
            console.log("Incorrect answers loaded successfully.", loadedIncorrectAnswers);
        } else {
            console.log("No incorrect answers found, starting fresh.");
            setIncorrectAnswers([]);   
        }
    } catch (error) {
        console.error("Error loading incorrect answers:", error);
    }
  };

  const loadCorrectCounts = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
          const userRef = doc(db, "quizCorrectCounts", user.uid);
          try {
              const docSnap = await getDoc(userRef);
              if (docSnap.exists()) {
                  setCorrectCounts(docSnap.data().correctCounts || {});
              } else {
                  await setDoc(userRef, { correctCounts: {} });
              }
          } catch (error) {
              console.error("Error loading correct counts:", error);
          }
      }
  };

  // Function to save correct counts to Firestore 
  const saveCorrectCounts = async (newCorrectCounts) => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
          const userRef = doc(db, "quizCorrectCounts", user.uid);
          try {
              await updateDoc(userRef, { correctCounts: newCorrectCounts });
          } catch (error) {
              console.error("Error saving correct counts:", error);
          }
      }
  };

  // Function to remove a letter from the focus list after it has been answered correctly 3 times
  const removeLetterFromFocus = async (animal) => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
          console.error("No user is authenticated");
          return;
      }
      const userRef = doc(db, "quizFocus", user.uid);
      try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists() && docSnap.data().incorrectAnswers) {
              const updatedIncorrectAnswers = docSnap.data().incorrectAnswers.filter(l => l !== animal);
              await updateDoc(userRef, { incorrectAnswers: updatedIncorrectAnswers });
          }
      } catch (error) {
          console.error("Error removing letter from focus:", error);
      }
  };

  // Function to adjust focus for the next quiz based on incorrect answers
  const adjustFocusForNextQuiz = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
          console.error("No user is authenticated");
          return;
      }
      const userRef = doc(db, "quizFocus", user.uid);
      try {
          await setDoc(userRef, { incorrectAnswers }, { merge: true });
          console.log("Incorrect answers saved successfully.");
      } catch (error) {
          console.error("Error saving incorrect answers:", error);
      }
  };

  return (
    <>
    <button className="quiz-back-button" onClick={() => navigate(-1)}>
      <FontAwesomeIcon icon={faArrowLeft} />
    </button>
    <div className="alphabetQuiz-container">            
      <h1>Spot the sign</h1>
      <video src={animalsData[currentQuestion].videoLink} controls playsInline muted autoPlay className='animalvideo' />
      <div>
        {options.map((option, index) => (
          <button 
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`option-button ${answered ? (option === animalsData[currentQuestion].animal
            ? 'correct' : (selectedOption === option ? 'incorrect' : '')) : ''}`}
            disabled={answered}
            >
            {option}
          </button>
        ))}
      </div>
      {questionCount < 10 && <button className="next-button" onClick={handleNextClick}> 
        <FontAwesomeIcon icon={faArrowRight} /></button>
      }
      <div className={`score-container ${streak >= 3 ? 'streak' : ''}`}>
        <div className="score">Score: {score}</div>
      </div>
    </div>
    
    <CustomModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        message="Oops! Let's pick an answer before we jump to the next question. 😊"
    />

    {/* End-of-Quiz Modal */}
    <CustomModal
        isOpen={showModal}
        onClose={handleModalClose}
        message={modalMessage}
    />
    </>
  );
};
export default AnimalsQuiz;