import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "../redux/category/categorySlice";
import propertyReducer from "../redux/property/propertySlice";
import bookingReducer from "../redux/booking/bookingSlice";
import adminUserReducer from "../redux/admin/adminUserSlice";
import userReducer from "../redux/user/userSlice";
import reviewReducer from "../redux/review/reviewSlice";
import otpReducer from "../redux/otp/otpSlice";
import authReducer from "../redux/auth/authSlice";
import reportReducer from "../redux/report/reportSlice";
import paymentReducer from "../redux/payment/paymentSlice";
import dashboardReducer from "../redux/dashboard/dashboardSlice";
import commentReducer from "../redux/comment/commentSlice";
import notificationReducer from "../redux/notification/notificationSlice";
import savedReducer from "../redux/saved/savedSlice";
import userReportReducer from "../redux/userReport/userReportSlice";

export const store = configureStore({
    reducer: {
        categories: categoryReducer,
        properties:propertyReducer,
        booking:bookingReducer,
        adminUser: adminUserReducer,
        user:userReducer,
        // Bug fix: every selector in reviewSlice.js reads `state.review.*`
        // (singular) — this was registered as `reviews` (plural), so any
        // component using the slice hit "Cannot read properties of undefined".
        // Never surfaced before because the slice was previously 100% unused.
        review:reviewReducer,
        otp:otpReducer,
        auth:authReducer,
        report: reportReducer,
        payment:paymentReducer,
        dashboard:dashboardReducer,
        comment:commentReducer,
        notification:notificationReducer,
        saved:savedReducer,
        userReport:userReportReducer,
    },
});
