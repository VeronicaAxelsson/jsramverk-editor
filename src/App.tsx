import React, {createContext, useContext} from 'react';
import './App.css';


import { Editor } from './components/editor';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import theme from './themes/index'

const App: React.FC = () => {


  return (
    <ThemeProvider theme={theme}>
    <div className="App">
      <Editor />
    </div>
    </ThemeProvider>
  );
};

export default App;
