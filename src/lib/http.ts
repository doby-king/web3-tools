import axios from "axios";

export const http = axios.create({
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Central error outlet; global toasts / reporting can be hooked in here later
    return Promise.reject(error);
  },
);
