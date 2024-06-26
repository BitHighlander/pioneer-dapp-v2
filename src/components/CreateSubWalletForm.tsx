import React, { useState, useEffect } from 'react';
import { generateMnemonic, entropyToMnemonic } from 'bip39';
import { Card, Container, Loading } from '@nextui-org/react';
import { usePioneer } from '@coinmasters/pioneer-react';
import * as bip39 from 'bip39';

// Helper function to generate seed from hash
const generateSeedFromHash = (hash: string) => {
    // Remove 0x prefix if it exists and ensure the hash is of the correct length (32 hex characters)
    const cleanedHash = hash.startsWith('0x') ? hash.slice(2) : hash;
    const trimmedHash = cleanedHash.slice(0, 32);

    // Convert hash to random bytes
    const randomBytes = Buffer.from(trimmedHash, 'hex');

    if (randomBytes.length !== 16) {
        throw new Error(`Entropy has incorrect length: expected 16 bytes, got ${randomBytes.length}`);
    }

    // Generate mnemonic from entropy
    const mnemonic = bip39.entropyToMnemonic(randomBytes.toString('hex'));
    return mnemonic;
};

interface CreateSubWalletFormProps {
    onCreateWallet: (password: string, seedPhrase: string) => void;
    onGoBack: () => void;
}

const CreateSubWalletForm: React.FC<CreateSubWalletFormProps> = ({ onCreateWallet, onGoBack }) => {
    const { state } = usePioneer();
    const { app } = state;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
    const [showSeedPhrase, setShowSeedPhrase] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSigning, setIsSigning] = useState(false);

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

    const handleGenerateSeedPhrase = async () => {
        if (app) {
            try {
                console.log('*** app: ', app);
                console.log('*** app: ', app.swapKit);
                const wallet = await app.swapKit.getWallet('ETH');
                console.log('*** wallet: ', wallet);

                const WALLET_STRING = 'SUBWALLET:PIONEER:0';
                const hash = await wallet.signMessage(WALLET_STRING);
                console.log('*** hash: ', hash);

                const seed = generateSeedFromHash(hash);
                console.log('*** seed: ', seed);

                // Split seed into an array of words
                setSeedPhrase(seed.split(' '));
                setIsSigning(false);

            } catch (error) {
                console.error('Error signing message:', error);
                setIsSigning(false);
            }
        } else {
            alert('App not loaded, cannot generate seed phrase.');
        }
    };

    useEffect(() => {
        handleGenerateSeedPhrase();
    }, [app]);

    return (
        <Container display="flex" justify="center" alignItems="center" style={{ height: '100vh' }}>
            <button
                onClick={onGoBack}
                style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '20px',
                }}
            >
                Go Back
            </button>
            <h2>Create Sub Wallet</h2>
            {isSigning ? (
                <Loading size="lg" />
            ) : (
                <>
                    <img src="https://pioneers.dev/coins/keepkey.png" alt="KeepKey" style={{ width: '100px', margin: '20px auto' }} />
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
                            marginBottom: '20px',
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
                            border: isPasswordValid ? '1px solid green' : '1px solid red',
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
                            border: doPasswordsMatch ? '1px solid green' : '1px solid red',
                        }}
                    />
                    <button
                        onClick={handleCreateWallet}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        {loading ? <Loading size="sm" /> : 'Create Wallet'}
                    </button>
                    <p className="warning">
                        Write down your secret phrase on paper and store it in a safe place. Do not create a digital copy, such as a screenshot or text file. Do not store it in an email or the cloud.
                    </p>
                    <p className="warning">
                        Remember, you do NOT need to save this seed and may generate it anytime from your KeepKey. However, saving it allows you to use it without having the KeepKey connected. It is best practice to wipe and not leave private keys in the browser environment for long periods of time if not in use.
                    </p>
                </>
            )}
        </Container>
    );
};

export default CreateSubWalletForm;
