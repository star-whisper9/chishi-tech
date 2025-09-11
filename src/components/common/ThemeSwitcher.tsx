import React, { useState } from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { setTheme } from "../../stores/themeSlice";
import { themeNameMap, type Themes } from "../../hooks/theme";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ThemeSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state) => state.theme.currentTheme);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (theme: Themes) => {
    dispatch(setTheme(theme));
    handleClose();
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Button
        variant="outlined"
        color="inherit"
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        {themeNameMap[currentTheme]}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {Object.entries(themeNameMap).map(([key, label]) => (
          <MenuItem
            key={key}
            onClick={() => handleThemeChange(key as Themes)}
            selected={key === currentTheme}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default ThemeSwitcher;
