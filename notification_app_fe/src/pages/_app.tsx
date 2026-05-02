import type { AppProps } from "next/app";
import Head from "next/head";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/styles/theme";
import { initLogger } from "@/lib/initLogger";
import { Log } from "logging-middleware";
import { useEffect } from "react";

// init logger as early as possible - it's safe to call this on every render
initLogger();

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    Log("frontend", "info", "config", "app booted");
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Head>
        <title>Campus Notifications</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
