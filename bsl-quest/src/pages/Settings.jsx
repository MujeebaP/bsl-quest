import React, { useState, useEffect } from 'react';
import { signOut, updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth, db } from '../services/firebase-config';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserEdit, faEnvelope, faKey, faRedoAlt, faSignOutAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import CustomModal from '../components/CustomModal';
import AvatarSelection from '../components/AvatarSelection';
import '../styles/Settings.css';

const Settings = () => {
    const navigate = useNavigate();
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [passwordForReAuth, setPasswordForReAuth] = useState(''); 
    const [newPassword, setNewPassword] = useState(''); 

    const [showNameModal, setShowNameModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showResetScoreModal, setShowResetScoreModal] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    // Functions to open modals
    const openNameModal = () => setShowNameModal(true);
    const openEmailModal = () => setShowEmailModal(true);
    const openPasswordModal = () => setShowPasswordModal(true);
    const openAvatarModal = () => setShowAvatarModal(true);

    // Function to handle logout
    const handleLogout = () => {
        signOut(auth).then(() => {
            navigate("/login");
            console.log("Signed out successfully");
        }).catch((error) => {
            console.error("Error signing out: ", error);
        });
    }

    const handleCloseModal = () => {
        setShowNameModal(false);
        setShowEmailModal(false);
        setShowPasswordModal(false);
        setUpdateMessage(''); // Reset the message state
    };

    // Function to update the user name
    const changeUserName = async () => {
        const user = auth.currentUser;
        try {
            await updateProfile(user, {
                displayName: newName
            });
            console.log("User name updated successfully.");
            setUpdateMessage("User name updated successfully.");
            setNewName('');
            setTimeout(handleCloseModal, 2000);
        } catch (error) {
            setUpdateMessage("Error updating user name.");
            console.error("Error updating user name: ", error);
        }
    };

    // Function to re-authenticate the user
    const reauthenticate = async (currentPassword) => {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            console.log("Re-authentication successful.");
            return true;
        } catch (error) {
            console.error("Error during re-authentication: ", error);
            return false;
        }
    };

    // Function to update the user email
    const changeUserEmail = async () => {
        const isReauthenticated = await reauthenticate(passwordForReAuth);
        if (isReauthenticated) {
            try {
                await updateEmail(auth.currentUser, newEmail);
                console.log("Email updated successfully.");
                setUpdateMessage("Email updated successfully.");
                setNewEmail('');
                setTimeout(handleCloseModal, 2000);
            } catch (error) {
                console.error("Error updating email: ", error);
                setUpdateMessage("Error updating email.");
            }
        }
    };

    // Function to update the user password
    const changeUserPassword = async () => {
        const isReauthenticated = await reauthenticate(passwordForReAuth);
        if (isReauthenticated) {
            try {
                await updatePassword(auth.currentUser, newPassword);
                console.log("Password updated successfully.");
                setUpdateMessage("Password updated successfully.");
                setNewPassword('');
                setTimeout(handleCloseModal, 2000);
            } catch (error) {
                console.error("Error updating password: ", error);
                setUpdateMessage("Error updating password.");
            }
        }
    };

    const resetUserScores = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            console.error("No user is authenticated");
            return;
        }
        const userScoreRef = doc(db, "quizScores", user.uid);
        try {
            // Set the QuizScores to an empty array
            await updateDoc(userScoreRef, {
                alphabetQuizScores: [],
                numbersQuizScores: [],
                coloursQuizScores: [],
                animalsQuizScores: [],
                greetingsQuizScores: []
            });
            console.log(`Scores for ${user.uid} have been reset.`);
            setUpdateMessage(`${user.displayName || 'User'}'s scores have been reset!`);
            setShowResetScoreModal(true); 
        } catch (error) {
            console.error("Error resetting scores:", error);
            setUpdateMessage(`Error resetting scores.`);
            setShowResetScoreModal(true); // Show the modal with the error message
        }
    };

    // Add background colour to body
    useEffect(() => {
        document.body.classList.add('settings-background');
        return () => {
            document.body.classList.remove('settings-background');
        };
    }, []);

    // Form for updating the name
    const nameForm = (
        <div>
            <input type="text" placeholder="New Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button onClick={changeUserName}>Submit</button>
            {updateMessage && <p>{updateMessage}</p>}
        </div>
    );

    // Form for updating the email
    const emailForm = (
        <div>
            <input type="password" placeholder="Current Password" value={passwordForReAuth} onChange={(e) => setPasswordForReAuth(e.target.value)} />
            <input type="email" placeholder="New Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <button onClick={changeUserEmail}>Submit</button>
            {updateMessage && <p>{updateMessage}</p>}
        </div>
    );

    // Form for updating the password
    const passwordForm = (
        <div>
            <input type="password" placeholder="Current Password" value={passwordForReAuth} onChange={(e) => setPasswordForReAuth(e.target.value)} />
            <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <button onClick={changeUserPassword}>Submit</button>
            {updateMessage && <p>{updateMessage}</p>}
        </div>
    );

    return (
        <div className="settings-page">
            <h1 className='h1-settings'>Settings</h1>
            <div className="settings-container">
                {/* my setting options */}
                <div className="settings-card" onClick={openNameModal}>
                    <FontAwesomeIcon icon={faUserEdit} />
                    <p>Change Name</p>
                </div>
                <div className="settings-card" onClick={openAvatarModal}>
                    <FontAwesomeIcon icon={faUserCircle} />
                    <p>Choose Avatar</p>
                </div>
                <div className="settings-card" onClick={openEmailModal}>
                    <FontAwesomeIcon icon={faEnvelope} />
                    <p>Change Email</p>
                </div>
                <div className="settings-card" onClick={openPasswordModal}>
                    <FontAwesomeIcon icon={faKey} />
                    <p>Change Password</p>
                </div>
                <div className="settings-card" onClick={resetUserScores}>
                    <FontAwesomeIcon icon={faRedoAlt} />
                    <p>Reset Scores</p>
                </div>
                <div className="settings-card" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <p>Logout</p>
                </div>
            </div>

            {/* modal forms that open and close */}
            <CustomModal
                isOpen={showNameModal}
                onClose={() => setShowNameModal(false)}
                message={nameForm}
            />
            <CustomModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                message={emailForm}
            />
            <CustomModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                message={passwordForm}
            />
            <CustomModal
                isOpen={showResetScoreModal}
                onClose={() => setShowResetScoreModal(false)}
                message={updateMessage}
            />
            <CustomModal 
                isOpen={showAvatarModal} 
                onClose={() => setShowAvatarModal(false)} 
                message={<AvatarSelection onClose={() => setShowAvatarModal(false)} />} />
            <Nav />
        </div>
    )};
export default Settings;