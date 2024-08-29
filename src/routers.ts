import { Router } from "express";
import { measurementController } from "./app/controller/MeasurementController";
import { fileController } from "./app/controller/FileController";

const router: Router = Router()

//Routes
router.post("/upload", measurementController.upload);
router.patch("/confirm", measurementController.confirm);
router.get("/:customer_code/list", measurementController.list);

router.get("/get-file/:customer_code/:file_name", fileController.getFile);

export { router };