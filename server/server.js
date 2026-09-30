const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const tagRoutes = require("./routes/tagroutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();


app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../client")));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

app.use(errorMiddleware);

app.get("/", (req, res) => {
     res.sendFile(path.join(__dirname, "../client/index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});