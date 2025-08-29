import {useState, useCallback, useRef } from 'react';
import { IconButton, Stack, Tooltip } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import ImportIcon from "@mui/icons-material/OpenInBrowserOutlined";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export function FlowControl({ 
  onLoad,
  onSave,
  onExecute,
  onDelete
}) {
  const fileInputRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (confirmed) => {
    setOpen(false);
    if (confirmed) {
      console.log("✅ User confirmed action");
    } else {
      console.log("❌ User canceled action");
    }
  };
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file && onLoad) {
      onLoad(file);
    }
  }, [onLoad]);

  const onclickImport = (e) => {
    fileInputRef.current.click();
  }

  return (
    <>
      <Stack
        top={10} 
        right={10}
        zIndex={1000}
        position={'absolute'} 
        direction="row" 
        spacing={2}>

        <Tooltip title="Play">
          <IconButton color="primary" onClick={onExecute}>
            <PlayArrowIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete">
          <IconButton color="error" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Save">
          <IconButton color="success" onClick={onSave}>
            <SaveIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Load">
          <IconButton color="secondary" onClick={onclickImport}>
            <ImportIcon />
          </IconButton>
        </Tooltip>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </Stack>    
      <Dialog
        open={open}
        onClose={() => handleClose(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to perform this action? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={() => handleClose(true)} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}