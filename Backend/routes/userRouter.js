import express from "express"
import { registerUser,loginUser, getAllUsers, blockOrUnblockUser, getUser, loginWithGoogle, sendOTP, verifyOTP  } from "../controllers/userController.js"

let userRouter = express.Router()


userRouter.post("/", registerUser)
userRouter.post("/login", loginUser)
userRouter.get("/all", getAllUsers)
userRouter.put("/block/:email", blockOrUnblockUser)
userRouter.get("/", getUser)
userRouter.post("/google", loginWithGoogle)
userRouter.get("/sendOTP", sendOTP)
userRouter.post("/verifyEmail", verifyOTP)

export default userRouter