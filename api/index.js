const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("../utils/connectDB");
const userRouter = require("../routes/auth");
const analyticsRouter = require("../routes/analytics");

connectDB();
const app = express();

app.use(express.json())
app.use(cookieParser());
// app.use(cors({ origin: true, credentials: true }));
// app.use(cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:3000" || "http://localhost:5173",
//     credentials: true,
// }));
const corsOptions = {
    origin: process.env.FRONTEND_URL || ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.static('public'));

app.use("/auth", userRouter)
app.use("/analytics", analyticsRouter)

app.get('/test', (req, res) => {
    res.send('Server is running')
})
app.get("/", (req, res) => res.send("Express on Vercel"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server ready on port ${port}`)
})

module.exports = app;