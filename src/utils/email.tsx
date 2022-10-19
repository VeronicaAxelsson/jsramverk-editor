const API_URL = 'http://localhost:1337';

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

export type EmailData = {
    inviterEmail?: string;
    email?: string;
    documentTitle?: string;
};

export const emailModel = {
    sendEmailInvite: async (token: string, data: EmailData) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        const response = await fetchApi(`${API_URL}/email`, token, requestOptions);
        if (response.status === 200) {
            const result = await response.json();
            console.log(result);

            return result;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    }
};

// export defaemailuserModel;
