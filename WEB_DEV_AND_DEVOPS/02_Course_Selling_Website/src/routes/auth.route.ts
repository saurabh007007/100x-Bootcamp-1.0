import { Router } from "express";
import { LoginUser, SignupUser } from "../controllers/auth.controller";
const router = Router();

router.post("/login", LoginUser);
router.post("/signup", SignupUser);

export default router;
