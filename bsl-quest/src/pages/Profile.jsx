import React, { useState, useEffect } from 'react';
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import { db } from '../services/firebase-config';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Nav from '../components/Nav';
import '../styles/profile.css';

const Profile = () => {
    const [userScores, setUserScores] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [userName, setUserName] = useState('');
    const [chartData, setChartData] = useState([]); 
    const [isChartVisible, setIsChartVisible] = useState(false);
    const [userBadges, setUserBadges] = useState([]);
    const [showBadgeOverlay, setShowBadgeOverlay] = useState(false);
    const [wobbleBadge, setWobbleBadge] = useState('');
    
    // Fetch user scores and badges from Firestore
    useEffect(() => {
        const fetchBadgesAndScores = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const userScoresDocRef = doc(db, "quizScores", user.uid);
                const userProgressDocRef = doc(db, "learningProgress", user.uid);
                setUserName(user.displayName || 'User');
                try {
                    const scoresSnap = await getDoc(userScoresDocRef);
                    if (scoresSnap.exists()) {
                        setUserScores(scoresSnap.data());
                    } else {
                        console.log("No such document for scores!");
                    }
                    const progressSnap = await getDoc(userProgressDocRef);
                    if (progressSnap.exists()) {
                        setUserBadges(progressSnap.data().badges || []);
                    } else {
                        console.log("No such document for progress!");
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            }
        };
        fetchBadgesAndScores();
    }, []);

    // Update chart data when selected category changes
    useEffect(() => {
        if (selectedCategory && userScores[selectedCategory]) {
            const scores = userScores[selectedCategory].map((score, index) => ({
                date: `${score.timestamp.toDate().getDate()}/${score.timestamp.toDate().getMonth()+1}/${score.timestamp.toDate().getFullYear()}`,
                score: score.score,
            }));
            setChartData(scores);
            setIsChartVisible(true);
        }else {
            setIsChartVisible(false); // Hide the chart
        }
    }, [selectedCategory, userScores]);

    // Format category name for display
    const formatCategoryName = (category) => {
        return category.charAt(0).toUpperCase() + category.slice(1, -'QuizScores'.length) + ' Quiz';
    };    

    // Render category cards for selection
    const renderCategory = () => (
        ['alphabetQuizScores', 'numbersQuizScores', 'coloursQuizScores', 'animalsQuizScores', 'greetingsQuizScores'].map((categoryKey) => (
            <div key={categoryKey} className="category-cards" onClick={() => setSelectedCategory(categoryKey)}>
                <div className="category-name">{formatCategoryName(categoryKey)}</div>
                <div className="category-progress">{userScores[categoryKey]?.length || 0} Attempts</div>
            </div>
        ))
    );
    
    // Render scores chart for selected category by user
    const renderScoresForCategory = () => {
        if (!selectedCategory) return null; 
        const scoresArray = userScores[selectedCategory];
        if (!scoresArray || scoresArray.length === 0) {
            //return <p><br></br>No records available for {selectedCategory.replace('QuizScores', '')}</p>;
            return <p><br></br>No records available for the {formatCategoryName(selectedCategory)}</p>;
        }
        return (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#82ca9d" />
                </LineChart>
            </ResponsiveContainer>
        );
    };
    
    // Badge images
    const badgeImageUrls = {
        'Alphabet Ace Badge': '/badges/alphabetBadge.png', 
        'Numbers Ninja Badge': '/badges/numbersBadge.png',
        'Colours Champion Badge': '/badges/coloursBadge.png',
        'Animal Expert Badge': '/badges/animalsBadge.png',
        'Greetings Guru Badge': '/badges/greetingsBadge.png'
    };

    // Badge image style
    const imageStyle = {
        width: '90px',
        height: 'auto'
    };

    // Handle badge click so that it wobbles
    const handleBadgeClick = (badgeName) => {
        setShowBadgeOverlay(true);
        setWobbleBadge(badgeName);
        setTimeout(() => {
            setWobbleBadge(null);
        }, 500); 
    };

    const closeBadgeOverlay = () => {
        setShowBadgeOverlay(false);
    };

    // displays the user's badges
    const MyBadgesCard = () => (
        <div className="category-cards" onClick={handleBadgeClick}>
            <div className="category-name">My Badges</div>
        </div>
    );

    // Badge overlay component
    const BadgeOverlay = () => {
        if (!showBadgeOverlay) return null;
        return (
            <div className="badge-overlay">
                <div className="badge-modal" style={{ width: '80%' }}> 
                    <button className="badge-close-button" onClick={closeBadgeOverlay}>X</button>
                    {userBadges.length > 0 ? (
                        <div className='badges-grid'>
                            {userBadges.map((badge, index) => (
                                <img key={index} 
                                src={badgeImageUrls[badge]} 
                                alt={badge} 
                                style={imageStyle } 
                                onClick={() => handleBadgeClick(badge)}
                                className={wobbleBadge === badge ? 'wobble-animation' : ''}/>
                            ))}
                        </div>
                    ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <p style={{ marginBottom: '16px' }}>No badges yet 😔</p>
                    </div>
                    )}
                </div>
            </div>
        );
    };

    useEffect(() => {
        document.body.classList.add('profile-background'); 
        return () => document.body.classList.remove('profile-background');
    }, []);

    return (
        <div className="profile-page">
            {selectedCategory && <div className="overlay-effect"></div>} {/* conditionally renders overlay */}
            <h1>Hi {userName}!</h1> {/* gets user's name from the database*/}
            <Nav />
            <div className="categories-container">
                <MyBadgesCard />
                <BadgeOverlay />
                {renderCategory()}
            </div>
            <div className={`scores-container ${!selectedCategory ? 'hidden' : ''}`}> {/* conditionally renders scores container */}
                {selectedCategory && (
                    <button className="chart-back-button" onClick={() => setSelectedCategory(null)}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                )}
                {/* {renderScoresForCategory()} */}
                {isChartVisible && renderScoresForCategory()}
            </div>
        </div>
    );
};
export default Profile;
