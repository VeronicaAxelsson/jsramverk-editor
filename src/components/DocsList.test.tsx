import React from 'react';
import { act } from 'react-dom/test-utils';
import ReactDOM from 'react-dom/client';
import DocsList from './DocsList';
import { BrowserRouter as Router } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { docsModel } from '../utils/docs';

let container: HTMLElement = null;
describe('docsList', () => {
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

    const fakeDocuments = [
        {
            _id: 'documentId',
            title: 'title',
            content: 'content',
            updatedAt: new Date(),
        },
    ];
    //DocsList ska innehålla en lista med titel, datum (format YYYY-MM-DD HH:MM), edit-knapp och delete-knapp, för alla existerande dokument.
    test('Fetch and show all documents in the list.', async () => {
        jest.spyOn(docsModel, 'getAllDocs').mockResolvedValue(fakeDocuments);

        await act(() => {
            ReactDOM.createRoot(container).render(
                <Router>
                    <DocsList />
                </Router>,
            );
        });

        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getAllByTestId('listItemText')).toHaveLength(1);
        expect(screen.getByText(/title/i).textContent).toBeInTheDocument;
        expect(
            screen.getByText(
                /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]/i,
            ).textContent,
        ).toBeInTheDocument;
        expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(1);
        expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(1);
    });
});
