import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Card, Container, Loading } from '@nextui-org/react';

interface RestoreWalletFormProps {
    onRestoreWallet: (password: string, seedPhrase: string) => void;
    onGoBack: () => void;
}

const RestoreWalletForm: React.FC<RestoreWalletFormProps> = ({ handleCreateWallet, onGoBack }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [seedPhrase, setSeedPhrase] = useState(Array(12).fill(''));
    const [showSeedPhrase, setShowSeedPhrase] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const isPasswordValid = password.length >= 8;
    const doPasswordsMatch = password === confirmPassword;
    const isSeedPhraseComplete = seedPhrase.every(word => word.trim().length > 0);

    const handlePasteSeedPhrase = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const clipboardData = e.clipboardData.getData('Text');
        const words = clipboardData.split(/\s+/);
        if (words.length <= 12) {
            const newSeedPhrase = Array(12).fill('');
            words.forEach((word, index) => {
                newSeedPhrase[index] = word;
            });
            setSeedPhrase(newSeedPhrase);
        } else {
            alert('Please paste a maximum of 12 words.');
        }
    };

    const handleRestoreWallet = () => {
        if (isPasswordValid && doPasswordsMatch && isSeedPhraseComplete) {
            setLoading(true);
            handleCreateWallet(password, seedPhrase.join(' '));
        } else {
            alert('Please fill out all fields correctly.');
        }
    };

    return (
        <Container display="flex" justify="center" alignItems="center" style={{ height: '100vh' }}>
            <Card css={{ mw: "400px", p: "$6", textAlign: 'center' }}>
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
                <h2>Restore Wallet</h2>
                <div className="seed-container">
                    {seedPhrase.map((word, index) => (
                        <input
                            key={index}
                            type={showSeedPhrase ? "text" : "password"}
                            value={word}
                            onChange={(e) => {
                                const newSeedPhrase = [...seedPhrase];
                                newSeedPhrase[index] = e.target.value;
                                setSeedPhrase(newSeedPhrase);
                            }}
                            onPaste={index === 0 ? handlePasteSeedPhrase : undefined}
                            placeholder={`Word ${index + 1}`}
                            autoComplete="off"
                            className="seed-input"
                            style={{
                                width: '100%',
                                margin: '4px 0',
                                padding: '10px',
                                borderRadius: '4px',
                                textAlign: 'center',
                                color: '#000',
                                border: word.trim().length > 0 ? '1px solid green' : '1px solid red'
                            }}
                        />
                    ))}
                    <button
                        onMouseDown={() => setShowSeedPhrase(true)}
                        onMouseUp={() => setShowSeedPhrase(false)}
                        onMouseLeave={() => setShowSeedPhrase(false)}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        {showSeedPhrase ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                <p className="warning">
                    Add a password to encrypt your wallet. This password will be required to access your wallet in the future.
                </p>
                <div style={{ position: 'relative' }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        className="input"
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            marginBottom: '10px',
                            color: '#000',
                            border: isPasswordValid ? '1px solid green' : '1px solid red'
                        }}
                    />
                    <button
                        onMouseDown={() => setShowPassword(true)}
                        onMouseUp={() => setShowPassword(false)}
                        onMouseLeave={() => setShowPassword(false)}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="input"
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        color: '#000',
                        border: doPasswordsMatch ? '1px solid green' : '1px solid red'
                    }}
                />
                <button onClick={handleRestoreWallet}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer'
                        }}>
                    {loading ? <Loading size="sm" /> : 'Restore Wallet'}
                </button>
                <p className="warning">
                    Ensure that you have correctly entered your seed phrase. This is required to restore your wallet.
                </p>
            </Card>
        </Container>
    );
};

export default RestoreWalletForm;
