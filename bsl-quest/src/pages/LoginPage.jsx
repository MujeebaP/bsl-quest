import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Teddy from '../components/Teddy';
import CustomModal from '../components/CustomModal';
import '../styles/login.scss';

const LoginPage = () => {
    const auth = getAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [teddyAction, setTeddyAction] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const navigate = useNavigate();

    // Add background colour to body
    useEffect(() => {
        document.body.classList.add('login-background'); 
        return () => {
            document.body.classList.remove('login-background');
        };
    }, []);

    // Sends password reset email
    const handlePasswordReset = () => {
        if (!email) {
            setModalMessage("Please enter your email address first.");
            setModalOpen(true);
            return;
        }
        sendPasswordResetEmail(auth, email)
            .then(() => {
                setModalMessage("Password reset email sent! Check your inbox.");
                setModalOpen(true);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setModalMessage(errorMessage); // Display the error message from Firebase
                setModalOpen(true);
            });
    };

    // Handles form submission
    const handleSubmit = (e) => {
        e.preventDefault();
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;   
                setTeddyAction('success');
                setModalMessage("Hooray! You're in!");
                setModalOpen(true);
                setTimeout(() => {
                    // alert("Logged in!");
                    navigate('/home');
                }, 2000);
        }) 
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            setTeddyAction('fail');
            setModalMessage("Whoops! Something's not right");
            setModalOpen(true);
            setTimeout(() => {}, 2000);
        });
    };

    return (
        <div className="unique-login-wrapper">
            <div className="ripple-background">
                <div className="circle xxlarge shade1"></div>
                <div className="circle xlarge shade2"></div>
                <div className="circle large shade3"></div>
                <div className="circle medium shade4"></div>
                <div className="circle small shade5"></div>

                <Teddy action={teddyAction} />

                <div className="loginForm">
                    <h2>Login</h2>
                    {/* input wrappers for the form fields */}
                    <form onSubmit={handleSubmit}>
                        <div className="input-wrapper">
                            <input 
                                type="text" 
                                id="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                                required 
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
                            />
                            <label htmlFor="password">Password</label>
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setPasswordVisible(!isPasswordVisible)}
                            >
                                <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
                            </button>
                        </div>

                        <div className="login-actions">
                            <button type="submit" className='submitButton'>Login</button>
                            <p className="account-switch">
                                Don't have an account? <span className="login-link" onClick={() => navigate('/signup')}>Register</span>
                            </p>
                            <p className="password-reset" onClick={handlePasswordReset}>
                                Forgot Password?
                            </p>
                        </div>

                    </form>
                <CustomModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} message={modalMessage} />
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
