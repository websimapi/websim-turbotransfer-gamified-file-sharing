import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { Upload, Download, File, Play, Zap, ShieldAlert, Wifi } from "lucide-react";
import { room, initStore, formatBytes, initAudio, playSound, filesStore } from "./store.js";
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
      lineNumber: 138,
      columnNumber: 9
    },
    this
  );
}
function App() {
  const [view, setView] = useState("list");
  const [isUploading, setIsUploading] = useState(false);
  const files = useSyncExternalStore(
    filesStore.subscribe,
    filesStore.getSnapshot
  );
  const [activeFile, setActiveFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  useEffect(() => {
    initStore();
    initAudio();
  }, []);
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await window.websim.upload(file);
      await room.collection("files").create({
        name: file.name,
        size: file.size,
        type: file.type,
        url
      });
      playSound("boost");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed! Check console.");
    } finally {
      setIsUploading(false);
    }
  };
  useEffect(() => {
    if (view !== "download" || !activeFile) return;
    let interval;
    if (progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 0.1;
          return next > 100 ? 100 : next;
        });
        setDownloadSpeed((Math.random() * 0.5 + 0.1).toFixed(1));
      }, 100);
    } else {
      playSound("complete");
      const link = document.createElement("a");
      link.href = activeFile.url;
      link.download = activeFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        setView("list");
        setProgress(0);
        setActiveFile(null);
      }, 2e3);
    }
    return () => clearInterval(interval);
  }, [view, activeFile, progress]);
  const handleBoost = (amount) => {
    setProgress((prev) => {
      let next = prev + amount;
      if (next < 0) next = 0;
      if (next > 100) next = 100;
      return next;
    });
    setDownloadSpeed((Math.random() * 20 + 10).toFixed(1));
    setTimeout(() => setDownloadSpeed((Math.random() * 2 + 1).toFixed(1)), 500);
  };
  const startDownload = (file) => {
    setActiveFile(file);
    setProgress(0);
    setView("download");
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "h-full w-full relative scanlines flex flex-col", children: [
    /* @__PURE__ */ jsxDEV("header", { className: "flex-none p-4 border-b border-cyan-800 bg-slate-900/90 backdrop-blur z-20 flex justify-between items-center shadow-[0_0_15px_rgba(6,182,212,0.3)]", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxDEV(Wifi, { className: `w-5 h-5 ${isUploading ? "animate-pulse text-yellow-400" : "text-cyan-400"}` }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 259,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("h1", { className: "text-xl font-bold tracking-widest text-cyan-100", children: [
          "TURBO",
          /* @__PURE__ */ jsxDEV("span", { className: "text-cyan-500", children: "TRANSFER" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 260,
            columnNumber: 90
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 260,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 258,
        columnNumber: 17
      }, this),
      view === "download" && /* @__PURE__ */ jsxDEV("button", { onClick: () => setView("list"), className: "text-xs border border-cyan-700 px-2 py-1 hover:bg-cyan-900/50", children: "ABORT" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 263,
        columnNumber: 22
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 257,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("main", { className: "flex-1 relative overflow-hidden", children: [
      view === "list" && /* @__PURE__ */ jsxDEV("div", { className: "h-full flex flex-col p-4 max-w-2xl mx-auto w-full", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex-none mb-6", children: /* @__PURE__ */ jsxDEV("label", { className: `
                                flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer 
                                transition-all duration-300 group
                                ${isUploading ? "border-yellow-500 bg-yellow-900/10" : "border-cyan-700 bg-slate-800/50 hover:bg-slate-800 hover:border-cyan-400"}
                            `, children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center justify-center pt-5 pb-6", children: [
            isUploading ? /* @__PURE__ */ jsxDEV("div", { className: "animate-spin mb-2", children: /* @__PURE__ */ jsxDEV(Upload, { className: "w-8 h-8 text-yellow-500" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 286,
              columnNumber: 45
            }, this) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 285,
              columnNumber: 41
            }, this) : /* @__PURE__ */ jsxDEV(Upload, { className: "w-8 h-8 mb-2 text-cyan-500 group-hover:scale-110 transition-transform" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 289,
              columnNumber: 41
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "mb-2 text-sm text-cyan-300", children: isUploading ? "ENCRYPTING & UPLOADING..." : "Click to Upload File" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 291,
              columnNumber: 37
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-cyan-600", children: "Secure Protocol v1.0" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 294,
              columnNumber: 37
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 283,
            columnNumber: 33
          }, this),
          /* @__PURE__ */ jsxDEV("input", { type: "file", className: "hidden", onChange: handleFileUpload, disabled: isUploading }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 296,
            columnNumber: 33
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 278,
          columnNumber: 29
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 277,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-y-auto pr-2 space-y-3", children: [
          /* @__PURE__ */ jsxDEV("h2", { className: "text-cyan-500 text-sm border-b border-cyan-900 pb-1 mb-2 sticky top-0 bg-slate-900", children: "AVAILABLE DATA STREAMS" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 302,
            columnNumber: 29
          }, this),
          files.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "text-center text-slate-600 py-10 italic", children: "No signals detected..." }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 304,
            columnNumber: 33
          }, this) : [...files].reverse().map((file) => /* @__PURE__ */ jsxDEV("div", { className: "group bg-slate-800/50 border border-slate-700 hover:border-cyan-500 p-3 rounded flex justify-between items-center transition-all hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3 overflow-hidden", children: [
              /* @__PURE__ */ jsxDEV(File, { className: "w-5 h-5 text-cyan-600 flex-shrink-0" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 309,
                columnNumber: 45
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxDEV("p", { className: "text-cyan-100 font-medium truncate text-sm", children: file.name }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 311,
                  columnNumber: 49
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-slate-400", children: [
                  formatBytes(file.size),
                  " \u2022 ",
                  new Date(file.created_at).toLocaleDateString()
                ] }, void 0, true, {
                  fileName: "<stdin>",
                  lineNumber: 312,
                  columnNumber: 49
                }, this)
              ] }, void 0, true, {
                fileName: "<stdin>",
                lineNumber: 310,
                columnNumber: 45
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 308,
              columnNumber: 41
            }, this),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => startDownload(file),
                className: "ml-3 px-3 py-1.5 bg-cyan-900/30 hover:bg-cyan-500 hover:text-white border border-cyan-700 rounded text-xs font-bold transition-colors flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsxDEV(Download, { className: "w-3 h-3" }, void 0, false, {
                    fileName: "<stdin>",
                    lineNumber: 319,
                    columnNumber: 45
                  }, this),
                  "PULL"
                ]
              },
              void 0,
              true,
              {
                fileName: "<stdin>",
                lineNumber: 315,
                columnNumber: 41
              },
              this
            )
          ] }, file.id, true, {
            fileName: "<stdin>",
            lineNumber: 307,
            columnNumber: 37
          }, this))
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 301,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 274,
        columnNumber: 21
      }, this),
      view === "download" && activeFile && /* @__PURE__ */ jsxDEV("div", { className: "h-full flex flex-col relative", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 z-0", children: /* @__PURE__ */ jsxDEV(MiniGame, { onBoost: handleBoost, isActive: progress < 100 }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 334,
          columnNumber: 29
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 333,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 bg-slate-900/20", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "text-center space-y-1", children: [
            /* @__PURE__ */ jsxDEV("h2", { className: "text-lg font-bold text-white drop-shadow-[0_0_5px_rgba(0,0,0,1)]", children: activeFile.name }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 342,
              columnNumber: 33
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "inline-flex items-center gap-4 bg-black/60 px-4 py-1 rounded-full border border-cyan-500/30 backdrop-blur-md", children: /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-cyan-300", children: [
              "SPEED: ",
              /* @__PURE__ */ jsxDEV("span", { className: "text-white font-mono text-lg", children: downloadSpeed }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 345,
                columnNumber: 48
              }, this),
              " MB/s"
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 344,
              columnNumber: 37
            }, this) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 343,
              columnNumber: 33
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 341,
            columnNumber: 29
          }, this),
          progress < 5 && /* @__PURE__ */ jsxDEV("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center animate-pulse", children: [
            /* @__PURE__ */ jsxDEV(Zap, { className: "w-12 h-12 text-yellow-400 mx-auto mb-2" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 353,
              columnNumber: 37
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-xl font-bold text-white bg-black/50 px-3 py-1", children: "TAP BLUE DATA PACKETS!" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 354,
              columnNumber: 37
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-red-400 bg-black/50 px-3 py-1 mt-1", children: "AVOID RED VIRUSES!" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 355,
              columnNumber: 37
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 352,
            columnNumber: 33
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-2 mb-4", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between text-xs font-bold px-1 text-cyan-300 bg-black/40 rounded py-1 backdrop-blur", children: [
              /* @__PURE__ */ jsxDEV("span", { children: "TRANSFER PROGRESS" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 362,
                columnNumber: 37
              }, this),
              /* @__PURE__ */ jsxDEV("span", { children: [
                Math.floor(progress),
                "%"
              ] }, void 0, true, {
                fileName: "<stdin>",
                lineNumber: 363,
                columnNumber: 37
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 361,
              columnNumber: 33
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "h-6 bg-slate-800 border border-slate-600 rounded-sm overflow-hidden relative", children: /* @__PURE__ */ jsxDEV(
              "div",
              {
                className: "h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-100 ease-out relative",
                style: { width: `${progress}%` },
                children: /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 bg-white/20 w-full h-full animate-[pulse_1s_infinite]" }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 370,
                  columnNumber: 41
                }, this)
              },
              void 0,
              false,
              {
                fileName: "<stdin>",
                lineNumber: 366,
                columnNumber: 37
              },
              this
            ) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 365,
              columnNumber: 33
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 360,
            columnNumber: 29
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 338,
          columnNumber: 25
        }, this),
        progress >= 100 && /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 z-50 bg-slate-900/90 flex flex-col items-center justify-center animate-in fade-in duration-500", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "rounded-full bg-cyan-500/20 p-6 mb-4 glow-effect", children: /* @__PURE__ */ jsxDEV(Download, { className: "w-12 h-12 text-cyan-400" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 380,
            columnNumber: 37
          }, this) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 379,
            columnNumber: 33
          }, this),
          /* @__PURE__ */ jsxDEV("h2", { className: "text-2xl font-bold text-white mb-2", children: "TRANSFER COMPLETE" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 382,
            columnNumber: 33
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-cyan-500 animate-bounce", children: "File saved to device" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 383,
            columnNumber: 33
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 378,
          columnNumber: 29
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 331,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 270,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 255,
    columnNumber: 9
  }, this);
}
const root = createRoot(document.getElementById("root"));
root.render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 394,
  columnNumber: 13
}));
export {
  App as default
};
