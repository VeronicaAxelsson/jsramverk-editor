import React from 'react';
import { act } from 'react-dom/test-utils';
import ReactDOM from 'react-dom/client';
import Editor from './Editor';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { docsModel } from '../utils/docs';
import { expect, jest, test } from '@jest/globals';

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

const fakeDocument = {
    title: 'content',
    content: 'title',
    updatedAt: new Date()
};

const saveData = {
    title: 'content',
    content: 'title'
};

const fakeDocumentId = '1234';

describe('Editor', () => {
    test('Render Title in textfield and Content in editor', async () => {
        //I Editor-vyn ska documentets titel visas i text-fältet och dokumentets innehåll i trix-editorn.
        jest.spyOn(docsModel, 'getDoc').mockResolvedValue(fakeDocument);

        await act(async () => {
            ReactDOM.createRoot(container).render(
                <Router>
                    <Editor documentId={fakeDocumentId} />
                </Router>
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
        const spySaveDoc = jest.spyOn(docsModel, 'saveDoc').mockResolvedValue(fakeDocument);
        await act(async () => {
            ReactDOM.createRoot(container).render(
                <Router>
                    <Editor documentId={fakeDocumentId} />
                </Router>
            );
        });

        const button = screen.getByRole('button', { name: 'save' });
        fireEvent.click(button);

        expect(spySaveDoc).toHaveBeenCalledTimes(1);
        expect(spySaveDoc).toHaveBeenCalledWith(fakeDocumentId, saveData);
    });
});
