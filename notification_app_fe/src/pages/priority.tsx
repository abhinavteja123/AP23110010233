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
import { useViewed } from "@/hooks/useViewed";
import { topN, scoreOf } from "@/lib/priority";
import { fetchAll } from "@/lib/api";
import type { Notification } from "@/lib/types";

export default function PriorityPage() {
  const [n, setN] = useState<number>(10);
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Log("frontend", "info", "page", "priority page mounted");
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    fetchAll()
      .then((list) => {
        if (!alive) return;
        setData(list);
        setLoading(false);
      })
      .catch((err) => {
        if (!alive) return;
        const status = err?.response?.status ?? "net";
        Log("frontend", "error", "page", `priority load fail: ${status}`);
        setError(`Could not load notifications (${status})`);
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const { viewed, markViewed } = useViewed();

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
              Showing top {top.length} from {unread.length} unread of {data.length} total fetched
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
            {top.map((item, i) => (
              <NotificationCard
                key={item.ID}
                notification={item}
                isNew={true}
                rank={i + 1}
                score={scoreOf(item)}
                onClick={() => markViewed(item.ID)}
              />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
