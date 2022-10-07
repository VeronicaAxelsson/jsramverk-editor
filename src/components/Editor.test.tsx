import React from 'react';
import { act } from 'react-dom/test-utils';
import ReactDOM from 'react-dom/client';
import Editor from './Editor';
import { render, screen, fireEvent } from '@testing-library/react';
import { docsModel } from '../utils/docs';
import { userModel } from '../utils/user';
import { expect, jest, test } from '@jest/globals';
import { AuthContext, User } from '../utils/auth';

let container: any = null;
beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
});

afterEach(() => {
    jest.restoreAllMocks();
    document.body.removeChild(container);
    container = null;
});

const fakeDocumentId = '1';

const fakeUserId = '2';
const fakeToken = '3';

const fakeDocument = {
    _id: fakeDocumentId,
    title: 'title',
    content: 'content',
    updatedAt: new Date(),
    owner: fakeUserId,
    allowed_editors: ['test@test.se']
};

const fakeUser: User = {
    _id: fakeUserId,
    email: 'test@test.se',
    token: fakeToken
};

const fakeUsers: User[] = [fakeUser];

const saveData = {
    title: 'title',
    content: 'content'
};

describe('Editor', () => {
    test('Render Title in textfield and Content in editor', async () => {
        //I Editor-vyn ska documentets titel visas i text-fältet och dokumentets innehåll i trix-editorn.
        jest.spyOn(docsModel, 'getDoc').mockResolvedValue(fakeDocument);
        jest.spyOn(userModel, 'getAllUsers').mockResolvedValue(fakeUsers);

        await act(async () => {
            ReactDOM.createRoot(container).render(
                <AuthContext.Provider value={{ user: fakeUser }}>
                    <Editor documentId={fakeDocumentId} />
                </AuthContext.Provider>
            );
        });
        // @ts-ignore
        expect(screen.getByRole('textbox', { name: /title-textbox/i }).value).toContain(
            fakeDocument.title
        );
        // @ts-ignore
        expect(screen.getByRole('textbox', { name: '' }).value).toContain(fakeDocument.content);
    });

    test('Click save and saveDoc should be called', async () => {
        //Då användaren klickar på “save” ska dokumentet sparas.
        jest.spyOn(docsModel, 'getDoc').mockResolvedValue(fakeDocument);
        jest.spyOn(userModel, 'getAllUsers').mockResolvedValue(fakeUsers);

        const spySaveDoc = jest.spyOn(docsModel, 'saveDoc').mockResolvedValue(fakeDocument);
        await act(async () => {
            ReactDOM.createRoot(container).render(
                <AuthContext.Provider value={{ user: fakeUser }}>
                    <Editor documentId={fakeDocumentId} />
                </AuthContext.Provider>
            );
        });

        const button = screen.getByRole('button', { name: 'save' });
        fireEvent.click(button);

        expect(spySaveDoc).toHaveBeenCalledTimes(1);
        expect(spySaveDoc).toHaveBeenCalledWith(fakeDocumentId, fakeToken, saveData);
    });
});
