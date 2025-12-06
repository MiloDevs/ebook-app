import { hc } from "hono/client";
import type { AppType } from "../../backend/src/index.ts";

export const apiClient = hc<AppType>("http://100.83.233.106:3001/");
