const URL = 'https://jsramverk-editor-veax20.azurewebsites.net';

export type Document = {
    _id?: string;
    title?: string;
    content?: string;
    updatedAt?: Date;
};

export const docsModel = {
    getAllDocs: async () => {
        const response = await fetch(`${URL}/docs`);
        const result: Document[] = await response.json();

        return result;
    },
    getDoc: async (documentId: string) => {
        const response = await fetch(`${URL}/docs/${documentId}`);
        const result: Document = await response.json();

        return result;
    },
    saveDoc: async (documentId: string, data: Document) => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        const response = await fetch(`${URL}/docs/${documentId}`, requestOptions);
        const result = await response.json();

        return result;
    },
    createDoc: async (data: Document) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        const response = await fetch(`${URL}/docs`, requestOptions);
        const result = await response.json();

        return result;
    },
    deleteDoc: async (documentId: string) => {
        const requestOptions = {
            method: 'DELETE'
        };
        const response = await fetch(`${URL}/docs/${documentId}`, requestOptions);
        const result = await response.json();

        return result;
    }
};
