import { useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Chip,
  Stack,
  LinearProgress,
  CircularProgress,
  Avatar,
  IconButton,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  Rating,
  Badge,
  Fab,
  Snackbar,
  Grid,
} from "@mui/material";
import {
  Favorite,
  Share,
  Add,
  Delete,
  Edit,
  Star,
  NotificationsNone,
  ShoppingCart,
} from "@mui/icons-material";
import MainLayout from "../components/layout/MainLayout";

function Example() {
  const [count, setCount] = useState(0);
  const [textValue, setTextValue] = useState("");
  const [switchChecked, setSwitchChecked] = useState(false);
  const [sliderValue, setSliderValue] = useState(30);
  const [rating, setRating] = useState<number | null>(4);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [chips, setChips] = useState([
    { id: 1, label: "React", color: "primary" as const },
    { id: 2, label: "TypeScript", color: "secondary" as const },
    { id: 3, label: "MUI", color: "success" as const },
    { id: 4, label: "Vite", color: "warning" as const },
  ]);

  const handleDeleteChip = (chipToDelete: { id: number }) => {
    setChips((chips) => chips.filter((chip) => chip.id !== chipToDelete.id));
  };

  return (
    <MainLayout>
      <Box sx={{ py: 4 }}>
        {/* 标题区域 */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            MUI 组件演示
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            探索 Material-UI 的常用组件
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* 按钮组件演示 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  按钮组件
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2}>
                    <Button variant="text">Text</Button>
                    <Button variant="contained">Contained</Button>
                    <Button variant="outlined">Outlined</Button>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" color="secondary">
                      Secondary
                    </Button>
                    <Button variant="contained" color="success">
                      Success
                    </Button>
                    <Button variant="outlined" color="error">
                      Error
                    </Button>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setCount(count + 1)}
                    >
                      点击次数: {count}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setSnackbarOpen(true)}
                    >
                      显示通知
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* 表单组件演示 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  表单组件
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    label="用户名"
                    variant="outlined"
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="密码"
                    type="password"
                    variant="outlined"
                    fullWidth
                  />
                  <TextField
                    label="多行文本"
                    multiline
                    rows={3}
                    variant="outlined"
                    fullWidth
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={switchChecked}
                        onChange={(e) => setSwitchChecked(e.target.checked)}
                      />
                    }
                    label="启用通知"
                  />
                  <Box>
                    <Typography gutterBottom>音量调节</Typography>
                    <Slider
                      value={sliderValue}
                      onChange={(_, newValue) =>
                        setSliderValue(newValue as number)
                      }
                      valueLabelDisplay="auto"
                    />
                  </Box>
                  <Box>
                    <Typography component="legend">评分</Typography>
                    <Rating
                      value={rating}
                      onChange={(_, newValue) => setRating(newValue)}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* 标签和进度条 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  标签和进度
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      技术栈标签
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {chips.map((chip) => (
                        <Chip
                          key={chip.id}
                          label={chip.label}
                          color={chip.color}
                          onDelete={() => handleDeleteChip(chip)}
                          variant="filled"
                        />
                      ))}
                    </Stack>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      加载进度
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={65}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <CircularProgress size={40} />
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* 用户界面元素 */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  界面元素
                </Typography>
                <Stack spacing={3}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main" }}>A</Avatar>
                    <Avatar alt="User" src="/static/images/avatar/1.jpg" />
                    <Badge badgeContent={4} color="error">
                      <NotificationsNone />
                    </Badge>
                  </Box>
                  <Divider />
                  <Stack direction="row" spacing={1}>
                    <IconButton color="primary">
                      <Favorite />
                    </IconButton>
                    <IconButton color="secondary">
                      <Share />
                    </IconButton>
                    <IconButton color="success">
                      <Edit />
                    </IconButton>
                    <IconButton color="error">
                      <Delete />
                    </IconButton>
                  </Stack>
                  <Alert severity="success">这是一个成功提示信息！</Alert>
                  <Alert severity="warning">这是一个警告信息，请注意！</Alert>
                </Stack>
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<Star />}>
                  收藏
                </Button>
                <Button size="small" endIcon={<Share />}>
                  分享
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* 产品卡片示例 */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Typography variant="h5">产品展示</Typography>
                  <Chip label="新品" color="primary" size="small" />
                </Box>
                <Grid container spacing={3}>
                  {[1, 2, 3].map((item) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={item}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box
                            sx={{
                              height: 120,
                              bgcolor: "grey.100",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mb: 2,
                              borderRadius: 1,
                            }}
                          >
                            <Typography color="text.secondary">
                              产品图片 {item}
                            </Typography>
                          </Box>
                          <Typography variant="h6" gutterBottom>
                            产品 {item}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            这是产品 {item} 的详细描述信息。
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mt: 2,
                            }}
                          >
                            <Typography variant="h6" color="primary">
                              ¥{99 + item * 50}
                            </Typography>
                            <Rating
                              value={4}
                              size="small"
                              sx={{ ml: 1 }}
                              readOnly
                            />
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button size="small" variant="contained" fullWidth>
                            加入购物车
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 快捷操作 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  快捷操作
                </Typography>
                <Stack spacing={2}>
                  <Button variant="outlined" startIcon={<Add />} fullWidth>
                    添加新项目
                  </Button>
                  <Button variant="outlined" startIcon={<Edit />} fullWidth>
                    编辑内容
                  </Button>
                  <Button variant="outlined" startIcon={<Delete />} fullWidth>
                    删除项目
                  </Button>
                  <Divider />
                  <Typography variant="body2" color="text.secondary">
                    编辑 <code>src/pages/App.tsx</code> 查看源代码
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 浮动操作按钮 */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
          }}
        >
          <ShoppingCart />
        </Fab>

        {/* 通知栏 */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message="这是一个通知消息！"
        />
      </Box>
    </MainLayout>
  );
}

export default Example;
