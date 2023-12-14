const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

import { Server } from "socket.io";

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

type Point = {
  x: number;
  y: number;
};

type DrawLine = {
  previousPoint: Point | null;
  currentPoint: Point;
  color: string;
};

io.on("connection", (socket) => {
  socket.on("client-ready", () => socket.broadcast.emit("get-canvas-state"));

  socket.on("canvas-state", (server) => {
    socket.broadcast.emit("canvas-state-from-server", server);
  });

  socket.on("draw-line", ({ previousPoint, currentPoint, color }: DrawLine) => {
    socket.broadcast.emit("draw-line", { previousPoint, currentPoint, color });
  });

  socket.on("clear", () => io.emit("clear"));
});

server.listen(3001, () => {
  console.log("✔ Server listening on port 3001");
});
