import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";

declare const __API_KEY__: string;

setAuthTokenGetter(() => __API_KEY__ || null);

createRoot(document.getElementById("root")!).render(<App />);
