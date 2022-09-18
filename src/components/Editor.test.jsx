import React from "react";
import { act } from "react-dom/test-utils";
import ReactDOM from 'react-dom/client';
import Editor from './Editor.tsx'
import {BrowserRouter as Router} from 'react-router-dom';
import {render, screen, fireEvent} from '@testing-library/react';
import { docsModel } from '../utils/docs.tsx';


let container = null;
beforeEach(() => {
  container = document.createElement("div");
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

describe('Editor', () => {

  test("Render Title in textfield and Content in editor", async () => {
    //I Editor-vyn ska documentets titel visas i text-fältet och dokumentets innehåll i trix-editorn.
      jest.spyOn(docsModel, 'getDoc').mockResolvedValue(fakeDocument);  
  

      await act( async () => {
        ReactDOM.createRoot(container).render(<Router><Editor /></Router>);
      });
      expect(screen.getByRole('textbox', {name: /title-textbox/i}).value).toContain(fakeDocument.title);
      expect(screen.getByRole('textbox', {name: ""}).value).toContain(fakeDocument.content);
  })

  test('Click save and saveDoc should be called', async () => {
    jest.spyOn(docsModel, 'getDoc').mockResolvedValue(fakeDocument);  
    const spySaveDoc = jest.spyOn(docsModel, 'saveDoc').mockResolvedValue(fakeDocument);  
    await act( async () => {
      ReactDOM.createRoot(container).render(<Router><Editor /></Router>);
    });

    const button = screen.getByRole('button', {name: 'save'});
    fireEvent.click(button);

    expect(spySaveDoc).toHaveBeenCalledTimes(1)
    expect(spySaveDoc).toHaveBeenCalledWith(undefined, saveData)
  })

})