import { User } from './auth';

const API_URL = 'https://jsramverk-editor-veax20.azurewebsites.net';

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

export const userModel = {
    getAllUsers: async (token: string) => {
        const response = await fetchApi(`${API_URL}/user`, token);
        if (response.status === 200) {
            const result: User[] = await response.json();
            return result;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    },
    getUser: async (userId: string, token: string) => {
        const response = await fetchApi(`${API_URL}/user/${userId}`, token);
        if (response.status === 200) {
            const result: User = await response.json();
            return result;
        } else {
            throw Error(`Request failed ${response.status}`);
        }
    }
};

// export default userModel;
