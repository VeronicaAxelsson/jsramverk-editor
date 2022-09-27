import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    IconButton,
    Avatar,
    Button,
    Tooltip,
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
import { docsModel, Document } from '../utils/docs';

const DocsList: React.FC<{
    documents: Document[];
    handleEdit: any;
    handleCreate: any;
    updateState: any;
}> = ({ documents, handleEdit, handleCreate, updateState }) => {
    const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);

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

    const actionButtonStyle = {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed'
    };

    const DeleteDialog: React.FC<{ documentId: string }> = ({ documentId }) => {
        return (
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
                    <Button onClick={() => handleDelete(documentId)} autoFocus>
                        DELETE
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <React.Fragment>
            <Box sx={{ flexGrow: 1 }}>
                <List dense={true}>
                    {documents.map((document: Document, i: any) => (
                        <ListItem key={i} data-testid="listItem">
                            <ListItemAvatar>
                                <Avatar sx={{ backgroundColor: 'background.default' }}>
                                    <ArticleIcon color="secondary" />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                data-testid="listItemText"
                                primary={document.title}
                                secondary={format(new Date(document.updatedAt), 'yyyy-MM-dd HH:mm')}
                            />
                            <Tooltip title="Edit document">
                                <IconButton
                                    aria-label="edit"
                                    edge="end"
                                    onClick={() => handleEdit(document._id)}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete document">
                                <IconButton
                                    aria-label="delete"
                                    edge="end"
                                    onClick={handleOpenDeleteAlert}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                            <DeleteDialog documentId={document._id}></DeleteDialog>
                        </ListItem>
                    ))}
                </List>
            </Box>
            <Fab sx={actionButtonStyle} color="primary" aria-label="add" onClick={handleCreate}>
                <Tooltip title="Create new document">
                    <AddIcon />
                </Tooltip>
            </Fab>
        </React.Fragment>
    );
};

export default DocsList;
