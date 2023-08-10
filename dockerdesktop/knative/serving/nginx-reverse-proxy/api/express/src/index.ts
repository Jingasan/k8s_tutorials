import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { Service1 } from "./service1";
import { Service2 } from "./service2";
const app: Application = express();
const PORT = 3000;
// リクエストボディのパース用設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// CORS設定
app.use(cors());

// Routerの追加
app.use("/api/service1", Service1());
app.use("/api/service2", Service2());

// Error 404 Not Found
app.use(async (_req: Request, res: Response, _next: NextFunction) => {
  return res.status(404).json({ error: "Not Found" });
});

// サーバーを起動する処理
try {
  app.listen(PORT, () => {
    console.log("server running at port:" + PORT);
  });
} catch (e) {
  if (e instanceof Error) {
    console.error(e.message);
  }
}
