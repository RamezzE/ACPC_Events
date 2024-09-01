import { Router } from 'express';
var router = Router();

import AdminController from './../controllers/admin_controller.js';

router.get("/", AdminController.get_admins);
router.get("/:name", AdminController.get_admin_by_name);

// if no session abort
router.use((req, res, next) => {
  if (!req.session.user || req.session.user.mode != "super_admin") {
    res.json({ success: false, errorMsg: "Please log in" });
  } else {
    next();
  }
});

router.put("/", AdminController.add_admin);

router.post("/update", AdminController.update_admin);

router.delete("/:name", AdminController.delete_admin);

export default router;