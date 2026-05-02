import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Stack,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Pagination,
  Button,
  Chip,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { Log } from "logging-middleware";
import NavBar from "@/components/NavBar";
import NotificationCard from "@/components/NotificationCard";
import TypeFilter, { FilterValue } from "@/components/TypeFilter";
import { useNotifications } from "@/hooks/useNotifications";
import { useViewed } from "@/hooks/useViewed";

const PAGE_SIZE = 5;

export default function Home() {
  const [filter, setFilter] = useState<FilterValue>("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    Log("frontend", "info", "page", "all-notifications page mounted");
  }, []);

  // reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter]);

  const { data, loading, error } = useNotifications({
    limit: PAGE_SIZE,
    page,
    type: filter,
  });

  const { viewed, markViewed, markManyViewed } = useViewed();

  // unread count on the current page (we don't have global count without another fetch)
  const unreadOnPage = useMemo(
    () => data.filter((n) => !viewed.has(n.ID)).length,
    [data, viewed]
  );

  const onMarkAll = () => {
    markManyViewed(data.map((n) => n.ID));
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <NavBar />
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mb: 1 }}
        >
          <Typography variant="h5">All Notifications</Typography>
          {!loading && data.length > 0 && (
            <Chip
              size="small"
              label={`${unreadOnPage} unread`}
              color={unreadOnPage > 0 ? "secondary" : "default"}
              sx={{ ml: { sm: 1 } }}
            />
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Filter by type and click a card to mark it as read.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{ mb: 3 }}
        >
          <TypeFilter value={filter} onChange={setFilter} />
          <Box sx={{ flexGrow: 1 }} />
          <Button
            size="small"
            variant="outlined"
            startIcon={<DoneAllIcon />}
            disabled={unreadOnPage === 0 || loading}
            onClick={onMarkAll}
          >
            Mark all as read
          </Button>
        </Stack>

        {loading && (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        )}

        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && data.length === 0 && (
          <Alert severity="info">No notifications to show.</Alert>
        )}

        {!loading && !error && data.length > 0 && (
          <>
            <Stack spacing={1.5}>
              {data.map((n) => (
                <NotificationCard
                  key={n.ID}
                  notification={n}
                  isNew={!viewed.has(n.ID)}
                  onClick={() => markViewed(n.ID)}
                />
              ))}
            </Stack>

            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Pagination
                count={page + (data.length === PAGE_SIZE ? 1 : 0)}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
              />
            </Stack>
          </>
        )}
      </Container>
    </Box>
  );
}
