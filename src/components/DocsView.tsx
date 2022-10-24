import React, { useEffect, useState } from 'react';
import { docsModel, Document, DocumentType } from '../utils/docs';
import DocsList from './DocsList';
import Editor from './Editor';
import useAuth from '../utils/auth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Tooltip, Grid } from '@mui/material';
import ClipLoader from 'react-spinners/ClipLoader';

type DocumentLists = {
    owner: Document[];
    editor: Document[];
};

const DocsView = () => {
    const [documents, setDocuments] = useState<DocumentLists>();
    const [documentId, setDocumentId] = useState<string | undefined>(undefined);
    const [state, updateState] = useState<object>({});
    const { user } = useAuth();

    const handleCreate = async (type?: DocumentType) => {
        let documentType: DocumentType = 'text';

        if (type) {
            documentType = type;
        }
        const data = {
            content: '',
            title: 'untitled',
            owner: user._id,
            ownerEmail: user.email,
            type: documentType
        };
        const doc = await docsModel.createDoc(data, user.token);
        setDocumentId(doc._id);
    };

    const handleOpenDocument = (documentId: string) => {
        setDocumentId(documentId);
    };

    useEffect(() => {
        (async () => {
            const ownedDocs = await docsModel.getOwnedDocs(user._id, user.token);
            console.log(ownedDocs);

            const editorDocs = await docsModel.getEditorDocs(user.email, user.token);

            setDocuments({ owner: ownedDocs, editor: editorDocs });
        })();
    }, [state, documentId, user]);

    return (
        <React.Fragment>
            {!documents && <ClipLoader
                    color={'#00887a'}
                    loading={true}
                    size={50}
                    aria-label="Loading Spinner"
                    cssOverride={{marginTop: '64px'}}
                />}
            {documents && !documentId && (
                <DocsList
                    documents={documents}
                    handleCreate={handleCreate}
                    handleEdit={handleOpenDocument}
                    updateState={updateState}
                ></DocsList>
            )}
            {documentId && (
                <React.Fragment>
                    <Grid container sx={{ padding: '24px 0 0 24px' }}>
                        <Grid
                            item
                            sx={{ flexGrow: 0 }}
                            justifyContent="flex-start"
                            alignItems="center"
                        >
                            <Tooltip title="Go back">
                                <IconButton onClick={() => setDocumentId(undefined)} sx={{ p: 0 }}>
                                    <ArrowBackIcon fontSize="large" sx={{ float: 'left' }} />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                    <Editor documentId={documentId}></Editor>
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

export default DocsView;
