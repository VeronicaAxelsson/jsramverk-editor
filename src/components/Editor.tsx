import React, { useRef, useEffect, useState, useContext } from 'react';
import 'trix/dist/trix';
import 'trix/dist/trix.css';
import { TrixEditor } from 'react-trix';
import { Toolbar, Button, TextField, Grid } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { docsModel, Document } from '../utils/docs';
import 'core-js';
import { SocketContext } from '../utils/socket';

const Editor: React.FC<{ documentId: string }> = ({ documentId }) => {
    const [loadingDocument, setLoadingDocument] = useState(true);
    const editorRef = useRef(null);
    const titleRef = useRef(null);
    const [editor, setEditor] = useState(null);
    const socket = useContext(SocketContext);
    const cursorPosRef = useRef([]);
    const sendToSocketRef = useRef(true);
    const [triggerSendToSocket, setTriggerSendToSocket] = useState({});
    // const triggerTrix = useRef(true);

    useEffect(() => {
        (async () => {
            const document: Document = await docsModel.getDoc(documentId);
            editorRef.current = document.content;
            titleRef.current = document.title;
            setLoadingDocument(false);
        })();
    }, [documentId]);

    useEffect(() => {
        const content = editorRef.current;

        if (socket && editor) {
            console.log('emitting');

            let data = {
                documentId: documentId,
                content: content
            };
            socket.emit('docsData', data);
            console.log(sendToSocketRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerSendToSocket]);

    useEffect(() => {
        if (socket) {
            socket.emit('create', documentId);
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

    let mergeTags = [
        {
            trigger: '@',
            tags: [
                { name: 'Dominic St-Pierre', tag: '@dominic' },
                { name: 'John Doe', tag: '@john' }
            ]
        }
    ];

    const handleEditorReady = (editor: any) => {
        setEditor(editor);
    };

    const handleDocsData = (data: any) => {
        console.log('writing');

        editorRef.current = data.content;
        sendToSocketRef.current = false;

        editor.element.innerHTML = editorRef.current;
        sendToSocketRef.current = false;

        cursorPosRef.current = editor.getSelectedRange();

        sendToSocketRef.current = false;
        editor.setSelectedRange(cursorPosRef.current);
    };

    const handleChange = (html: string, text: string) => {
        // if (triggerTrix.current) {

        if (sendToSocketRef.current) {
            console.log('trigger');
            editorRef.current = html;
            setTriggerSendToSocket({});
        }

        sendToSocketRef.current = true;
        // }

        // triggerTrix.current = !triggerTrix.current;
    };

    const handleTitleChange = (event: any) => {
        titleRef.current = event.currentTarget.value;
    };

    const saveText = async () => {
        const data = {
            content: editorRef.current,
            title: titleRef.current
        };
        await docsModel.saveDoc(documentId, data);
    };

    return (
        <React.Fragment>
            {!loadingDocument && (
                <Toolbar>
                    <Grid container spacing={1}>
                        <Grid item xs textAlign={'left'}>
                            <TextField
                                inputProps={{
                                    'aria-label': 'title-textbox'
                                }}
                                variant={'standard'}
                                size={'small'}
                                onChange={handleTitleChange}
                                defaultValue={titleRef.current}
                            ></TextField>
                        </Grid>
                        <Grid item xs={'auto'} justifyContent="flex-end">
                            <Button
                                aria-label={'save'}
                                size={'small'}
                                variant={'contained'}
                                endIcon={<SaveIcon />}
                                onClick={saveText}
                            >
                                Save
                            </Button>
                        </Grid>
                    </Grid>
                </Toolbar>
            )}
            <div style={textEditor}>
                {!loadingDocument && (
                    <TrixEditor
                        className="trix-text-editor"
                        onChange={handleChange}
                        onEditorReady={handleEditorReady}
                        mergeTags={mergeTags}
                        value={editorRef.current}
                        aria-label={'trix-textbox'}
                    />
                )}
            </div>
        </React.Fragment>
    );
};

export default Editor;
