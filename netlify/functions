exports.handler = async (event, context) => {
  // 1. Solo aceptamos peticiones POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const requestBody = JSON.parse(event.body);

    // 2. Inyectamos nuestro Secreto Maestro que solo existe en Netlify
    const securePayload = {
      ...requestBody,
      app_secret: process.env.ESQUEMAS_MASTER_SECRET, // Variable oculta en Netlify
    };

    // 3. Hacemos la petición a Google Apps Script desde el servidor (oculto al usuario)
    const response = await fetch(process.env.GAS_URL_SECRET, {
      method: "POST",
      body: JSON.stringify(securePayload),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });

    const data = await response.json();

    // 4. Devolvemos la respuesta de Google a React
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno del servidor seguro" }),
    };
  }
};
