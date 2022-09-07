import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
    IconButton, 
    Avatar, 
    Button, 
    Tooltip, 
    Divider, 
    List, 
    ListItem, 
    ListItemAvatar, 
    ListItemText, 
    Box, 
    Fab,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import { Link, useNavigate } from 'react-router-dom';
import { docsModel, Document } from '../utils/docs';
import { Header } from './Header';
import theme from '../themes/index';

export const DocsList = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);
    const [state, updateState] = useState<object>({});
    const navigate = useNavigate();

    const handleOpenDeleteAlert = () => {
        setOpenDeleteAlert(true);
    };

    const handleCloseDeleteAlert = () => {
        setOpenDeleteAlert(false);
    };

    const handleDelete = async (documentId: string) => {
        await docsModel.deleteDoc(documentId);
        setOpenDeleteAlert(false);
        updateState({});
    };

    const createDocument = async () => {
        const data = {
            content: '',
            title: 'untitled'
        };
        const doc = await docsModel.createDoc(data);
        navigate(`/${doc._id}`);
    };

    const actionButtonStyle = {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed'
    };

    useEffect(() => {
        (async () => {
            const allDocs = await docsModel.getAllDocs();
            setDocuments(allDocs);
            console.log(allDocs);
        })();
    }, [state]);

    return (
        <React.Fragment>
            <Header></Header>
            <Box sx={{ flexGrow: 1 }}>
                <List dense={true}>
                    {documents.map((document) => (
                        <>
                            <ListItem key={document._id}>
                                <ListItemAvatar>
                                    <Avatar sx={{ backgroundColor:'background.default'}}>
                                        <ArticleIcon color='secondary' />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={document.title}
                                    secondary={format(
                                        new Date(document.updatedAt),
                                        'yyyy-MM-dd hh:mm'
                                    )}
                                />
                                <Link to={`${document._id}`}>
                                    <Tooltip title="Edit document">
                                        <IconButton aria-label="edit" edge="end">
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Link>
                                <Tooltip title="Delete document">
                                    <IconButton
                                        aria-label="delete"
                                        edge="end"
                                        onClick={handleOpenDeleteAlert}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                                <Dialog
                                    open={openDeleteAlert}
                                    onClose={handleCloseDeleteAlert}
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"
                                >
                                    <DialogTitle id="alert-dialog-title">
                                        {'Are you sure you want to delete the document?'}
                                    </DialogTitle>
                                    <DialogContent>
                                        <DialogContentText id="alert-dialog-description">
                                            Press DELETE to confirm.
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseDeleteAlert}>Abort</Button>
                                        <Button
                                            onClick={() => handleDelete(document._id)}
                                            autoFocus
                                        >
                                            DELETE
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </ListItem>
                            <Divider variant="inset" component="li" />
                        </>
                    ))}
                </List>
            </Box>
            <Fab sx={actionButtonStyle} color="primary" aria-label="add" onClick={createDocument}>
                <Tooltip title="Create new document">
                    <AddIcon />
                </Tooltip>
            </Fab>
        </React.Fragment>
    );
};
