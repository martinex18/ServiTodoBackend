const buildNewRequestMessage = ({
    category,
    description,
    address,
}) => {

    return [
        "🔔 *Nueva solicitud - ServiTodo*",
        "",
        "📌 *Servicio:*", category,
        "",
        description ? `📝 *Descripción:*\n${description}\n` : "",
        address
            ? `📍 *Dirección:*\n${address}\n`
            : "",
        "Responde:",
        "",
        "1️⃣ ACEPTAR",
        "2️⃣ RECHAZAR",
    ]
        .filter(Boolean)
        .join("\n");
};

module.exports = {
    buildNewRequestMessage,
};