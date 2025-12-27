import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { Upload, Download, File, Play, Zap, ShieldAlert, Wifi } from "lucide-react";
import { room, initStore, formatBytes, initAudio, playSound } from "./store.js";
const MiniGame = window.MiniGame;
function App() {
  const [view, setView] = useState("list");
  const [isUploading, setIsUploading] = useState(false);
  const files = useSyncExternalStore(
    room.collection("files").subscribe,
    room.collection("files").getList
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
          lineNumber: 120,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("h1", { className: "text-xl font-bold tracking-widest text-cyan-100", children: [
          "TURBO",
          /* @__PURE__ */ jsxDEV("span", { className: "text-cyan-500", children: "TRANSFER" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 121,
            columnNumber: 90
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 121,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 119,
        columnNumber: 17
      }, this),
      view === "download" && /* @__PURE__ */ jsxDEV("button", { onClick: () => setView("list"), className: "text-xs border border-cyan-700 px-2 py-1 hover:bg-cyan-900/50", children: "ABORT" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 124,
        columnNumber: 22
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 118,
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
              lineNumber: 147,
              columnNumber: 45
            }, this) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 146,
              columnNumber: 41
            }, this) : /* @__PURE__ */ jsxDEV(Upload, { className: "w-8 h-8 mb-2 text-cyan-500 group-hover:scale-110 transition-transform" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 150,
              columnNumber: 41
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "mb-2 text-sm text-cyan-300", children: isUploading ? "ENCRYPTING & UPLOADING..." : "Click to Upload File" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 152,
              columnNumber: 37
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-cyan-600", children: "Secure Protocol v1.0" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 155,
              columnNumber: 37
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 144,
            columnNumber: 33
          }, this),
          /* @__PURE__ */ jsxDEV("input", { type: "file", className: "hidden", onChange: handleFileUpload, disabled: isUploading }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 157,
            columnNumber: 33
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 139,
          columnNumber: 29
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 138,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-y-auto pr-2 space-y-3", children: [
          /* @__PURE__ */ jsxDEV("h2", { className: "text-cyan-500 text-sm border-b border-cyan-900 pb-1 mb-2 sticky top-0 bg-slate-900", children: "AVAILABLE DATA STREAMS" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 163,
            columnNumber: 29
          }, this),
          files.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "text-center text-slate-600 py-10 italic", children: "No signals detected..." }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 165,
            columnNumber: 33
          }, this) : [...files].reverse().map((file) => /* @__PURE__ */ jsxDEV("div", { className: "group bg-slate-800/50 border border-slate-700 hover:border-cyan-500 p-3 rounded flex justify-between items-center transition-all hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3 overflow-hidden", children: [
              /* @__PURE__ */ jsxDEV(File, { className: "w-5 h-5 text-cyan-600 flex-shrink-0" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 170,
                columnNumber: 45
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxDEV("p", { className: "text-cyan-100 font-medium truncate text-sm", children: file.name }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 172,
                  columnNumber: 49
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-slate-400", children: [
                  formatBytes(file.size),
                  " \u2022 ",
                  new Date(file.created_at).toLocaleDateString()
                ] }, void 0, true, {
                  fileName: "<stdin>",
                  lineNumber: 173,
                  columnNumber: 49
                }, this)
              ] }, void 0, true, {
                fileName: "<stdin>",
                lineNumber: 171,
                columnNumber: 45
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 169,
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
                    lineNumber: 180,
                    columnNumber: 45
                  }, this),
                  "PULL"
                ]
              },
              void 0,
              true,
              {
                fileName: "<stdin>",
                lineNumber: 176,
                columnNumber: 41
              },
              this
            )
          ] }, file.id, true, {
            fileName: "<stdin>",
            lineNumber: 168,
            columnNumber: 37
          }, this))
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 162,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 135,
        columnNumber: 21
      }, this),
      view === "download" && activeFile && /* @__PURE__ */ jsxDEV("div", { className: "h-full flex flex-col relative", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 z-0", children: /* @__PURE__ */ jsxDEV(MiniGame, { onBoost: handleBoost, isActive: progress < 100 }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 195,
          columnNumber: 29
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 194,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 bg-slate-900/20", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "text-center space-y-1", children: [
            /* @__PURE__ */ jsxDEV("h2", { className: "text-lg font-bold text-white drop-shadow-[0_0_5px_rgba(0,0,0,1)]", children: activeFile.name }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 203,
              columnNumber: 33
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "inline-flex items-center gap-4 bg-black/60 px-4 py-1 rounded-full border border-cyan-500/30 backdrop-blur-md", children: /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-cyan-300", children: [
              "SPEED: ",
              /* @__PURE__ */ jsxDEV("span", { className: "text-white font-mono text-lg", children: downloadSpeed }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 206,
                columnNumber: 48
              }, this),
              " MB/s"
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 205,
              columnNumber: 37
            }, this) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 204,
              columnNumber: 33
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 202,
            columnNumber: 29
          }, this),
          progress < 5 && /* @__PURE__ */ jsxDEV("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center animate-pulse", children: [
            /* @__PURE__ */ jsxDEV(Zap, { className: "w-12 h-12 text-yellow-400 mx-auto mb-2" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 214,
              columnNumber: 37
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-xl font-bold text-white bg-black/50 px-3 py-1", children: "TAP BLUE DATA PACKETS!" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 215,
              columnNumber: 37
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-red-400 bg-black/50 px-3 py-1 mt-1", children: "AVOID RED VIRUSES!" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 216,
              columnNumber: 37
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 213,
            columnNumber: 33
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-2 mb-4", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between text-xs font-bold px-1 text-cyan-300 bg-black/40 rounded py-1 backdrop-blur", children: [
              /* @__PURE__ */ jsxDEV("span", { children: "TRANSFER PROGRESS" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 223,
                columnNumber: 37
              }, this),
              /* @__PURE__ */ jsxDEV("span", { children: [
                Math.floor(progress),
                "%"
              ] }, void 0, true, {
                fileName: "<stdin>",
                lineNumber: 224,
                columnNumber: 37
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 222,
              columnNumber: 33
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "h-6 bg-slate-800 border border-slate-600 rounded-sm overflow-hidden relative", children: /* @__PURE__ */ jsxDEV(
              "div",
              {
                className: "h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-100 ease-out relative",
                style: { width: `${progress}%` },
                children: /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 bg-white/20 w-full h-full animate-[pulse_1s_infinite]" }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 231,
                  columnNumber: 41
                }, this)
              },
              void 0,
              false,
              {
                fileName: "<stdin>",
                lineNumber: 227,
                columnNumber: 37
              },
              this
            ) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 226,
              columnNumber: 33
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 221,
            columnNumber: 29
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 199,
          columnNumber: 25
        }, this),
        progress >= 100 && /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 z-50 bg-slate-900/90 flex flex-col items-center justify-center animate-in fade-in duration-500", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "rounded-full bg-cyan-500/20 p-6 mb-4 glow-effect", children: /* @__PURE__ */ jsxDEV(Download, { className: "w-12 h-12 text-cyan-400" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 241,
            columnNumber: 37
          }, this) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 240,
            columnNumber: 33
          }, this),
          /* @__PURE__ */ jsxDEV("h2", { className: "text-2xl font-bold text-white mb-2", children: "TRANSFER COMPLETE" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 243,
            columnNumber: 33
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-cyan-500 animate-bounce", children: "File saved to device" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 244,
            columnNumber: 33
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 239,
          columnNumber: 29
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 192,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 131,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 116,
    columnNumber: 9
  }, this);
}
const root = createRoot(document.getElementById("root"));
root.render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 255,
  columnNumber: 13
}));
export {
  App as default
};
