const { db } = require("../config/firebaseAdmin");

const findWorker = async (category, rejectedWorkers = []) => {
    try {
        console.log('categoria: ', category);
        console.log('trabajadores rechazados: ', rejectedWorkers);
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

            const availableWorkers = workers.filter(
                worker => !rejectedWorkers.includes(worker.id)
            );

            if (availableWorkers.length === 0) {
                return {
                    success: false,
                    workers: [],
                    message: "No se encontraron trabajadores disponibles.",
                }
            }

            return {
                success: true,
                workers: availableWorkers,
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