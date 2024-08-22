import React, { useState } from 'react';
import URLAccordion from './components/URLAccordion';  // Adjust the import path as necessary
import './App.css';

const App: React.FC = () => {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Welcome to My App</h1>
                <URLAccordion />
            </header>
        </div>
    );
};

export default App;
