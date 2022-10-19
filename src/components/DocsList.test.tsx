import React from 'react';
import { act } from 'react-dom/test-utils';
import ReactDOM from 'react-dom/client';
import DocsView from './DocsView';
import { render, screen } from '@testing-library/react';
import { docsModel } from '../utils/docs';
import { AuthContext, User } from '../utils/auth';

let container: any = null;
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement('div');
    document.body.appendChild(container);
});

afterEach(() => {
    // cleanup on exiting
    jest.restoreAllMocks();
    document.body.removeChild(container);
    container = null;
});

const fakeDocumentId = '1';

const fakeUserId = '2';
const fakeToken = '3';

const fakeUser: User = {
    _id: fakeUserId,
    email: 'test@test.se',
    token: fakeToken
};

const fakeDocument = {
    _id: fakeDocumentId,
    title: 'title',
    content: 'content',
    updatedAt: new Date(),
    owner: fakeUserId,
    ownerEmail: 'test@test.se',
    allowed_editors: ['test@test.se']
};

const fakeDocuments = [fakeDocument];

describe('DocsList', () => {
    //DocsList ska innehålla en lista med titel, datum (format YYYY-MM-DD HH:MM), edit-knapp och delete-knapp, för alla existerande dokument.
    test('Fetch and show all documents in the list.', async () => {
        jest.spyOn(docsModel, 'getOwnedDocs').mockResolvedValue(fakeDocuments);
        jest.spyOn(docsModel, 'getEditorDocs').mockResolvedValue(fakeDocuments);

        await act(() => {
            ReactDOM.createRoot(container).render(
                <AuthContext.Provider value={{ user: fakeUser }}>
                    <DocsView></DocsView>
                </AuthContext.Provider>
            );
        });

        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getAllByTestId('listItemText')).toHaveLength(1);
        expect(screen.getByText(/title/i).textContent).toBeInTheDocument;
        expect(screen.getByText(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i).textContent).toBeInTheDocument;
        expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(1);
        expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(1);
    });
});
