import React, { useState, useEffect } from 'react';
import { generateMnemonic } from 'bip39';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Card, Container, Loading } from '@nextui-org/react';

interface CreateWalletFormProps {
    onCreateWallet: (password: string, seedPhrase: string) => void;
}

const CreateWalletForm: React.FC<CreateWalletFormProps> = ({ onCreateWallet, onGoBack }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [seedPhrase, setSeedPhrase] = useState(generateMnemonic().split(' '));
    const [showSeedPhrase, setShowSeedPhrase] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (showSeedPhrase) {
            timeout = setTimeout(() => setShowSeedPhrase(false), 4000);
        }
        return () => clearTimeout(timeout);
    }, [showSeedPhrase]);

    const isPasswordValid = password.length >= 8;
    const doPasswordsMatch = password === confirmPassword;

    const handleCreateWallet = () => {
        if (isPasswordValid && doPasswordsMatch) {
            setLoading(true);
            onCreateWallet(password, seedPhrase.join(' '));
        } else {
            alert('Password is too short or passwords do not match');
        }
    };

    return (
        <Container display="flex" justify="center" alignItems="center" style={{ height: '100vh' }}>
            <button onClick={onGoBack}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer'
                    }}>
                go back
            </button>
                <h2>Create Wallet</h2>
                <button
                    onMouseDown={() => setShowSeedPhrase(true)}
                    onMouseUp={() => setShowSeedPhrase(false)}
                    className="reveal-button"
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        marginBottom: '20px'
                    }}
                >
                    Press and Hold to Reveal
                </button>
                <div className="seed-container">
                    <div className="seed-phrase">
                        {seedPhrase.map((word, index) => (
                            <div key={index} className="seed-word">
                                {index + 1}. {showSeedPhrase ? word : '--------'}
                            </div>
                        ))}
                    </div>
                </div>
                <p className="warning">
                    Add a password to encrypt your wallet. This password will be required to access your wallet in the future.
                </p>
                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        color: '#000', // Ensure the text color is visible
                        border: isPasswordValid ? '1px solid green' : '1px solid red'
                    }}
                />
                <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        color: '#000', // Ensure the text color is visible
                        border: doPasswordsMatch ? '1px solid green' : '1px solid red'
                    }}
                />
                <button onClick={handleCreateWallet}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer'
                        }}>
                    {loading ? <Loading size="sm" /> : 'Create Wallet'}
                </button>
                <p className="warning">
                    Write down your secret phrase on paper and store it in a safe place. Do not create a digital copy, such as a screenshot or text file. Do not store it in an email or the cloud.
                </p>
        </Container>
    );
};

export default CreateWalletForm;
