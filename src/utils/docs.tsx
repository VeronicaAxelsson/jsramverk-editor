const API_URL = 'https://jsramverk-editor-veax20.azurewebsites.net';

export type DocumentType = 'text' | 'code';

export type Comment = {
    rangeIndex: number;
    rangeLength: number;
    comment: string;
    commenter: string;
    date: Date;
};

export type Document = {
    _id?: string;
    title?: string;
    content?: string;
    updatedAt?: Date;
    owner?: string;
    type?: DocumentType;
    ownerEmail?: string;
    allowed_editors?: string[];
    comments?: Comment[];
};

type GraphqlResponse = {
    data: {
        documents?: Document[];
    };
};

const fetchApi = async (
    input: RequestInfo | URL,
    token: string,
    init?: RequestInit | undefined
) => {
    const params = {
        ...init,
        headers: {
            'x-access-token': token,
            ...init?.headers
        }
    };

    const response = await fetch(input, params);
    return response;
};

export const docsModel = {
    getAllDocs: async (token: string) => {
        const response = await fetchApi(`${API_URL}/docs`, token);

        if (response.status === 200) {
            const result: GraphqlResponse = await response.json();
            return result.data;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    },
    getOwnedDocs: async (userId: string, token: string) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `{ documents(owner: "${userId}" ) { _id owner ownerEmail content title updatedAt allowed_editors }}`
            })
        };

        const response = await fetchApi(`${API_URL}/graphql`, token, requestOptions);

        if (response.status === 200) {
            const result: GraphqlResponse = await response.json();
            return result.data.documents;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    },
    getEditorDocs: async (userId: string, token: string) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `{ documents(allowedEditor: "${userId}" ) { _id owner ownerEmail content title updatedAt allowed_editors }}`
            })
        };

        const response = await fetchApi(`${API_URL}/graphql`, token, requestOptions);

        if (response.status === 200) {
            const result: GraphqlResponse = await response.json();
            return result.data.documents;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    },
    getDoc: async (documentId: string, token: string) => {
        const response = await fetchApi(`${API_URL}/docs/${documentId}`, token);

        if (response.status === 200) {
            const result: Document = await response.json();
            return result;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    },
    saveDoc: async (documentId: string, token: string, data: Document) => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        const response = await fetchApi(`${API_URL}/docs/${documentId}`, token, requestOptions);
        if (response.status === 200) {
            const result = await response.json();
            return result;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    },
    createDoc: async (data: Document, token: string) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        const response = await fetchApi(`${API_URL}/docs`, token, requestOptions);

        if (response.status === 201) {
            const result = await response.json();
            return result;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    },
    deleteDoc: async (documentId: string, token: string) => {
        const requestOptions = {
            method: 'DELETE'
        };
        const response = await fetchApi(`${API_URL}/docs/${documentId}`, token, requestOptions);

        if (response.status === 200) {
            const result = await response.json();
            return result;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    },

    addEditor: async (token: string, data: any) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        const response = await fetchApi(`${API_URL}/docs/addEditor`, token, requestOptions);

        if (response.status === 200) {
            const result = await response.json();
            return result;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    },

    removeEditor: async (token: string, data: any) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        const response = await fetchApi(`${API_URL}/docs/removeEditor`, token, requestOptions);

        if (response.status === 200) {
            const result = await response.json();
            return result;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    }
};
