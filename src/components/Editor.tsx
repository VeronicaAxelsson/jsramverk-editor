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
    const [documentChange, setDocumentChange] = useState({});
    const [editor, setEditor] = useState(null);
    const socket = useContext(SocketContext);
    const cursorPosRef = useRef([]);

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
            let data = {
                documentId: documentId,
                content: content
            };
            socket.emit('docsData', data);
        }
    }, [documentChange]);

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
        cursorPosRef.current = editor.getSelectedRange();

        editorRef.current = data.content;
        editor.element.innerHTML = editorRef.current;

        editor.setSelectedRange(cursorPosRef.current);
    };

    const handleChange = (html: string, text: string) => {
        setDocumentChange({});
        editorRef.current = html;
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
