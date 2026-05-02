import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Stack,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import { Log } from "logging-middleware";
import NavBar from "@/components/NavBar";
import NotificationCard from "@/components/NotificationCard";
import { useNotifications } from "@/hooks/useNotifications";
import { useViewed } from "@/hooks/useViewed";
import { topN } from "@/lib/priority";

// no limit/page params - fetch the default full list and rank locally
// the server rejects large limit values with 400 so we just take what it gives

export default function PriorityPage() {
  const [n, setN] = useState<number>(10);

  useEffect(() => {
    Log("frontend", "info", "page", "priority page mounted");
  }, []);

  // pull the default full list and score locally
  const { data, loading, error } = useNotifications({});
  const { viewed, markViewed } = useViewed();

  // exclude already-read items from the priority pool
  const unread = useMemo(() => data.filter((x) => !viewed.has(x.ID)), [data, viewed]);
  const top = useMemo(() => topN(unread, n), [unread, n]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <NavBar />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Priority Inbox
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Top unread notifications, ranked by type weight and recency.
          Placement &gt; Result &gt; Event.
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="topn-label">Show top</InputLabel>
              <Select
                labelId="topn-label"
                label="Show top"
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
              >
                {[5, 10, 15, 20].map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              From {unread.length} unread of {data.length} total fetched
            </Typography>
          </Stack>
        </Paper>

        {loading && (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        )}

        {error && !loading && <Alert severity="error">{error}</Alert>}

        {!loading && !error && top.length === 0 && (
          <Alert severity="info">
            No unread notifications. Everything's been seen.
          </Alert>
        )}

        {!loading && !error && top.length > 0 && (
          <Stack spacing={1.5}>
            {top.map((item) => (
              <NotificationCard
                key={item.ID}
                notification={item}
                isNew={true}
                onClick={() => markViewed(item.ID)}
              />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
