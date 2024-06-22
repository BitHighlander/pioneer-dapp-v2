import React from 'react';
import Navigation from '@/components/Navigation';
import RouteTransition from '@/components/RouteTransition';
import { Card } from '@nextui-org/react';

interface Props {
    initialized: boolean;
    children: React.ReactNode | React.ReactNode[];
    handleLogout: () => void;
}

const Layout: React.FC<Props> = ({ children, initialized, handleLogout }) => {
    return (
        <React.Fragment>
            <RouteTransition>
                <Card.Body
                    css={{
                        display: 'block',
                        paddingLeft: 2,
                        paddingRight: 2,
                        paddingBottom: '40px',
                        '@xs': {
                            padding: '20px',
                            paddingBottom: '40px',
                        },
                    }}
                >
                    {children}
                </Card.Body>
            </RouteTransition>

            <Card.Footer
                css={{
                    height: '85px',
                    minHeight: '85px',
                    position: 'sticky',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    boxShadow: '0 -30px 20px #111111',
                    backgroundColor: '#111111',
                    zIndex: 200,
                    bottom: 0,
                    left: 0,
                }}
            >
                <Navigation />
            </Card.Footer>
        </React.Fragment>
    );
};

export default Layout;
