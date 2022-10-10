import React, { useEffect, useState } from 'react';
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
    DialogTitle,
    Tab,
    Tabs
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import { docsModel, Document } from '../utils/docs';
import useAuth from '../utils/auth';

const DocsList: React.FC<{
    documents: { owner: Document[]; editor: Document[] };
    handleEdit: any;
    handleCreate: any;
    updateState: any;
}> = ({ documents, handleEdit, handleCreate, updateState }) => {
    const [openDeleteAlert, setOpenDeleteAlert] = useState<boolean>(false);
    const { user } = useAuth();
    const [value, setValue] = React.useState(0);
    const [listDocuments, setListDocuments] = useState<Document[]>();

    useEffect(() => {
        setListDocuments(documents.owner);
    }, [documents]);

    const a11yProps = (index: number) => {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`
        };
    };

    const handleOpenDeleteAlert = () => {
        setOpenDeleteAlert(true);
    };

    const handleCloseDeleteAlert = () => {
        setOpenDeleteAlert(false);
    };

    const handleDelete = async (documentId: string) => {        
        await docsModel.deleteDoc(documentId, user.token);

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

    const handleListChange = (event: React.SyntheticEvent, newValue: number) => {
        if (newValue === 0) {
            setListDocuments(documents.owner);
        }
        if (newValue === 1) {
            setListDocuments(documents.editor);
        }
        setValue(newValue);
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
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleListChange} aria-label="basic tabs example">
                        <Tab label="Your Documents" {...a11yProps(0)} />
                        <Tab label="Shared With You" {...a11yProps(1)} />
                    </Tabs>
                </Box>
                {documents && listDocuments && (
                    <List dense={true}>
                        {listDocuments.map((document: Document, i: any) => (
                            <ListItem key={i} data-testid="listItem">
                                <ListItemAvatar>
                                    <Avatar sx={{ backgroundColor: 'background.default' }}>
                                        <ArticleIcon color="secondary" />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    data-testid="listItemText"
                                    primary={document.title}
                                    secondary={document.ownerEmail}
                                    // secondary={format(
                                    //     new Date(document.updatedAt),
                                    //     'yyyy-MM-dd HH:mm'
                                    // )}
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
                                {value === 0 && (
                                    <Tooltip title="Delete document">
                                        <IconButton
                                            aria-label="delete"
                                            edge="end"
                                            onClick={handleOpenDeleteAlert}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <DeleteDialog documentId={document._id}></DeleteDialog>
                            </ListItem>
                        ))}
                    </List>
                )}
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
