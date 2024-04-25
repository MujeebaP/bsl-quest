import React, { useState, useEffect, createRef } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, getFirestore, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import confetti from 'canvas-confetti';
import '../../styles/AlphabetCards.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const FlashCard = ({ animal, videoLink, index, isActive, videoRef, id }) => {
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

const AnimalsCards = () => {
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

    const animalEmojis = {
        Dog: '🐶',
        Cat: '🐱',
        Fish: '🐠',
        Horse: '🐴',
        Monkey: '🐵',
        Cow: '🐮',
        Sheep: '🐑',
        Chicken: '🐔',
        Lion: '🦁',
        Snake: '🐍'
    };

    const [activeCard, setActiveCard] = useState(1);
    const [animalProgress, setAnimalProgress] = useState(1);
    const videoRefs = createVideoRefsArray(animalsData.length);
    const [showBadgeAnimation, setShowBadgeAnimation] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();

    // Add background animation
    useEffect(() => {
        document.body.classList.add('animalsCard-background'); 
        return () => {
            document.body.classList.remove('animalsCard-background');
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
                        animalsLearned: true,
                        badges: ["Animal Expert Badge"]
                    });
                    console.log("User learning progress created and updated successfully.");
                } else {
                    // Document exists, update it
                    await updateDoc(userProgressRef, {
                        animalsLearned: true,
                        // Use arrayUnion to only add the badge if it doesn't already exist
                        badges: arrayUnion("Animal Expert Badge"),
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

    // Handle badge completion
    const handleCompletion = async () => {
        const userId = auth.currentUser.uid;
        const userProgressRef = doc(db, "learningProgress", userId);
        const docSnap = await getDoc(userProgressRef);
        const hasCompletedCategory = docSnap.exists() && docSnap.data().animalsLearned;
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
        onSwipedLeft: () => setActiveCard((prev) => Math.min(prev + 1, animalsData.length)),
        onSwipedRight: () => setActiveCard((prev) => Math.max(prev - 1, 1)),
    });

    // Play the video when the card is active
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
        setAnimalProgress((prevProgress) => Math.max(prevProgress, activeCard));
    }, [activeCard]);

    // Save the user's progress
    useEffect(() => {
        const saveProgress = async () => {
            if (auth.currentUser && animalProgress !== 1) {
                const userId = auth.currentUser.uid;
                const userProgressRef = doc(db, "learningProgress", userId);
    
                try {
                    await setDoc(userProgressRef, { animalProgress }, { merge: true });
                    console.log("User progress saved successfully.");
                } catch (error) {
                    console.error("Error saving user progress:", error);
                }
            }
        };
    
        saveProgress();
    }, [auth.currentUser, db, animalProgress]);

    // Load the user's progress
    const loadProgress = async () => {
        if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            const userProgressRef = doc(db, "learningProgress", userId);
    
            try {
                const docSnap = await getDoc(userProgressRef);
                if (docSnap.exists()) {
                    const savedProgress = docSnap.data().animalProgress;
                    setAnimalProgress(savedProgress || 1);
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

    // Check if the user has completed the category
    useEffect(() => {
        if (animalProgress === animalsData.length) {
            const timer = setTimeout(() => {
                handleCompletion();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [animalsData.length, animalProgress]);

    return (
        <>
        {/* background animation from https://codepen.io/alvarotrigo/pen/GRvYNax, altered */}
        <div className="area"> 
            <ul className="emojis">
                {Array(25).fill(null).map((_, idx) => (
                    <li key={idx}>
                        {animalEmojis[animalsData[activeCard - 1].animal]}
                    </li>
                ))}
            </ul>
        </div>

        <button className="back-button" onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <div className="instruction">
            Sign the animal 
            <div className="letter"> '{animalsData[activeCard - 1].animal}'</div>
        </div>

        <div className="flashCard-container" {...handlers}>
            {animalsData.map((item, index) => (
                <input
                type="radio"
                name="alphabet-slider"
                id={`alphabet-item-${index + 1}`}
                key={index}
                onChange={() => setActiveCard(index + 1)}
                checked={activeCard === index + 1} />
            ))}

            <div className="cards">
                {animalsData.map((item, index) => (
                    <FlashCard
                    key={item.animal}
                    index={index}
                    {...item}
                    isActive={activeCard === index + 1}
                    videoRef={videoRefs[index]} 
                    id={`alphabet-item-${index + 1}`} // Pass the unique ID to the FlashCard component
                    />
                ))}
            </div>

            <div className="progress-container">
                <div className="progress-bar" style={{ width: `${(animalProgress / animalsData.length) * 100}%` }}></div>
                <div className="progress-count">{animalProgress}/{animalsData.length} completed</div>
            </div>
        </div>
        {showBadgeAnimation && (
        <>
            <div className="badge-animation-overlay"></div>
            <div className="badge-animation">
            <p className="badge-message">You've earned the Animals Adventurer Badge!</p>
            <img src="/badges/animalsBadge.png" alt="Congratulations Badge" />
            </div>
        </>
    )}
        </>
    );
};

export default AnimalsCards;