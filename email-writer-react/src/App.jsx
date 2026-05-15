import { Box, Container } from '@mui/system';
import './App.css'
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CssBaseline
} from '@mui/material';
import { useState } from 'react';
import axios from 'axios';
import { TypeAnimation } from 'react-type-animation';
import {
  ThemeProvider,
  createTheme
} from '@mui/material/styles';

function App() {
 const [emailContent, setEmailContent] = useState('');
 const [tone, setTone] = useState('');
 const[generatedReply, setGeneratedReply] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [copied, setCopied] = useState(false);
 const handleSubmit = async () => {
  setLoading(true);
  setError('');

  const cleanedEmail = emailContent?.trim();

  console.log("DEBUG EMAIL:", cleanedEmail);

  if (!cleanedEmail) {
    setError("Please paste the email content first.");
    setLoading(false);
    return;
  }

  try {
    const response = await axios.post("http://localhost:8081/api/email/generate", {
      emailContent: cleanedEmail,
      tone,
      action
    });

    setGeneratedReply(response.data.reply);
  } catch (err) {
    setError("Failed to generate reply.");
  } finally {
    setLoading(false);
  }
};


const handleRegenerate = () => {
  handleSubmit();
};
const handleClear = () => {
  setEmailContent('');
  setTone('');
  setGeneratedReply('');
  setError('');
  setAction('Reply');
};
const [action, setAction] = useState('Reply');
const [darkMode, setDarkMode] = useState(false);
const theme = createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    background: {
      default: darkMode ? '#121212' : '#f5f5f5',
      paper: darkMode ? '#1e1e1e' : '#ffffff'
    }
  }
});

  return (
     <ThemeProvider theme={theme}>
      <CssBaseline />
    <Container  maxWidth="md"
  sx={{
    py: 4,
    minHeight: '100vh'
  }}>
      <Typography
  variant='h3'
  component='h1'
  gutterBottom
  sx={{ color: 'text.primary' }}
>
  AI Email Assistant
</Typography>
      <Typography
  variant="body1"
  color="text.secondary"
  sx={{ mb: 3 }}
>
  Generate intelligent and professional email replies instantly using AI.
 
</Typography>
 <Button
  variant="outlined"
  sx={{ mb: 3 }}
  onClick={() => setDarkMode(!darkMode)}
>
  {darkMode ? "Light Mode" : "Dark Mode"}
</Button>

      <Box sx={{ mx : 3}}>
<TextField
  fullWidth
  multiline
  rows={6}
  label="Original Email Content"
  placeholder="Paste the email you want to reply to..."
  variant='outlined'
  value={emailContent || ''}
  onChange={(e) => setEmailContent(e.target.value)}
  sx={{ mb: 2 }}
/>
<Typography
  variant="body2"
  color="text.secondary"
  sx={{ mb: 2 }}
>
  Characters: {emailContent.length}
</Typography>
        <FormControl fullWidth sx={{mb:2}} >
          <InputLabel>Tone (Optional)</InputLabel>
          <Select
             value={tone || ''}
             label={"Tone (Optional)"}
             onChange={(e) => setTone(e.target.value)}>
              <MenuItem value="Professional">Professional</MenuItem>
<MenuItem value="Friendly">Friendly</MenuItem>
<MenuItem value="Formal">Formal</MenuItem>
<MenuItem value="Confident">Confident</MenuItem>
<MenuItem value="Persuasive">Persuasive</MenuItem>
<MenuItem value="Apologetic">Apologetic</MenuItem>
<MenuItem value="Concise">Concise</MenuItem>
<MenuItem value="Supportive">Supportive</MenuItem>
<MenuItem value="Follow-up">Follow-up</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Action</InputLabel>

  <Select
    value={action}
    label="Action"
    onChange={(e) => setAction(e.target.value)}
  >
    <MenuItem value="Reply">Reply</MenuItem>
    <MenuItem value="Summarize">Summarize</MenuItem>
    <MenuItem value="Improve">Improve Writing</MenuItem>
    <MenuItem value="Shorten">Shorten</MenuItem>
    <MenuItem value="Expand">Expand</MenuItem>
    <MenuItem value="Grammar">Fix Grammar</MenuItem>
  </Select>
</FormControl>

        <Button
          variant='contained' color='primary' onClick={(handleSubmit)} disabled={loading || !emailContent} fullWidth>

          {loading ? (
  <>
    <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
    Generating...
  </>
) : (
  "Generate Reply"
)}

        </Button>
      </Box>
      {error && (
        <Typography color='error' sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {generatedReply && (
       <Box
  sx={{
    mt: 3,
    p: 3,
    borderRadius: 3,
    boxShadow: 3,
    backgroundColor: darkMode ? "#1e1e1e" : "#fff"
  }}
>
          <Typography variant='h6' gutterBottom>
            Generated Reply:
          </Typography>
<Box
  sx={{
    p: 2,

    border: darkMode
      ? '1px solid #444'
      : '1px solid #ccc',

    borderRadius: 2,

    minHeight: '150px',

    backgroundColor: darkMode
      ? '#2a2a2a'
      : '#fafafa'
  }}
>
  <TypeAnimation
    sequence={[generatedReply]}
    speed={75}
    cursor={true}
    repeat={0}
    style={{
      whiteSpace: 'pre-line',
      display: 'block'
    }}
  />
</Box>           
           <Button
  variant='outlined'
  sx={{ mt: 2 }}
  onClick={() => {
    navigator.clipboard.writeText(generatedReply);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }}
>
  {copied ? "Copied!" : "Copy to Clipboard"}
</Button>
<Button
  variant='contained'
  sx={{ mt: 2, ml: 2 }}
  onClick={handleRegenerate}
>
  Regenerate Reply
</Button>
<Button
  variant='text'
  color='error'
  sx={{ mt: 2, ml: 2 }}
  onClick={handleClear}
>
  Clear
</Button>
        </Box>
      )}
    </Container>
    </ThemeProvider>
  )
}

export default App
