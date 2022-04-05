import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'

export default function ConfirmationDialog({
  title,
  message,
  onOk,
  dialogOpen,
  setDialogOpen,
}) {
  const closeDialog = () => {
    setDialogOpen(false)
  }

  function onOkClick() {
    closeDialog()
    onOk()
  }

  return (
    <Dialog onClose={closeDialog} open={dialogOpen}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>Cancel</Button>
        <Button autoFocus onClick={onOkClick}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  )
}
