import React, { useState } from 'react';
import { Button, Box, Typography, CircularProgress } from '@material-ui/core';

interface FileUploadProps {
  onSummarized: (summary: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onSummarized }) => {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/summarize', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          onSummarized(data.summary);
        } else {
          throw new Error('Failed to summarize file');
        }
      } catch (error) {
        console.error(error);
      }
    }
    setLoading(false);
  };

  return (
    <Box>
      <input
        accept=".pdf, .docx"
        id="file-upload"
        type="file"
        hidden
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload">
        <Button variant="contained" color="primary" component="span" disabled={loading}>
          Upload File
        </Button>
      </label>
      {loading && (
        <Box mt={2}>
          <CircularProgress />
          <Typography variant="caption">Processing file...</Typography>
        </Box>
      )}
    </Box>
  );
};
