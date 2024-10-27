import React, { useEffect, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility"; // Import the view icon
import axiosInstance from "../../axios";
import { useNavigate } from "react-router-dom";

// Validation messages
const ValidationMessages = {
  TITLE_REQUIRED: "Title is required",
  DESCRIPTION_REQUIRED: "Description is required",
  FETCH_TASKS_FAILED: "Failed to fetch tasks",
  DELETE_TASK_SUCCESS: "Task deleted successfully",
  DELETE_TASK_FAILED: "Failed to delete task",
  SAVE_TASK_FAILED: "Failed to save task",
  TASK_UPDATED_SUCCESS: "Task updated successfully",
  TASK_CREATED_SUCCESS: "Task created successfully",
  TASK_VIEW_FAILED: "Failed to view task", // Add new message for viewing task
};

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false); // State for view dialog
  const [currentTask, setCurrentTask] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [formErrors, setFormErrors] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [taskDetails, setTaskDetails] = useState(null); // State for task details

  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const { username = "bharath" } = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get("/tasks");
        setTasks(response.data);
      } catch (error) {
        setSnackbar({
          open: true,
          message: ValidationMessages.FETCH_TASKS_FAILED,
          severity: "error",
        });
      }
    };
    fetchTasks();
  }, []);

  // Fetch task details
  const handleViewTask = async (taskId) => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}`); // Adjust the API endpoint as necessary
      setTaskDetails(response.data);
      setOpenViewDialog(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: ValidationMessages.TASK_VIEW_FAILED,
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
      setSnackbar({
        open: true,
        message: ValidationMessages.DELETE_TASK_SUCCESS,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: ValidationMessages.DELETE_TASK_FAILED,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
    handleCloseConfirmDialog();
  };

  const handleClickOpen = (task) => {
    setCurrentTask(task);
    setFormData({
      title: task ? task.title : "",
      description: task ? task.description : "",
    });
    setFormErrors({ title: "", description: "" });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentTask(null);
    setFormData({ title: "", description: "" });
    setFormErrors({ title: "", description: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const validateForm = () => {
    let errors = { title: "", description: "" };
    if (formData.title.trim() === "")
      errors.title = ValidationMessages.TITLE_REQUIRED;
    if (formData.description.trim() === "")
      errors.description = ValidationMessages.DESCRIPTION_REQUIRED;
    setFormErrors(errors);
    return !errors.title && !errors.description;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (currentTask) {
        await axiosInstance.put(`/tasks/${currentTask.id}`, formData);
        setTasks(
          tasks.map((task) =>
            task.id === currentTask.id ? { ...task, ...formData } : task
          )
        );
        setSnackbar({
          open: true,
          message: ValidationMessages.TASK_UPDATED_SUCCESS,
          severity: "success",
        });
      } else {
        const response = await axiosInstance.post("/tasks", formData);
        setTasks([...tasks, response.data]);
        setSnackbar({
          open: true,
          message: ValidationMessages.TASK_CREATED_SUCCESS,
          severity: "success",
        });
      }
      handleClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: ValidationMessages.SAVE_TASK_FAILED,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmDialog = (task) => {
    setCurrentTask(task);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setCurrentTask(null);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography
          variant="h4"
          align="center"
          sx={{ marginTop: 2, marginBottom: 2 }}
        >
          Task List
        </Typography>
        <IconButton onClick={handleMenuOpen} sx={{ marginRight: 2 }}>
          <Avatar>
            <AccountCircleIcon />
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
          PaperProps={{ sx: { width: 200 } }}
        >
          <MenuItem disabled>{username || "bharath"}</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
      <Button
        variant="contained"
        onClick={() => handleClickOpen(null)}
        sx={{ marginBottom: 2 }}
      >
        Add New Task
      </Button>
      <Card>
        <CardContent>
          <Typography variant="h6">Tasks</Typography>
          <List>
            {tasks.length === 0 ? (
              <ListItem>
                <ListItemText primary="No tasks available" />
              </ListItem>
            ) : (
              tasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <ListItem sx={{ padding: "4px 8px" }}>
                    <ListItemText
                      primary={task.title}
                      secondary={task.description}
                    />
                    <IconButton
                      edge="end"
                      onClick={() => handleViewTask(task.id)}
                    >
                      <VisibilityIcon /> {/* View icon */}
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleClickOpen(task)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenConfirmDialog(task)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                  {index < tasks.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </List>
        </CardContent>
      </Card>
      {/* Dialog for Add/Edit Task */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentTask ? "Edit Task" : "Add New Task"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            value={formData.title}
            onChange={handleChange}
            error={Boolean(formErrors.title)}
            helperText={formErrors.title}
            fullWidth
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            error={Boolean(formErrors.description)}
            helperText={formErrors.description}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            disabled={loading}
            variant="contained"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirm Delete Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseConfirmDialog}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(currentTask.id)}
            color="error"
            disabled={loading}
            variant="contained"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Task Details</DialogTitle>
        <Divider />
        <DialogContent>
          {taskDetails && (
            <div>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Title:</strong>
              </Typography>
              <Typography variant="h5" gutterBottom>
                {taskDetails.task.title}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                <strong>Description:</strong>
              </Typography>
              <Typography variant="body1" paragraph>
                {taskDetails.task.description}
              </Typography>

              <Typography
                variant="subtitle1"
                color="textSecondary"
                gutterBottom
              >
                <strong>Created At:</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {new Date(taskDetails.task.createdAt).toLocaleString()}
              </Typography>

              <Typography
                variant="subtitle1"
                color="textSecondary"
                gutterBottom
              >
                <strong>Last Updated:</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {new Date(taskDetails.task.updatedAt).toLocaleString()}
              </Typography>
            </div>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            onClick={() => setOpenViewDialog(false)}
            color="primary"
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TaskList;
