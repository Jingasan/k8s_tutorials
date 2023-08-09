import express, { Router, Request, Response, NextFunction } from "express";
export const Service2 = () => {
  const router: Router = express.Router();
  // GET /service2/:id
  router.get(
    "/:id",
    async (req: Request, res: Response, _next: NextFunction) => {
      return res.status(200).json({ Query: req.query });
    }
  );
  // POST /service2/:id
  router.post(
    "/:id",
    async (req: Request, res: Response, _next: NextFunction) => {
      return res.status(200).json({ PostBody: req.body });
    }
  );
  // PUT /service2/:id
  router.put(
    "/:id",
    async (req: Request, res: Response, _next: NextFunction) => {
      return res.status(200).json({ RequestHeader: req.headers });
    }
  );
  // DELETE /service2/:id
  router.delete(
    "/:id",
    async (req: Request, res: Response, _next: NextFunction) => {
      return res.status(200).json({ URLParams: req.params.id });
    }
  );
  return router;
};
