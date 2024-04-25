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

const AlphabetQuiz = () => {
    const alphabetData = [
        { letter: 'A', videoLink: '/signs/letters/letter_a.mp4' },
        { letter: 'B', videoLink: '/signs/letters/letter_b.mp4' },
        { letter: 'C', videoLink: '/signs/letters/letter_c.mp4' },
        { letter: 'D', videoLink: '/signs/letters/letter_d.mp4' },
        { letter: 'E', videoLink: '/signs/letters/letter_e.mp4' },
        { letter: 'F', videoLink: '/signs/letters/letter_f.mp4' },
        { letter: 'G', videoLink: '/signs/letters/letter_g.mp4' },
        { letter: 'H', videoLink: '/signs/letters/letter_h.mp4' },
        { letter: 'I', videoLink: '/signs/letters/letter_i.mp4' },
        { letter: 'J', videoLink: '/signs/letters/letter_j.mp4' },
        { letter: 'K', videoLink: '/signs/letters/letter_k.mp4' },
        { letter: 'L', videoLink: '/signs/letters/letter_l.mp4' },
        { letter: 'M', videoLink: '/signs/letters/letter_m.mp4' },
        { letter: 'N', videoLink: '/signs/letters/letter_n.mp4' },
        { letter: 'O', videoLink: '/signs/letters/letter_o.mp4' },
        { letter: 'P', videoLink: '/signs/letters/letter_p.mp4' },
        { letter: 'Q', videoLink: '/signs/letters/letter_q.mp4' },
        { letter: 'R', videoLink: '/signs/letters/letter_r.mp4' },
        { letter: 'S', videoLink: '/signs/letters/letter_s.mp4' },
        { letter: 'T', videoLink: '/signs/letters/letter_t.mp4' },
        { letter: 'U', videoLink: '/signs/letters/letter_u.mp4' },
        { letter: 'V', videoLink: '/signs/letters/letter_v.mp4' },
        { letter: 'W', videoLink: '/signs/letters/letter_w.mp4' },
        { letter: 'X', videoLink: '/signs/letters/letter_x.mp4' },
        { letter: 'Y', videoLink: '/signs/letters/letter_y.mp4' },
        { letter: 'Z', videoLink: '/signs/letters/letter_z.mp4' }
    ];

    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(Math.floor(Math.random() * alphabetData.length));
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

    // Load incorrect answers and correct counts on initial render
    useEffect(() => {
        loadIncorrectAnswers();
        loadCorrectCounts();
    }, []);

    // Update options and reset answered state when the current question changes
    useEffect(() => {
        const newOptions = generateOptions();
        setOptions(newOptions);
        setAnswered(false);
    }, [currentQuestion]);

    // Function to handle option click
    const handleOptionClick = async (option) => {
        if (!answered) {
            setSelectedOption(option);
            const correctLetter = alphabetData[currentQuestion].letter;
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

    // Function to handle the next button click
    const handleNextClick = () => {
        if (!answered) {
            setShowPromptModal(true);
            return; // Exit the function early
        }
        const totalXP = score * 10;
        if (questionCount < 9) { // Still within the first 9 questions
            setSelectedOption(null);
            // setCurrentQuestion(Math.floor(Math.random() * alphabetData.length));
            setCurrentQuestion(pickNextQuestion());
            setQuestionCount(prevCount => prevCount + 1); // Use functional update for accuracy
        } else {
            // Now handling the 10th question
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
    
    // Function to generate options for the current question
    const generateOptions = () => {
        let options = [alphabetData[currentQuestion].letter];
        while (options.length < 4) {
            const randomIndex = Math.floor(Math.random() * alphabetData.length);
            const letter = alphabetData[randomIndex].letter;
            if (!options.includes(letter)) {
                options.push(letter);
            }
        }
        return options.sort(() => Math.random() - 0.5);
    };

    // Function to pick the next question
    const pickNextQuestion = () => {
        // Logic to increase focus on previously incorrect answers
        let nextQuestionIndex = Math.floor(Math.random() * alphabetData.length);
        if (incorrectAnswers.length > 0) {
            const focusOnIncorrect = Math.random() < 0.5;
            if (focusOnIncorrect) {
                const incorrectLetter = incorrectAnswers[Math.floor(Math.random() * incorrectAnswers.length)];
                const focusedIndex = alphabetData.findIndex(item => item.letter === incorrectLetter);
                if (focusedIndex !== -1) {
                    nextQuestionIndex = focusedIndex;
                }
            }
        }
        return nextQuestionIndex;
    };

    // Function to initialize user score in Firestore
    const triggerConfetti = () => {
        confetti({
            zIndex: 9999,
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    const triggerSchoolPrideConfetti = () => {
        const end = Date.now() + (5 * 1000); 
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

    // Function to initialize user score in Firestore
    const initializeUserScore = async (userId) => {
        const userScoreRef = doc(db, "quizScores", userId);
        try {
            await setDoc(userScoreRef, {
                alphabetQuizScores: [] // Initialize as an empty array if not present
            }, { merge: true }); // Use merge to prevent overwriting other fields
        } catch (error) {
            console.error("Error initializing user score:", error);
        }
    };
    
    // Function to save quiz score to Firestore
    const saveQuizScore = async (score, totalXP) => {
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (!user) {
            console.error("No user is authenticated");
            return;
        }
        const userXPRef = doc(db, "userXP", user.uid);
        const userScoreRef = doc(db, "quizScores", user.uid);
        console.log(user.displayName);
        try {
            // check if document exists + has alphabetQuizScores field
            const docSnap = await getDoc(userScoreRef);
            if (!docSnap.exists() || !docSnap.data().alphabetQuizScores) {
                // initialize document with alphabetQuizScores as empty array
                await initializeUserScore(user.uid);
            }
            // update document with server timestamp
            await updateDoc(userScoreRef, {
                lastUpdated: serverTimestamp(),
            });
            // get updated document to get server timestamp
            const updatedDocSnap = await getDoc(userScoreRef);
            const currentTimestamp = updatedDocSnap.data().lastUpdated;
            // append the score for alphabet quiz to array of scores
            await updateDoc(userScoreRef, {
                alphabetQuizScores: arrayUnion({
                    score: score,
                    total: 10, // each quiz has 10 questions
                    timestamp: currentTimestamp
                })
            });  
            // Update user's XP in their profile
            const userProfileSnap = await getDoc(userXPRef);
            if (userProfileSnap.exists()) {
                const currentXP = userProfileSnap.data().xp || 0;
                await updateDoc(userXPRef, {
                    xp: currentXP + totalXP, // Update the XP by adding the newly earned XP
                    username: user.displayName || 'Anonymous',
                },{ merge: true });
            } else {
                // If the userProfile doesn't exist, create it with the initial XP
                await setDoc(userXPRef, { xp: totalXP, username: user.displayName || 'Anonymous'});
            }

            console.log(`Score and XP for ${user.uid} saved successfully.`);
        } catch (error) {
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

    // Function to load correct counts from Firestore
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

    // Function to remove letter from focus after it has been answered correctly 3 times
    const removeLetterFromFocus = async (letter) => {
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
                const updatedIncorrectAnswers = docSnap.data().incorrectAnswers.filter(l => l !== letter);
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
            <video src={alphabetData[currentQuestion].videoLink} controls playsInline muted autoPlay />
            <div>
                {options.map((option, index) => (
                    <button 
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className={`option-button ${answered
                                ? (option === alphabetData[currentQuestion].letter
                                    ? 'correct'
                                    : (selectedOption === option ? 'incorrect' : ''))
                                : ''}`}
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

export default AlphabetQuiz;