
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout:90000,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if(error.response?.status === 401
            &&
            !error.config.url.includes("/auth/login") ) {
            localStorage.removeItem("token");
            localStorage.removeItem("authUser");
            window.location.href = "/login";
            return Promise.reject(error);
        }

        // An admin disabling a user mid-session shouldn't just show a red
        // error banner on whatever action they were attempting — the backend
        // (JwtFilter + the explicit checks in booking/payment) returns 403
        // with this exact message, so force the same logout 401 gets.
        if (
            error.response?.status === 403 &&
            error.response?.data?.message?.toLowerCase().includes("disabled")
        ) {
            localStorage.removeItem("token");
            localStorage.removeItem("authUser");
            window.location.href = "/login";
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;