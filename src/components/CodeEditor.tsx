import React, { useRef, useEffect, useState, useContext } from 'react';
import 'trix/dist/trix';
import 'trix/dist/trix.css';
import { Button, Box } from '@mui/material';
import { Document } from '../utils/docs';
import 'core-js';
import { SocketContext } from '../utils/socket';
import Editor from '@monaco-editor/react';

export type AllowedUser = {
    _id: string;
    email: string;
};

const CodeEditor: React.FC<{ document: Document; editorRef: any }> = ({ document, editorRef }) => {
    const [editor, setEditor] = useState(null);
    const socket = useContext(SocketContext);
    const cursorPosRef = useRef([]);
    const sendToSocketRef = useRef(true);
    const [triggerSendToSocket, setTriggerSendToSocket] = useState({});
    const [terminalOutput, setTerminalOutput] = useState<string>('');
    const codeEditorRef = useRef(null);

    useEffect(() => {
        const content = editorRef.current;

        if (socket && editor) {
            let data = {
                documentId: document._id,
                content: content
            };
            socket.emit('docsData', data);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerSendToSocket]);

    useEffect(() => {
        if (socket) {
            socket.emit('create', document._id);
            socket.on('docsData', handleDocsData);
        }
        return () => {
            socket.off('docsData', handleDocsData);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);

    const textEditor = {
        padding: '0 24px'
    };

    const handleDocsData = (data: any) => {
        editorRef.current = data.content;
        sendToSocketRef.current = false;

        codeEditorRef.current.setValue(editorRef.current);
        // editor.element.innerHTML = editorRef.current;
        // sendToSocketRef.current = false;

        // cursorPosRef.current = editor.getSelectedRange();

        // sendToSocketRef.current = false;
        // editor.setSelectedRange(cursorPosRef.current);
    };

    const handleEditorDidMount = (editor: any, monaco: any) => {
        codeEditorRef.current = editor;
    };

    const handleEditorChange = (value: string, event: any) => {
        if (sendToSocketRef.current) {
            console.log('trigger');
            editorRef.current = value;
            setTriggerSendToSocket({});
        }

        sendToSocketRef.current = true;

        setEditor(true);
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
                console.log(decodedOutput);
            });
    };

    return (
        <React.Fragment>
            <Box style={textEditor}>
                <Editor
                    height="20vh"
                    width={'90%'}
                    defaultLanguage="javascript"
                    defaultValue={editorRef.current}
                    onMount={handleEditorDidMount}
                    onChange={handleEditorChange}
                    theme={'vs-dark'}
                />
            </Box>
            <Button
                aria-label={'execute'}
                size={'small'}
                variant={'contained'}
                // endIcon={<SaveIcon />}
                onClick={executeCode}
            >
                execute
            </Button>
            <Box
                data-testid="terminal"
                style={textEditor}
                sx={{
                    width: 300,
                    height: 300,
                    display: 'flex',
                    flexDirection: 'column',
                    whiteSpace: 'pre-wrap',
                    textAlign: 'left'
                }}
            >
                {terminalOutput}
            </Box>
        </React.Fragment>
    );
};

export default CodeEditor;
