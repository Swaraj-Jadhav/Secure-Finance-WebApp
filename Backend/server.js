import express from "express";

const app = express();

app.get("/api/test", (req, res) => {
    res.send("Api is working");
});

app.listen(5001, () => {
    console.log("Server Started");
});