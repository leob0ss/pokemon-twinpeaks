export function createMapEditorUI(mapUndoDepth) {
  const wrap = document.createElement("div");
wrap.style.position = "fixed";
wrap.style.right = "12px";
wrap.style.top = "12px";
wrap.style.zIndex = "9999";
wrap.style.display = "flex";
wrap.style.flexWrap = "wrap";
wrap.style.gap = "8px";
wrap.style.alignItems = "center";
wrap.style.maxWidth = "min(420px, calc(100vw - 24px))";
wrap.style.justifyContent = "flex-end";
wrap.style.padding = "8px 10px";
wrap.style.borderRadius = "10px";
wrap.style.background = "rgba(20,20,26,0.65)";
wrap.style.color = "#fff";
wrap.style.font = "12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
wrap.style.backdropFilter = "blur(8px)";

const label = document.createElement("div");
label.textContent = "Cell";
label.style.opacity = "0.9";

const select = document.createElement("select");
select.id = "mapPaintType";
select.style.padding = "4px 6px";
select.style.borderRadius = "8px";
select.style.border = "1px solid rgba(255,255,255,0.25)";
select.style.background = "rgba(0,0,0,0.3)";
select.style.color = "#fff";

const angleLabel = document.createElement("div");
angleLabel.textContent = "Angle";
angleLabel.style.opacity = "0.9";

const angleSelect = document.createElement("select");
angleSelect.id = "mapPaintAngle";
angleSelect.style.padding = "4px 6px";
angleSelect.style.borderRadius = "8px";
angleSelect.style.border = "1px solid rgba(255,255,255,0.25)";
angleSelect.style.background = "rgba(0,0,0,0.3)";
angleSelect.style.color = "#fff";
angleSelect.style.maxWidth = "200px";
angleSelect.disabled = true;
angleSelect.title = "Autotile with Auto. Listed angles match the Cell type you selected.";

wrap.appendChild(label);
wrap.appendChild(select);
wrap.appendChild(angleLabel);
wrap.appendChild(angleSelect);

const exportBtn = document.createElement("button");
exportBtn.type = "button";
exportBtn.textContent = "Export map";
exportBtn.title = "Download published-map.json — save as published-map.json next to index.html and deploy";
exportBtn.style.padding = "4px 8px";
exportBtn.style.borderRadius = "8px";
exportBtn.style.border = "1px solid rgba(255,255,255,0.35)";
exportBtn.style.background = "rgba(255,255,255,0.12)";
exportBtn.style.color = "#fff";
exportBtn.style.cursor = "pointer";
exportBtn.style.font = "12px system-ui, sans-serif";

const undoBtn = document.createElement("button");
undoBtn.type = "button";
undoBtn.textContent = "Undo";
undoBtn.title = "Revert last Shift+paint stroke or paste (up to " + mapUndoDepth + " steps) · ⌘/Ctrl+Z";
undoBtn.style.padding = "4px 8px";
undoBtn.style.borderRadius = "8px";
undoBtn.style.border = "1px solid rgba(255,255,255,0.35)";
undoBtn.style.background = "rgba(255,255,255,0.12)";
undoBtn.style.color = "#fff";
undoBtn.style.cursor = "pointer";
undoBtn.style.font = "12px system-ui, sans-serif";
undoBtn.style.marginRight = "8px";

const windModeHudEl = document.createElement("div");
windModeHudEl.style.width = "100%";
windModeHudEl.style.textAlign = "right";
windModeHudEl.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
windModeHudEl.style.fontSize = "11px";
windModeHudEl.style.opacity = "0.95";
windModeHudEl.style.lineHeight = "1.4";
windModeHudEl.textContent = "Wind: —";

const hoverTileEl = document.createElement("div");
hoverTileEl.style.width = "100%";
hoverTileEl.style.textAlign = "right";
hoverTileEl.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
hoverTileEl.style.fontSize = "11px";
hoverTileEl.style.opacity = "0.9";
hoverTileEl.style.lineHeight = "1.4";
hoverTileEl.textContent = "Tile: —";

wrap.appendChild(undoBtn);
wrap.appendChild(exportBtn);
wrap.appendChild(windModeHudEl);
wrap.appendChild(hoverTileEl);
  document.body.appendChild(wrap);
  return { paintSelect: select, angleSelect, undoBtn, exportBtn, hoverTileEl, windModeHudEl };
}


export function initTwinPeaksEditor(g) {
  const {
    canvas,
    getCamera,
    screenToTile,
    clamp,
    tileInWorldBounds,
    lineTiles,
    MAP_X_MIN,
    MAP_X_MAX,
    MAP_Y_MIN,
    MAP_ROWS,
    map,
    mapEdits,
    mountainEdits,
    streetArt,
    streetCarArt,
    earthPaint,
    pathArt,
    fenceOverlays,
    decorOverlays,
    pathCells,
    streetCells,
    streetCarCells,
    applyOneCellEdit,
    saveMapEditsBundle,
    defaultCarStreetFaceForTile,
    isFenceVariantId,
    isDecorOverlayCell,
    isMapCellOverlayObject,
    editorHud,
    mapEditBundleMeta,
    rebuildGrassCaches,
    T_VOID,
    T_GRASS,
    T_FLOWER,
    T_WALL,
    T_MOUNTAIN,
    T_STAIRS,
    T_EARTH,
    T_TELESCOPE,
    T_EARTH_STREET,
    T_EARTH_STREET_CAR,
    T_LEDGE,
    T_ROCK_SMALL,
    T_ROCK_MEDIUM,
    T_ROCK_BIG,
    T_BOARD,
    T_LAMPPOST,
    T_VEHICLE_BICYCLE_LEFT,
    T_VEHICLE_BICYCLE_RIGHT,
    T_VEHICLE_TRUCK,
    T_FENCE_LOGS_LEFT,
    T_FENCE_LOGS_RIGHT,
    T_FENCE_LOGS_TOP_LEFT,
    T_FENCE_LOGS_TOP_RIGHT,
    T_FENCE_LOGS_BOTTOM_RIGHT,
    T_FENCE_LOGS_BOTTOM_LEFT,
    T_FENCE_LOGS_MIDDLE,
    MOUNTAIN_BROWN_FILES,
    MOUNTAIN_CORNER_FILES,
    PATH_GROUND_FILES,
    EARTH_CORNER_FILES,
    STREET_GROUND_FILES,
    STREET_CORNER_FILES,
    STREET_CAR_GROUND_FILES,
    STREET_CAR_CORNER_FILES,
    pushUndoSnapshot,
    applyUndo,
    normalizeEditorSelect,
    buildMapClipboardFromRect,
    pasteMapClipboardBottomRightAt,
  } = g;

  const { paintSelect, angleSelect, undoBtn, exportBtn, hoverTileEl, windModeHudEl: windHud } =
    createMapEditorUI(g.mapUndoDepth);
  editorHud.windModeHudEl = windHud;

  // Editor wiring: dropdown + click-to-paint + autosave.
  window.addEventListener("mousemove", (e) => {
          const r = canvas.getBoundingClientRect();
          if (e.clientX < r.left || e.clientX >= r.right || e.clientY < r.top || e.clientY >= r.bottom) {
            hoverTileEl.textContent = "Tile: —";
            return;
          }
          const { camX, camY } = getCamera();
          const { tx, ty } = screenToTile(e.clientX, e.clientY, camX, camY);
          if (!tileInWorldBounds(tx, ty)) {
            hoverTileEl.textContent = "Tile: x=" + tx + " y=" + ty + " (off map)";
          } else {
            hoverTileEl.textContent = "Tile: x=" + tx + " y=" + ty;
          }
        });
      const paintOptionGroups = [
        {
          label: "Terrain",
          options: [
            ["Nothing (background)", T_VOID],
            ["Grass", T_GRASS],
            ["Flowers", T_FLOWER],
            ["Wall", T_WALL],
            ["Mountain", T_MOUNTAIN],
            ["Stairs", T_STAIRS],
            ["Earth (path)", T_EARTH],
            ["Street", T_EARTH_STREET],
            ["Street (cars)", T_EARTH_STREET_CAR],
          ],
        },
        {
          label: "Objects",
          options: [
            ["Telescope", T_TELESCOPE],
            ["Ledge (brown middle)", T_LEDGE],
            ["Rock — small", T_ROCK_SMALL],
            ["Rock — medium", T_ROCK_MEDIUM],
            ["Rock — big", T_ROCK_BIG],
            ["Board (path sign)", T_BOARD],
            ["Lamppost", T_LAMPPOST],
          ],
          children: [
            {
              label: "Vehicles",
              options: [
                ["Bicycle (left)", T_VEHICLE_BICYCLE_LEFT],
                ["Bicycle (right)", T_VEHICLE_BICYCLE_RIGHT],
                ["Truck", T_VEHICLE_TRUCK],
              ],
            },
            {
              label: "Fences",
              options: [
                ["Logs — left", T_FENCE_LOGS_LEFT],
                ["Logs — right", T_FENCE_LOGS_RIGHT],
                ["Logs — top left", T_FENCE_LOGS_TOP_LEFT],
                ["Logs — top right", T_FENCE_LOGS_TOP_RIGHT],
                ["Logs — bottom right", T_FENCE_LOGS_BOTTOM_RIGHT],
                ["Logs — bottom left", T_FENCE_LOGS_BOTTOM_LEFT],
                ["Logs — middle", T_FENCE_LOGS_MIDDLE],
              ],
            },
          ],
        },
      ];
      for (const grp of paintOptionGroups) {
        const og = document.createElement("optgroup");
        og.label = grp.label;
        for (const [label, val] of grp.options || []) {
          const opt = document.createElement("option");
          opt.value = String(val);
          opt.textContent = label;
          if (val === T_VOID) opt.selected = true;
          og.appendChild(opt);
        }
        paintSelect.appendChild(og);
        for (const ch of grp.children || []) {
          const cg = document.createElement("optgroup");
          cg.label = ch.label;
          for (const [label, val] of ch.options || []) {
            const opt = document.createElement("option");
            opt.value = String(val);
            opt.textContent = label;
            cg.appendChild(opt);
          }
          paintSelect.appendChild(cg);
        }
      }

      const angleLabels = {
        center: "Center",
        left: "Left",
        right: "Right",
        top: "Top",
        bottom: "Bottom",
        tl: "TL",
        tr: "TR",
        bl: "BL",
        br: "BR",
      };

      /** Order matches Angle dropdown: Auto, face variants, then invert corners — used for same-tile click cycling. */
      function angleCycleList(pv) {
        const n = Number(pv);
        if (n === T_MOUNTAIN) {
          return ["", ...Object.keys(MOUNTAIN_BROWN_FILES), ...Object.keys(MOUNTAIN_CORNER_FILES).map((v) => `c:${v}`)];
        }
        if (n === T_EARTH) {
          return ["", ...Object.keys(PATH_GROUND_FILES), ...Object.keys(EARTH_CORNER_FILES).map((v) => `e:${v}`)];
        }
        if (n === T_EARTH_STREET) {
          return ["", ...Object.keys(STREET_GROUND_FILES), ...Object.keys(STREET_CORNER_FILES).map((v) => `s:${v}`)];
        }
        if (n === T_EARTH_STREET_CAR) {
          return ["", ...Object.keys(STREET_CAR_GROUND_FILES), ...Object.keys(STREET_CAR_CORNER_FILES).map((v) => `sc:${v}`)];
        }
        return [""];
      }

      function angleValueAllowedForPaint(pv, val) {
        if (val === "" || val === undefined || val === null) return true;
        const n = Number(pv);
        if (n === T_MOUNTAIN) {
          if (typeof val !== "string") return false;
          if (val.startsWith("c:")) return MOUNTAIN_CORNER_FILES.hasOwnProperty(val.slice(2));
          return MOUNTAIN_BROWN_FILES.hasOwnProperty(val);
        }
        if (n === T_EARTH) {
          if (typeof val !== "string") return false;
          if (val.startsWith("e:")) return EARTH_CORNER_FILES.hasOwnProperty(val.slice(2));
          return PATH_GROUND_FILES.hasOwnProperty(val);
        }
        if (n === T_EARTH_STREET) {
          if (typeof val !== "string") return false;
          if (val.startsWith("s:")) return STREET_CORNER_FILES.hasOwnProperty(val.slice(2));
          return STREET_GROUND_FILES.hasOwnProperty(val);
        }
        if (n === T_EARTH_STREET_CAR) {
          if (typeof val !== "string") return false;
          if (val.startsWith("sc:")) return STREET_CAR_CORNER_FILES.hasOwnProperty(val.slice(3));
          return STREET_CAR_GROUND_FILES.hasOwnProperty(val);
        }
        return false;
      }

      function rebuildAngleSelectOptions() {
        const pv = Number(paintSelect.value);
        const prev = angleSelect.value;
        angleSelect.replaceChildren();

        const autoOpt = document.createElement("option");
        autoOpt.value = "";
        autoOpt.textContent = "Auto";
        angleSelect.appendChild(autoOpt);

        const needsAngle = pv === T_MOUNTAIN || pv === T_EARTH || pv === T_EARTH_STREET || pv === T_EARTH_STREET_CAR;
        if (!needsAngle) {
          angleSelect.value = "";
          return;
        }

        function appendFaceOptgroup(label, filesObj) {
          const g = document.createElement("optgroup");
          g.label = label;
          angleSelect.appendChild(g);
          for (const v of Object.keys(filesObj)) {
            const opt = document.createElement("option");
            opt.value = v;
            opt.textContent = angleLabels[v] || v;
            g.appendChild(opt);
          }
        }

        function appendInvertOptgroup(label, prefix, cornerFilesObj) {
          const g = document.createElement("optgroup");
          g.label = label;
          angleSelect.appendChild(g);
          for (const v of Object.keys(cornerFilesObj)) {
            const opt = document.createElement("option");
            opt.value = `${prefix}${v}`;
            opt.textContent = `Invert ${angleLabels[v] || v}`;
            g.appendChild(opt);
          }
        }

        if (pv === T_MOUNTAIN) {
          appendFaceOptgroup("Brown mountain face", MOUNTAIN_BROWN_FILES);
          appendInvertOptgroup("Mountain invert corners", "c:", MOUNTAIN_CORNER_FILES);
        } else if (pv === T_EARTH) {
          appendFaceOptgroup("Earth path face", PATH_GROUND_FILES);
          appendInvertOptgroup("Earth path invert corners", "e:", EARTH_CORNER_FILES);
        } else if (pv === T_EARTH_STREET) {
          appendFaceOptgroup("Street face", STREET_GROUND_FILES);
          appendInvertOptgroup("Street invert corners", "s:", STREET_CORNER_FILES);
        } else if (pv === T_EARTH_STREET_CAR) {
          appendFaceOptgroup("Car street face", STREET_CAR_GROUND_FILES);
          appendInvertOptgroup("Car street invert corners", "sc:", STREET_CAR_CORNER_FILES);
        }

        angleSelect.value = angleValueAllowedForPaint(pv, prev) ? prev : "";
      }

      function syncAngleSelectEnabled() {
        const pv = Number(paintSelect.value);
        const needsAngle = pv === T_MOUNTAIN || pv === T_EARTH || pv === T_EARTH_STREET || pv === T_EARTH_STREET_CAR;
        rebuildAngleSelectOptions();
        angleSelect.disabled = !needsAngle;
      }
      paintSelect.addEventListener("change", syncAngleSelectEnabled);
      syncAngleSelectEnabled();

      /** Last Shift+paint tile + Cell value — repeat click same tile cycles Angle. */
      let paintCycleRef = null;
      /** Start of current Shift+drag paint stroke (line fill to cursor while held). */
      let paintDragAnchor = null;

      function readPaintBrushSpec() {
        const raw = Number(paintSelect.value);
        if (!Number.isFinite(raw)) return null;
        let cell = raw;
        let earthLane;
        if (raw === T_EARTH_STREET) {
          cell = T_EARTH;
          earthLane = "street";
        } else if (raw === T_EARTH_STREET_CAR) {
          cell = T_EARTH;
          earthLane = "car";
        } else if (raw === T_EARTH) {
          earthLane = "path";
        }
        return { cell, earthLane };
      }

      function applyPaintBrushToTile(tx, ty) {
        const spec = readPaintBrushSpec();
        if (!spec) return;
        const { cell, earthLane } = spec;
        const k = `${tx},${ty}`;
        if (isFenceVariantId(cell)) {
          fenceOverlays[k] = cell;
          persistPaintEdits();
          return;
        }
        if (isDecorOverlayCell(cell)) {
          decorOverlays[k] = cell;
          persistPaintEdits();
          return;
        }
        const prevCell = map[ty][tx - MAP_X_MIN];
        applyOneCellEdit(tx, ty, cell, earthLane);
        if (prevCell !== cell) {
          delete fenceOverlays[k];
          delete decorOverlays[k];
        }
        mapEdits[k] = cell;
        const angle = angleSelect.value.trim();
        if (cell === T_EARTH) {
          if (earthLane === "street") {
            earthPaint[k] = "street";
            if (!angle) delete streetArt[k];
            else streetArt[k] = angle;
            delete streetCarArt[k];
          } else if (earthLane === "car") {
            earthPaint[k] = "car";
            if (!angle) streetCarArt[k] = defaultCarStreetFaceForTile(ty);
            else streetCarArt[k] = angle;
            delete streetArt[k];
          } else {
            delete earthPaint[k];
            if (!angle) delete pathArt[k];
            else pathArt[k] = angle;
            delete streetArt[k];
            delete streetCarArt[k];
          }
        } else if (isMapCellOverlayObject(cell)) {
          if (streetCells.has(k)) earthPaint[k] = "street";
          else if (streetCarCells.has(k)) earthPaint[k] = "car";
          else delete earthPaint[k];
        } else {
          if (cell !== T_MOUNTAIN) delete earthPaint[k];
        }
        if (cell === T_MOUNTAIN) {
          if (!angle) delete mountainEdits[k];
          else mountainEdits[k] = angle;
        }
      }

      function persistPaintEdits() {
        saveMapEditsBundle({
          cells: mapEdits,
          mtn: mountainEdits,
          street: streetArt,
          streetCar: streetCarArt,
          earth: earthPaint,
          path: pathArt,
          fence: fenceOverlays,
          decor: decorOverlays,
        });
      }

      function endPaintDragSession() {
        if (!paintDragAnchor) return;
        paintDragAnchor = null;
        persistPaintEdits();
      }

      canvas.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        const { camX, camY } = getCamera();
        const { tx, ty } = screenToTile(e.clientX, e.clientY, camX, camY);
        const mod = e.ctrlKey || e.metaKey;

        if (e.shiftKey) {
          if (!tileInWorldBounds(tx, ty)) return;
          if (paintDragAnchor) endPaintDragSession();
          if (!readPaintBrushSpec()) return;
          pushUndoSnapshot();
          const pv = Number(paintSelect.value);
          const cycle = angleCycleList(pv);
          if (
            paintCycleRef &&
            paintCycleRef.tx === tx &&
            paintCycleRef.ty === ty &&
            paintCycleRef.pv === pv &&
            cycle.length > 1
          ) {
            const cur = angleSelect.value;
            const i = cycle.indexOf(cur);
            const idx = i < 0 ? 0 : i;
            angleSelect.value = cycle[(idx + 1) % cycle.length];
          }
          paintCycleRef = { tx, ty, pv };
          paintDragAnchor = { tx, ty };
          applyPaintBrushToTile(tx, ty);
          return;
        }

        if (mod) {
          e.preventDefault();
          if (tileInWorldBounds(tx, ty)) {
            if (paintDragAnchor) endPaintDragSession();
            editorHud.editorSelectDrag = { tx0: tx, ty0: ty, tx1: tx, ty1: ty };
            editorHud.editorCopyRect = normalizeEditorSelect(editorHud.editorSelectDrag);
          }
          return;
        }

        if (tileInWorldBounds(tx, ty)) {
          editorHud.editorPasteTarget = { tx, ty };
          editorHud.editorCopyRect = { x0: tx, x1: tx, y0: ty, y1: ty };
        }
      });

      window.addEventListener("keydown", (e) => {
        const mod = e.ctrlKey || e.metaKey;
        if (!mod) return;
        const tag = e.target && e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        const k = e.key.toLowerCase();
        if (k === "c") {
          const r = editorHud.editorSelectDrag ? normalizeEditorSelect(editorHud.editorSelectDrag) : editorHud.editorCopyRect;
          if (!r) return;
          e.preventDefault();
          editorHud.mapClipboard = buildMapClipboardFromRect(r);
        } else if (k === "v") {
          e.preventDefault();
          if (!editorHud.mapClipboard || !editorHud.editorPasteTarget) {
            return;
          }
          pushUndoSnapshot();
          pasteMapClipboardBottomRightAt(editorHud.editorPasteTarget.tx, editorHud.editorPasteTarget.ty);
        } else if (k === "z" && !e.shiftKey) {
          e.preventDefault();
          applyUndo();
        }
      });

      window.addEventListener("mousemove", (e) => {
        const modMove = e.ctrlKey || e.metaKey;
        if (editorHud.editorSelectDrag && (e.buttons & 1) && modMove && !e.shiftKey) {
          const { camX, camY } = getCamera();
          const st = screenToTile(e.clientX, e.clientY, camX, camY);
          const tx = clamp(st.tx, MAP_X_MIN, MAP_X_MAX);
          const ty = clamp(st.ty, MAP_Y_MIN, MAP_ROWS - 1);
          editorHud.editorSelectDrag.tx1 = tx;
          editorHud.editorSelectDrag.ty1 = ty;
          editorHud.editorCopyRect = normalizeEditorSelect(editorHud.editorSelectDrag);
          return;
        }
        if (!paintDragAnchor || !(e.buttons & 1) || !e.shiftKey) return;
        const { camX: camXP, camY: camYP } = getCamera();
        const stPaint = screenToTile(e.clientX, e.clientY, camXP, camYP);
        const ptx = stPaint.tx;
        const pty = stPaint.ty;
        if (!tileInWorldBounds(ptx, pty)) return;
        if (ptx === paintDragAnchor.tx && pty === paintDragAnchor.ty) return;
        for (const [px, py] of lineTiles(paintDragAnchor.tx, paintDragAnchor.ty, ptx, pty)) {
          if (!tileInWorldBounds(px, py)) continue;
          applyPaintBrushToTile(px, py);
        }
        paintDragAnchor = { tx: ptx, ty: pty };
      });

      window.addEventListener("mouseup", () => {
        if (editorHud.editorSelectDrag) {
          editorHud.editorCopyRect = normalizeEditorSelect(editorHud.editorSelectDrag);
          editorHud.editorSelectDrag = null;
        }
        endPaintDragSession();
      });

      window.addEventListener("blur", () => {
        editorHud.editorSelectDrag = null;
        endPaintDragSession();
      });

      undoBtn.addEventListener("click", () => {
        applyUndo();
      });

      exportBtn.addEventListener("click", () => {
        const payload = {
          cells: { ...mapEdits },
          mtn: { ...mountainEdits },
          street: { ...streetArt },
          streetCar: { ...streetCarArt },
          earth: { ...earthPaint },
          path: { ...pathArt },
          fence: { ...fenceOverlays },
          decor: { ...decorOverlays },
          meta: mapEditBundleMeta(),
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "published-map.json";
        a.click();
        URL.revokeObjectURL(a.href);
      });

}
