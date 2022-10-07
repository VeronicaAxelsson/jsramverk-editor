import React, { useRef, useEffect, useState, useContext } from 'react';
import { Control, Controller, SubmitHandler, useForm } from 'react-hook-form';
import ClipLoader from 'react-spinners/ClipLoader';
import 'trix/dist/trix';
import 'trix/dist/trix.css';
import { TrixEditor } from 'react-trix';
import {
    Toolbar,
    Button,
    TextField,
    Grid,
    Autocomplete,
    ListItem,
    List,
    ListItemText,
    Modal,
    Box,
    Typography,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { docsModel, Document } from '../utils/docs';
import 'core-js';
import { SocketContext } from '../utils/socket';
import useAuth, { User } from '../utils/auth';
import { userModel } from '../utils/user';
import AddIcon from '@mui/icons-material/Add';

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 4,
    p: 4
};

export type AllowedUser = {
    _id: string;
    email: string;
};

const Editor: React.FC<{ documentId: string, updateList?: any;}> = ({ documentId, updateList }) => {
    const editorRef = useRef(null);
    const titleRef = useRef(null);
    const [editor, setEditor] = useState(null);
    const socket = useContext(SocketContext);
    const cursorPosRef = useRef([]);
    const sendToSocketRef = useRef(true);
    const [triggerSendToSocket, setTriggerSendToSocket] = useState({});
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>();
    const [editorUser, setEditorUser] = useState<User>();
    const [document, setDocument] = useState<Document>();
    const [allowedEditors, setAllowedEditors] = useState<AllowedUser[]>([]);
    const [updateAllowedEditors, setUpdateAllowedEditors] = useState({});
    // const triggerTrix = useRef(true);

    const { handleSubmit, control } = useForm();

    //modal
    const [open, setOpen] = React.useState(false);
    const handleOpenModal = () => setOpen(true);
    const handleCloseModal = () => setOpen(false);

    useEffect(() => {
        (async () => {
            const thisDocument: Document = await docsModel.getDoc(documentId, user.token);
            editorRef.current = thisDocument.content;
            titleRef.current = thisDocument.title;
            setDocument(thisDocument);

            const userlist: User[] = await userModel.getAllUsers(user.token);
            setUsers(userlist);
        })();
    }, []);

    useEffect(() => {
        const content = editorRef.current;

        if (socket && editor) {
            let data = {
                documentId: documentId,
                content: content
            };
            socket.emit('docsData', data);
            console.log(sendToSocketRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerSendToSocket]);

    useEffect(() => {
        if (socket) {
            socket.emit('create', documentId);
            socket.on('docsData', handleDocsData);
        }
        return () => {
            socket.off('docsData', handleDocsData);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);

    const textEditor = {
        padding: '0 24px'
    };

    let mergeTags = [
        {
            trigger: '@',
            tags: [
                { name: 'Dominic St-Pierre', tag: '@dominic' },
                { name: 'John Doe', tag: '@john' }
            ]
        }
    ];

    const handleEditorReady = (editor: any) => {
        setEditor(editor);
    };

    const handleDocsData = (data: any) => {
        editorRef.current = data.content;
        sendToSocketRef.current = false;

        editor.element.innerHTML = editorRef.current;
        sendToSocketRef.current = false;

        cursorPosRef.current = editor.getSelectedRange();

        sendToSocketRef.current = false;
        editor.setSelectedRange(cursorPosRef.current);
    };

    const handleChange = (html: string, text: string) => {
        // if (triggerTrix.current) {

        if (sendToSocketRef.current) {
            console.log('trigger');
            editorRef.current = html;
            setTriggerSendToSocket({});
        }

        sendToSocketRef.current = true;
        // }

        // triggerTrix.current = !triggerTrix.current;
    };

    const handleTitleChange = (event: any) => {
        titleRef.current = event.currentTarget.value;
    };

    const saveText = async () => {
        const data = {
            content: editorRef.current,
            title: titleRef.current
        };
        await docsModel.saveDoc(documentId, user.token, data);
    };

    const addEditor = async (event: any) => {
        const data = {
            documentId: document._id,
            editorEmail: editorUser.email
        };
        console.log(data);

        try {
            await docsModel.addEditor(user.token, data);

            const thisDocument: Document = await docsModel.getDoc(documentId, user.token);
            setDocument(thisDocument);
        } catch (error) {
            console.log('User already editor');
        }
    };

    const removeEditor = async (editorId: any) => {
        const data = {
            documentId: document._id,
            editorEmail: editorId
        };
        try {
            await docsModel.removeEditor(user.token, data);

            const thisDocument: Document = await docsModel.getDoc(documentId, user.token);
            setDocument(thisDocument);
        } catch (error) {
            console.log('User not an editor');
        }
    };

    return (
        <React.Fragment>
            {document && users ? (
                <React.Fragment>
                    <Toolbar>
                        <Grid container spacing={1}>
                            <Grid item xs textAlign={'left'}>
                                <TextField
                                    inputProps={{
                                        'aria-label': 'title-textbox'
                                    }}
                                    variant={'standard'}
                                    size={'small'}
                                    onChange={handleTitleChange}
                                    defaultValue={titleRef.current}
                                ></TextField>
                            </Grid>
                            <Grid item xs={'auto'} justifyContent="flex-end">
                                <Button
                                    aria-label={'open'}
                                    size={'small'}
                                    variant={'contained'}
                                    endIcon={<AddIcon />}
                                    onClick={handleOpenModal}
                                >
                                    Add editor
                                </Button>
                            </Grid>
                            <Grid item xs={'auto'} justifyContent="flex-end">
                                <Button
                                    aria-label={'save'}
                                    size={'small'}
                                    variant={'contained'}
                                    endIcon={<SaveIcon />}
                                    onClick={saveText}
                                >
                                    Save
                                </Button>
                            </Grid>
                        </Grid>
                    </Toolbar>
                    <Modal
                        open={open}
                        onClose={handleCloseModal}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={modalStyle}>
                            <Grid container spacing={4} direction="column">
                                <Grid item>
                                    <Grid container spacing={1} direction="row" alignItems="center">
                                        <Grid item>
                                            <Autocomplete
                                                id="combo-box-demo"
                                                size="small"
                                                options={users}
                                                onChange={(event: any, newValue: User | null) =>
                                                    setEditorUser(newValue)
                                                }
                                                getOptionLabel={(user: User) => user.email}
                                                // inputValue={option._id}
                                                value={editorUser}
                                                sx={{ width: 300 }}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Add editor" />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <Button
                                                aria-label={'add'}
                                                size={'medium'}
                                                variant={'contained'}
                                                endIcon={<AddIcon />}
                                                onClick={addEditor}
                                            >
                                                Add
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <Typography id="modal-modal-title" variant="h6" component="h2">
                                        Editors
                                    </Typography>

                                    <List dense={true}>
                                        {document.allowed_editors.map((email) => (
                                            <ListItem
                                                secondaryAction={
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="delete"
                                                        onClick={() => removeEditor(email)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemText primary={email} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Grid>
                            </Grid>
                        </Box>
                    </Modal>

                    <div style={textEditor}>
                        <TrixEditor
                            className="trix-text-editor"
                            onChange={handleChange}
                            onEditorReady={handleEditorReady}
                            mergeTags={mergeTags}
                            value={editorRef.current}
                            aria-label={'trix-textbox'}
                        />
                    </div>
                </React.Fragment>
            ) : (
                <ClipLoader
                    color={'#00887a'}
                    loading={true}
                    size={50}
                    aria-label="Loading Spinner"
                />
            )}
        </React.Fragment>
    );
};

export default Editor;
