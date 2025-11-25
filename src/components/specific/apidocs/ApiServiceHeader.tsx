import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ApiServiceHeaderProps {
  service: string;
  version: string;
  versions: string[];
  title?: string;
  description?: string;
}

const ApiServiceHeader: React.FC<ApiServiceHeaderProps> = ({
  service,
  version,
  versions,
  title,
  description,
}) => {
  const navigate = useNavigate();

  const handleVersionChange = (newVersion: string) => {
    navigate(`/api/${service}/${newVersion}`);
  };

  return (
    <Box
      sx={{ mb: 4, pb: 3, borderBottom: "2px solid", borderColor: "divider" }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={2}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            {title || `${service} API`}
          </Typography>
          {description && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ whiteSpace: "pre-line" }}
            >
              {description}
            </Typography>
          )}
        </Box>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>版本</InputLabel>
          <Select
            value={version}
            label="版本"
            onChange={(e) => handleVersionChange(e.target.value)}
          >
            {versions.map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );
};

export default ApiServiceHeader;
