import React from 'react';
import './App.css';
import { Editor } from './components/Editor';
import { DocsList } from './components/DocsList';
import { Routes, Route } from 'react-router-dom';

const App: React.FC = () => {
    return (
            <div className="App">
                <Routes>
                    <Route path={`/`} element={<DocsList />} />
                    <Route path={`/:documentId`} element={<Editor />} />
                </Routes>
            </div>
    );
};

export default App;
