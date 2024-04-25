import React, { useState, useEffect, createRef } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, getFirestore, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import confetti from 'canvas-confetti';
import '../../styles/AlphabetCards.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const FlashCard = ({ colour, videoLink, index, isActive, videoRef, id }) => {
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

const ColoursCards = () => {

    const coloursData = [
        { colour: 'Red', videoLink: '/signs/colours/red.mp4' },
        { colour: 'Orange', videoLink: '/signs/colours/orange.mp4' },
        { colour: 'Yellow', videoLink: '/signs/colours/yellow.mp4' },
        { colour: 'Green', videoLink: '/signs/colours/green.mp4' },
        { colour: 'Blue', videoLink: '/signs/colours/blue.mp4' },
        { colour: 'Purple', videoLink: '/signs/colours/purple.mp4' },
        { colour: 'Pink', videoLink: '/signs/colours/pink.mp4' },
        { colour: 'Brown', videoLink: '/signs/colours/brown.mp4' },
        { colour: 'Black', videoLink: '/signs/colours/black.mp4' },
        { colour: 'White', videoLink: '/signs/colours/white.mp4' },
    ];

    const colourEmojis = {
        Red: '❤️',
        Orange: '🍊',
        Yellow: '💛',
        Green: '🌿',
        Blue: '💧',
        Purple: '🔮', 
        Pink: '🌸',    
        Brown: '🐻',      
        Black: '🖤',      
        White: '☁️',      
    };

    const [activeCard, setActiveCard] = useState(1);
    const [colourProgress, setColourProgress] = useState(1);
    const videoRefs = createVideoRefsArray(coloursData.length);
    const [showBadgeAnimation, setShowBadgeAnimation] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();
    const [backgroundColor, setBackgroundColor] = useState('initialColor'); // Initial colour before change

    useEffect(() => {
        document.body.classList.add('coloursCard-background'); 
        return () => {
            document.body.classList.remove('coloursCard-background'); 
        };
    }, []);

    // depending on the active card, change the background colour
    useEffect(() => {
        document.body.classList.add('coloursCard-background');
        setBackgroundColor(coloursData[activeCard - 1].colour.toLowerCase()); // Update initial color
    }, [activeCard]);

    // sets the background colour of the page
    useEffect(() => {
        document.body.classList.add(`coloursCard-background-${backgroundColor}`); 
        return () => {
            document.body.classList.remove(`coloursCard-background-${backgroundColor}`);
        };
    }, [backgroundColor]);

    // Update the user's learning progress
    const updateUserLearningProgress = async () => {
        if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            const userProgressRef = doc(db, "learningProgress", userId);
            try {
                const docSnap = await getDoc(userProgressRef);
                if (!docSnap.exists()) {
                    await setDoc(userProgressRef, {
                        coloursLearned: true,
                        badges: ["Colours Champion Badge"],
                    });
                    console.log("User learning progress created and updated successfully.");
                } else {
                    // Document exists, update it
                    await updateDoc(userProgressRef, {
                        coloursLearned: true,
                        // Use arrayUnion to only add the badge if it doesn't already exist
                        badges: arrayUnion("Colours Champion Badge"),
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

    const handleCompletion = async () => {
        const userId = auth.currentUser.uid;
        const userProgressRef = doc(db, "learningProgress", userId);
        const docSnap = await getDoc(userProgressRef);
        const hasCompletedCategory = docSnap.exists() && docSnap.data().coloursLearned;
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
        onSwipedLeft: () => setActiveCard((prev) => Math.min(prev + 1, coloursData.length)),
        onSwipedRight: () => setActiveCard((prev) => Math.max(prev - 1, 1)),
    });

    // These useEffects will play the video when the card is active
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
        setColourProgress((prevProgress) => Math.max(prevProgress, activeCard));
    }, [activeCard]);

    useEffect(() => {
        const saveProgress = async () => {
            if (auth.currentUser && colourProgress !== 1) {
                const userId = auth.currentUser.uid;
                const userProgressRef = doc(db, "learningProgress", userId);
    
                try {
                    await setDoc(userProgressRef, { colourProgress }, { merge: true });
                    console.log("User progress saved successfully.");
                } catch (error) {
                    console.error("Error saving user progress:", error);
                }
            }
        };
    
        saveProgress();
    }, [auth.currentUser, db, colourProgress]);

    // Load the user's progress
    const loadProgress = async () => {
        if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            const userProgressRef = doc(db, "learningProgress", userId);
    
            try {
                const docSnap = await getDoc(userProgressRef);
                if (docSnap.exists()) {
                    const savedProgress = docSnap.data().colourProgress;
                    setColourProgress(savedProgress || 1);
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

    // useEffect to handle badge animation
    useEffect(() => {
        if (colourProgress === coloursData.length) {
            const timer = setTimeout(() => {
                handleCompletion();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [coloursData.length, colourProgress]);

    return (
    <>
    {/* background animation from https://codepen.io/alvarotrigo/pen/GRvYNax, altered */}
    <div className="area"> 
        <ul className="floating-elements">
            {Array(25).fill(null).map((_, idx) => (
                <li key={idx}>
                    {colourEmojis[coloursData[activeCard - 1].colour]}
                </li>
            ))}
        </ul>
    </div>

    <button className="back-button" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faArrowLeft} />
    </button>

    <div className="instruction">
        Sign the colour
        <div className="letter"> '{coloursData[activeCard - 1].colour}'</div>
    </div>

    <div className="flashCard-container" {...handlers}>
            {coloursData.map((item, index) => (
                <input
                type="radio"
                name="alphabet-slider"
                id={`alphabet-item-${index + 1}`}
                key={index}
                onChange={() => setActiveCard(index + 1)}
                checked={activeCard === index + 1} />
            ))}

            <div className="cards">
                {coloursData.map((item, index) => (
                    <FlashCard
                    key={item.colour}
                    index={index}
                    {...item}
                    isActive={activeCard === index + 1}
                    videoRef={videoRefs[index]} 
                    id={`alphabet-item-${index + 1}`} 
                    />
                ))}
            </div>

        <div className="progress-container">
            <div className="progress-bar" style={{ width: `${(colourProgress / coloursData.length) * 100}%` }}></div>
            <div className="progress-count">{colourProgress}/{coloursData.length} completed</div>
        </div>
    </div>
    {showBadgeAnimation && (
        <>
            <div className="badge-animation-overlay"></div>
            <div className="badge-animation">
            <p className="badge-message">You've earned the Colours Champion Badge!</p>
            <img src="/badges/coloursBadge.png" alt="Congratulations Badge" />
            </div>
        </>
    )}
    </>
    );
};

export default ColoursCards;