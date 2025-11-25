import React, { useState } from "react";
import { Box, Typography, Collapse, IconButton, Stack } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface SchemaTreeProps {
  schema: Record<string, unknown>;
  depth?: number;
  name?: string;
}

const SchemaTree: React.FC<SchemaTreeProps> = ({ schema, depth = 0, name }) => {
  const [expanded, setExpanded] = useState(depth < 2); // 默认展开前两层

  if (!schema || typeof schema !== "object") {
    return (
      <Typography variant="body2" color="text.secondary">
        -
      </Typography>
    );
  }

  const type = schema.type as string | undefined;
  const properties = schema.properties as Record<string, unknown> | undefined;
  const items = schema.items as Record<string, unknown> | undefined;
  const description = schema.description as string | undefined;
  const required = schema.required as string[] | undefined;

  const isObject = type === "object" && properties;
  const isArray = type === "array" && items;
  const hasChildren = isObject || isArray;

  const getTypeColor = (t: string | undefined) => {
    switch (t) {
      case "string":
        return "success.main";
      case "number":
      case "integer":
        return "info.main";
      case "boolean":
        return "warning.main";
      case "array":
        return "secondary.main";
      case "object":
        return "primary.main";
      default:
        return "text.secondary";
    }
  };

  return (
    <Box sx={{ pl: depth > 0 ? 2 : 0, py: 0.5 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {/* 始终预留展开按钮空间，保证所有属性名对齐 */}
        <Box
          sx={{
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {hasChildren && (
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ p: 0.5 }}
            >
              {expanded ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </IconButton>
          )}
        </Box>
        {name && (
          <Typography
            variant="body2"
            component="span"
            sx={{ fontWeight: 600, fontFamily: "monospace" }}
          >
            {name}
            {required?.includes(name) && (
              <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
                *
              </Typography>
            )}
          </Typography>
        )}
        <Typography
          variant="body2"
          component="span"
          sx={{ color: getTypeColor(type), fontFamily: "monospace" }}
        >
          {type || "any"}
        </Typography>
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            - {description}
          </Typography>
        )}
      </Stack>

      {hasChildren && (
        <Collapse in={expanded}>
          <Box
            sx={{
              ml: 2,
              borderLeft: "2px solid",
              borderColor: "divider",
              pl: 1,
              mt: 0.5,
            }}
          >
            {isObject &&
              properties &&
              Object.entries(properties).map(([key, value]) => (
                <SchemaTree
                  key={key}
                  name={key}
                  schema={value as Record<string, unknown>}
                  depth={depth + 1}
                />
              ))}
            {isArray && items && (
              <SchemaTree name="[item]" schema={items} depth={depth + 1} />
            )}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default SchemaTree;
