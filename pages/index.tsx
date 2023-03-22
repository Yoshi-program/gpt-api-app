import type { NextPage } from 'next';
import { Container, Typography, Box } from '@material-ui/core';
import { FileUpload } from '../components/FileUpload';
import { useState } from 'react';

const Home: NextPage = () => {
  const [summary, setSummary] = useState('');

  const handleSummarized = (summary: string) => {
    setSummary(summary);
  };

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          File Summarizer
        </Typography>
        <FileUpload onSummarized={handleSummarized} />
        {summary && (
          <Box mt={4}>
            <Typography variant="h6">Summary:</Typography>
            <Typography>{summary}</Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Home;
