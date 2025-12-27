import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { playSound } from "./store.js";
function MiniGame({ onBoost, isActive }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const requestRef = useRef();
  const gameState = useRef({
    packets: [],
    lastSpawn: 0,
    spawnRate: 1e3,
    width: 0,
    height: 0
  });
  const packetImg = useRef(new Image());
  const virusImg = useRef(new Image());
  useEffect(() => {
    packetImg.current.src = "packet.png";
    virusImg.current.src = "virus.png";
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gameState.current.width = canvas.width;
      gameState.current.height = canvas.height;
    };
    window.addEventListener("resize", resize);
    resize();
    const update = (time) => {
      if (!isActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (time - gameState.current.lastSpawn > gameState.current.spawnRate) {
        const isVirus = Math.random() < 0.2;
        gameState.current.packets.push({
          id: Math.random(),
          x: Math.random() * (canvas.width - 60) + 30,
          y: -50,
          speed: (Math.random() * 2 + 2) * (canvas.height / 500),
          // Scale speed by height
          type: isVirus ? "virus" : "packet",
          size: 50
        });
        gameState.current.lastSpawn = time;
        gameState.current.spawnRate = Math.max(300, 1e3 - score * 10);
      }
      for (let i = gameState.current.packets.length - 1; i >= 0; i--) {
        const p = gameState.current.packets[i];
        p.y += p.speed;
        const img = p.type === "virus" ? virusImg.current : packetImg.current;
        ctx.save();
        const pulse = 1 + Math.sin(time / 200) * 0.1;
        ctx.translate(p.x, p.y);
        ctx.scale(pulse, pulse);
        if (img.complete) {
          ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx.fillStyle = p.type === "virus" ? "red" : "cyan";
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
        if (p.y > canvas.height + 50) {
          gameState.current.packets.splice(i, 1);
        }
      }
      requestRef.current = requestAnimationFrame(update);
    };
    requestRef.current = requestAnimationFrame(update);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, score]);
  const handleTouch = useCallback((e) => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    for (let i = gameState.current.packets.length - 1; i >= 0; i--) {
      const p = gameState.current.packets[i];
      const dx = x - p.x;
      const dy = y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < p.size) {
        gameState.current.packets.splice(i, 1);
        if (p.type === "virus") {
          onBoost(-15);
        } else {
          playSound("boost");
          setScore((s) => s + 1);
          onBoost(5);
        }
      }
    }
  }, [isActive, onBoost]);
  return /* @__PURE__ */ jsxDEV(
    "canvas",
    {
      ref: canvasRef,
      className: "w-full h-full cursor-crosshair touch-none",
      onMouseDown: handleTouch,
      onTouchStart: handleTouch
    },
    void 0,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 136,
      columnNumber: 9
    },
    this
  );
}
window.MiniGame = MiniGame;
