import React, { useState, useEffect, createRef } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, getFirestore, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import confetti from 'canvas-confetti';
import '../../styles/AlphabetCards.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const FlashCard = ({ number, videoLink, index, isActive, videoRef, id }) => {
    return (
        <label className="alphabetCard" htmlFor={`alphabet-item-${index + 1}`}>
            <video ref={videoRef} className='alphabetCard__video' controls playsInline muted autoPlay loop>
                {isActive && <source src={videoLink} type="video/mp4" />} 
                {/* Implements lazy loading + improves performance */}
            </video>
        </label>
    );
};

const createVideoRefsArray = (length) => {
    return Array.from({ length }).map(() => createRef()); // An array of refs to access video elements
};

const NumbersCards = () => {
    const numbersData = [
        { number: '1', videoLink: '/signs/numbers/1.mp4' },
        { number: '2', videoLink: '/signs/numbers/two.mp4' },
        { number: '3', videoLink: '/signs/numbers/three.mp4'},
        { number: '4', videoLink: '/signs/numbers/four.mp4' },
        { number: '5', videoLink: '/signs/numbers/five.mp4' },
        { number: '6', videoLink: '/signs/numbers/6.mp4' },
        { number: '7', videoLink: '/signs/numbers/7.mp4' },
        { number: '8', videoLink: '/signs/numbers/8.mp4' },
        { number: '9', videoLink: '/signs/numbers/9.mp4' },
        { number: '10', videoLink: '/signs/numbers/10.mp4' },
        { number: '11', videoLink: '/signs/numbers/11.mp4' },
        { number: '12', videoLink: '/signs/numbers/12.mp4' },
        { number: '13', videoLink: '/signs/numbers/13.mp4' },
        { number: '14', videoLink: '/signs/numbers/14.mp4' },
        { number: '15', videoLink: '/signs/numbers/15.mp4' },
        { number: '16', videoLink: '/signs/numbers/16.mp4' },
        { number: '17', videoLink: '/signs/numbers/17.mp4' },
        { number: '18', videoLink: '/signs/numbers/18.mp4' },
        { number: '19', videoLink: '/signs/numbers/19.mp4' },
        { number: '20', videoLink: '/signs/numbers/20.mp4' },
    ];

    const [activeCard, setActiveCard] = useState(1);
    const [numberProgress, setnumberProgress] = useState(1);
    const videoRefs = createVideoRefsArray(numbersData.length);
    const [showBadgeAnimation, setShowBadgeAnimation] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();
    
    // Add background animation
    useEffect(() => {
        document.body.classList.add('numberCard-background'); 
        return () => {
            document.body.classList.remove('numberCard-background'); 
        };
    }, []);
    
    // Update user learning progress
    const updateUserLearningProgress = async () => {
        if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            const userProgressRef = doc(db, "learningProgress", userId);
    
            try {
                const docSnap = await getDoc(userProgressRef);
    
                if (!docSnap.exists()) {
                    // Document does not exist, so create it
                    await setDoc(userProgressRef, {
                        numberLearned: true,
                        badges: ["Numbers Ninja Badge"],
                    });
                    console.log("User learning progress created and updated successfully.");
                } else {
                    // Document exists, update it
                    await updateDoc(userProgressRef, {
                        numberLearned: true,
                        // Use arrayUnion to only add the badge if it doesn't already exist
                        badges: arrayUnion("Numbers Ninja Badge"),
                    });
                    console.log("User learning progress updated successfully.");
                }
            } catch (error) {
                console.error("Error updating learning progress:", error);
            }
        }
    };
    
    // Trigger confetti animation
    const triggerConfetti = () => {
        confetti({
            zIndex: 9999,
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    // Handle badge animation
    const handleCompletion = async () => {
        const userId = auth.currentUser.uid;
        const userProgressRef = doc(db, "learningProgress", userId);
        const docSnap = await getDoc(userProgressRef);
        const hasCompletedCategory = docSnap.exists() && docSnap.data().numberLearned;
        if (!hasCompletedCategory) {
            setShowBadgeAnimation(true);
            await updateUserLearningProgress();
            triggerConfetti();
        
          // Hide animation after a few seconds (optional)
            setTimeout(() => {
                setShowBadgeAnimation(false);
            }, 5000);
        }
    };
    
    // Swipe handlers
    const handlers = useSwipeable({
        onSwipedLeft: () => setActiveCard((prev) => Math.min(prev + 1, numbersData.length)),
        onSwipedRight: () => setActiveCard((prev) => Math.max(prev - 1, 1)),
    });

    // These useEffects will handle the video playback and user progress
    useEffect(() => {
        const activeVideoRef = videoRefs[activeCard - 1];
        if (activeVideoRef.current) {
            activeVideoRef.current.play();
        }
    }, [activeCard, videoRefs]);

    // ensure only the active card is playing + pause the rest
    useEffect(() => {
        videoRefs.forEach((videoRef, index) => {
            if (videoRef.current) {
                if (activeCard === index + 1) {
                    videoRef.current.oncanplay = function() {
                        videoRef.current.play();
                    };
                } else {
                    videoRef.current.oncanplay = function() {
                        videoRef.current.pause();
                    };
                }
            }
        });
    }, [activeCard, videoRefs]);

    useEffect(() => {
        setnumberProgress((prevProgress) => Math.max(prevProgress, activeCard));
    }, [activeCard]);

    useEffect(() => {
        const saveProgress = async () => {
            if (auth.currentUser && numberProgress!== 1) {
                const userId = auth.currentUser.uid;
                const userProgressRef = doc(db, "learningProgress", userId);
    
                try {
                    await setDoc(userProgressRef, { numberProgress}, { merge: true });
                    console.log("User progress saved successfully.");
                } catch (error) {
                    console.error("Error saving user progress:", error);
                }
            }
        };
    
        saveProgress();
    }, [auth.currentUser, db, numberProgress]);

    // Load user progress
    const loadProgress = async () => {
        if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            const userProgressRef = doc(db, "learningProgress", userId);
    
            try {
                const docSnap = await getDoc(userProgressRef);
                if (docSnap.exists()) {
                    const savedProgress = docSnap.data().numberProgress;
                    setnumberProgress(savedProgress || 1);
                    setActiveCard(savedProgress || 1);
                }
            } catch (error) {
                console.error("Error loading user progress:", error);
            }
        }
    };

    // Load user progress on page load
    useEffect(() => {
        loadProgress();
    }, [auth.currentUser, db]);

    // Check if the user has completed the category
    useEffect(() => {
        if (numberProgress=== numbersData.length) {
            const timer = setTimeout(() => {
                handleCompletion();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [numbersData.length, numberProgress]);
    return (
    <>
    {/* background animation from https://codepen.io/alvarotrigo/pen/GRvYNax, altered */}
    <div className="area"> 
        <ul className="letters">
            {Array(25).fill(numbersData[activeCard - 1].number).map((number, idx) => (
                <li key={idx}>{number}</li>
            ))}
        </ul>
    </div>

    <button className="back-button" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faArrowLeft} />
    </button>

    <div className="instruction">
        Sign the number 
        <div className="letter"> '{numbersData[activeCard - 1].number}'</div>
    </div>

    <div className="flashCard-container" {...handlers}>
            {numbersData.map((item, index) => (
                <input
                type="radio"
                name="alphabet-slider"
                id={`alphabet-item-${index + 1}`}
                key={index}
                onChange={() => setActiveCard(index + 1)}
                checked={activeCard === index + 1} />
            ))}

            <div className="cards">
                {numbersData.map((item, index) => (
                    <FlashCard
                    key={item.number}
                    index={index}
                    {...item}
                    isActive={activeCard === index + 1}
                    videoRef={videoRefs[index]} 
                    id={`alphabet-item-${index + 1}`} 
                    />
                ))}
            </div>

        <div className="progress-container">
            <div className="progress-bar" style={{ width: `${(numberProgress / numbersData.length) * 100}%` }}></div>
            <div className="progress-count">{numberProgress}/{numbersData.length} completed</div>
        </div>
    </div>
    {showBadgeAnimation && (
        <>
            <div className="badge-animation-overlay"></div>
            <div className="badge-animation">
            <p className="badge-message">You've earned the Numbers Ninja Badge!</p>
            <img src="/badges/numbersBadge.png" alt="Congratulations Badge" />
            </div>
        </>
    )}
    </>
    );
};
export default NumbersCards;
