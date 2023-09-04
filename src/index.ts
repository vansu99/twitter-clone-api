import express from "express";
import usersRouter from "~/routes/users.routes";
import databaseService from "./services/database.services";
import { defaultErrorHandler } from "./middlewares/errors.middlewares";

databaseService.connect().catch(console.dir);

const app = express();
const port = 3000;

app.use(express.json());
app.use("/users", usersRouter);
app.use(defaultErrorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
