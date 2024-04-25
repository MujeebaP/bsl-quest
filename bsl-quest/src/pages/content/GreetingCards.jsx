import React, { useState, useEffect, createRef } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, getFirestore, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import confetti from 'canvas-confetti';
import '../../styles/AlphabetCards.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const FlashCard = ({ greeting, videoLink, index, isActive, videoRef, id }) => {
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

const GreetingsCards = () => {
    const greetingsData = [
        {greeting: 'Hello', videoLink: '/signs/greetings/hello.mp4'},
        {greeting: 'Good Morning', videoLink: '/signs/greetings/morning.mp4'},
        {greeting: 'Good Afternoon', videoLink: '/signs/greetings/afternoon.mp4'},
        {greeting: 'Good Evening', videoLink: '/signs/greetings/evening.mp4'},
        {greeting: 'Good Night', videoLink: '/signs/greetings/night.mp4'},
        {greeting: 'Sorry', videoLink: '/signs/greetings/sorry.mp4'},
        {greeting: 'Please', videoLink: '/signs/greetings/please.mp4'},
        {greeting: 'How are you?', videoLink: '/signs/greetings/how.mp4'},
    ];

    const greetingIcons = {
        Hello: '👋',
        'Good Morning': '☀️',
        'Good Afternoon': '🌞',
        'Good Evening': '🌙',
        'Good Night': '🌃',
        Sorry: '😔',
        Please: '🙏',
        'How are you?': '🤔',
    };

    const [activeCard, setActiveCard] = useState(1);
    const [greetingProgress, setGreetingProgress] = useState(1);
    const videoRefs = createVideoRefsArray(greetingsData.length);
    const [showBadgeAnimation, setShowBadgeAnimation] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();

    // Add background animation
    useEffect(() => {
        document.body.classList.add('greetingsCard-background'); 
        return () => {
            document.body.classList.remove('greetingsCard-background');
        };
    }, []);

    // Update the user's learning progress
    const updateUserLearningProgress = async () => {
        if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            const userProgressRef = doc(db, "learningProgress", userId);
    
            try {
                const docSnap = await getDoc(userProgressRef);
    
                if (!docSnap.exists()) {
                    // Document does not exist, so let's create it
                    await setDoc(userProgressRef, {
                        greetingsLearned: true,
                        badges: ["Greetings Guru Badge"],
                    });
                    console.log("User learning progress created and updated successfully.");
                } else {
                    // Document exists, update it
                    await updateDoc(userProgressRef, {
                        greetingsLearned: true,
                        // Use arrayUnion to only add the badge if it doesn't already exist
                        badges: arrayUnion("Greetings Guru Badge"),
                    });
                    console.log("User learning progress updated successfully.");
                }
            } catch (error) {
                console.error("Error updating learning progress:", error);
            }
        }
    };
    
    const triggerConfetti = () => {
        confetti({
            zIndex: 9999,
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    // Trigger confetti animation and update user progress
    const handleCompletion = async () => {
        const userId = auth.currentUser.uid;
        const userProgressRef = doc(db, "learningProgress", userId);
        const docSnap = await getDoc(userProgressRef);
        const hasCompletedCategory = docSnap.exists() && docSnap.data().greetingsLearned;
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
        onSwipedLeft: () => setActiveCard((prev) => Math.min(prev + 1, greetingsData.length)),
        onSwipedRight: () => setActiveCard((prev) => Math.max(prev - 1, 1)),
    });

    // These useEffects handle the video playback
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
        setGreetingProgress((prevProgress) => Math.max(prevProgress, activeCard));
    }, [activeCard]);

    useEffect(() => {
        const saveProgress = async () => {
            if (auth.currentUser && greetingProgress !== 1) {
                const userId = auth.currentUser.uid;
                const userProgressRef = doc(db, "learningProgress", userId);
    
                try {
                    await setDoc(userProgressRef, { greetingProgress }, { merge: true });
                    console.log("User progress saved successfully.");
                } catch (error) {
                    console.error("Error saving user progress:", error);
                }
            }
        };
    
        saveProgress();
    }, [auth.currentUser, db, greetingProgress]);

    // Load the user's progress
    const loadProgress = async () => {
        if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            const userProgressRef = doc(db, "learningProgress", userId);
    
            try {
                const docSnap = await getDoc(userProgressRef);
                if (docSnap.exists()) {
                    const savedProgress = docSnap.data().greetingProgress;
                    setGreetingProgress(savedProgress || 1);
                    setActiveCard(savedProgress || 1);
                }
            } catch (error) {
                console.error("Error loading user progress:", error);
            }
        }
    };

    // Load the user's progress when the component mounts
    useEffect(() => {
        loadProgress();
    }, [auth.currentUser, db]);

    // Check if the user has completed all the cards
    useEffect(() => {
        if (greetingProgress === greetingsData.length) {
            const timer = setTimeout(() => {
                handleCompletion();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [greetingsData.length, greetingProgress]);

    return (
    <>
    {/* background animation from https://codepen.io/alvarotrigo/pen/GRvYNax, altered */}
    <div className="area"> 
        <ul className="floating-elements">
            {Array(25).fill(null).map((_, idx) => (
                <li key={idx}>
                    {greetingIcons[greetingsData[activeCard - 1].greeting]}
                </li>
            ))}
        </ul>
    </div>

    <button className="back-button" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faArrowLeft} />
    </button>

    <div className="instruction">
        Sign the greeting 
        <div className="letter"> '{greetingsData[activeCard - 1].greeting}'</div>
    </div>
    
    <div className="flashCard-container" {...handlers}>
            {greetingsData.map((item, index) => (
                <input
                type="radio"
                name="alphabet-slider"
                id={`alphabet-item-${index + 1}`}
                key={index}
                onChange={() => setActiveCard(index + 1)}
                checked={activeCard === index + 1} />
            ))}

            <div className="cards">
                {greetingsData.map((item, index) => (
                    <FlashCard
                    key={item.greeting}
                    index={index}
                    {...item}
                    isActive={activeCard === index + 1}
                    videoRef={videoRefs[index]} 
                    id={`alphabet-item-${index + 1}`} 
                    />
                ))}
            </div>

        <div className="progress-container">
            <div className="progress-bar" style={{ width: `${(greetingProgress / greetingsData.length) * 100}%` }}></div>
            <div className="progress-count">{greetingProgress}/{greetingsData.length} completed</div>
        </div>
    </div>
    {showBadgeAnimation && (
        <>
        <div className="badge-animation-overlay"></div>
        <div className="badge-animation">
        <p className="badge-message">You've earned the Greetings Guru Badge!</p>
        <img src="/badges/greetingsBadge.png" alt="Congratulations Badge" />
        </div>
        </>
    )}
    </>
    );
};

export default GreetingsCards;