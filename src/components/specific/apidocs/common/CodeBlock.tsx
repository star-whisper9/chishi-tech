import React from "react";
import { Box, Paper, Typography, Stack } from "@mui/material";
import CopyButton from "../../../common/CopyButton";
import { Highlight, type RenderProps } from "prism-react-renderer";
import { useCodeHighlight } from "../../../../hooks/useCodeHighlight";
import type { SupportedLanguage } from "../../../../hooks/useCodeHighlight";

interface CodeBlockProps {
  code: string;
  language?: SupportedLanguage; // 限定支持范围
  showCopy?: boolean;
  title?: string;
  showLineNumbers?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "bash",
  showCopy = true,
  title,
  showLineNumbers = false,
}) => {
  const { theme, language: prismLanguage } = useCodeHighlight(language);
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        position: "relative",
        overflow: "auto",
        fontFamily: "monospace",
        fontSize: "0.875rem",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {title && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 1 }}
          >
            {title}
          </Typography>
        )}

        {showCopy && (
          <Box sx={{ position: "sticky", top: 0 }}>
            <CopyButton text={code} />
          </Box>
        )}
      </Box>

      <Stack direction="row" alignItems="flex-start" spacing={1}>
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <Highlight
            theme={theme}
            code={code.trimEnd()}
            language={prismLanguage}
          >
            {({
              className,
              style,
              tokens,
              getLineProps,
              getTokenProps,
            }: RenderProps) => (
              <pre
                className={className}
                style={{
                  ...style,
                  margin: 0,
                  background: "transparent",
                  whiteSpace: "pre",
                  overflowX: "auto",
                }}
              >
                {tokens.map((line, i) => {
                  const { key: _lineKey, ...lineProps } = getLineProps({
                    line,
                  });
                  return (
                    <div
                      key={i}
                      {...lineProps}
                      style={{ display: "table-row" }}
                    >
                      {showLineNumbers && (
                        <span
                          style={{
                            display: "table-cell",
                            textAlign: "right",
                            paddingRight: 12,
                            userSelect: "none",
                            opacity: 0.5,
                          }}
                        >
                          {i + 1}
                        </span>
                      )}
                      <span style={{ display: "table-cell" }}>
                        {line.map((token, tokenIdx) => {
                          const { key: _tokenKey, ...tokenProps } =
                            getTokenProps({ token });
                          return <span key={tokenIdx} {...tokenProps} />;
                        })}
                      </span>
                    </div>
                  );
                })}
              </pre>
            )}
          </Highlight>
        </Box>
      </Stack>
    </Paper>
  );
};

export default CodeBlock;
