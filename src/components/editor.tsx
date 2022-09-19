import React, { useRef, useEffect, useState } from 'react';
import 'trix/dist/trix';
import 'trix/dist/trix.css';
import { TrixEditor } from 'react-trix';
import { Toolbar, Button, TextField, Grid } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { docsModel, Document } from '../utils/docs';
import { useParams } from 'react-router-dom';
import { Header } from './Header';

const Editor = () => {
    const { documentId } = useParams();
    const [loadingDocument, setLoadingDocument] = useState(true);
    const editorRef = useRef(null);
    const titleRef = useRef(null);

    useEffect(() => {
        (async () => {
            const document: Document = await docsModel.getDoc(documentId);
            editorRef.current = document.content;
            titleRef.current = document.title;
            setLoadingDocument(false);
        })();
    }, [documentId]);

    const textEditor = {
        padding: '0 24px',
    };

    const mergeTags = [
        {
            trigger: '@',
            tags: [
                { name: 'Dominic St-Pierre', tag: '@dominic' },
                { name: 'John Doe', tag: '@john' },
            ],
        },
    ];

    // const handleEditorReady = (editor: any) => {
    //     // this is a reference back to the editor if you want to
    //     // do editing programatically
    // };

    const handleChange = (html: string) => {
        editorRef.current = html;
    };

    const handleTitleChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        titleRef.current = event.currentTarget.value;
    };

    const saveText = async () => {
        const data = {
            content: editorRef.current,
            title: titleRef.current,
        };
        await docsModel.saveDoc(documentId, data);
    };

    return (
        <React.Fragment>
            <Header></Header>
            {!loadingDocument && (
                <Toolbar>
                    <Grid container spacing={1}>
                        <Grid item xs textAlign={'left'}>
                            <TextField
                                inputProps={{
                                    'aria-label': 'title-textbox',
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
                        // onEditorReady={handleEditorReady}
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
