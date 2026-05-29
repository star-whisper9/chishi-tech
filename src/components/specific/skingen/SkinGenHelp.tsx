import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Alert,
  Box,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import CircleIcon from "@mui/icons-material/Circle";

interface SkinGenHelpProps {
  open: boolean;
  onClose: () => void;
}

const RECOMMENDED_SYSTEM_PROMPT = `You are a prompt engineer for the NoobAI XL image generation model, specializing in Minecraft skin design. Convert the user's natural language description into a comma-separated list of English tags.

Rules:
1. Output ONLY the tag list — no explanations, no markdown, no code fences.
2. All tags must be in English, lowercase, comma-separated.
3. Focus strictly on character appearance: hair (color, style), eyes, skin tone, clothing, armor, accessories, patterns, colors, species (human/elf/monster), theme.
4. DO NOT include: poses, actions, backgrounds, scenery, camera angles, lighting, multiple characters, or held items that extend beyond the skin canvas.
5. Minecraft skins are 64×64 pixel textures wrapped around a character model — only describe what can be painted on the skin itself.
6. DO NOT include generic quality tags (e.g., masterpiece, best quality, highres). The application handles quality control automatically; adding them may cause unexpected results.
7. Output 15–25 tags total.`;

const EXAMPLE_PROMPTS = [
  "1girl, solo, long hair, blue hair, silver blue hair, bangs, hair over one eye, halo, white dress, blue ribbon, black gloves, black thighhighs, leg armor, mechanical leg armor, black boots, mechanical arm guards, serious expression, closed mouth, blue eye, pale skin",
  'hatsune miku, twintails, very long aqua hair, aqua hair, blue eyes, hair between eyes, headphones, black sleeveless shirt, grey necktie, black pleated skirt, black thighhighs, red "01" tattoo on left upper arm, looking at viewer, simple pixel art style',
];

const SkinGenHelp: React.FC<SkinGenHelpProps> = ({ open, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(RECOMMENDED_SYSTEM_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>使用帮助</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {/* ========== 1. 提示词指南 ========== */}
          <Stack spacing={1.5}>
            <Typography variant="h6">提示词指南</Typography>

            <Alert severity="info" variant="outlined">
              本 Demo 采用 <b>NoobAI XL</b> 风格的提示词格式。请使用
              <b>英文、逗号分隔的 tag 列表</b>，不要写完整句子。你可以参见
              <Link
                href="https://my.feishu.cn/wiki/S8Z4wy7fSiePNRksiBXcyrUenOh"
                target="_blank"
              >
                这个指南
              </Link>
              。
            </Alert>

            <Alert severity="warning" variant="outlined">
              <b>无需添加质量词：</b>系统已自动控制画质。请勿手动添加{" "}
              <code>masterpiece</code>、<code>best quality</code>{" "}
              等通用质量提示词，否则可能得到意料之外的结果。
            </Alert>

            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                由于 Minecraft 皮肤是 64×64 像素的贴图，请勿在提示词中包含：
              </Typography>
              <Typography variant="body2" color="text.secondary">
                人物姿势 /
                动作、画面背景、场景物件、镜头角度、光影效果、多人物、超出皮肤画幅的持物。
                <br />
                请专注于描述<b>角色本身的外观特征</b>
                ：发型发色、瞳色、肤色、服装、盔甲、配饰、花纹、配色、种族、主题等。
              </Typography>
            </Stack>

            <Stack spacing={0.5}>
              <Typography variant="subtitle2">示例提示词</Typography>
              {EXAMPLE_PROMPTS.map((p, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1.25,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    fontFamily: "monospace",
                    fontSize: 12,
                    wordBreak: "break-word",
                  }}
                >
                  {p}
                </Box>
              ))}
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                  推荐的大模型生成系统提示词
                </Typography>
                <Tooltip title={copied ? "已复制" : "复制"}>
                  <IconButton size="small" onClick={handleCopy}>
                    {copied ? (
                      <CheckIcon fontSize="small" color="success" />
                    ) : (
                      <ContentCopyIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                将下面这段作为 System Prompt 发给任意
                LLM，再附上你的自然语言描述，即可自动生成符合格式的 tag 提示词。
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  color: "text.primary",
                  fontFamily: "monospace",
                  fontSize: 12,
                  whiteSpace: "pre-wrap",
                  maxHeight: 240,
                  overflow: "auto",
                }}
              >
                {RECOMMENDED_SYSTEM_PROMPT}
              </Box>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={1.5}>
            <Typography variant="h6">应用限制</Typography>

            <List dense disablePadding>
              {[
                "单个用户每小时最多生成 5 次。",
                "单个 IP 地址每小时最多生成 10 次。",
                "生成结果仅保留 1 小时；若未保存就发起新的生成，未保存的结果将会丢失。",
              ].map((text, i) => (
                <ListItem key={i} disableGutters sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <CircleIcon sx={{ fontSize: 8, color: "text.secondary" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    slotProps={{ primary: { variant: "body2" } }}
                  />
                </ListItem>
              ))}
            </List>

            <Alert severity="warning" variant="outlined" sx={{ mt: 0.5 }}>
              <Typography variant="body2">
                <b>数据留存说明：</b>为便于溯源与违规审查，您的 IP 地址、用户
                ID、使用的邀请码以及生成所用的提示词将会被存储。
              </Typography>
            </Alert>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SkinGenHelp;
