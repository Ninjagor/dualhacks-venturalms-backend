"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const class_controller_1 = __importDefault(require("../controllers/class.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const admin_middleware_1 = __importDefault(require("../middleware/admin.middleware"));
const noparent_middleware_1 = __importDefault(require("../middleware/noparent.middleware"));
const router = (0, express_1.Router)();
router.get('/getclasses', auth_middleware_1.default, noparent_middleware_1.default, class_controller_1.default.getAllClasses);
router.post('/getstudentlist', auth_middleware_1.default, noparent_middleware_1.default, admin_middleware_1.default, class_controller_1.default.getStudentsList);
router.post('/create/class', auth_middleware_1.default, noparent_middleware_1.default, class_controller_1.default.createNewClass);
router.post('/joinclass', auth_middleware_1.default, noparent_middleware_1.default, class_controller_1.default.joinClass);
exports.default = router;
