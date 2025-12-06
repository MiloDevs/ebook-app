import { hc } from "hono/client";
import { AppType } from "../../ebook-app-backend/src/index";

const client = hc<AppType>("http://localhost:3001/");

export { client as honoclient };
