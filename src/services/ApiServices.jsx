const API_URL = import.meta.env.VITE_API_URL;
// const API_URL = "http://127.0.0.1:8000/api/";

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

// GET con access_token
async function GetData2(endpoint, accessToken) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching ${endpoint}: ${response.status}`);
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
            body: JSON.stringify(body),
            credentials: 'include'
        });

        
        const data = await response.json();
        return {
            status: response.status, // <-- aquí mandamos el estado HTTP
            data: data                      // <-- aquí mandamos el contenido JSON
        };
    } catch (error) {
        console.error('Error:', endpoint, error);
        throw error;
    }
}

async function PostData2(endpoint, body, access_token = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (access_token) {
      headers['Authorization'] = `Bearer ${access_token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await response.json();

    return {
      status: response.status,
      data,
    };
  } catch (error) {
    console.error('Error:', endpoint, error);
    throw error;
  }
}

export default PostData;


// PUT
async function PutData(endpoint, id, body) {
      
    try {
        const response = await fetch(`${API_URL}${endpoint}${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error('Error al actualizar' + endpoint);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error al actualizar:', endpoint, error);
        throw error;
    }
}

// PATCH
async function PatchData(endpoint, id, body) {
  
  try {
    const response = await fetch(`${API_URL}${endpoint}${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar " + endpoint);
    }

    const data = await response.json();
    return {
        status: response.status,
        data: data
    };
    
  } catch (error) {
    console.error("Error al actualizar:", endpoint, error);
    throw error;
  }
}

// DELETE USER
async function DeleteUserData(endpoint, id) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ID: id }),

    });

    if (!response.ok) {
      throw new Error("Error al eliminar " + endpoint);
    }

    return {
        status: response.status,
        message: "Eliminado correctamente"
    };

  } catch (error) {
    console.error("Error al eliminar:", endpoint, error);
    throw error;
  }
}

// DELETE
async function DeleteData(endpoint, id) {
  try {
    const response = await fetch(`${API_URL}${endpoint}${id}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al eliminar " + endpoint);
    }

    return {
      status: response.status,
      message: "Eliminado correctamente"
    };

  } catch (error) {
    console.error("Error al eliminar:", endpoint, error);
    throw error;
  }
}

export { GetData, GetData2, PostData, PostData2, PutData, PatchData, DeleteUserData, DeleteData };