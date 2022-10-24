import React, { useState } from 'react';
import 'trix/dist/trix';
import 'trix/dist/trix.css';
import { Button, Box } from '@mui/material';
import 'core-js';
import Editor from '@monaco-editor/react';

export type AllowedUser = {
    _id: string;
    email: string;
};

const CodeEditor: React.FC<{ editorRef: any; handleEditorOnChange: any; codeEditorRef: any }> = ({
    editorRef,
    handleEditorOnChange,
    codeEditorRef
}) => {
    const [terminalOutput, setTerminalOutput] = useState<string>(null);

    const textEditor = {
        padding: '12px',
        borderRadius: '4px'
    };

    const handleEditorDidMount = (editor: any) => {
        codeEditorRef.current = editor;
    };

    const executeCode = () => {
        let data = {
            code: window.btoa(editorRef.current)
        };

        fetch('https://execjs.emilfolino.se/code', {
            body: JSON.stringify(data),
            headers: {
                'content-type': 'application/json'
            },
            method: 'POST'
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (result) {
                let decodedOutput = window.atob(result.data);
                setTerminalOutput(decodedOutput);
            });
    };

    return (
        <Box sx={{ margin: '24px', textAlign: 'left', borderRadius: '4px' }}>
            <React.Fragment>
                <Box style={textEditor} bgcolor="primary.main">
                    <Editor
                        height="30vh"
                        width={'100%'}
                        defaultLanguage="javascript"
                        defaultValue={editorRef.current}
                        onMount={handleEditorDidMount}
                        onChange={handleEditorOnChange}
                        theme={'vs-light'}
                    />
                    <Button
                        aria-label={'execute'}
                        size={'small'}
                        variant={'contained'}
                        onClick={executeCode}
                        sx={{ margin: '12px' }}
                        color={'warning'}
                    >
                        execute
                    </Button>
                    <Box
                        data-testid="terminal"
                        bgcolor="#fff"
                        sx={{
                            // width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            whiteSpace: 'pre-wrap',
                            textAlign: 'left',
                            padding: '24px',
                            borderRadius: '4px'
                        }}
                    >
                        {'>>>'}
                        <br></br>
                        {terminalOutput}
                    </Box>
                </Box>
            </React.Fragment>
        </Box>
    );
};

export default CodeEditor;
