import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase-config';
import '../styles/Avatar.css'

const AvatarSelection = ({ onClose }) => {
    const avatars = [
        '/avatars/clown-fish.png',
        '/avatars/crab.png',
        '/avatars/deer.png',
        '/avatars/frog.png',
        '/avatars/lion.png',
        '/avatars/panda.png',
        '/avatars/sloth.png',
        '/avatars/cat.png',
        '/avatars/penguin.png',
        '/avatars/parrot.png',
        '/avatars/owl.png',
        '/avatars/whale.png',
        '/avatars/hedgehog.png',
        '/avatars/turtle.png',
        '/avatars/crocodile.png',
        '/avatars/stingray.png',
    ];
    const [selectedAvatar, setSelectedAvatar] = useState(auth.currentUser.photoURL || '/avatars/default.png');
    
    // Save the selected avatar to the user's profile
    const saveAvatar = async () => {
        try {
            await updateProfile(auth.currentUser, {
                photoURL: selectedAvatar
            });
            await updateUserAvatar(auth.currentUser.uid, selectedAvatar);
            console.log("Avatar updated successfully.");
            onClose(); 
        } catch (error) {
            console.error("Error updating avatar: ", error);
        }
    };

    // Update the user's avatar in the database
    const updateUserAvatar = async (userId, newAvatarUrl) => {
        const userProfileRef = doc(db, 'userProfiles', userId);
        try {
            await setDoc(userProfileRef, { photoURL: newAvatarUrl }, { merge: true });
            console.log('User avatar updated successfully.');
        } catch (error) {
            console.error('Error updating user avatar:', error);
        }
    };

    return (
        <div className="avatar-selection">
            {/* This allows the user to select avatars */}
            {avatars.map(avatar => (
                <img 
                    key={avatar} 
                    src={avatar} 
                    alt="avatar"
                    className={selectedAvatar === avatar ? 'selected' : ''}
                    onClick={() => setSelectedAvatar(avatar)}
                    style={{ cursor: 'pointer', border: selectedAvatar === avatar ? '2px solid blue' : 'none' }}
                />
            ))}
            <button onClick={saveAvatar}>Save Avatar</button>
            <div>
            {/* <a href="https://www.flaticon.com/free-icons/animals" title="animals icons">Animals icons created by Freepik - Flaticon</a> */}
            </div>
        </div>
    );
};

export default AvatarSelection;

