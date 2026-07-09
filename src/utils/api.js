import { ESQUEMAS_MASTER_SECRET } from "./constants";

export const CACHE = {
  proyectos: null,
  hitos: null,
  riders: null,
  usuarios: null,
  transportes: null,
  mensajes: null,
};

export const clearCache = (key) => {
  CACHE[key] = null;
};

export const setCache = (key, value) => {
  CACHE[key] = value;
};

export const compareProjectIds = (idA, idB) => {
  if (idA === undefined || idA === null || idB === undefined || idB === null)
    return false;
  let strA = String(idA).trim();
  let strB = String(idB).trim();
  if (strA.endsWith(".0")) strA = strA.slice(0, -2);
  if (strB.endsWith(".0")) strB = strB.slice(0, -2);

  if (strA === strB) return true;
  if (strA.toLowerCase() === strB.toLowerCase()) return true;

  const numA = Number(strA);
  const numB = Number(strB);
  if (!isNaN(numA) && !isNaN(numB)) {
    if (numA === numB) return true;

    // Fallback para notación científica o diferencias mínimas de redondeo
    const sA = String(Math.round(numA));
    const sB = String(Math.round(numB));
    if (sA.substring(0, 9) === sB.substring(0, 9)) return true;
  }
  return false;
};

// --- MOCK DATABASE IMPLEMENTATION FOR STRICTLY LOCAL MODE ---
const cifrarPassword = async (password) => {
  if (!password) return "";
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

const getDefaultPermisos = (role) => {
  const cleanRole = role
    ? role.toString().split(":")[0].trim().toUpperCase()
    : "";
  if (
    cleanRole === "ADMIN" ||
    cleanRole === "MANAGER" ||
    cleanRole === "TOUR MANAGER"
  ) {
    return [
      "DASHBOARD",
      "PROJECTS_MANAGE",
      "PROJECT_ASSIGN",
      "PROJECT_STATUS",
      "RIDERS",
      "RIDERS_MANAGE",
      "TRANSPORT",
      "TRANSPORT_CREATE",
      "TRANSPORT_EDIT",
      "HITOS",
      "HITOS_MANAGE",
      "CHAT",
      "CHAT_SEND",
      "STAFF",
      "ADMIN_PANEL",
      "EXPENSES",
      "EXPENSES_MANAGE",
    ];
  }
  if (cleanRole === "ARTISTA") {
    return ["DASHBOARD", "RIDERS"];
  }
  return [
    "DASHBOARD",
    "RIDERS",
    "TRANSPORT",
    "HITOS",
    "CHAT",
    "CHAT_SEND",
    "STAFF",
  ];
};

const initMockDB = async () => {
  if (window.localStorage.getItem("mock_initialized") !== "v2") {
    const adminHash = await cifrarPassword("admin123");
    const techHash = await cifrarPassword("tech123");

    const defaultUsuarios = [
      {
        id: 1,
        name: "Admin Local",
        email: "admin@esquemas.pro",
        phone: "+56912345678",
        role: "ADMIN",
        dieta: "OMNIVORA",
        status: "ACTIVO",
        permisos: getDefaultPermisos("ADMIN"),
        isTempPass: false,
        disclaimerAceptado: true,
        passwordHash: adminHash,
      },
      {
        id: 2,
        name: "Técnico Local",
        email: "tech@esquemas.pro",
        phone: "+56987654321",
        role: "TÉCNICO",
        dieta: "OMNIVORA",
        status: "ACTIVO",
        permisos: getDefaultPermisos("TÉCNICO"),
        isTempPass: false,
        disclaimerAceptado: true,
        passwordHash: techHash,
      },
    ];

    const defaultProyectos = [
      {
        id: "1718000000000",
        name: "Gira Sur 2026",
        manager: "Admin Local",
        date: "2026-08-15",
        status: "ACTIVO",
        asignados: ["admin@esquemas.pro", "tech@esquemas.pro"],
        presupuesto: 2000000,
      },
      {
        id: "1719000000000",
        name: "Festival Primavera",
        manager: "Admin Local",
        date: "2026-09-10",
        status: "PLANIFICACION",
        asignados: [],
        presupuesto: 5000000,
      },
    ];

    const defaultHitos = [
      {
        id: "h1",
        title: "Prueba de Sonido",
        location: "Movistar Arena, Santiago",
        date: "2026-08-15",
        time: "16:00",
        proyectoId: "1718000000000",
        riderId: "",
        asignados: ["tech@esquemas.pro"],
      },
      {
        id: "h2",
        title: "Apertura de Puertas",
        location: "Movistar Arena, Santiago",
        date: "2026-08-15",
        time: "19:00",
        proyectoId: "1718000000000",
        riderId: "",
        asignados: [],
      },
      {
        id: "h3",
        title: "Inicio Show",
        location: "Movistar Arena, Santiago",
        date: "2026-08-15",
        time: "21:00",
        proyectoId: "1718000000000",
        riderId: "",
        asignados: ["admin@esquemas.pro", "tech@esquemas.pro"],
      },
    ];

    const defaultRiders = [
      {
        id: "r1",
        title: "Stageplot Gira Sur",
        type: "STAGEPLOT",
        content: JSON.stringify({
          proyectoId: "1718000000000",
          elements: [
            {
              id: "e1",
              type: "drum",
              x: 45,
              y: 30,
              name: "Batería",
              note: "Prueba",
            },
            {
              id: "e2",
              type: "amp",
              x: 20,
              y: 40,
              name: "Amp Guitarra",
              note: "Mic SM57",
            },
          ],
        }),
      },
    ];

    const defaultGastos = [
      {
        id: "g1",
        proyectoId: "1718000000000",
        description: "Catering Gira",
        amount: 150000,
        date: "2026-07-01",
        type: "ALIMENTACION",
        createdBy: "admin@esquemas.pro",
      },
    ];

    window.localStorage.setItem(
      "mock_usuarios",
      JSON.stringify(defaultUsuarios),
    );
    window.localStorage.setItem(
      "mock_proyectos",
      JSON.stringify(defaultProyectos),
    );
    window.localStorage.setItem("mock_hitos", JSON.stringify(defaultHitos));
    window.localStorage.setItem("mock_riders", JSON.stringify(defaultRiders));
    window.localStorage.setItem("mock_gastos", JSON.stringify(defaultGastos));
    window.localStorage.setItem("mock_initialized", "v2");
  }
};

const handleMockRequest = async (action, payload) => {
  await initMockDB();

  const getDB = (name) => JSON.parse(window.localStorage.getItem(name) || "[]");
  const saveDB = (name, data) =>
    window.localStorage.setItem(name, JSON.stringify(data));

  switch (action) {
    case "login": {
      const { email, password } = payload;
      const usuarios = getDB("mock_usuarios");
      const passHash = await cifrarPassword(password);
      const user = usuarios.find(
        (u) =>
          u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
          u.passwordHash === passHash,
      );
      if (user) {
        if (user.status === "PENDING" || user.status === "INACTIVO") {
          return {
            status: "error",
            message: "Cuenta bloqueada o en revisión.",
          };
        }
        return { status: "success", user };
      }
      return { status: "error", message: "Credenciales inválidas." };
    }
    case "checkEmailTC": {
      const usuarios = getDB("mock_usuarios");
      const user = usuarios.find(
        (u) =>
          u.email.trim().toLowerCase() === payload.email.trim().toLowerCase(),
      );
      return {
        status: "success",
        accepted: user ? !!user.disclaimerAceptado : false,
      };
    }
    case "solicitarAcceso": {
      const { name, email, phone, role } = payload;
      const usuarios = getDB("mock_usuarios");
      const emailLower = email.trim().toLowerCase();
      if (usuarios.some((u) => u.email.toLowerCase() === emailLower)) {
        return { status: "error", message: "El correo ya está registrado." };
      }

      const totalUsers = usuarios.length;
      let finalRole = role;
      let finalStatus = "PENDING";
      let isNewAdmin = false;
      let tempPass = "";
      let passwordHash = "";

      if (totalUsers === 0) {
        finalRole = "ADMIN";
        finalStatus = "ACTIVO";
        isNewAdmin = true;
        tempPass = Math.floor(100000 + Math.random() * 900000).toString();
        passwordHash = await cifrarPassword(tempPass);
      } else {
        tempPass = "123456";
        passwordHash = await cifrarPassword(tempPass);
      }

      const newUser = {
        id: Date.now(),
        name,
        email: emailLower,
        phone,
        role: finalRole,
        dieta: "OMNIVORA",
        status: finalStatus,
        permisos: getDefaultPermisos(finalRole),
        isTempPass: true,
        disclaimerAceptado: isNewAdmin,
        passwordHash,
      };

      usuarios.push(newUser);
      saveDB("mock_usuarios", usuarios);

      return { status: "success", isNewAdmin, tempPass };
    }
    case "getUsuarios": {
      return { status: "success", data: getDB("mock_usuarios") };
    }
    case "updateProfile": {
      const { email, name, phone, dieta, disclaimerAceptado, password } =
        payload;
      const usuarios = getDB("mock_usuarios");
      const index = usuarios.findIndex(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      if (index !== -1) {
        if (name !== undefined) usuarios[index].name = name;
        if (phone !== undefined) usuarios[index].phone = phone;
        if (dieta !== undefined) usuarios[index].dieta = dieta;
        if (disclaimerAceptado !== undefined)
          usuarios[index].disclaimerAceptado = disclaimerAceptado;
        if (password) {
          usuarios[index].passwordHash = await cifrarPassword(password);
          usuarios[index].isTempPass = false;
        }
        saveDB("mock_usuarios", usuarios);
        return { status: "success", data: usuarios[index] };
      }
      return { status: "error", message: "Usuario no encontrado." };
    }
    case "updateUserAdmin": {
      const { email, status, role, permisos, name, phone, dieta } = payload;
      const usuarios = getDB("mock_usuarios");
      const index = usuarios.findIndex(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      if (index !== -1) {
        if (status !== undefined) usuarios[index].status = status;
        if (role !== undefined) {
          usuarios[index].role = role;
          usuarios[index].permisos = getDefaultPermisos(role);
        }
        if (permisos !== undefined) usuarios[index].permisos = permisos;
        if (name !== undefined) usuarios[index].name = name;
        if (phone !== undefined) usuarios[index].phone = phone;
        if (dieta !== undefined) usuarios[index].dieta = dieta;
        saveDB("mock_usuarios", usuarios);
        return { status: "success" };
      }
      return { status: "error", message: "Usuario no encontrado." };
    }
    case "aprobarUsuario": {
      const { email } = payload;
      const usuarios = getDB("mock_usuarios");
      const index = usuarios.findIndex(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      if (index !== -1) {
        usuarios[index].status = "ACTIVO";
        saveDB("mock_usuarios", usuarios);
        return { status: "success" };
      }
      return { status: "error", message: "Usuario no encontrado." };
    }
    case "rechazarUsuario":
    case "eliminarUsuario": {
      const { email } = payload;
      let usuarios = getDB("mock_usuarios");
      usuarios = usuarios.filter(
        (u) => u.email.toLowerCase() !== email.toLowerCase(),
      );
      saveDB("mock_usuarios", usuarios);
      return { status: "success" };
    }
    case "recuperarClave": {
      return {
        status: "success",
        message:
          "Se ha simulado el envío de recuperación. Tu contraseña sigue siendo la misma.",
      };
    }

    // --- PROYECTOS ---
    case "getProyectos": {
      return { status: "success", data: getDB("mock_proyectos") };
    }
    case "createProyecto": {
      const proyectos = getDB("mock_proyectos");
      const newProj = {
        id: String(Date.now()),
        name: payload.name,
        manager: payload.manager || "Admin Local",
        date: payload.date || new Date().toISOString().split("T")[0],
        status: payload.status || "PLANIFICACION",
        asignados: payload.asignados || [],
        presupuesto: Number(payload.presupuesto) || 0,
      };
      proyectos.push(newProj);
      saveDB("mock_proyectos", proyectos);
      return { status: "success", data: newProj };
    }
    case "updateProyectoStatus": {
      const { id, status } = payload;
      const proyectos = getDB("mock_proyectos");
      const index = proyectos.findIndex((p) => String(p.id) === String(id));
      if (index !== -1) {
        proyectos[index].status = status;
        saveDB("mock_proyectos", proyectos);
        return { status: "success" };
      }
      return { status: "error", message: "Proyecto no encontrado." };
    }
    case "deleteProyecto": {
      const { id } = payload;
      let proyectos = getDB("mock_proyectos");
      // Conservar presupuestos vinculados pasándolos a independientes
      proyectos = proyectos.map((p) => {
        if (p.type === "PRESUPUESTO" && p.manager === "PROYECTO_ID:" + id) {
          return { ...p, manager: "" };
        }
        return p;
      });
      proyectos = proyectos.filter((p) => String(p.id) !== String(id));
      saveDB("mock_proyectos", proyectos);

      // Conservar hitos (cronogramas) pasándolos a "No asignado"
      let hitos = getDB("mock_hitos");
      hitos = hitos.map((h) =>
        String(h.proyectoId) === String(id) ? { ...h, proyectoId: "" } : h,
      );
      saveDB("mock_hitos", hitos);

      // Conservar riders técnicos pasándolos a "No asignado"
      let riders = getDB("mock_riders");
      riders = riders.map((r) => {
        if (r.content && String(r.content.proyectoId) === String(id)) {
          return { ...r, content: { ...r.content, proyectoId: "" } };
        }
        return r;
      });
      saveDB("mock_riders", riders);

      return { status: "success" };
    }
    case "updateProyectoAsignaciones": {
      const { id, asignados } = payload;
      const proyectos = getDB("mock_proyectos");
      const index = proyectos.findIndex((p) => String(p.id) === String(id));
      if (index !== -1) {
        proyectos[index].asignados = asignados;
        saveDB("mock_proyectos", proyectos);
        return { status: "success" };
      }
      return { status: "error", message: "Proyecto no encontrado." };
    }
    case "updateProyectoManager": {
      const { id, manager } = payload;
      const proyectos = getDB("mock_proyectos");
      const index = proyectos.findIndex((p) => String(p.id) === String(id));
      if (index !== -1) {
        proyectos[index].manager = manager;
        saveDB("mock_proyectos", proyectos);
        return { status: "success" };
      }
      return { status: "error", message: "Proyecto no encontrado." };
    }
    case "updateProyectoPresupuesto": {
      const { id, presupuesto } = payload;
      const proyectos = getDB("mock_proyectos");
      const index = proyectos.findIndex((p) => String(p.id) === String(id));
      if (index !== -1) {
        proyectos[index].presupuesto = Number(presupuesto);
        saveDB("mock_proyectos", proyectos);
        return { status: "success" };
      }
      return { status: "error", message: "Proyecto no encontrado." };
    }

    // --- HITOS ---
    case "getHitos": {
      return { status: "success", data: getDB("mock_hitos") };
    }
    case "createHito": {
      const hitos = getDB("mock_hitos");
      const newHito = {
        id: "h-" + Date.now(),
        title: payload.title,
        location: payload.location || "",
        date: payload.date || "",
        time: payload.time || "",
        proyectoId: String(payload.proyectoId),
        riderId: payload.riderId || "",
        asignados: payload.asignados || [],
      };
      hitos.push(newHito);
      saveDB("mock_hitos", hitos);
      return { status: "success", data: newHito };
    }
    case "updateHito": {
      const hitos = getDB("mock_hitos");
      const index = hitos.findIndex((h) => String(h.id) === String(payload.id));
      if (index !== -1) {
        hitos[index] = {
          ...hitos[index],
          title: payload.title,
          location: payload.location,
          date: payload.date,
          time: payload.time,
          riderId: payload.riderId,
        };
        saveDB("mock_hitos", hitos);
        return { status: "success" };
      }
      return { status: "error", message: "Hito no encontrado." };
    }
    case "deleteHito": {
      let hitos = getDB("mock_hitos");
      hitos = hitos.filter((h) => String(h.id) !== String(payload.id));
      saveDB("mock_hitos", hitos);
      return { status: "success" };
    }
    case "updateHitoAsignaciones": {
      const { id, asignados } = payload;
      const hitos = getDB("mock_hitos");
      const index = hitos.findIndex((h) => String(h.id) === String(id));
      if (index !== -1) {
        hitos[index].asignados = asignados;
        saveDB("mock_hitos", hitos);
        return { status: "success" };
      }
      return { status: "error", message: "Hito no encontrado." };
    }

    // --- RIDERS ---
    case "getRiders": {
      return { status: "success", data: getDB("mock_riders") };
    }
    case "createRider":
    case "updateRider": {
      const riders = getDB("mock_riders");
      const index = riders.findIndex(
        (r) => String(r.id) === String(payload.id),
      );
      if (index !== -1) {
        riders[index] = {
          ...riders[index],
          title: payload.title,
          type: payload.type,
          content: payload.content,
        };
        saveDB("mock_riders", riders);
      } else {
        riders.push({
          id: payload.id || "r-" + Date.now(),
          title: payload.title,
          type: payload.type,
          content: payload.content,
        });
        saveDB("mock_riders", riders);
      }
      return { status: "success" };
    }
    case "deleteRider": {
      let riders = getDB("mock_riders");
      riders = riders.filter((r) => String(r.id) !== String(payload.id));
      saveDB("mock_riders", riders);
      return { status: "success" };
    }

    // --- GASTOS ---
    case "getGastos": {
      return { status: "success", data: getDB("mock_gastos") };
    }
    case "createGasto": {
      const gastos = getDB("mock_gastos");
      const newGasto = {
        id: "g-" + Date.now(),
        proyectoId: String(payload.proyectoId),
        description: payload.description,
        amount: Number(payload.amount),
        date: payload.date || new Date().toISOString().split("T")[0],
        type: payload.type || "VARIOS",
        createdBy: payload.createdBy || "Sistema",
      };
      gastos.push(newGasto);
      saveDB("mock_gastos", gastos);
      return { status: "success", data: newGasto };
    }
    case "deleteGasto": {
      let gastos = getDB("mock_gastos");
      gastos = gastos.filter((g) => String(g.id) !== String(payload.id));
      saveDB("mock_gastos", gastos);
      return { status: "success" };
    }

    // --- ROLES CONFIG ---
    case "getRolesConfig": {
      const config = getDB("mock_roles_config") || [
        { role: "TOUR MANAGER", permisos: getDefaultPermisos("TOUR MANAGER") },
        { role: "TÉCNICO", permisos: getDefaultPermisos("TÉCNICO") },
        { role: "ARTISTA", permisos: getDefaultPermisos("ARTISTA") },
      ];
      return { status: "success", data: config };
    }
    case "updateRoleDefaultPermisos": {
      let config = getDB("mock_roles_config") || [
        { role: "TOUR MANAGER", permisos: getDefaultPermisos("TOUR MANAGER") },
        { role: "TÉCNICO", permisos: getDefaultPermisos("TÉCNICO") },
        { role: "ARTISTA", permisos: getDefaultPermisos("ARTISTA") },
      ];
      const { role, permisos } = payload;
      const idx = config.findIndex((c) => c.role === role);
      if (idx !== -1) {
        config[idx].permisos = permisos;
      } else {
        config.push({ role, permisos });
      }
      saveDB("mock_roles_config", config);
      return { status: "success" };
    }

    default:
      return {
        status: "error",
        message: `Acción '${action}' no soportada en el modo local.`,
      };
  }
};

export const normalizeRole = (role) => {
  if (!role) return "TÉCNICO";
  const clean = role.toString().trim().toUpperCase();
  if (clean.startsWith("ARTISTA")) return "ARTISTA";
  if (clean === "ADMIN" || clean === "MANAGER" || clean === "TOUR MANAGER")
    return "TOUR MANAGER";
  return "TÉCNICO";
};

export const apiFetch = async (action, payload = {}) => {
  const isMock = import.meta.env.VITE_LOCAL_MOCK !== "false";

  let res;
  if (isMock) {
    // Artificial delay to simulate network latency for smoother UX loading indicators
    await new Promise((resolve) => setTimeout(resolve, 300));
    res = await handleMockRequest(action, payload);
  } else {
    const url = import.meta.env.VITE_API_URL;
    if (!url) {
      throw new Error(
        "No VITE_GAS_URL defined in environment and VITE_LOCAL_MOCK is false.",
      );
    }

    const storedUser = window.localStorage.getItem("esquemapps_user");
    let requesterEmail = null;
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.email) requesterEmail = parsed.email;
      } catch (e) {}
    }

    const securePayload = { ...payload };
    if (requesterEmail && !securePayload.requesterEmail) {
      securePayload.requesterEmail = requesterEmail;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        app_secret: ESQUEMAS_MASTER_SECRET,
        action,
        payload: securePayload,
      }),
    });
    res = await response.json();
  }

  // Intercept and normalize roles to the 3 profiles: TOUR MANAGER, TÉCNICO, ARTISTA
  if (res && res.status === "success") {
    if (res.user && res.user.role) {
      res.user.role = normalizeRole(res.user.role);
    }
    if (Array.isArray(res.data)) {
      res.data = res.data.map((u) => {
        if (u && u.role) {
          return { ...u, role: normalizeRole(u.role) };
        }
        return u;
      });
    }
  }

  return res;
};

export const formatCleanLocation = (loc) => {
  if (!loc) return "";
  const parts = loc.split(",").map((p) => p.trim());

  const countryKeywords = [
    "chile",
    "argentina",
    "peru",
    "bolivia",
    "brasil",
    "colombia",
    "ecuador",
    "uruguay",
    "paraguay",
    "venezuela",
    "españa",
    "mexico",
    "united states",
    "usa",
    "united kingdom",
    "uk",
  ];
  const regionKeywords = [
    "región",
    "region",
    "metropolitana",
    "provincia",
    "estado",
    "state",
    "county",
    "departamento",
    "rm",
  ];

  const cleaned = parts.filter((part) => {
    const lower = part.toLowerCase();
    if (/^\d{4,10}$/.test(part)) return false;
    if (countryKeywords.some((kw) => lower === kw)) return false;
    if (regionKeywords.some((kw) => lower.includes(kw))) return false;
    return true;
  });

  return cleaned.join(", ");
};
