"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parents_controller_1 = __importDefault(require("../controllers/parents.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const router = (0, express_1.Router)();
// Route for fetching all users
router.get('/parents', parents_controller_1.default.getAllParents);
router.get('/get/parentinbox/:offset', auth_middleware_1.default, parents_controller_1.default.viewParentInbox);
router.post('/create/parent', parents_controller_1.default.createNewParent);
router.post('/pair/student', auth_middleware_1.default, parents_controller_1.default.addChild);
router.get('/getchildren', auth_middleware_1.default, parents_controller_1.default.getChildren);
exports.default = router;
