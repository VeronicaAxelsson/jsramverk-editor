const API_URL = 'http://localhost:1337';

export type Document = {
    _id?: string;
    title?: string;
    content?: string;
    updatedAt?: Date;
    owner?: string;
    allowed_editors?: string[];
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
            const result: Document[] = await response.json();
            return result;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    },
    getOwnedDocs: async (userId: string, token: string) => {
        const response = await fetchApi(`${API_URL}/docs?owner=${userId}`, token);

        if (response.status === 200) {
            const result: Document[] = await response.json();
            return result;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    },
    getEditorDocs: async (userId: string, token: string) => {
        const response = await fetchApi(`${API_URL}/docs?allowed_editor=${userId}`, token);

        if (response.status === 200) {
            const result: Document[] = await response.json();
            return result;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    },
    getDoc: async (documentId: string, token: string) => {
        const response = await fetchApi(`${API_URL}/docs/${documentId}`, token);
        // const response = await fetch(`${API_URL}/docs/${documentId}`);

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
        console.log(response);

        if (response.status === 200) {
            const result = await response.json();
            return result;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    },

    removeEditor: async (token: string, data: any) => {
        console.log(data);

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        const response = await fetchApi(`${API_URL}/docs/removeEditor`, token, requestOptions);
        console.log(response);

        if (response.status === 200) {
            const result = await response.json();
            return result;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    }
};
