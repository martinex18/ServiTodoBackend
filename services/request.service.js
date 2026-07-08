const { db } = require("../config/firebaseAdmin");

const findWorker = async (category) => {
    try {
        console.log(category);
        const snapshot = await db.collection("users")
            .where("role", "==", "worker")
            .where("workerData.category", "==", category)
            .where("workerData.isAvailable", "==", true)
            .get();

            if (snapshot.empty) {
                return {
                    success: false,
                    message: "No se encontraron trabajadores disponibles.",
                };
            }

            const workers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            return {
                success: true,
                workers,
            };
            
    } catch (error) {
        console.error(error);

        return {
            success: false,
            message: error.message,
        };
    }
}

module.exports = {
    findWorker,
}