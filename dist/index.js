"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const message_route_1 = __importDefault(require("./routes/message.route"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./lib/db"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const socket_1 = require("./lib/socket");
dotenv_1.default.config();
socket_1.app.use(express_1.default.json({ limit: "10mb" }));
socket_1.app.use(express_1.default.urlencoded({ limit: "10mb", extended: true }));
socket_1.app.use((0, cookie_parser_1.default)());
socket_1.app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
// app.use(express.json());
const PORT = process.env.PORT || 8080;
// console.log(PORT);
socket_1.app.use("/api/auth", auth_route_1.default);
socket_1.app.use("/api/messages", message_route_1.default);
(0, db_1.default)()
    .then(() => {
    socket_1.server.listen(PORT, () => {
        console.log(`\n Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.log("mongoDB  connection failed !!!", error);
});
