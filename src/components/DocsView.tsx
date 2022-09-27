import React, { useEffect, useState } from 'react';
import { docsModel, Document } from '../utils/docs';
import DocsList from './DocsList';
import Editor from './Editor';

const DocsView = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [documentId, setDocumentId] = useState<string | undefined>(undefined);
    const [state, updateState] = useState<object>({});

    const handleCreate = async () => {
        const data = {
            content: '',
            title: 'untitled'
        };
        const doc = await docsModel.createDoc(data);
        setDocumentId(doc._id);
    };

    const handleOpenDocument = (documentId: string) => {
        setDocumentId(documentId);
    };

    useEffect(() => {
        (async () => {
            const allDocs = await docsModel.getAllDocs();
            setDocuments(allDocs);
        })();
    }, [state]);

    return (
        <React.Fragment>
            {documents && !documentId && (
                <DocsList
                    documents={documents}
                    handleCreate={handleCreate}
                    handleEdit={handleOpenDocument}
                    updateState={updateState}
                ></DocsList>
            )}
            {documentId && <Editor documentId={documentId}></Editor>}
        </React.Fragment>
    );
};

export default DocsView;
