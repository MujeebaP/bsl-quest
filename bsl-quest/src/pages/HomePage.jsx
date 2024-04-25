import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useSwipeable } from 'react-swipeable';
import { getAuth } from "firebase/auth";
import { doc, getDoc} from "firebase/firestore";
import { db } from './../services/firebase-config';
import Nav from '../components/Nav';
import CustomModal from '../components/CustomModal';
import GPTComponent from '../components/gpt';
import '../styles/home.scss';

const cardsData = [
    { id: 1, content: 'Alphabet' },
    { id: 2, content: 'Numbers' },
    { id: 3, content: 'Colours' },
    { id: 4, content: 'Animals' },
    { id: 5, content: 'Greetings' },
    { id: 6, content: 'My AI' },
];

const HomePage = ({ cards = cardsData }) => { 
    const [activeCard, setActiveCard] = useState(1);
    const navigate = useNavigate();
    const [userXP, setUserXP] = useState(0);
    const [showGPTModal, setShowGPTModal] = useState(false);
    const openGPTModal = () => setShowGPTModal(true);

    // Add background colour to body
    useEffect(() => {
        document.body.classList.add('home-background'); 
        return () => {
            document.body.classList.remove('home-background');
        };
    }, []);

    // sets the active card
    const handleCardChange = (cardId) => {
        setActiveCard(cardId);
    };

    const handleButtonClick = (cardId, type) => {
        const card = cards.find(card => card.id === cardId);
        if (card.content === 'My AI') {
            openGPTModal(true); 
        } else {
            const path = `/${type}-${card.content.toLowerCase().trim()}`;
            navigate(path);
        }
    };


    // Returns the image source based on the content
    const getImageSrc = (content) => {
        switch(content) {
            case 'Alphabet':
                return 'categoryimg/alphabet.png';
            case 'Numbers':
                return 'categoryimg/numbers.png'; 
            case 'Colours':
                return 'categoryimg/wheel.png'; 
            case 'Animals':
                return 'categoryimg/livestock.png'; 
            case 'Greetings':
                return 'categoryimg/greetings.png';
            case 'My AI':
                return 'categoryimg/ai.png';
            default:
                return '';
        }
    };  
    
    // Fetch user XP from Firestore
    useEffect(() => {
        const fetchUserXP = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                console.error("No user is authenticated");
                return;
            }

            const userXPRef = doc(db, "userXP", user.uid);
            try {
                const docSnap = await getDoc(userXPRef);
                if (docSnap.exists()) {
                    setUserXP(docSnap.data().xp);
                } else {
                    console.log("No XP found for the user.");
                }
            } catch (error) {
                console.error("Error fetching user XP:", error);
            }
        };
        fetchUserXP();
    }, []);

    // Swipe left and right to change the active card
    const handlers = useSwipeable({
        onSwipedLeft: () => setActiveCard((prev) => Math.min(prev + 1, cards.length)),
        onSwipedRight: () => setActiveCard((prev) => Math.max(prev - 1, 1)),
    });


    return (
        <>
        <div className="UniqueHomecontainer" {...handlers}>
            {Array(cards.length).fill(null).map((_, index) => (
                <input 
                    type="radio" 
                    name="slider" 
                    id={`item-${index + 1}`} 
                    key={index} 
                    onChange={() => handleCardChange(index + 1)} 
                    checked={activeCard === index + 1} 
                    style={{ display: 'none' }} 
                />
            ))}
            <div className="cards">
                {cards.map((card, index) => (
                    <label className="UniqueCard" htmlFor={`item-${index + 1}`} key={card.id} id={`card-${index + 1}`}>
                        <div className="card-content">{card.content}</div>
                        <img src={getImageSrc(card.content)} alt={card.content} className="card-image" />
                        <div className="card-buttons">
                            {card.content === 'My AI' ? (
                                <button className="chat-btn" onClick={() => handleButtonClick(card.id)}>Chat</button>
                            ) : (
                                <>
                                    <button className="learn-btn" onClick={() => handleButtonClick(card.id, 'learn')}>Learn</button>
                                    <button className="quiz-btn" onClick={() => handleButtonClick(card.id, 'quiz')}>Quiz</button>
                                </>
                            )}
                        </div>
                    </label>
                ))}
            </div>
        </div>
        <div className="xp-container">
            <p>My XP: {userXP}</p>
        </div>
        <div className="nav-bar">
            <Nav />
        </div>
        <CustomModal
            isOpen={showGPTModal}
            onClose={() => setShowGPTModal(false)}
            message={<GPTComponent />}
        />
        </>
    );
}

export default HomePage;
