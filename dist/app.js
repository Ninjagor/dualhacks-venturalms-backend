"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_middleware_1 = __importDefault(require("./middleware/cors.middleware"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const assignment_routes_1 = __importDefault(require("./routes/assignment.routes"));
const class_routes_1 = __importDefault(require("./routes/class.routes"));
const parents_routes_1 = __importDefault(require("./routes/parents.routes"));
const forum_routes_1 = __importDefault(require("./routes/forum.routes"));
const errorhandler_middleware_1 = __importDefault(require("./middleware/errorhandler.middleware"));
// Create app
const app = (0, express_1.default)();
// Apply CORS
app.use(cors_middleware_1.default);
// Parse request body as JSON
app.use(express_1.default.json());
// userRoute
app.use(user_routes_1.default);
app.use(auth_routes_1.default);
app.use(class_routes_1.default);
app.use(assignment_routes_1.default);
app.use(parents_routes_1.default);
app.use(forum_routes_1.default);
app.use(errorhandler_middleware_1.default);
exports.default = app;
