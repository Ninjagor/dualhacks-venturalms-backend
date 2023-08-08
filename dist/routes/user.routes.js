"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const noparent_middleware_1 = __importDefault(require("../middleware/noparent.middleware"));
const router = (0, express_1.Router)();
// Route for fetching all users
router.get('/users', user_controller_1.default.getAllUsers);
router.post('/create/user', user_controller_1.default.createNewUserWithCredentials);
router.get('/classesasstudent', auth_middleware_1.default, noparent_middleware_1.default, user_controller_1.default.getClassesAsStudent);
router.get('/classesasadmin', auth_middleware_1.default, noparent_middleware_1.default, user_controller_1.default.getClassesAsAdmin);
exports.default = router;
