import React from 'react';
import './App.css';
import Header from './components/Header';
import DocsView from './components/DocsView';
import { SocketContext, socket } from './utils/socket';

const App: React.FC = () => {
    return (
        <SocketContext.Provider value={socket}>
            <div className="App">
                <Header></Header>
                <DocsView></DocsView>
            </div>
        </SocketContext.Provider>
    );
};

export default App;
