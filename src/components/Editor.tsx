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
    Typography,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { docsModel, Document } from '../utils/docs';
import 'core-js';
import useAuth, { User } from '../utils/auth';
import { userModel } from '../utils/user';
import { emailModel, EmailData } from '../utils/email';
import AddIcon from '@mui/icons-material/Add';
import { pdfExporter } from 'quill-to-pdf';
import ReactQuill from 'react-quill';
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

const Editor: React.FC<{ documentId: string; updateList?: any }> = ({ documentId, updateList }) => {
    const editorRef = useRef(null);
    const titleRef = useRef(null);
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>();
    const [editorUser, setEditorUser] = useState<User>({ email: '' });
    const [document, setDocument] = useState<Document>();
    const quillRef = useRef<ReactQuill>();

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

    const handleTitleChange = (event: any) => {
        titleRef.current = event.currentTarget.value;
    };

    const saveText = async () => {
        const data = {
            content: editorRef.current,
            title: titleRef.current
        };
        console.log(data);

        await docsModel.saveDoc(documentId, user.token, data);
    };

    const addEditor = async (event: any) => {
        console.log(editorUser.email);
        const data = {
            documentId: document._id,
            editorEmail: editorUser.email
        };
        console.log(data);
        const emailData: EmailData = {
            inviterEmail: user.email,
            email: editorUser.email
        };

        try {
            await docsModel.addEditor(user.token, data);

            const thisDocument: Document = await docsModel.getDoc(documentId, user.token);
            setDocument(thisDocument);
        } catch (error) {
            console.log('User already editor');
        }

        try {
            await emailModel.sendEmailInvite(user.token, emailData);
        } catch (error) {
            console.log(error);
        }
    };

    const removeEditor = async (editorEmail: any) => {
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
                                                onChange={(event: any, newValue: User | null) =>
                                                    setEditorUser(newValue)
                                                }
                                                freeSolo={true}
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
                                    <Grid container spacing={1} direction="row" alignItems="center">
                                        <Typography
                                            id="modal-modal-title"
                                            variant="h6"
                                            component="h2"
                                        >
                                            Add non registered user
                                        </Typography>
                                        <Grid item>
                                            <TextField
                                                id="combo-box-demo"
                                                size="small"
                                                onChange={(event: any) =>
                                                    setEditorUser({ email: event.target.value })
                                                }
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
                    {document.type === 'text' && (
                        <TextEditor
                            setDocument={setDocument}
                            document={document}
                            editorRef={editorRef}
                            quillRef={quillRef}
                        ></TextEditor>
                    )}
                    {document.type === 'code' && (
                        <CodeEditor document={document} editorRef={editorRef}></CodeEditor>
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
