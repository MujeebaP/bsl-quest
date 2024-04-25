import React, { useState, useEffect } from 'react';
import { db } from './../services/firebase-config';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import '../styles/Leaderboard.css';
import Nav from '../components/Nav';
import confetti from 'canvas-confetti';

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const defaultAvatarUrl = '/avatars/default.png';

    // Fetch leaderboard data from Firestore
    useEffect(() => {
        const fetchLeaderboardData = async () => {
            const leaderboardRef = collection(db, 'userXP');
            const q = query(leaderboardRef, orderBy('xp', 'desc'));

            try {
                const querySnapshot = await getDocs(q); // Get all documents in the collection
                const users = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data() // add all the data from the document
                }));

                const leaderboardUsers = await Promise.all(users.map(async user => { // Fetch user profile data
                    const userProfileRef = doc(db, 'userProfiles', user.id);
                    const userProfileSnapshot = await getDoc(userProfileRef);
                    const userProfile = userProfileSnapshot.exists() ? userProfileSnapshot.data() : {};
                    return {
                        ...user,
                        avatar: userProfile.photoURL || defaultAvatarUrl
                    };
                }));

                setLeaderboardData(leaderboardUsers);
            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
            }
        };
        fetchLeaderboardData();
    }, []);

    // Add background colour to body
    useEffect(() => {
        document.body.classList.add('leaderboard-background'); 
        return () => document.body.classList.remove('leaderboard-background');
    }, []);

    // Fires confetti based on rank
    const fireConfetti = (rank) => {
        switch (rank) {
            case 1:
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#ffae00', '#ffffff'],
                    shapes: ['circle', 'star'],
                    scalar: 1.2
                });   
                break;
            case 2:
                confetti({
                    angle: 60,
                    spread: 55,
                    particleCount: 60,
                    origin: { y: 0.6 },
                    colors: ['#0000ff', '#ffffff'],
                    shapes: ['square'],
                    ticks: 200
                });
                confetti({
                    angle: 120,
                    spread: 55,
                    particleCount: 60,
                    origin: { y: 0.6 },
                    colors: ['#0000ff', '#ffffff'],
                    shapes: ['square'],
                    ticks: 200
                });
                break;
            case 3:
                confetti({
                    particleCount: 75,
                    spread: 120,
                    origin: { y: 0.75 },
                    colors: ['#bb0000', '#ffffff'],
                    shapes: ['circle', 'square'],
                    gravity: 0.5
                });
                break;
            default:
                break;
        }
    };

    return (
        <>
        <div className='leaderboard-page'>
        <h1 className="h1-leaderboard">Rankings</h1>
        <div className="leaderboard-container">
        <ol className="leaderboard-top-ranks">
            {/* top 3 users */}
            {leaderboardData.slice(0, 3).map((user, index) => (
                <li key={user.id} 
                    className="leaderboard-entry" 
                    data-rank={`#${index + 1}`}
                    onClick={() => fireConfetti(index + 1)}
                >
                    <img src={user.avatar} alt="Avatar" className="leaderboard-avatar"/>
                    <span className="leaderboard-name">{user.username || 'Anonymous'}</span>
                    <span className="leaderboard-xp">{user.xp} XP</span>
                </li>
            ))}
        </ol>
        <ol className="leaderboard-rest">
            {/* other users */}
            {leaderboardData.slice(3).map((user, index) => (
                <li key={user.id} 
                    className="leaderboard-entry-rest" 
                    data-rank={`#${index + 4}`}>
                    <img src={user.avatar} alt="Avatar" className="leaderboard-avatar"/>
                    <span className="leaderboard-name">{user.username || 'Anonymous'}</span>
                    <span className="leaderboard-xp">{user.xp} XP</span>
                </li>
            ))}
        </ol>
        </div>
        </div>
    <Nav />
    </>
    );
}
export default Leaderboard;
