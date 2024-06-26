import React from 'react';
import { Button } from '@nextui-org/react';
import Image from 'next/image';

interface ChoiceFormProps {
    onCreateNewWallet: () => void;
    onRestoreWallet: () => void;
}

const ChoiceForm: React.FC<ChoiceFormProps> = ({ onCreateNewWallet, onRestoreWallet }) => {
    return (
        <div style={{ textAlign: 'center' }}>
            <h2>Welcome to Pioneer</h2>
            <div style={{ borderRadius: '50%', overflow: 'hidden', width: '260px', height: '260px', margin: '0 auto' }}>
                <Image alt="accounts icon" src="/png/pioneerMan.png" width={260} height={260} />
            </div>
            <h4 style={{ fontStyle: 'italic' }}>exploring new worlds</h4>
            <Button onClick={onCreateNewWallet} css={{ margin: '10px', backgroundColor: '#007bff' }}>Create New Wallet</Button>
            <Button onClick={onRestoreWallet} css={{ margin: '10px', backgroundColor: '#007bff' }}>Restore Wallet from Seed</Button>
        </div>
    );
};

export default ChoiceForm;
