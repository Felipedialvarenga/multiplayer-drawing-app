"use client";
import { useDrawn } from "@/hooks/useDraw";
import { drawLine } from "@/utils/drawnLine";
import { FC, useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { io } from "socket.io-client";
const socket = io("http://localhost:3001");

interface pageProps {}

const Page: FC<pageProps> = ({}) => {
  const { canvasRef, onMouseDown, clear } = useDrawn(createLine);
  const [color, setColor] = useState("#000");

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    socket.emit("client-ready");

    socket.on("get-canvas-state", () => {
      if (!canvasRef.current?.toDataURL()) return;
      socket.emit("canvas-state", canvasRef.current.toDataURL());
    });

    socket.on("canvas-state-from-server", (state: string) => {
      const img = new Image();
      img.src = state;
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
    });

    socket.on(
      "draw-line",
      ({ previousPoint, currentPoint, color }: DrawLineProps) => {
        if (!ctx) return;
        drawLine({ previousPoint, currentPoint, ctx, color });
      }
    );

    socket.on("clear", clear);

    return () => {
      socket.off("draw-line");
      socket.off("get-canvas-state");
      socket.off("canvas-state-from-server");
      socket.off("clear");
    };
  }, [canvasRef, clear]);

  function createLine({ ctx, currentPoint, previousPoint }: Draw) {
    socket.emit("draw-line", { previousPoint, currentPoint, color });
    drawLine({ previousPoint, currentPoint, ctx, color });
  }

  return (
    <div className="h-screen min-w-max bg-white flex justify-center items-center gap-10 p-5 bg-green">
      <div className="flex flex-col justify-center items-center gap-10 p-5 rounded-md bg-brown shadow-lg shadow-black">
        <h2 className="font-sans text-lg font-semibold">Drawing App</h2>
        <HexColorPicker color={color} onChange={setColor} />
        <button
          type="button"
          onClick={() => socket.emit("clear")}
          className="p-2 rounded-md border border-black bg-beige"
        >
          Clear Canvas
        </button>
      </div>

      <canvas
        onMouseDown={onMouseDown}
        ref={canvasRef}
        height={750}
        width={750}
        className="border border-black rounded-md bg-white"
      />
    </div>
  );
};

export default Page;
