import React, { useContext } from 'react';
import './App.css';
import Header from './components/Header';
import DocsView from './components/DocsView';
import SignIn from './components/SignIn';
import { SocketContext, socket } from './utils/socket';
import useAuth from './utils/auth';

const App: React.FC = () => {
    const { user } = useAuth();

    return (
        <SocketContext.Provider value={socket}>
            <div className="App">
                <Header></Header>
                {user?.token ? <DocsView /> : <SignIn />}
            </div>
        </SocketContext.Provider>
    );
};

export default App;
