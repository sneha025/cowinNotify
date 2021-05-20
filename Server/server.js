const express = require("express");
const app = express();
const router = require("../Router/router");
const bodyParser = require("body-parser");
const port = 3000;

app.use(bodyParser.json());
app.use("/service", router);
app.listen(port, () => {
  console.log(`server started at ${port}`);
});
