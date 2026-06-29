// =================================================================================
// CÓDIGO.GS - CONFIGURACIÓN DEL BACKEND (GOOGLE APPS SCRIPT)
// =================================================================================
// Instrucciones de uso:
// 1. Abre tu Google Sheet de base de datos.
// 2. Ve a Extensiones > Apps Script.
// 3. Reemplaza TODO el código existente por este archivo.
// 4. Asegúrate de configurar las 3 constantes de abajo (SPREADSHEET_ID, ESQUEMAS_MASTER_SECRET, URL_PLATAFORMA).
// 5. Guarda y haz clic en "Implementar" > "Nueva implementación" tipo Web App.
// =================================================================================

const scriptProps = PropertiesService.getScriptProperties();
const SPREADSHEET_ID = scriptProps.getProperty("SPREADSHEET_ID");
const ESQUEMAS_MASTER_SECRET = scriptProps.getProperty("ESQUEMAS_MASTER_SECRET");
const URL_PLATAFORMA = scriptProps.getProperty("URL_PLATAFORMA");
const URL_CONDUCTOR = scriptProps.getProperty("URL_CONDUCTOR") || (URL_PLATAFORMA ? URL_PLATAFORMA.replace("esquemapps", "esquemas-driver") : "");

function configurarCORS(salida) {
  return ContentService.createTextOutput(JSON.stringify(salida))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return HtmlService.createHtmlOutput("Servidor de Base de Datos Esquemas Pro Activo.");
}

// =================================================================================
// 🛡️ FUNCIONES DE SEGURIDAD Y UTILERÍAS
// =================================================================================

// Cifrado criptográfico SHA-256 para contraseñas de una sola vía
function cifrarPassword(passwordPlain) {
  if (!passwordPlain) return "";
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, passwordPlain, Utilities.Charset.UTF_8);
  let output = "";
  for (let i = 0; i < rawHash.length; i++) {
    let byteValue = rawHash[i];
    if (byteValue < 0) byteValue += 256;
    let byteString = byteValue.toString(16);
    if (byteString.length == 1) byteString = "0" + byteString;
    output += byteString;
  }
  return output;
}

// Sanitizar entradas para evitar Inyección de Fórmulas en Hojas de Cálculo (SEC-02)
function sanitizarEntrada(valor) {
  if (typeof valor === "string") {
    const valTrim = valor.trim();
    // Antepone comilla simple si empieza por caracteres ejecutables (=, +, -, @)
    if (valTrim.startsWith("=") || valTrim.startsWith("+") || valTrim.startsWith("-") || valTrim.startsWith("@")) {
      return "\"" + valTrim;
    }
    return valTrim;
  }
  return valor;
}

// Verificar rol del emisor de la petición para mitigar Escalada de Privilegios (SEC-01)
function verificarPermisoRequester(ss, requesterEmail, rolesPermitidos) {
  if (!requesterEmail) return false;
  const sheetUsuarios = ss.getSheetByName("Usuarios");
  if (!sheetUsuarios) return false;
  const rows = sheetUsuarios.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2].toString().trim().toLowerCase() === requesterEmail.trim().toLowerCase() && rows[i][6] === "ACTIVO") {
      const userRole = rows[i][4];
      return rolesPermitidos.includes(userRole);
    }
  }
  return false;
}

// Permisos por defecto segun el rol
function getDefaultPermisos(ss, role) {
  try {
    let sheet = ss.getSheetByName("RolesConfig");
    if (sheet) {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === role && rows[i][1]) {
          try {
            return JSON.parse(rows[i][1]);
          } catch(e) {}
        }
      }
    }
  } catch(e) {}

  // Fallback to hardcoded defaults (updated with new granular permissions)
  if (role === "ADMIN") {
    return ["DASHBOARD", "PROJECTS_MANAGE", "PROJECT_ASSIGN", "PROJECT_STATUS", "RIDERS", "RIDERS_MANAGE", "TRANSPORT", "TRANSPORT_CREATE", "TRANSPORT_EDIT", "HITOS", "HITOS_MANAGE", "CHAT", "CHAT_SEND", "STAFF", "ADMIN_PANEL", "EXPENSES", "EXPENSES_MANAGE"];
  }
  if (role === "MANAGER") {
    return ["DASHBOARD", "PROJECTS_MANAGE", "PROJECT_ASSIGN", "PROJECT_STATUS", "RIDERS", "RIDERS_MANAGE", "TRANSPORT", "TRANSPORT_CREATE", "TRANSPORT_EDIT", "HITOS", "HITOS_MANAGE", "CHAT", "CHAT_SEND", "STAFF", "EXPENSES", "EXPENSES_MANAGE"];
  }
  if (role === "TOUR MANAGER") {
    return ["DASHBOARD", "PROJECTS_MANAGE", "PROJECT_ASSIGN", "PROJECT_STATUS", "RIDERS", "RIDERS_MANAGE", "TRANSPORT", "TRANSPORT_CREATE", "TRANSPORT_EDIT", "HITOS", "HITOS_MANAGE", "CHAT", "CHAT_SEND", "STAFF", "EXPENSES"];
  }
  if (role === "JEFE CAT/APV") {
    return ["DASHBOARD", "RIDERS", "RIDERS_MANAGE", "TRANSPORT", "TRANSPORT_CREATE", "HITOS", "HITOS_MANAGE", "CHAT", "CHAT_SEND", "STAFF", "EXPENSES"];
  }
  if (role === "TEC. JEFE") {
    return ["DASHBOARD", "RIDERS", "RIDERS_MANAGE", "TRANSPORT", "TRANSPORT_CREATE", "HITOS", "HITOS_MANAGE", "CHAT", "CHAT_SEND", "STAFF"];
  }
  if (role === "APV/CATERING") {
    return ["DASHBOARD", "RIDERS", "TRANSPORT", "HITOS", "CHAT", "CHAT_SEND", "STAFF"];
  }
  if (role === "TRASLADO") {
    return ["TRANSPORT", "TRANSPORT_CREATE", "CHAT", "CHAT_SEND", "STAFF"];
  }
  // Técnico y otros roles por defecto (solo lectura)
  return ["DASHBOARD", "RIDERS", "TRANSPORT", "HITOS", "CHAT", "STAFF"];
}

// Helper para envío de correos
function enviarCorreoNotificacion(destinatario, nombre, mensaje, clave, rol, mostrarBoton) {
  try {
    var styleDiv = "font-family:sans-serif; max-width:600px; padding:20px; border:1px solid #e2e8f0; border-radius:12px; background-color:#f8fafc;";
    var styleH2 = "color:#059669; font-weight:900;";
    var styleCode = "background-color:#ffffff; border:1px dashed #cbd5e1; padding:15px; border-radius:8px; text-align:center; margin:20px 0;";
    var styleP = "margin:0 0 5px 0; font-size:12px; color:#64748b; font-weight:bold;";
    var styleSpan = "font-size:24px; letter-spacing:4px; font-weight:900; color:#0f172a;";
    var styleBtnDiv = "text-align:center; margin:25px 0;";
    var styleBtn = "background-color:#059669; color:#ffffff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;";

    var finalUrl = URL_PLATAFORMA;
    if (clave) {
      finalUrl += "?email=" + encodeURIComponent(destinatario) + "&tempPass=" + encodeURIComponent(clave);
    }

    var htmlBody = "<div style=\"" + styleDiv + "\">" +
      "<h2 style=\"" + styleH2 + "\">ESQUEMAS PRO</h2>" +
      "<p>Hola <b>" + nombre + "</b>,</p>" +
      "<p>" + mensaje + "</p>";
    
    if (clave) {
      htmlBody += "<div style=\"" + styleCode + "\">" +
        "<p style=\"" + styleP + "\">CREDENCIALES TEMPORALES</p>" +
        "<span style=\"" + styleSpan + "\">" + clave + "</span>" +
        "</div>";
    }
    
    if (mostrarBoton) {
      htmlBody += "<div style=\"" + styleBtnDiv + "\">" +
        "<a href=\"" + finalUrl + "\" style=\"" + styleBtn + "\">Ingresar a la Plataforma</a>" +
        "</div>";
    }
    
    htmlBody += "<hr style=\"border:0; border-top:1px solid #cbd5e1; margin:20px 0;\">" +
      "<p style=\"font-size:11px; color:#64748b; margin:0;\">Este es un correo automatico generado por el sistema logistico Esquemas Pro.</p>" +
      "</div>";

    MailApp.sendEmail({
      to: destinatario,
      subject: "Notificacion de Cuenta - Esquemas Pro",
      htmlBody: htmlBody
    });
  } catch (e) {
    Logger.log("Error al enviar correo: " + e.toString());
  }
}

// =================================================================================
// 📩 PUNTO DE ENTRADA PRINCIPAL POST
// =================================================================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Validar Secreto de Aplicación
    if (data.app_secret !== ESQUEMAS_MASTER_SECRET) {
      return configurarCORS({ status: "error", message: "ACCESO DENEGADO" });
    }

    const action = data.action; 
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const requester = data.payload ? data.payload.requesterEmail : null;

    // 🛡️ CONTROL DE ACCESOS EN EL BACKEND (SEC-01)
    const adminActions = ["aprobarUsuario", "rechazarUsuario", "eliminarUsuario", "updateUserAdmin"];
    if (adminActions.includes(action)) {
      if (!verificarPermisoRequester(ss, requester, ["ADMIN"])) {
        return configurarCORS({ status: "error", message: "ACCION RECHAZADA: Requiere privilegios de ADMIN." });
      }
    }

    const managerActions = ["createProyecto", "updateProyectoStatus", "updateProyectoAsignaciones", "createHito", "deleteHito", "updateHitoAsignaciones"];
    if (managerActions.includes(action)) {
      if (!verificarPermisoRequester(ss, requester, ["ADMIN", "MANAGER", "TOUR MANAGER"])) {
        return configurarCORS({ status: "error", message: "ACCION RECHAZADA: Requiere rol ADMIN o MANAGER." });
      }
    }

    // ==========================================
    // 1. SECCIÓN USUARIOS, LOGIN Y PERFILES
    // ==========================================
    if (action === "solicitarAcceso" || action === "checkEmailTC" || action === "aprobarUsuario" || action === "rechazarUsuario" || action === "eliminarUsuario" || action === "login" || action === "getUsuarios" || action === "updateProfile" || action === "updateUserAdmin") {
      const sheetUsuarios = ss.getSheetByName("Usuarios");
      if (!sheetUsuarios) return configurarCORS({ status: "error", message: "Pestaña Usuarios no existe." });

      if (action === "checkEmailTC") {
        const emailLower = data.payload.email.trim().toLowerCase();
        const rows = sheetUsuarios.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][2].toString().trim().toLowerCase() === emailLower) {
            const tcVal = rows[i][10] ? rows[i][10].toString().trim() : "";
            if (tcVal && (tcVal.indexOf("Aceptado:") === 0 || tcVal.indexOf("Reingreso Aceptado:") === 0)) {
              return configurarCORS({ status: "success", accepted: true });
            }
          }
        }
        return configurarCORS({ status: "success", accepted: false });
      }

      if (action === "solicitarAcceso") {
        const newId = new Date().getTime(); 
        const name = sanitizarEntrada(data.payload.name);
        const email = sanitizarEntrada(data.payload.email);
        const phone = sanitizarEntrada(data.payload.phone);
        const role = sanitizarEntrada(data.payload.role);
        
        let finalRole = role;
        let finalStatus = "PENDING";
        let passVal = "";
        let isNewAdmin = false;
        let claveTemporal = "";
        
        const totalUsers = sheetUsuarios.getDataRange().getValues().length - 1; // Excluir cabecera
        if (totalUsers <= 0) {
          finalRole = "ADMIN";
          finalStatus = "ACTIVO";
          isNewAdmin = true;
          claveTemporal = Math.floor(100000 + Math.random() * 900000).toString();
          passVal = cifrarPassword(claveTemporal);
        }
        
        const tcText = "Aceptado: " + new Date().toISOString();
        sheetUsuarios.appendRow([
          newId, 
          name, 
          email, 
          phone, 
          finalRole, 
          passVal, 
          finalStatus, 
          "M", 
          "OMNIVORA", 
          JSON.stringify(getDefaultPermisos(ss, finalRole)),
          tcText
        ]);
        
        if (isNewAdmin) {
          try {
            enviarCorreoNotificacion(email, name, "Tu cuenta de Administrador ha sido creada e inicializada. Usa esta clave temporal para ingresar a la plataforma.", claveTemporal, "ADMIN", true);
          } catch(e) {}
          return configurarCORS({ status: "success", isNewAdmin: true, tempPass: claveTemporal });
        }
        
        return configurarCORS({ status: "success", message: "Solicitud en revision." });
      }

      if (action === "aprobarUsuario") {
        const rows = sheetUsuarios.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][2].toString().toLowerCase() === data.payload.email.toLowerCase()) {
            const nombre = rows[i][1];
            const rol = rows[i][4];
            const claveTemporal = Math.floor(100000 + Math.random() * 900000).toString();
            sheetUsuarios.getRange(i + 1, 6).setValue(cifrarPassword(claveTemporal)); 
            sheetUsuarios.getRange(i + 1, 7).setValue("ACTIVO");     
            
            enviarCorreoNotificacion(data.payload.email, nombre, "Tu solicitud de acceso ha sido aprobada. Utiliza esta clave temporal para ingresar a la plataforma y no olvides actualizarla en tu perfil.", claveTemporal, rol, true);
            return configurarCORS({ status: "success", message: "Aprobado y correo enviado." });
          }
        }
        return configurarCORS({ status: "error", message: "Usuario no encontrado." });
      }

      if (action === "rechazarUsuario") {
        const rows = sheetUsuarios.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][2].toString().toLowerCase() === data.payload.email.toLowerCase()) {
            const nombre = rows[i][1];
            const rol = rows[i][4];
            sheetUsuarios.deleteRow(i + 1); 
            
            enviarCorreoNotificacion(data.payload.email, nombre, "Lamentamos informarte que tu solicitud de acceso a la plataforma ha sido rechazada por el equipo de administracion.", null, rol, false);
            return configurarCORS({ status: "success", message: "Rechazado y correo enviado." });
          }
        }
        return configurarCORS({ status: "error", message: "Usuario no encontrado." });
      }

      if (action === "eliminarUsuario") {
        const rows = sheetUsuarios.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][2].toString().toLowerCase() === data.payload.email.toLowerCase()) {
            const nombre = rows[i][1];
            const rol = rows[i][4];
            sheetUsuarios.deleteRow(i + 1); 
            
            enviarCorreoNotificacion(data.payload.email, nombre, "Te informamos que tu cuenta ha sido eliminada y tu acceso a la plataforma ESQUEMAS ha sido revocado por la administracion.", null, rol, false);
            return configurarCORS({ status: "success", message: "Usuario eliminado y correo enviado." });
          }
        }
        return configurarCORS({ status: "error", message: "Usuario no encontrado." });
      }

      if (action === "updateUserAdmin") {
        const { email, name, phone, role, status, permisos, requesterEmail } = data.payload;
        const rows = sheetUsuarios.getDataRange().getValues();
        
        let cedingAdmin = false;
        if (role === "ADMIN" && requesterEmail && email.toLowerCase() !== requesterEmail.toLowerCase()) {
          cedingAdmin = true;
        }

        for (let i = 1; i < rows.length; i++) {
          const userEmail = rows[i][2].toString().toLowerCase();
          if (userEmail === email.toLowerCase()) {
            sheetUsuarios.getRange(i + 1, 2).setValue(sanitizarEntrada(name));
            sheetUsuarios.getRange(i + 1, 4).setValue(sanitizarEntrada(phone));
            sheetUsuarios.getRange(i + 1, 5).setValue(sanitizarEntrada(role));
            sheetUsuarios.getRange(i + 1, 7).setValue(sanitizarEntrada(status));
            sheetUsuarios.getRange(i + 1, 10).setValue(JSON.stringify(permisos || []));
          }
          
          if (cedingAdmin && userEmail === requesterEmail.toLowerCase()) {
            sheetUsuarios.getRange(i + 1, 5).setValue("MANAGER");
            sheetUsuarios.getRange(i + 1, 10).setValue(JSON.stringify(getDefaultPermisos(ss, "MANAGER")));
          }
        }
        return configurarCORS({ status: "success", ceded: cedingAdmin });
      }

      if (action === "login") {
        const rows = sheetUsuarios.getDataRange().getValues();
        const passCifrada = cifrarPassword(data.payload.password);
        for (let i = 1; i < rows.length; i++) { 
          if (rows[i][2].toString().trim().toLowerCase() === data.payload.email.trim().toLowerCase() && passCifrada === rows[i][5].toString().trim()) {
            if (rows[i][6] === "PENDING" || rows[i][6] === "INACTIVO") {
              return configurarCORS({ status: "error", message: "Cuenta bloqueada o en revision." });
            }
            
            let permisosStr = rows[i][9];
            let permisosParsed = [];
            try { 
               permisosParsed = JSON.parse(permisosStr); 
            } catch(e) { 
               permisosParsed = getDefaultPermisos(ss, rows[i][4]); 
               sheetUsuarios.getRange(i + 1, 10).setValue(JSON.stringify(permisosParsed));
            }

            return configurarCORS({ status: "success", user: { id: rows[i][0], name: rows[i][1], email: rows[i][2].toString().trim(), phone: rows[i][3], role: rows[i][4], talla: rows[i][7] || "M", dieta: rows[i][8] || "OMNIVORA", permisos: permisosParsed } });
          }
        }
        return configurarCORS({ status: "error", message: "Credenciales invalidas." });
      }

      if (action === "getUsuarios") {
        const rows = sheetUsuarios.getDataRange().getValues();
        const usuarios = [];
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][1]) {
             let p = [];
             try { p = JSON.parse(rows[i][9]); } catch(e) {}
             if (!p || p.length === 0) {
               p = getDefaultPermisos(ss, rows[i][4]);
             }
             usuarios.push({ id: rows[i][0], name: rows[i][1], email: rows[i][2].toString().trim(), phone: rows[i][3], role: rows[i][4], status: rows[i][6], dieta: rows[i][8] || "OMNIVORA", permisos: p });
          }
        }
        return configurarCORS({ status: "success", data: usuarios });
      }

      if (action === "updateProfile") {
        const { email, phone, talla, dieta, newPassword, oldPassword } = data.payload;
        const rows = sheetUsuarios.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][2].toString().trim().toLowerCase() === email.trim().toLowerCase()) {
            
            if (newPassword && oldPassword) {
               const oldPassCifrada = cifrarPassword(oldPassword);
               if (rows[i][5].toString().trim() !== oldPassCifrada) {
                  return configurarCORS({ status: "error", message: "La contrasena actual ingresada es incorrecta." });
               }
               sheetUsuarios.getRange(i + 1, 6).setValue(cifrarPassword(newPassword)); 
            }
            
            sheetUsuarios.getRange(i + 1, 4).setValue(sanitizarEntrada(phone)); 
            sheetUsuarios.getRange(i + 1, 8).setValue(sanitizarEntrada(talla || "M")); 
            sheetUsuarios.getRange(i + 1, 9).setValue(sanitizarEntrada(dieta || "OMNIVORA")); 
            return configurarCORS({ status: "success" });
          }
        }
        return configurarCORS({ status: "error", message: "Usuario no encontrado." });
      }
    }

    // ==========================================
    // 2. SECCIÓN PROYECTOS
    // ==========================================
    if (action === "getProyectos") {
      const sheet = ss.getSheetByName("Proyectos");
      const rows = sheet ? sheet.getDataRange().getValues() : [];
      const proyectos = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0]) {
          let asignados = [];
          try { asignados = JSON.parse(rows[i][5]); } catch(e) {}
          proyectos.push({ 
            id: rows[i][0], 
            name: rows[i][1], 
            type: rows[i][2], 
            manager: rows[i][3], 
            status: rows[i][4], 
            asignados: asignados,
            presupuesto: Number(rows[i][6] || 0)
          });
        }
      }
      return configurarCORS({ status: "success", data: proyectos });
    }

    if (action === "createProyecto") {
      const sheet = ss.getSheetByName("Proyectos");
      if (!sheet) return configurarCORS({ status: "error", message: "Pestaña Proyectos no existe." });
      sheet.appendRow([new Date().getTime(), sanitizarEntrada(data.payload.name), sanitizarEntrada(data.payload.type), sanitizarEntrada(data.payload.manager), "ACTIVO", "[]"]);
      return configurarCORS({ status: "success" });
    }

    if (action === "updateProyectoStatus") {
      const sheet = ss.getSheetByName("Proyectos");
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == data.payload.id) {
          sheet.getRange(i + 1, 5).setValue(sanitizarEntrada(data.payload.status));
          return configurarCORS({ status: "success" });
        }
      }
      return configurarCORS({ status: "error", message: "Proyecto no encontrado" });
    }

    if (action === "updateProyectoAsignaciones") {
      const sheet = ss.getSheetByName("Proyectos");
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == data.payload.id) {
          sheet.getRange(i + 1, 6).setValue(JSON.stringify(data.payload.asignados));
          return configurarCORS({ status: "success" });
        }
      }
      return configurarCORS({ status: "error", message: "Proyecto no encontrado" });
    }

    // ==========================================
    // 3. SECCIÓN HITOS
    // ==========================================
    if (action === "getHitos") {
      const sheet = ss.getSheetByName("Hitos");
      const rows = sheet ? sheet.getDataRange().getValues() : [];
      const hitos = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0]) {
          let asignados = [];
          try { asignados = JSON.parse(rows[i][7]); } catch(e) {}
          hitos.push({
            id: rows[i][0],
            proyectoId: rows[i][1],
            title: rows[i][2],
            date: rows[i][3],
            time: rows[i][4],
            location: rows[i][5],
            status: rows[i][6],
            asignados: asignados
          });
        }
      }
      return configurarCORS({ status: "success", data: hitos });
    }

    if (action === "createHito") {
      const sheet = ss.getSheetByName("Hitos");
      if (!sheet) return configurarCORS({ status: "error", message: "Pestaña Hitos no existe." });
      const newRow = [
        new Date().getTime(),    
        data.payload.proyectoId, 
        sanitizarEntrada(data.payload.title),      
        sanitizarEntrada(data.payload.date),       
        sanitizarEntrada(data.payload.time),       
        sanitizarEntrada(data.payload.location),   
        "AGENDADO",              
        "[]"                     
      ];
      sheet.appendRow(newRow);
      return configurarCORS({ status: "success" });
    }

    if (action === "deleteHito") {
      const sheet = ss.getSheetByName("Hitos");
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == data.payload.id) {
          sheet.deleteRow(i + 1);
          return configurarCORS({ status: "success" });
        }
      }
      return configurarCORS({ status: "error", message: "Hito no encontrado" });
    }

    if (action === "updateHitoAsignaciones") {
      const sheet = ss.getSheetByName("Hitos");
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == data.payload.id) {
          sheet.getRange(i + 1, 8).setValue(JSON.stringify(data.payload.asignados));
          return configurarCORS({ status: "success" });
        }
      }
      return configurarCORS({ status: "error", message: "Hito no encontrado" });
    }

    // ==========================================
    // 4. SECCIÓN CANAL DE ANUNCIOS / CHAT
    // ==========================================
    if (action === "getMensajes") {
      const sheet = ss.getSheetByName("Chat");
      if(!sheet) return configurarCORS({ status: "error", message: "Pestaña Chat no existe" });
      const rows = sheet.getDataRange().getValues();
      const mensajes = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0]) {
          const statusVal = rows[i][7] ? String(rows[i][7]).trim() : "ACTIVO";
          if (statusVal === "OCULTO") continue;

          let leidoPor = [];
          try { leidoPor = JSON.parse(rows[i][5]); } catch(e) {}
          
          mensajes.push({
            id: rows[i][0],
            sender: rows[i][1],
            role: rows[i][2],
            text: rows[i][3],
            time: rows[i][4],
            readBy: leidoPor,
            proyectoId: rows[i][6] ? String(rows[i][6]).trim() : "",
            status: statusVal
          });
        }
      }
      return configurarCORS({ status: "success", data: mensajes });
    }

    if (action === "sendMensaje") {
      const sheet = ss.getSheetByName("Chat");
      if(!sheet) return configurarCORS({ status: "error", message: "Pestaña Chat no existe" });
      
      sheet.appendRow([
        new Date().getTime(),
        sanitizarEntrada(data.payload.sender),
        sanitizarEntrada(data.payload.role),
        sanitizarEntrada(data.payload.text),
        sanitizarEntrada(data.payload.time),
        "[]",                         
        data.payload.proyectoId || "",
        "ACTIVO"                      
      ]);
      return configurarCORS({ status: "success" });
    }

    if (action === "marcarLeido") {
      const sheet = ss.getSheetByName("Chat");
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == data.payload.id) {
          let leidoPor = [];
          try { leidoPor = JSON.parse(rows[i][5]); } catch(e) {}
          
          if (!leidoPor.includes(data.payload.userName)) {
            leidoPor.push(data.payload.userName);
            sheet.getRange(i + 1, 6).setValue(JSON.stringify(leidoPor));
          }
          return configurarCORS({ status: "success" });
        }
      }
      return configurarCORS({ status: "error", message: "Mensaje no encontrado." });
    }

    if (action === "ocultarMensaje") {
      const sheet = ss.getSheetByName("Chat");
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == data.payload.id) {
          sheet.getRange(i + 1, 8).setValue("OCULTO"); 
          return configurarCORS({ status: "success" });
        }
      }
      return configurarCORS({ status: "error", message: "Mensaje no encontrado." });
    }

    // ==========================================
    // 5. SECCIÓN LOGÍSTICA / TRANSPORTES
    // ==========================================
    if (action === "getTransportes") {
      const sheet = ss.getSheetByName("Transportes");
      const rows = sheet ? sheet.getDataRange().getValues() : [];
      const trans = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][1]) {
          trans.push({ 
            id: rows[i][0], 
            token: rows[i][1], 
            title: rows[i][2], 
            date: rows[i][3], 
            time: rows[i][4], 
            origin: rows[i][5], 
            dest: rows[i][6], 
            status: rows[i][7], 
            proyectoId: rows[i][8] || "",
            paradas: rows[i][9] ? JSON.parse(rows[i][9]) : [],
            conductor: rows[i][10] || "",
            conductorPhone: rows[i][11] || "",
            conductorAceptado: rows[i][12] || "PENDIENTE"
          });
        }
      }
      return configurarCORS({ status: "success", data: trans });
    }

    if (action === "createTransporte") {
      const sheet = ss.getSheetByName("Transportes");
      if (!sheet) return configurarCORS({ status: "error", message: "Pestaña Transportes no existe." });
      const token = "TR-" + Math.floor(1000 + Math.random() * 9000);
      sheet.appendRow([
        new Date().getTime(), 
        token, 
        sanitizarEntrada(data.payload.title), 
        sanitizarEntrada(data.payload.date), 
        sanitizarEntrada(data.payload.time), 
        sanitizarEntrada(data.payload.origin), 
        sanitizarEntrada(data.payload.dest), 
        "PENDING", 
        data.payload.proyectoId || "",
        "[]", // paradas (Col J)
        "",   // conductor (Col K)
        "",   // conductorPhone (Col L)
        "PENDIENTE" // conductorAceptado (Col M)
      ]);
      return configurarCORS({ status: "success" });
    }

    if (action === "updateTransportStatus") {
      const sheet = ss.getSheetByName("Transportes");
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][1] === data.payload.token) {
          sheet.getRange(i + 1, 8).setValue(sanitizarEntrada(data.payload.newStatus));
          return configurarCORS({ status: "success" });
        }
      }
      return configurarCORS({ status: "error", message: "Transporte no encontrado." });
    }

    if (action === "loginConductor") {
      const sheet = ss.getSheetByName("Transportes");
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][1] === data.payload.token) {
          return configurarCORS({ 
            status: "success", 
            user: { 
              role: "CONDUCTOR", 
              name: "Conductor", 
              routeInfo: { 
                token: rows[i][1], 
                title: rows[i][2], 
                date: rows[i][3], 
                time: rows[i][4], 
                origin: rows[i][5], 
                dest: rows[i][6], 
                status: rows[i][7],
                paradas: rows[i][9] ? JSON.parse(rows[i][9]) : [],
                conductor: rows[i][10] || "",
                conductorPhone: rows[i][11] || "",
                conductorAceptado: rows[i][12] || "PENDIENTE"
              } 
            } 
          });
        }
      }
      return configurarCORS({ status: "error", message: "Token invalido" });
    }

    if (action === "asignarConductor") {
      const sheet = ss.getSheetByName("Transportes");
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][1] === data.payload.token) {
          sheet.getRange(i + 1, 11).setValue(sanitizarEntrada(data.payload.conductor)); // Col K
          sheet.getRange(i + 1, 12).setValue(sanitizarEntrada(data.payload.conductorPhone)); // Col L
          sheet.getRange(i + 1, 13).setValue("PENDIENTE"); // Col M (conductorAceptado)
          return configurarCORS({ status: "success" });
        }
      }
      return configurarCORS({ status: "error", message: "Token no encontrado." });
    }

    if (action === "enviarAvisoConductor") {
      // Envía email con enlace de confirmación
      const linkConfirmar = URL_CONDUCTOR + "?acceptToken=" + data.payload.token;
      let emailBody = "Estimado conductor " + data.payload.conductorName + ",\n\n";
      emailBody += "Se le ha asignado una ruta de transporte en Esquemas Pro.\n\n";
      emailBody += "Detalles de la Ruta:\n";
      emailBody += "- Servicio: " + data.payload.title + "\n";
      emailBody += "- Fecha/Hora: " + data.payload.date + " a las " + data.payload.time + "\n";
      emailBody += "- Origen: " + data.payload.origin + "\n";
      emailBody += "- Destino: " + data.payload.dest + "\n\n";
      emailBody += "Por favor, confirme la recepcion y aceptacion de la ruta haciendo clic en el siguiente enlace:\n";
      emailBody += linkConfirmar + "\n\n";
      emailBody += "Saludos cordiales,\nEquipo de Logistica Esquemas Pro.";

      try {
        MailApp.sendEmail(data.payload.conductorEmail, "Asignacion de Ruta " + data.payload.token + " - Esquemas Pro", emailBody);
        return configurarCORS({ status: "success" });
      } catch (e) {
        return configurarCORS({ status: "error", message: "Error al enviar correo: " + e.toString() });
      }
    }

    if (action === "aceptarRuta") {
      const sheet = ss.getSheetByName("Transportes");
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][1] === data.payload.token) {
          sheet.getRange(i + 1, 13).setValue("Ruta aceptada por conductor"); // Col M
          return configurarCORS({ status: "success" });
        }
      }
      return configurarCORS({ status: "error", message: "Token no encontrado." });
    }

    if (action === "updateTransporte") {
      const sheet = ss.getSheetByName("Transportes");
      if (!sheet) return configurarCORS({ status: "error", message: "Pestaña Transportes no existe." });
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == data.payload.id) {
          sheet.getRange(i + 1, 3).setValue(sanitizarEntrada(data.payload.title));
          sheet.getRange(i + 1, 4).setValue(sanitizarEntrada(data.payload.date));
          sheet.getRange(i + 1, 5).setValue(sanitizarEntrada(data.payload.time));
          sheet.getRange(i + 1, 6).setValue(sanitizarEntrada(data.payload.origin));
          sheet.getRange(i + 1, 7).setValue(sanitizarEntrada(data.payload.dest));
          sheet.getRange(i + 1, 10).setValue(JSON.stringify(data.payload.paradas || []));
          sheet.getRange(i + 1, 13).setValue("PENDIENTE"); // Reset a PENDIENTE
          
          // Enviar avisos por correo
          try {
            const conductor = rows[i][10]; 
            const token = rows[i][1]; 
            const proyectoId = rows[i][8]; 
            
            let crewEmails = [];
            const sheetProyectos = ss.getSheetByName("Proyectos");
            if (sheetProyectos) {
              const pRows = sheetProyectos.getDataRange().getValues();
              for (let j = 1; j < pRows.length; j++) {
                if (pRows[j][0] == proyectoId) {
                  try { crewEmails = JSON.parse(pRows[j][5]); } catch(e) {}
                  break;
                }
              }
            }
            
            const alertMsg = "Se ha actualizado la ruta de transporte " + token + " (" + data.payload.title + ") agendada para el dia " + data.payload.date + " a las " + data.payload.time + ". Por favor revise la plataforma.";
            
            if (crewEmails && crewEmails.length > 0) {
              crewEmails.forEach(function(email) {
                MailApp.sendEmail(email, "Ruta Actualizada - Esquemas Pro", alertMsg);
              });
            }
            
            if (conductor && conductor.indexOf("@") !== -1) {
              const condEmail = conductor.substring(conductor.indexOf("(") + 1, conductor.indexOf(")"));
              MailApp.sendEmail(condEmail, "Actualizacion de Ruta Asignada - Esquemas Pro", alertMsg);
            }
          } catch(e) {}

          return configurarCORS({ status: "success" });
        }
      }
      return configurarCORS({ status: "error", message: "Ruta no encontrada." });
    }

    // ==========================================
    // 6. SECCIÓN RIDERS / STAGEPLOT
    // ==========================================
    if (action === "getRiders") {
      const sheet = ss.getSheetByName("Riders");
      const rows = sheet ? sheet.getDataRange().getValues() : [];
      const riders = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][1]) riders.push({ id: rows[i][0], title: rows[i][1], type: rows[i][2], content: rows[i][3] });
      }
      return configurarCORS({ status: "success", data: riders });
    }

    if (action === "createRider") {
      const sheet = ss.getSheetByName("Riders");
      if (!sheet) return configurarCORS({ status: "error", message: "Pestaña Riders no existe." });
      sheet.appendRow([new Date().getTime(), sanitizarEntrada(data.payload.title), sanitizarEntrada(data.payload.type), sanitizarEntrada(data.payload.content)]);
      return configurarCORS({ status: "success" });
    }

    if (action === "updateRider" || action === "deleteRider") {
      const sheet = ss.getSheetByName("Riders");
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == data.payload.id) {
          if (action === "deleteRider") sheet.deleteRow(i + 1);
          else {
            sheet.getRange(i + 1, 2).setValue(sanitizarEntrada(data.payload.title));
            sheet.getRange(i + 1, 3).setValue(sanitizarEntrada(data.payload.type));
            sheet.getRange(i + 1, 4).setValue(sanitizarEntrada(data.payload.content));
          }
          return configurarCORS({ status: "success" });
        }
      }
      return configurarCORS({ status: "error", message: "Rider no encontrado" });
    }

    // ==========================================
    // 7. SECCIÓN GASTOS Y PRESUPUESTOS
    // ==========================================
    if (action === "getGastos") {
      let sheet = ss.getSheetByName("Gastos");
      if (!sheet) {
        sheet = ss.insertSheet("Gastos");
        sheet.appendRow(["ID", "Tour ID", "Monto", "Categoria", "Descripción", "Fecha", "Reportado Por", "Comprobante"]);
      }
      const rows = sheet.getDataRange().getValues();
      const gastos = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0]) {
          gastos.push({
            id: rows[i][0],
            proyectoId: rows[i][1],
            monto: Number(rows[i][2] || 0),
            categoria: rows[i][3],
            concepto: rows[i][4],
            fecha: rows[i][5],
            registradoPor: rows[i][6],
            comprobante: rows[i][7] || ""
          });
        }
      }
      return configurarCORS({ status: "success", data: gastos });
    }

    if (action === "createGasto") {
      let sheet = ss.getSheetByName("Gastos");
      if (!sheet) {
        sheet = ss.insertSheet("Gastos");
        sheet.appendRow(["ID", "Tour ID", "Monto", "Categoria", "Descripción", "Fecha", "Reportado Por", "Comprobante"]);
      }
      sheet.appendRow([
        new Date().getTime(),
        data.payload.proyectoId,
        Number(data.payload.monto || 0),
        sanitizarEntrada(data.payload.categoria),
        sanitizarEntrada(data.payload.concepto),
        sanitizarEntrada(data.payload.fecha),
        sanitizarEntrada(data.payload.registradoPor),
        data.payload.comprobante || ""
      ]);
      return configurarCORS({ status: "success" });
    }

    if (action === "deleteGasto") {
      const sheet = ss.getSheetByName("Gastos");
      if (sheet) {
        const rows = sheet.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][0] == data.payload.id) {
            sheet.deleteRow(i + 1);
            return configurarCORS({ status: "success" });
          }
        }
      }
      return configurarCORS({ status: "error", message: "Gasto no encontrado" });
    }

    if (action === "updateProyectoPresupuesto") {
      // Solo ADMIN y MANAGER pueden editar presupuestos (SEC-01)
      if (!verificarPermisoRequester(ss, requester, ["ADMIN", "MANAGER"])) {
        return configurarCORS({ status: "error", message: "ACCION RECHAZADA: Requiere privilegios de ADMIN o MANAGER." });
      }
      const sheet = ss.getSheetByName("Proyectos");
      if (!sheet) throw new Error("Pestaña Proyectos no existe.");
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == data.payload.id) {
          sheet.getRange(i + 1, 7).setValue(Number(data.payload.presupuesto || 0));
          return configurarCORS({ status: "success" });
        }
      }
      return configurarCORS({ status: "error", message: "Proyecto no encontrado" });
    }

    if (action === "getRolesConfig") {
      let sheet = ss.getSheetByName("RolesConfig");
      const config = [];
      if (sheet) {
        const rows = sheet.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][0]) {
            let perms = [];
            try { perms = JSON.parse(rows[i][1]); } catch(e) {}
            config.push({ role: rows[i][0], permisos: perms });
          }
        }
      }
      return configurarCORS({ status: "success", data: config });
    }

    if (action === "updateRoleDefaultPermisos") {
      if (!verificarPermisoRequester(ss, requester, ["ADMIN"])) {
        return configurarCORS({ status: "error", message: "ACCION RECHAZADA: Requiere privilegios de ADMIN." });
      }
      let sheet = ss.getSheetByName("RolesConfig");
      if (!sheet) {
        sheet = ss.insertSheet("RolesConfig");
        sheet.appendRow(["Role", "Permisos"]);
      }
      const rows = sheet.getDataRange().getValues();
      let foundRow = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === data.payload.role) {
          foundRow = i + 1;
          break;
        }
      }
      const permsStr = JSON.stringify(data.payload.permisos);
      if (foundRow !== -1) {
        sheet.getRange(foundRow, 2).setValue(permsStr);
      } else {
        sheet.appendRow([data.payload.role, permsStr]);
      }
      return configurarCORS({ status: "success" });
    }

    return configurarCORS({ status: "error", message: "Accion no reconocida: " + action });

  } catch (error) {
    return configurarCORS({ status: "error", message: error.toString() });
  }
}
