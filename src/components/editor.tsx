import React, { useState, useRef } from 'react';
import 'trix/dist/trix';
import 'trix/dist/trix.css';
import { TrixEditor } from 'react-trix';
import { Toolbar, IconButton, Button } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

export const Editor = () => {
  const editorRef = useRef('');

  const textEditor = {
    padding: '0 24px',
  };

  let mergeTags = [
    {
      trigger: '@',
      tags: [
        { name: 'Dominic St-Pierre', tag: '@dominic' },
        { name: 'John Doe', tag: '@john' }
      ]
    },
  ];

  const handleEditorReady = (editor: any) => {
    // this is a reference back to the editor if you want to
    // do editing programatically
  };

  const handleChange = (html: any, text: string) => {
    editorRef.current = text;
  };

  const saveText = () => {
    console.log(editorRef.current);
  };

  return (
    <React.Fragment>
    <Toolbar sx={{ justifyContent: "space-between" }}>
      <div />
      <Button size={'small'} variant={"contained"} endIcon={<SaveIcon />} onClick={saveText}>
  Save
</Button>
      </Toolbar>
      <div style={textEditor}>
      <TrixEditor
        className='trix-text-editor'
        onChange={handleChange}
        onEditorReady={handleEditorReady}
        mergeTags={mergeTags}
        value={''}
      />
      </div>
    </React.Fragment>
  );
};
