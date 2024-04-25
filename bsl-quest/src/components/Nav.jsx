import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faHouse, faGear, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom'; 
import '../styles/Nav.scss';

const Nav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeItem, setActiveItem] = useState(null);

    // Set the active item based on the current path
    useEffect(() => {
        if (location.pathname.includes('home')) {
            setActiveItem('home');
        } else if (location.pathname.includes('profile')) {
            setActiveItem('profile');
        } else if (location.pathname.includes('settings')) {
            setActiveItem('settings');
        }
        else if (location.pathname.includes('leaderboard')) {
            setActiveItem('leaderboard');
        }
    }, [location]);

    const handleNavigation = (path, itemKey) => {
        navigate(path);
        setActiveItem(itemKey);
    };

    return (
        // This component displays the bottom navigation bar
        <div className="bottom-nav">
            <div className={`nav-item ${activeItem === 'settings' ? 'active' : ''}`} onClick={(e) => handleNavigation("/settings", "settings", e)}>
                <FontAwesomeIcon icon={faGear} size="lg" />
                {activeItem === 'settings' && <span>Settings</span>}
            </div>
            <div className={`nav-item ${activeItem === 'home' ? 'active' : ''}`} onClick={(e) => handleNavigation("/home", "home", e)}>
                <FontAwesomeIcon icon={faHouse} size="lg" />
                {activeItem === 'home' && <span>Home</span>}
            </div>
            <div className={`nav-item ${activeItem === 'profile' ? 'active' : ''}`} onClick={(e) => handleNavigation("/profile", "profile", e)}>
                <FontAwesomeIcon icon={faUserCircle} size="lg" />
                {activeItem === 'profile' && <span>Profile</span>}
            </div>
            <div className={`nav-item ${activeItem === 'leaderboard' ? 'active' : ''}`} onClick={() => handleNavigation("/leaderboard", "leaderboard")}>
                <FontAwesomeIcon icon={faTrophy} size="lg" />
                {activeItem === 'leaderboard' && <span>Ranks</span>}
            </div>
        </div>
    );
}
export default Nav;
