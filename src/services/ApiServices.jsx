
const API_URL = "http://127.0.0.1:8000/api/";

// GET
async function GetData(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Error fetching ' + endpoint);
        }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error al obtener:', endpoint, error);
        throw error;
    }
}

// POST
async function PostData(endpoint, body) {
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error('Error al crear ' + endpoint);
        }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error:', endpoint, error);
        throw error;
    }
}

// PATCH
async function PatchData(endpoint, body) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error('Error al actualizar ' + endpoint);
        }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error al actualizar:', endpoint, error);
        throw error;
    }
}

// DELETE
async function DeleteData(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Error al eliminar ' + endpoint);
        }
        return { message: 'Eliminado correctamente' };

    } catch (error) {
        console.error('Error al eliminar:', endpoint, error);
        throw error;
    }
}

export { GetData, PostData, PatchData, DeleteData };