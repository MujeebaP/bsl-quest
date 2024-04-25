import React, { useState, useEffect, createRef } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, getFirestore, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import confetti from 'canvas-confetti';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../../styles/AlphabetCards.scss';

const FlashCard = ({ letter, videoLink, index, isActive, videoRef, id }) => {
    return (
        <label className="alphabetCard" htmlFor={id}>
            <video ref={videoRef} className='alphabetCard__video' controls playsInline muted autoPlay loop={isActive}>
                {isActive && <source src={videoLink} type="video/mp4" />} 
                {/* implements lazy loading + improves performance*/}
            </video>
        </label>
    );
};

const createVideoRefsArray = (length) => {
    return Array.from({ length }).map(() => createRef()); //an array of refs to access video elements
};

const AlphabetCards = () => {

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
    const [activeCard, setActiveCard] = useState(1);
    const [alphabetProgress, setalphabetProgress] = useState(1);
    const videoRefs = createVideoRefsArray(alphabetData.length);
    const [showBadgeAnimation, setShowBadgeAnimation] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();
    
    // Add background animation
    useEffect(() => {
        document.body.classList.add('alphabetCard-background');
        return () => {
            document.body.classList.remove('alphabetCard-background');
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
                    // Document does not exist, so create it
                    await setDoc(userProgressRef, {
                        alphabetLearned: true,
                        badges: ["Alphabet Ace Badge"],
                    });
                    console.log("User learning progress created and updated successfully.");
                } else {
                    // Document exists, update it
                    await updateDoc(userProgressRef, {
                        alphabetLearned: true,
                        // Use arrayUnion to only add the badge if it doesn't already exist
                        badges: arrayUnion("Alphabet Ace Badge"),
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
            zIndex: 9999, // Ensure confetti is above other elements
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    // Handle completion of the alphabet
    const handleCompletion = async () => {
        const userId = auth.currentUser.uid;
        const userProgressRef = doc(db, "learningProgress", userId);
        const docSnap = await getDoc(userProgressRef);
        const hasCompletedCategory = docSnap.exists() && docSnap.data().alphabetLearned;
        if (!hasCompletedCategory) {
            setShowBadgeAnimation(true);
            await updateUserLearningProgress();
            triggerConfetti();
        
          // Hide animation after a few seconds
            setTimeout(() => {
                setShowBadgeAnimation(false);
            }, 5000);
        }
    };
    
    // Swipe handlers
    const handlers = useSwipeable({
        onSwipedLeft: () => setActiveCard((prev) => Math.min(prev + 1, alphabetData.length)),
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

    // sets the progress to the current card if it is greater than the current progress
    useEffect(() => {
        setalphabetProgress((prevProgress) => Math.max(prevProgress, activeCard));
    }, [activeCard]);

    // Save the user's progress
    useEffect(() => {
        const saveProgress = async () => {
            if (auth.currentUser && alphabetProgress!== 1) {
                const userId = auth.currentUser.uid;
                const userProgressRef = doc(db, "learningProgress", userId);
    
                try {
                    await setDoc(userProgressRef, { alphabetProgress}, { merge: true });
                    console.log("User progress saved successfully.");
                } catch (error) {
                    console.error("Error saving user progress:", error);
                }
            }
        };
    
        saveProgress();
    }, [auth.currentUser, db, alphabetProgress]);

    // Load the user's progress
    const loadProgress = async () => {
        if (auth.currentUser) {
            const userId = auth.currentUser.uid;
            const userProgressRef = doc(db, "learningProgress", userId);
    
            try {
                const docSnap = await getDoc(userProgressRef);
                if (docSnap.exists()) {
                    const savedProgress = docSnap.data().alphabetProgress;
                    setalphabetProgress(savedProgress || 1);
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

    // Check if the user has completed the alphabet
    useEffect(() => {
        if (alphabetProgress=== alphabetData.length) {
            const timer = setTimeout(() => {
                handleCompletion();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [alphabetData.length, alphabetProgress]);

    return (
        <>
        {/* background animation from https://codepen.io/alvarotrigo/pen/GRvYNax, altered */}
        <div className="area"> 
            <ul className="letters">
                {Array(25).fill(alphabetData[activeCard - 1].letter).map((letter, idx) => (
                    <li key={idx}>{letter}</li>
                ))}
            </ul>
        </div>

        <button className="back-button" onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <div className="instruction">
            Sign the letter 
            <div className="letter"> '{alphabetData[activeCard - 1].letter}'</div>
        </div>

        <div className="alphabetCard-container" {...handlers}>
            {alphabetData.map((item, index) => (
                <input
                type="radio"
                name="alphabet-slider"
                id={`alphabet-item-${index + 1}`}
                key={index}
                onChange={() => setActiveCard(index + 1)}
                checked={activeCard === index + 1} />
            ))}

            <div className="cards">
                {alphabetData.map((item, index) => (
                    <FlashCard
                    key={item.letter}
                    index={index}
                    {...item}
                    isActive={activeCard === index + 1}
                    videoRef={videoRefs[index]} 
                    id={`alphabet-item-${index + 1}`} // Pass the unique ID to the FlashCard component
                    />
                ))}
            </div>

            <div className="progress-container">
                <div className="progress-bar" style={{ width: `${(alphabetProgress / alphabetData.length) * 100}%` }}></div>
                <div className="progress-count">{alphabetProgress}/{alphabetData.length} completed</div>
            </div>
        </div>
        {showBadgeAnimation && (
            <>
                <div className="badge-animation-overlay"></div>
                <div className="badge-animation">
                <p className="badge-message">You've earned the Alphabet Ace Badge!</p>
                <img src="/badges/alphabetBadge.png" alt="Congratulations Badge" />
                </div>
            </>
        )}
        </>
    );
};

export default AlphabetCards;