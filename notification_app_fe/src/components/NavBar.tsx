import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import Link from "next/link";

export default function NavBar() {
  return (
    <AppBar position="sticky" elevation={1} color="default">
      <Toolbar>
        <NotificationsIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: 700, color: "primary.main" }}
        >
          Campus Notifications
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button size="small" startIcon={<NotificationsIcon />}>
              All
            </Button>
          </Link>
          <Link href="/priority" style={{ textDecoration: "none" }}>
            <Button size="small" color="secondary" startIcon={<StarIcon />}>
              Priority
            </Button>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
