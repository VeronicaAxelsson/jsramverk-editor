import React, { useRef, useEffect, useState, useContext } from 'react';
import { saveAs } from 'file-saver';
import ClipLoader from 'react-spinners/ClipLoader';
import 'trix/dist/trix';
import 'trix/dist/trix.css';
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
    Typography
} from '@mui/material';
import { SocketContext } from '../utils/socket';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import { docsModel, Document } from '../utils/docs';
import 'core-js';
import useAuth, { User } from '../utils/auth';
import { userModel } from '../utils/user';
import { emailModel, EmailData } from '../utils/email';
import AddIcon from '@mui/icons-material/Add';
import { pdfExporter } from 'quill-to-pdf';
import TextEditor from './TextEditor';
import CodeEditor from './CodeEditor';

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

const Editor: React.FC<{ documentId: string }> = ({ documentId }) => {
    const editorRef = useRef(null);
    const titleRef = useRef(null);
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>();
    const [editorUser, setEditorUser] = useState<User>({ email: '' });
    const [document, setDocument] = useState<Document>();
    const [addEditorLoading, setAddEditorLoading] = useState<boolean>(false);
    const [addNewEditorLoading, setAddNewEditorLoading] = useState<boolean>(false);
    const [saveDocLoading, setSaveDocLoading] = useState<boolean>(false);
    const [editor, setEditor] = useState(null);
    const socket = useContext(SocketContext);
    const sendToSocketRef = useRef(true);
    const [triggerSendToSocket, setTriggerSendToSocket] = useState({});
    const codeEditorRef = useRef(null);
    const quillRef = useRef<any>();

    //modal
    const [open, setOpen] = React.useState<boolean>(false);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTitleChange = (event: any) => {
        titleRef.current = event.currentTarget.value;
    };

    // Connect to socket
    useEffect(() => {
        if (socket && document) {
            console.log(document);

            socket.emit('create', document._id);
            socket.on('docsData', handleDocsData);
        }
        return () => {
            socket.off('docsData', handleDocsData);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [document]); //When document is ready, connect to socket.

    //Send to socket when triggerd.
    useEffect(() => {
        const content = editorRef.current;

        if (socket && editor && document) {
            let data = {
                documentId: document._id,
                content: content
            };
            socket.emit('docsData', data);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerSendToSocket]);

    const handleDocsData = (data: any) => {
        //When reciving data from socket, update editor content but don't send to socket
        editorRef.current = data.content;
        sendToSocketRef.current = false;

        if (document.type === 'text') {
            quillRef.current.getEditor().container.firstChild.innerHTML = editorRef.current;
        }

        if (document.type === 'code') {
            codeEditorRef.current.setValue(editorRef.current);
        }

        sendToSocketRef.current = false;
    };

    const handleEditorOnChange = (value: string) => {
        if (sendToSocketRef.current) {
            //This is set to false if the change was recived from socket.
            editorRef.current = value;
            setTriggerSendToSocket({});
        }

        sendToSocketRef.current = true;

        setEditor(true); //Don't send to socket when editor is opened. Wait until the user writes something.
    };

    const saveText = async () => {
        setSaveDocLoading(true);
        const data = {
            content: editorRef.current,
            title: titleRef.current
        };
        console.log(data);

        await docsModel.saveDoc(documentId, user.token, data);
        setSaveDocLoading(false);
    };

    const addEditor = async () => {
        let sendEmail = true;
        if (editorUser._id) {
            setAddEditorLoading(true);
        } else {
            setAddNewEditorLoading(true);
        }

        const data = {
            documentId: document._id,
            editorEmail: editorUser.email
        };

        const emailData: EmailData = {
            inviterEmail: user.email,
            email: editorUser.email
        };

        try {
            await docsModel.addEditor(user.token, data);

            const thisDocument: Document = await docsModel.getDoc(documentId, user.token);
            setDocument(thisDocument);
        } catch (error) {
            sendEmail = false;
            console.log(error);
        }

        setAddNewEditorLoading(false);
        setAddEditorLoading(false);

        if (sendEmail) {
            try {
                await emailModel.sendEmailInvite(user.token, emailData);
            } catch (error) {
                console.log(error);
            }
        }
    };

    const removeEditor = async (editorEmail: string) => {
        const data = {
            documentId: document._id,
            editorEmail: editorEmail
        };

        try {
            await docsModel.removeEditor(user.token, data);

            const thisDocument: Document = await docsModel.getDoc(documentId, user.token);
            setDocument(thisDocument);
        } catch (error) {
            console.log('User not an editor');
        }
    };

    const saveToPdf = async () => {
        const delta = quillRef.current.getEditor().getContents();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const pdfAsBlob = await pdfExporter.generatePdf(delta); // converts to PDF
        saveAs(pdfAsBlob, `${titleRef.current}.pdf`);
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
                                <LoadingButton
                                    aria-label={'save'}
                                    size={'small'}
                                    variant={'contained'}
                                    endIcon={<SaveIcon />}
                                    onClick={saveText}
                                    loading={saveDocLoading}
                                >
                                    Save
                                </LoadingButton>
                            </Grid>
                            {document.type === 'text' && (
                                <Grid item xs={'auto'} justifyContent="flex-end">
                                    <Button
                                        aria-label={'download'}
                                        size={'small'}
                                        variant={'contained'}
                                        endIcon={<SaveIcon />}
                                        onClick={saveToPdf}
                                    >
                                        Download as PDF
                                    </Button>
                                </Grid>
                            )}
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
                                        <Typography
                                            id="modal-modal-title"
                                            variant="h6"
                                            component="h2"
                                        >
                                            Add registered user
                                        </Typography>
                                        <Grid item>
                                            <Autocomplete
                                                id="combo-box-demo"
                                                size="small"
                                                options={users}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>,
                                                    newValue: User | null
                                                ) => setEditorUser(newValue)}
                                                freeSolo={true}
                                                getOptionLabel={(user: User) => user.email}
                                                value={editorUser}
                                                sx={{ width: 300 }}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Add editor" />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <LoadingButton
                                                aria-label={'add'}
                                                size={'medium'}
                                                variant={'contained'}
                                                endIcon={<AddIcon />}
                                                onClick={addEditor}
                                                loading={addEditorLoading}
                                            >
                                                Add
                                            </LoadingButton>
                                        </Grid>
                                    </Grid>
                                    <Grid item>
                                        <Grid
                                            container
                                            spacing={1}
                                            direction="row"
                                            alignItems="center"
                                            sx={{ marginTop: '32px' }}
                                        >
                                            <Typography
                                                id="modal-modal-title"
                                                variant="h6"
                                                component="h2"
                                            >
                                                Add non registered user
                                            </Typography>
                                            <Grid item>
                                                <TextField
                                                    sx={{ width: 300 }}
                                                    id="combo-box-demo"
                                                    size="small"
                                                    onChange={(event: any) =>
                                                        setEditorUser({ email: event.target.value })
                                                    }
                                                />
                                            </Grid>
                                            <Grid item>
                                                <LoadingButton
                                                    aria-label={'add'}
                                                    size={'medium'}
                                                    variant={'contained'}
                                                    endIcon={<AddIcon />}
                                                    onClick={addEditor}
                                                    loading={addNewEditorLoading}
                                                >
                                                    Add
                                                </LoadingButton>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <Typography id="modal-modal-title" variant="h6" component="h2">
                                        Editors
                                    </Typography>

                                    <List dense={true}>
                                        {document.allowed_editors.map((email, i) => (
                                            <ListItem
                                                key={i}
                                                secondaryAction={
                                                    <LoadingButton
                                                        aria-label="delete"
                                                        onClick={() => removeEditor(email)}
                                                        // loading={removeEditorLoading}
                                                    >
                                                        <DeleteIcon />
                                                    </LoadingButton>
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
                    {document.type === 'text' && (
                        <TextEditor
                            setDocument={setDocument}
                            document={document}
                            editorRef={editorRef}
                            quillRef={quillRef}
                            handleEditorOnChange={handleEditorOnChange}
                        ></TextEditor>
                    )}
                    {document.type === 'code' && (
                        <CodeEditor
                            editorRef={editorRef}
                            handleEditorOnChange={handleEditorOnChange}
                            codeEditorRef={codeEditorRef}
                        ></CodeEditor>
                    )}
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
