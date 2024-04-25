import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Teddy from '../components/Teddy';
import CustomModal from '../components/CustomModal';
import '../styles/login.scss';

const SignUp = () => {
    const [fullName, setFullName] = useState(''); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [teddyAction, setTeddyAction] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const navigate = useNavigate();
    const [isInputFocused, setInputFocused] = useState(false);

    const auth = getAuth();

    // Handles form submission so that we can create a new user
    const handleSubmit = (e) => {
        e.preventDefault();
            // Check if passwords match
            if (password !== confirmPassword) {
                setTeddyAction('fail');
                setModalMessage("Oops! Your passwords don't match. Try again.");
                setModalOpen(true);
                return; // Prevent the form from being submitted
            }
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Account created & signed in
                setTeddyAction('success');
                setModalMessage("Hooray! Account created successfully!");
                setModalOpen(true);
                setTimeout(() => {
                    navigate('/home');
                }, 2000);
                return updateProfile(userCredential.user, {
                    displayName: fullName
                });
            })
            .catch((error) => {

                const errorMessage = error.message;
                setTeddyAction('fail');
                setModalMessage(errorMessage); // Display the error message from Firebase
                setModalOpen(true);
            });
    };

    // Update handleFocus and handleBlur methods
    const handleFocus = () => {
        setInputFocused(true);
    };
    
    const handleBlur = () => {
        setInputFocused(false);
    };

    // Add background colour to body
    useEffect(() => {
        document.body.classList.add('login-background'); 
        return () => {
            document.body.classList.remove('login-background');
        };
    }, []);

    return (
        // <div className="unique-login-wrapper">
        <div className={`unique-login-wrapper ${isInputFocused ? 'input-focused' : ''}`}>
            <div className="ripple-background">
                <div className="circle xxlarge shade1"></div>
                <div className="circle xlarge shade2"></div>
                <div className="circle large shade3"></div>
                <div className="circle medium shade4"></div>
                <div className="circle small shade5"></div>
                <Teddy action={teddyAction} />
                <div className="loginForm">
                    <h2>Register</h2>
                    <form onSubmit={handleSubmit}>
                        {/* input wrappers for form fields*/}
                        <div className="input-wrapper">
                            <input 
                                type="text" 
                                id="fullName" 
                                value={fullName} 
                                onChange={e => setFullName(e.target.value)}
                                required 
                                onFocus={handleFocus} onBlur={handleBlur}
                            />
                            <label htmlFor="fullName">First Name</label>
                        </div>

                        <div className={`input-wrapper ${email ? 'has-value' : ''}`}>
                            <input 
                                type="email" 
                                id="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                                required 
                                onFocus={handleFocus} onBlur={handleBlur}
                                
                            />
                            <label htmlFor="email">Email</label>
                        </div>
                        <div className="input-wrapper password-input">
                            <input 
                                type={isPasswordVisible ? "text" : "password"} 
                                id="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)}
                                required 
                                onFocus={handleFocus} onBlur={handleBlur}
                            />
                            <label htmlFor="password">Password</label>
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setPasswordVisible(!isPasswordVisible)}
                            >
                                <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
                                <span>Toggle Password Visibility</span>
                            </button>
                        </div>

                        <div className="input-wrapper password-input">
                            <input 
                                type={isConfirmPasswordVisible ? "text" : "password"} 
                                id="confirmPassword" 
                                value={confirmPassword} 
                                onChange={e => setConfirmPassword(e.target.value)}
                                required 
                                onFocus={handleFocus} onBlur={handleBlur}
                            />
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}
                            >
                                <FontAwesomeIcon icon={isConfirmPasswordVisible ? faEyeSlash : faEye} />
                                <span>Toggle Password Visibility</span>
                            </button>
                        </div>
                        <button type="submit" className='submitButton'>Sign Up</button>
                        <p className="account-switch">Already have an account? <span className="login-link" onClick={() => navigate('/login')}>Login</span></p>
                    </form>
                    <CustomModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} message={modalMessage} />
                </div>
            </div>
        </div>
    );
}

export default SignUp;
