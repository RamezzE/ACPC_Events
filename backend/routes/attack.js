import { Router } from "express";
import Settings from "../models/setting.js";
import AttackController from "./../controllers/attack_controller.js";

var router = Router();
// Middleware to check if the game is active
const checkGameStatus = async (req, res, next) => {
  try {
    const setting = await Settings.findOne({ name: "Game Status" });
    
    if (setting && setting.value === "Active") {
      next(); // Proceed to the route handler
    } else {
      res.json({ success: false, errorMsg: "Game has ended or is paused" });
    }
  } catch (error) {
    console.error('Error checking game status:', error);
    res.json({ success: false, errorMsg: "Internal server error" });
  }
};

// Define routes without middleware
router.get("/", AttackController.get_attacks);
router.get("/wars/:war", AttackController.get_attacks_by_war);
router.get("/expiry/:attack_id", AttackController.get_attack_expiry_time);

// Apply middleware to routes that need game status check

router.use((req, res, next) => {
  if (!req.session.user) {
    res.json({ success: false, errorMsg: "Please log in" });
  } else {
    next();
  }
});

router.post("/attack", checkGameStatus, AttackController.attack);
router.post("/check", checkGameStatus, AttackController.attack_check);

router.use((req, res, next) => {
  if (req.session.user.mode != "super_admin" && req.session.user.mode != "admin") {
    res.json({ success: false, errorMsg: "You cannot do this action" });
  } else {
    next();
  }
});

router.post("/set_result", checkGameStatus, AttackController.set_attack_result);
router.delete("/", checkGameStatus, AttackController.delete_attack);

export default router;
