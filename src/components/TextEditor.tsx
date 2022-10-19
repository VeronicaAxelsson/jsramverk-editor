import React, { useRef, useEffect, useState, useContext } from 'react';
import 'trix/dist/trix';
import 'trix/dist/trix.css';
import { format } from 'date-fns';
import { Box, TextField, IconButton, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import AddCommentIcon from '@mui/icons-material/AddComment';
import DoneIcon from '@mui/icons-material/Done';
import Typography from '@mui/material/Typography';
import { Document, Comment, docsModel } from '../utils/docs';
import 'core-js';
import { SocketContext } from '../utils/socket';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import useAuth from '../utils/auth';

export type AllowedUser = {
    _id: string;
    email: string;
};

const TextEditor: React.FC<{
    setDocument: any;
    document: Document;
    editorRef: any;
    quillRef: any;
}> = ({ setDocument, document, editorRef, quillRef }) => {
    const { user } = useAuth();
    const [editor, setEditor] = useState(null);
    const [comment, setComment] = useState<string>('');
    const socket = useContext(SocketContext);
    const sendToSocketRef = useRef(true);
    const [triggerSendToSocket, setTriggerSendToSocket] = useState({});
    const activeCommentRef = useRef<Comment>();
    const newCommentRangeRef = useRef(null);
    const [showAddComment, setShowAddComment] = useState(false);
    const [showAddCommentForm, setShowAddCommentForm] = useState(false);

    // Quill editor settings
    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
            ['link', 'image'],
            ['clean']
        ]
    };

    const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
        'image',
        'background',
        'color'
    ];

    // Connect to socket
    useEffect(() => {
        if (socket) {
            console.log('connecting');

            socket.emit('create', document._id);
            socket.on('docsData', handleDocsData);
        }
        return () => {
            socket.off('docsData', handleDocsData);
        };
    }, []); //editor?

    //Send to socket when triggerd.
    useEffect(() => {
        const content = editorRef.current;

        if (socket && editor) {
            let data = {
                documentId: document._id,
                content: content
            };
            socket.emit('docsData', data);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerSendToSocket]);

    const textEditor = {
        padding: '0 24px'
    };

    const handleDocsData = (data: any) => {
        //When reciving data from socket, update editor content but don't send to socket
        editorRef.current = data.content;
        sendToSocketRef.current = false;

        quillRef.current.getEditor().container.firstChild.innerHTML = editorRef.current;
        sendToSocketRef.current = false;
    };

    const handleEditorOnChange = (value: any) => {
        if (sendToSocketRef.current) {
            //This is set to false if the change was recived from socket.
            editorRef.current = value;
            setTriggerSendToSocket({});
        }

        sendToSocketRef.current = true;
        setEditor(true); //Don't send to socket when editor is opened. Wait until the user writes something.
    };

    const handleChangeSelection = (range: any, source: any, editor: any) => {
        // If letters in the editor are marked, the add comment button should be displayed.
        if (range && range.length > 0) {
            setShowAddComment(true);
        } else {
            setShowAddComment(false);
        }
    };

    const handleOpenCommentForm = () => {
        // Open comment form and close hide comment button
        setShowAddComment(false);
        setShowAddCommentForm(true);
        // Sett new comment ref to keep track of what range was selected when add comment button was clicked
        newCommentRangeRef.current = quillRef.current.getEditor().getSelection();
        quillRef.current
            .getEditor()
            .formatText(
                newCommentRangeRef.current.index,
                newCommentRangeRef.current.length,
                'background',
                '#efc82b'
            );
    };

    const handleAddComment = async () => {
        const addComment: Comment = {
            rangeIndex: newCommentRangeRef.current.index,
            rangeLength: newCommentRangeRef.current.length,
            comment: comment,
            commenter: user.email,
            date: new Date()
        };

        document.comments.push(addComment);
        const updatedDocument = await docsModel.saveDoc(document._id, user.token, {
            comments: document.comments
        });
        setDocument(updatedDocument);
        setShowAddComment(false);
        setShowAddCommentForm(false);
        quillRef.current
            .getEditor()
            .formatText(
                newCommentRangeRef.current.index,
                newCommentRangeRef.current.length,
                'background',
                '#fff'
            );
    };

    const handleClickOnComment = (comment: Comment) => {
        if (activeCommentRef.current) {
            quillRef.current
                .getEditor()
                .formatText(
                    activeCommentRef.current.rangeIndex,
                    activeCommentRef.current.rangeLength,
                    'background',
                    '#fff'
                );
        }
        quillRef.current
            .getEditor()
            .formatText(comment.rangeIndex, comment.rangeLength, 'background', '#ffe554');
        activeCommentRef.current = comment;
    };

    const handleClickAwayFromComments = () => {
        setShowAddCommentForm(false);

        if (activeCommentRef.current) {
            quillRef.current
                .getEditor()
                .formatText(
                    activeCommentRef.current.rangeIndex,
                    activeCommentRef.current.rangeLength,
                    'background',
                    '#fff'
                );
        }

        activeCommentRef.current = null;
    };

    const handleRemoveComment = async (thisComment: Comment) => {
        quillRef.current
            .getEditor()
            .formatText(thisComment.rangeIndex, thisComment.rangeLength, 'background', '#fff');
        const remainingComments = document.comments.filter(
            (comment) => comment.date != thisComment.date
        );
        const updatedDocument = await docsModel.saveDoc(document._id, user.token, {
            comments: remainingComments
        });

        setDocument(updatedDocument);
    };

    return (
        <Box style={textEditor}>
            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <ReactQuill
                        data-testid="quillEditor"
                        ref={quillRef}
                        theme="snow"
                        value={editorRef.current}
                        onChange={handleEditorOnChange}
                        modules={modules}
                        formats={formats}
                        onChangeSelection={handleChangeSelection}
                    ></ReactQuill>
                </Grid>
                <Grid item xs={4}>
                    <ClickAwayListener onClickAway={handleClickAwayFromComments}>
                        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                            <ListItem alignItems="center" key={'addComment'}>
                                {showAddComment && (
                                    <IconButton onClick={handleOpenCommentForm}>
                                        <AddCommentIcon color={'primary'} fontSize={'large'} />
                                    </IconButton>
                                )}
                                {showAddCommentForm && (
                                    <React.Fragment>
                                        <TextField
                                            placeholder="Add comment"
                                            sx={{ display: 'inline' }}
                                            onChange={(event: any) =>
                                                setComment(event.target.value)
                                            }
                                        ></TextField>

                                        <IconButton onClick={handleAddComment}>
                                            <DoneIcon color={'primary'} fontSize={'large'} />
                                        </IconButton>
                                    </React.Fragment>
                                )}
                            </ListItem>
                            {document.comments &&
                                document.comments.map((comment: Comment, i: any) => (
                                    <React.Fragment>
                                        <ListItem
                                            key={i}
                                            alignItems="flex-start"
                                            onClick={() => handleClickOnComment(comment)}
                                            sx={{ cursor: 'pointer' }}
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    aria-label="delete"
                                                    onClick={() => handleRemoveComment(comment)}
                                                >
                                                    <CloseIcon />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText
                                                primary={comment.comment}
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography
                                                            sx={{ display: 'inline' }}
                                                            component="span"
                                                            variant="body2"
                                                            color="text.primary"
                                                        >
                                                            {comment.commenter}
                                                        </Typography>
                                                        <br />
                                                        {format(
                                                            new Date(comment.date),
                                                            'yyyy-MM-dd HH:mm'
                                                        )}
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem>
                                        <Divider variant="middle" component="li" />
                                    </React.Fragment>
                                ))}
                        </List>
                    </ClickAwayListener>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TextEditor;
