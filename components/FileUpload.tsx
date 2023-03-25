import React, { useState } from 'react';
import { Button, Box, Typography, CircularProgress } from '@material-ui/core';

interface FileUploadProps {
  onSummarized: (summary: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onSummarized }) => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file);
  };

  const handleSummarize = async () => {
    if (selectedFile) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/api/summarize', {
          method: 'POST',
          body: formData,
        });

        console.log(response)

        if (response.ok) {
          const data = await response.json();
          onSummarized(data.summary);
        } else {
          throw new Error('Failed to summarize file');
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
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
        <Button variant="contained" color="primary" component="span">
          Select File
        </Button>
      </label>
      {selectedFile && (
        <Box mt={2}>
          <Typography variant="subtitle1">
            Selected file: {selectedFile.name}
          </Typography>
        </Box>
      )}
      <Box mt={2}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSummarize}
          disabled={!selectedFile || loading}
        >
          Summarize
        </Button>
      </Box>
      {loading && (
        <Box mt={2}>
          <CircularProgress />
          <Typography variant="caption">Processing file...</Typography>
        </Box>
      )}
    </Box>
  );
};
