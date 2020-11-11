import mongoose from "mongoose"
import C from "./consts"

const db = mongoose.createConnection(C.DB_CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

export default db;
