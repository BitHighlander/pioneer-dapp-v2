import React, { useState } from 'react';
import { Card } from '@nextui-org/react';
import Image from 'next/image';

interface LoginFormProps {
    onLogin: (password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, createNewWallet }) => {
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        onLogin(password);
    };

    const handleCreateNewWallet = () => {
        createNewWallet();
    };

    return (
        <Card css={{ padding: '20px', maxWidth: '400px', margin: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <Card.Body css={{ textAlign: 'center' }}>
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
                        color: '#000', // Ensure the text color is visible
                        backgroundColor: '#fff' // Ensure the background color is white
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
                <br/>
                {/*<button*/}
                {/*    onClick={handleCreateNewWallet}*/}
                {/*    style={{*/}
                {/*        width: '100%',*/}
                {/*        padding: '10px',*/}
                {/*        borderRadius: '4px',*/}
                {/*        backgroundColor: '#007bff',*/}
                {/*        color: '#fff',*/}
                {/*        border: 'none',*/}
                {/*        cursor: 'pointer'*/}
                {/*    }}*/}
                {/*>*/}
                {/*    Create New Wallet*/}
                {/*</button>*/}
            </Card.Body>
        </Card>
    );
};

export default LoginForm;