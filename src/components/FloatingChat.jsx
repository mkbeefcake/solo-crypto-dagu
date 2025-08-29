import { useState } from "react";
import { Box, TextField, Button, List, ListItem, ListItemText, Paper } from "@mui/material";
import { IconButton, Stack, Tooltip } from "@mui/material";
import MinimizeIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/ChatBubble";


export default function FloatingChat( { triggerMinimize, sendChat } ) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [windowState, setWindowState] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, input]);
    setInput("");
    sendChat(input);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        position: "absolute",
        bottom: 10,
        left: 10,
        width: 400,
        height: 400,
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
        <Stack
          top={-5} 
          right={-8}
          zIndex={1000}
          position={'absolute'} 
          direction="row" 
          spacing={2}>
          <Tooltip title="Minimize">
            <IconButton color="outlined" onClick={triggerMinimize} >
              <MinimizeIcon />
            </IconButton>
          </Tooltip>
        </Stack>
  
        {/* Messages */}
        <List sx={{ flex: 1, overflowY: "auto", p: 1 }}>
          {messages.map((msg, idx) => (
            <ListItem key={idx} sx={{ p: 0.5 }}>
              <ListItemText primary={msg} />
            </ListItem>
          ))}
        </List>

        {/* Input Area */}
        <Box sx={{ display: "flex", p: 1, gap: 1 }}>
          <TextField
            multiline
            maxRows={4}
            fullWidth
            variant="outlined"
            color="outline"
            size="small"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button variant="outlined" onClick={handleSend} color="outline">
            Run
          </Button>
          <Button variant="outlined" onClick={handleSend} color="outline">
            Clear
          </Button>
        </Box>
    </Paper>
  );
}
