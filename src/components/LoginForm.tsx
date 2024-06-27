import React, { useState } from 'react';
import { Card } from '@nextui-org/react';
import Image from 'next/image';

interface LoginFormProps {
    onLogin: (password: string) => void;
    createNewWallet: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, clearSeed, createNewWallet }: any) => {
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        onLogin(password);
    };

    const handleCreateNewWallet = () => {
        clearSeed();
    };

    return (
<div>
    <h2>Pioneer</h2>
    <h4 style={{ fontStyle: 'italic' }}>exploring new worlds</h4>

    <div style={{ borderRadius: '50%', overflow: 'hidden', width: '260px', height: '260px', margin: '0 auto' }}>
        <Image alt="accounts icon" src="/png/pioneerMan.png" width={260} height={260} />
    </div>
    <br />

    <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            color: '#000',
            backgroundColor: '#fff'
        }}
    />
    <button
        onClick={handleLogin}
        style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
        }}
    >
        Submit
    </button>
    <br />
    <div  onClick={handleCreateNewWallet} style={{ marginTop: '10px', color: 'blue', fontSize: '12px' }}>
        Wipe Wallet?
    </div>
</div>)

};

export default LoginForm;
