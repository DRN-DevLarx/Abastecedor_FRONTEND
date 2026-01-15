import React, { useEffect, useState } from 'react'
import { Search, X, Edit, ColumnsSettings } from 'lucide-react'
import { GetData, PostData, PutData, PatchData, DeleteData } from '../services/ApiServices'
import cloudDinaryServices from '../services/cloudDinaryServices'
import Alert, { showAlert } from "./Alert"
import Swal from 'sweetalert2'
import Loader from "./Loader" //Monta y crea su estado

import { getCookie } from "../services/Token/sessionManager";
import { decodeJwt } from "jose";

function ModelsList() {
  
  const [token, setToken] = useState(() => getCookie("access_token"));
  const [CurrentUser, setCurrentUser] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [imagenesCarrusel, setImagenesCarrusel] = useState([])
  const [contenidoEstatico, setContenidoEstatico] = useState([])
  const [comentarios, setComentarios] = useState([])
  const [Users, setUsers] = useState([])

  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [modalModel, setModalModel] = useState(null)
  const [form, setForm] = useState({})
  
  const [ImageStatus, setImageStatus] = useState("activa")
  const [ImageVia, setImageVia] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploaderName, setuploaderName] = useState("")
  const [originalForm, setOriginalForm] = useState(null)

  
  useEffect(() => {
      const interval = setInterval(() => {
          const currentToken = getCookie("access_token");
          setToken(prev => prev !== currentToken ? currentToken : prev);
      }, 500); // polling ligero

      return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    setIsUploading(true)
    try {
      const [c, prov, img, cont, com, users] = await Promise.all([
        GetData('categorias/'),
        GetData('proveedores/'),
        GetData('imagenesCarrusel/'),
        GetData('contenidoEstatico/'),
        GetData('comentarios/'),
        GetData("users/")
      ])

      if (c) setCategorias(c)
      if (prov) setProveedores(prov)
      if (img) setImagenesCarrusel(img)
      if (cont) setContenidoEstatico(cont)
      if (com) setComentarios(com)
      if (users) {
        setUsers(users)
        
        //Obtener el usuario actual mediante el token
        try {
          const decoded = decodeJwt(token);
          const UserAdmin = users.find(u => u.id === decoded?.user_id);
          if (UserAdmin) {
            setCurrentUser(UserAdmin)
          }
        } catch {
          console.error('Error decodificando el token');
        }

      }

    } catch (err) {
      console.error('Error fetching models:', err)
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const filterList = (list, fields = []) => {
    const q = query || ''
    if (!q || !q.trim()) return list
    const s = q.toLowerCase()
    return list.filter((item) => fields.some((f) => (((item[f] || '') + '').toLowerCase().includes(s))))
  }

  const openCreate = (model) => {
    setModalMode('create')
    setModalModel(model)
    setForm({})
    setOriginalForm(null)
    setModalOpen(true)
  }

  const openEdit = (model, item) => {
    setModalMode('edit')
    setModalModel(model)
    setForm(item)
    setOriginalForm(JSON.parse(JSON.stringify(item)))
    // Inicializar el estado y vía de imagen según el item al editar
    if (model === 'imagenesCarrusel') {
      setImageStatus(item?.estado || 'activa')
      setImageVia("")
    }
    setModalOpen(true)

    const UserName = getUploaderName(Users, item.subida_por)    
    setuploaderName(UserName)
  }

  const normalizeForm = (obj) => {
    if (!obj) return obj
    const copy = JSON.parse(JSON.stringify(obj))
    if (copy.file) delete copy.file
    return copy
  }

  const hasFormChanged = () => {
    if (modalMode === 'create') return true
    if (!originalForm) return true

    if (modalModel === 'imagenesCarrusel') {
      const urlChanged = (form.url || '') !== (originalForm.url || '')
      const estadoChanged = (ImageStatus || '') !== (originalForm.estado || originalForm.estado === undefined ? originalForm.estado : '')
      const fileProvided = !!form.file
      return urlChanged || estadoChanged || fileProvided || ImageVia !== ''
    }

    const nForm = normalizeForm(form)
    const nOrig = normalizeForm(originalForm)
    return JSON.stringify(nForm) !== JSON.stringify(nOrig)
  }

  const validateBeforeSave = (mode) => {
    console.log("111");

    // mode: 'create' | 'edit'
    const m = modalModel
    if (!m) return false

    // IMÁGENES
    if (m === 'imagenesCarrusel') {
      const isEdit = mode === 'edit'

      // Determinar si se debe validar URL:
      // - siempre cuando el usuario seleccionó explícitamente 'url'
      // - o en edición cuando la URL fue modificada pero no se escogió 'local'
      const urlChanged = isEdit && (form.url || '') !== (originalForm?.url || '')
      const wantsUrl = ImageVia === 'url' || (isEdit && ImageVia !== 'local' && urlChanged)
      if (wantsUrl) {
        if (!form.url || !form.url.trim()) {
          showAlert('error', 'Error', 'La URL de la imagen no puede estar vacía.')
          return false
        }
      }

      // Determinar si se intenta subir local: vía seleccionada o en edición se adjuntó un archivo
      const fileProvided = !!form.file
      const wantsLocal = ImageVia === 'local' || fileProvided
      if (wantsLocal) {
        if (!form.file) {
          showAlert('error', 'Error', 'Debes seleccionar un archivo para subir.')
          return false
        }
      }

      // en edit, si no se cambió nada permitir solo estado (o bloquear si no hay cambios)
      if (isEdit && !hasFormChanged()) {
        showAlert('info', 'Info', 'No hay cambios para guardar.')
        return false
      }

      return true
    }

    // CATEGORÍAS
    if (m === 'categorias') {
      if (!form.nombre || !form.nombre.toString().trim()) {
        showAlert('error', 'Error', 'El nombre de la categoría no puede estar vacío.')
        return false
      }
      return true
    }

    // PROVEEDORES
    if (m === 'proveedores') {
      if (!form.nombre || !form.nombre.toString().trim()) {
        showAlert('error', 'Error', 'El nombre del proveedor no puede estar vacío.')
        return false
      }
      if (!form.telefono || !form.telefono.toString().trim()) {
        showAlert('error', 'Error', 'El teléfono del proveedor no puede estar vacío.')
        return false
      }
      // correo opcional pero si está, validar formato simple
      if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
        showAlert('error', 'Error', 'El correo no tiene un formato válido.')
        return false
      }
      return true
    }

    // CONTENIDO ESTÁTICO
    if (m === 'contenidoEstatico') {
      if (!form.titulo || !form.titulo.toString().trim()) {
        showAlert('error', 'Error', 'El título no puede estar vacío.')
        return false
      }
      if (!form.contenido || !form.contenido.toString().trim()) {
        showAlert('error', 'Error', 'El contenido no puede estar vacío.')
        return false
      }
      return true
    }

    // COMENTARIOS
    if (m === 'comentarios') {
      const userInput = form.user || form.user_id || ''
      if (!userInput || !String(userInput).trim()) {
        showAlert('error', 'Error', 'El usuario no puede estar vacío.')
        return false
      }
      if (!form.comentario || !form.comentario.toString().trim()) {
        showAlert('error', 'Error', 'El comentario no puede estar vacío.')
        return false
      }
      return true
    }

    return true
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalModel(null)
    setForm({})
    setImageVia("")
    setImageStatus("activa")
  }


  const handleFormChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleCreate = async () => {
    if (!modalModel) return

    try {
      // validaciones generales antes de crear
      const validCreate = validateBeforeSave('create')
      if (!validCreate) return
      // IMÁGENES CARRUSEL
      if (modalModel === "imagenesCarrusel") {
        if (ImageVia === "") {
          showAlert("error", "Error", "Selecciona una vía para subir la imagen.")
          return
        }

        const payload = { estado: ImageStatus, subida_por: CurrentUser?.id }

        if (ImageVia === "url") {
          if ((!form.url || form.url.trim() === "")) {
            showAlert("error", "Error", "La URL de la imagen no puede estar vacía.")
            return
          }
          payload.url = form.url
        }


        try {
          Swal.fire({ title: 'Subiendo imagen...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })

          if (ImageVia === "local") {
            if (!form.file) {
              showAlert("error", "Error", "Debes seleccionar un archivo para subir.")
              // setIsUploading(false)
              Swal.close()
              return
            }
            const imageUrl = await cloudDinaryServices.uploadImage(form.file)
            if (!imageUrl) {
              showAlert("error", "Error", "No se pudo subir la imagen.")
              Swal.close()
              return
            }
            payload.url = imageUrl
          }

          const res = await PostData(`${modalModel}/`, payload)
          const created = res && (res.id ? res : (res.data ? res.data : null))
          const createdOk = created || (res && res.status >= 200 && res.status < 300)

          if (createdOk) {
            const newItem = created || { id: Date.now(), ...payload }
            setImagenesCarrusel(prev => [newItem, ...prev])
            closeModal()
            showAlert('success', 'Éxito', 'Imagen creada correctamente.')
          } else {
            showAlert('error', 'Error', 'No se pudo crear la imagen en el servidor.')
          }

        } catch (err) {
          console.error('upload/create image error', err)
          showAlert('error', 'Error', 'Ocurrió un error al subir la imagen.')
        } finally {
          Swal.close()
        }

        return
      }

      // OTROS MODELOS: crear y actualizar estado local para visualización instantánea
      const payload = { ...form }

      // Para comentarios, enviar username en vez de id
      if (modalModel === 'comentarios') {
        const userInput = form.user || form.user_id || ''
        const userObj = Users.find(u => String(u.id) === String(userInput) || u.username === userInput)
        payload.user = userObj ? userObj.username : String(userInput)
      }

      setIsUploading(true)
      try {
        const res = await PostData(`${modalModel}/`, payload)
        const created = res && (res.id ? res : (res.data ? res.data : null))
        const createdOk = created || (res && res.status >= 200 && res.status < 300)

        if (createdOk) {
          const newItem = created || { id: Date.now(), ...payload }
          switch (modalModel) {
            case 'categorias':
              setCategorias(prev => [newItem, ...prev])
              break
            case 'proveedores':
              setProveedores(prev => [newItem, ...prev])
              break
            case 'contenidoEstatico':
              setContenidoEstatico(prev => [newItem, ...prev])
              break
            case 'comentarios':
              setComentarios(prev => [newItem, ...prev])
              break
            default:
              await fetchAll()
              break
          }

          closeModal()
          showAlert('success', 'Éxito', 'Creado correctamente.')
        } else {
          showAlert('error', 'Error', 'No se pudo crear en el servidor.')
        }
      } catch (err) {
        console.error('create error', err)
        showAlert('error', 'Error', 'Ocurrió un error al crear.')
      } finally {
        setIsUploading(false)
      }

    } catch (err) {
      console.error('create error', err)
      showAlert('error', 'Error', 'Ocurrió un error al crear.')
    }
  }


  const handleUpdate = async () => {
    if (!modalModel || !form.id) return

    // validaciones antes de actualizar
    const validUpdate = validateBeforeSave('edit')
    if (!validUpdate) return

    // Flow específico para imágenes: solo subir cuando el usuario eligió 'local' o adjuntó archivo,
    // o actualizar la URL cuando se cambió explícitamente. Si solo cambia el estado, no subir.
    if (modalModel === 'imagenesCarrusel') {
      const urlTrim = (form.url || '').toString().trim()
      const origUrlTrim = (originalForm?.url || '').toString().trim()
      const urlChanged = urlTrim !== origUrlTrim
      const estadoChanged = (ImageStatus || '') !== (originalForm?.estado || '')

      const wantsLocal = ImageVia === 'local'
      const wantsUrl = ImageVia === 'url' || (urlChanged && ImageVia !== 'local')

      if (!wantsLocal && !wantsUrl && !estadoChanged) {
        showAlert('info', 'Info', 'No hay cambios para guardar.')
        return
      }

      const payload = { estado: ImageStatus, subida_por: CurrentUser?.id }

      try {
        // Solo mostrar Swal de subida si vamos a subir un archivo local
        if (wantsLocal) Swal.fire({ title: 'Subiendo imagen...', allowOutsideClick: false, didOpen: () => Swal.showLoading() })

        if (wantsLocal) {
          if (!form.file) {
            showAlert('error', 'Error', 'Debes seleccionar un archivo para subir.')
            if (wantsLocal) Swal.close()
            return
          }
          const imageUrl = await cloudDinaryServices.uploadImage(form.file)
          if (!imageUrl) {
            showAlert('error', 'Error', 'No se pudo subir la imagen.')
            if (wantsLocal) Swal.close()
            return
          }
          payload.url = imageUrl
        } else if (wantsUrl) {
          if (!urlTrim) {
            showAlert('error', 'Error', 'La URL de la imagen no puede estar vacía.')
            return
          }
          if (urlTrim === origUrlTrim) {
            showAlert('info', 'Info', 'La URL ingresada es igual a la actual.')
            return
          }
          payload.url = urlTrim
        }

        const res = await PatchData(`${modalModel}/`, form.id, payload)
        const updated = res && (res.id ? res : (res.data ? res.data : null))
        const newItem = updated || { ...originalForm, ...payload }

        setImagenesCarrusel(prev => prev.map(it => it.id === form.id ? newItem : it))
        setImageVia("")
        setOriginalForm(JSON.parse(JSON.stringify(newItem)))
        closeModal()
        showAlert('success', 'Éxito', 'Imagen actualizada correctamente.')

      } catch (err) {
        console.error('update image error', err)
        showAlert('error', 'Error', 'Ocurrió un error al actualizar la imagen.')
      } finally {
        if (wantsLocal) Swal.close()
      }

      return
    }

    // Resto de modelos: usar isUploading + put genérico
    setIsUploading(true)
    try {
      await PutData(`${modalModel}/`, form.id, form)
      await fetchAll()
      closeModal()
    } catch (err) {
      console.error('update error', err)
      showAlert('error', 'Error', 'Ocurrió un error al actualizar.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (model, id) => {
    try {
      const Delete = await Swal.fire({
        icon: "warning",
        iconColor: "red",
        title: `¿Estás seguro que deseas eliminar?`,
        text: "Esta acción es irreversible.",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Sí, eliminar",
        confirmButtonColor: "red",
        background: 'rgba(80, 80, 80, 0.75)',
        color: "white",
      }).then((result) => {
        if (result.isConfirmed) {
          return true
        }
      })

      if (!Delete) return

      setIsUploading(true)
      try {
        await DeleteData(`${model}/`, id)
        await fetchAll()
        showAlert('success', 'Éxito', 'El elemento fue eliminado correctamente.')
      } catch (err) {
        console.error('delete error', err)
        showAlert('error', 'Error', 'No se pudo eliminar el elemento.')
      } finally {
        setIsUploading(false)
      }

    } catch (err) {
      console.error('delete error', err)
      showAlert('error', 'Error', 'No se pudo eliminar el elemento.')
    }
  }

  const getUploaderName = (users, userId) => {
    const user = users.find(u => u.id === userId)
    return user?.username ?? 'Desconocido'
  }

  // const formatDate = (dateString) => {
  //   if (!dateString) return ''
  //   return new Date(dateString).toLocaleDateString('es-CR', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: '2-digit'
  //   })
  // }

  const renderTableCard = (activeTab) => {
    switch (activeTab) {
      case 'imagenesCarrusel': {
        // Mostrar más recientes primero
        const list = filterList(imagenesCarrusel, ['url']).slice().sort((a, b) => (b.id || 0) - (a.id || 0))

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-105 overflow-y-auto">
            {list.map((i) => {
              const uploaderUserName = getUploaderName(Users, i.subida_por)
              // const fechaSubida = formatDate(i.fecha_subida)

              return (
                <div key={i.id} className="relative">
                  <div className="relative overflow-hidden rounded-xl ring-2 ring-white/20 hover:ring-white/40 transition-all">

                    <img src={i.url} alt={`img-${i.id}`} className="w-full h-50 object-cover" />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                    <button
                      type="button"
                      onClick={() => handleDelete('imagenesCarrusel', i.id)}
                      className="absolute top-2 right-2 bg-red-400 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
                    >
                      <X size={16} />
                    </button>

                    <div className="absolute bottom-0 w-full px-3 pb-2 h-16 pt-1 flex justify-between items-center bg-gray-600/60">
                      <div className="flex-1 min-w-0 space-y-0.5">

                        <span className={`text-xs font-semibold ${i.estado === 'activa' ? 'text-emerald-400' : 'text-red-500'}`}>
                          {i.estado === 'activa' ? 'Activa' : 'Inactiva'}
                        </span>

                        <p className="text-xs text-white truncate"> Subida por: {uploaderUserName}</p>

                        {/* {fechaSubida && (
                          <p className="text-[11px] text-gray-200">
                            {fechaSubida}
                          </p>
                        )} */}
                      </div>

                      <button
                        type="button"
                        onClick={() => openEdit('imagenesCarrusel', i)}
                        className="ml-2 bg-emerald-400 hover:bg-emerald-800 hover:text-white text-gray-800 p-1.5 rounded-lg shadow-lg transition flex-shrink-0"
                      >
                        <Edit size={18} />
                      </button>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )
      }

      case 'categorias': {
        const list = filterList(categorias, ['nombre'])
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-100 uppercase bg-[#3f763081] backdrop-blur-md">
                <tr>
                  <th className="px-2 py-3">ID</th>
                  <th className="px-2 py-3">Nombre</th>
                  <th className="text-center px-2 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} className="bg-transparent border-b border-gray-300 dark:border-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600">
                    <td className="px-2 py-2 font-semibold whitespace-nowrap">#{c.id}</td>
                    <td className="px-2 py-2">{c.nombre}</td>
                    <td className="px-2 py-2">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <button onClick={() => openEdit('categorias', c)} className="text-white bg-[#0191ff60] hover:bg-[#0191ff] font-medium rounded-lg text-sm px-3 py-2">Editar</button>
                        <button onClick={() => handleDelete('categorias', c.id)} className="text-white bg-[#ff011f89] hover:bg-[#ff011f] font-medium rounded-lg text-sm px-3 py-2">Borrar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      case 'proveedores': {
        const list = filterList(proveedores, ['nombre', 'telefono', 'correo'])
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-100 uppercase bg-[#3f763081] backdrop-blur-md">
                <tr>
                  <th className="px-2 py-3">ID</th>
                  <th className="px-2 py-3">Nombre</th>
                  <th className="px-2 py-3">Teléfono</th>
                  <th className="text-center px-2 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="bg-transparent border-b border-gray-300 dark:border-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600">
                    <td className="px-2 py-2 font-semibold whitespace-nowrap">#{p.id}</td>
                    <td className="px-2 py-2">{p.nombre}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{p.telefono}</td>
                    <td className="px-2 py-2">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <button onClick={() => openEdit('proveedores', p)} className="text-white bg-[#0191ff60] hover:bg-[#0191ff] font-medium rounded-lg text-sm px-3 py-2">Editar</button>
                        <button onClick={() => handleDelete('proveedores', p.id)} className="text-white bg-[#ff011f89] hover:bg-[#ff011f] font-medium rounded-lg text-sm px-3 py-2">Borrar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      case 'contenidoEstatico': {
        const list = filterList(contenidoEstatico, ['titulo', 'contenido'])
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-100 uppercase bg-[#3f763081] backdrop-blur-md">
                <tr>
                  <th className="px-2 py-3">ID</th>
                  <th className="px-2 py-3">Título</th>
                  <th className="px-2 py-3 hidden md:table-cell">Modificado por</th>
                  <th className="px-2 py-3 hidden lg:table-cell">Fecha</th>
                  <th className="px-2 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} className="bg-transparent border-b border-gray-300 dark:border-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600">
                    <td className="px-2 py-2 font-semibold whitespace-nowrap">#{c.id}</td>
                    <td className="px-2 py-2">{c.titulo}</td>
                    <td className="px-2 py-2 hidden md:table-cell">{c.modificado_Por || c.modificado_por || '-'}</td>
                    <td className="px-2 py-2 hidden lg:table-cell whitespace-nowrap">{new Date(c.actualizado_el || c.updated_at || Date.now()).toLocaleDateString('es-ES')}</td>
                    <td className="px-2 py-2">
                      <div className="flex gap-2 justify-center flex-wrap">
                        <button onClick={() => openEdit('contenidoEstatico', c)} className="text-white bg-[#0191ff60] hover:bg-[#0191ff] font-medium rounded-lg text-sm px-3 py-2">Editar</button>
                        <button onClick={() => handleDelete('contenidoEstatico', c.id)} className="text-white bg-[#ff011f89] hover:bg-[#ff011f] font-medium rounded-lg text-sm px-3 py-2">Borrar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      case 'comentarios': {
        const list = filterList(comentarios, ['comentario'])
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-100 uppercase bg-[#3f763081] backdrop-blur-md">
                <tr>
                  <th className="px-2 py-3">ID</th>
                  <th className="px-2 py-3 hidden sm:table-cell">Usuario</th>
                  <th className="px-2 py-3">Comentario</th>
                  <th className="px-2 py-3 hidden md:table-cell">Fecha</th>
                  <th className="px-2 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {list.map((cm) => (
                  <tr key={cm.id} className="bg-transparent border-b border-gray-300 dark:border-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600">
                    <td className="px-2 py-2 font-semibold whitespace-nowrap">#{cm.id}</td>
                    <td className="px-2 py-2 hidden sm:table-cell">{cm.user || cm.user_id || '-'}</td>
                    <td className="px-2 py-2 max-w-xs truncate">{cm.comentario}</td>
                    <td className="px-2 py-2 hidden md:table-cell whitespace-nowrap text-xs">{new Date(cm.publicado_el || cm.created_at || Date.now()).toLocaleDateString('es-ES')}</td>
                    <td className="px-2 py-2">
                      <div className="flex gap-2 justify-center flex-wrap">
                        <button onClick={() => openEdit('comentarios', cm)} className="text-white bg-[#0191ff60] hover:bg-[#0191ff] font-medium rounded-lg text-sm px-3 py-2">Editar</button>
                        <button onClick={() => handleDelete('comentarios', cm.id)} className="text-white bg-[#ff011f89] hover:bg-[#ff011f] font-medium rounded-lg text-sm px-3 py-2">Borrar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      default:
        return <div>No hay datos</div>
    }
  }

  return (
    <div className="w-full px-2 sm:px-4 lg:w-[95%] mx-auto py-4 sm:py-6">
      <Alert/>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-3">
        <h2 className="text-black dark:text-white text-xl sm:text-2xl font-bold text-center sm:text-left w-full sm:w-auto">
          Ajustes generales
        </h2>

        <div className="relative w-full sm:w-auto sm:flex-1 lg:max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18}/>
          </div>
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            type="text" 
            className="w-full pl-10 pr-3 py-2 text-sm text-white placeholder-gray-100 border border-gray-300 rounded-lg bg-gray-400 focus:ring-[#38664e] focus:border-[#38664e] dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" 
            placeholder="Buscar..."
          />
        </div>
      </div>

      <div className="p-2 sm:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">

          {/* Imagenes Carrusel Card */}
          <div className="lg:col-span-5 backdrop-blur-xl rounded-lg px-3 sm:px-4 pb-3 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3">
              <h3 className="text-black dark:text-white text-base sm:text-lg font-bold">
                Imágenes del Carrusel ({imagenesCarrusel.length})
              </h3>
              
              <button 
                onClick={() => openCreate('imagenesCarrusel')} 
                className="w-[88%] mx-auto sm:mx-0 sm:w-auto inline-flex gap-1 items-center justify-center text-white bg-gray-400 hover:bg-[#38664e] border border-gray-300 font-medium rounded-lg text-sm px-3 py-2 dark:bg-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Agregar</span>
              </button>
            </div>
            <div className="overflow-auto px-8">{renderTableCard('imagenesCarrusel')}</div>
          </div>

          {/* Comentarios Card */}
          <div className="lg:col-span-2 backdrop-blur-xl rounded-lg px-3 sm:px-4 pb-3 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3">
              <h3 className="text-black dark:text-white text-base sm:text-lg font-bold">
                Comentarios ({comentarios.length})
              </h3>
              <button 
                onClick={() => openCreate('comentarios')} 
                className="w-full sm:w-auto inline-flex gap-1 items-center justify-center text-white bg-gray-400 hover:bg-[#38664e] border border-gray-300 font-medium rounded-lg text-sm px-3 py-2 dark:bg-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Agregar</span>
              </button>
            </div>
            <div className="max-h-80 overflow-auto">{renderTableCard('comentarios')}</div>
          </div>

          {/* Ilustrativo - oculto en móvil */}
          <div className="hidden lg:flex justify-center items-center px-4 pb-2">
            <ColumnsSettings className='max-h-80' size={200}/>
          </div>

          {/* Contenido Estatico Card */}
          <div className="lg:col-span-2 backdrop-blur-xl rounded-lg px-3 sm:px-4 pb-3 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3">
              <h3 className="text-black dark:text-white text-base sm:text-lg font-bold">
                Contenido Estático ({contenidoEstatico.length})
              </h3>
              <button 
                onClick={() => openCreate('contenidoEstatico')} 
                className="w-full sm:w-auto inline-flex gap-1 items-center justify-center text-white bg-gray-400 hover:bg-[#38664e] border border-gray-300 font-medium rounded-lg text-sm px-3 py-2 dark:bg-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Agregar</span>
              </button>
            </div>
            <div className="max-h-80 overflow-auto">{renderTableCard('contenidoEstatico')}</div>
          </div>

          {/* Proveedores Card */}
          <div className="lg:col-span-3 backdrop-blur-xl rounded-lg px-3 sm:px-4 pb-3 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3">
              <h3 className="text-black dark:text-white text-base sm:text-lg font-bold">
                Proveedores ({proveedores.length})
              </h3>
              <button 
                onClick={() => openCreate('proveedores')} 
                className="w-full sm:w-auto inline-flex gap-1 items-center justify-center text-white bg-gray-400 hover:bg-[#38664e] border border-gray-300 font-medium rounded-lg text-sm px-3 py-2 dark:bg-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Agregar</span>
              </button>
            </div>
            <div className="max-h-90 overflow-auto">{renderTableCard('proveedores')}</div>
          </div>

          {/* Categorias Card */}
          <div className="lg:col-span-2 backdrop-blur-xl rounded-lg px-3 sm:px-4 pb-3 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3">
              <h3 className="text-black dark:text-white text-base sm:text-lg font-bold">
                Categorías ({categorias.length})
              </h3>
              <button
                onClick={() => openCreate('categorias')}
                className="w-full sm:w-auto inline-flex gap-1 items-center justify-center text-white bg-gray-400 hover:bg-[#38664e] border border-gray-300 font-medium rounded-lg text-sm px-3 py-2 dark:bg-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Agregar</span>
              </button>
            </div>
            <div className="max-h-90 overflow-auto">{renderTableCard('categorias')}</div>
          </div>

        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[900] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-gray-500/40 backdrop-blur-md rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              {isUploading && (
                <div className="absolute inset-0 z-[950] flex items-center justify-center bg-black/40">
                  <Loader />
                </div>
              )}
              {/* HEADER */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gray-500/60 backdrop-blur-md">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-white">

                    {modalModel === "imagenesCarrusel" ? (
                      <> {modalMode === "create" ? "Subir" : "Editar"} Imagenes de Carrusel </>
                    ) : (
                      <>
                      {modalMode === "create" ? "Crear" : "Editar"} {modalModel}
                      </>
                    )}

                    
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-200">
                    Rellena los campos y guarda
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
                >
                  <X />
                </button>
              </div>

              {/* BODY */}
              <div className="p-4 space-y-4">

                {/* IMÁGENES CARRUSEL */}
                {modalModel === "imagenesCarrusel" && (
                  <div className="rounded-lg px-4 py-2  space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-sm text-emerald-200 mb-1">Estado</label>
                        <select
                          value={ImageStatus}
                          onChange={(e) => setImageStatus(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                        >
                          <option className="bg-emerald-600" value="activa">Activa</option>
                          <option className="bg-emerald-600" value="inactiva">Inactiva</option>
                        </select>
                      </div>
                      {modalMode === "edit" && (
                        <div>
                          <label className="block text-sm text-emerald-200 mb-1">Subida por</label>
                          <div className="w-full px-3 py-2 mb-2 bg-white/10 rounded-xl text-white">
                            {uploaderName}
                          </div>
                        
                          <label className="block text-sm text-emerald-200 mb-1">Subida el</label>
                          <div className="w-full px-3 py-2 bg-white/10 rounded-xl text-white">
                            {form.fecha_subida ? new Date(form.fecha_subida).toLocaleDateString('es-CR', {
                              year: 'numeric',
                              month: 'long',
                              day: '2-digit'
                            }) : '-'}
                          </div>
                        </div>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm text-emerald-200 mb-1"> {modalMode === "create" ? "Subir" : "Cambiar"} imagen por </label>
                      <select
                        value={ImageVia}
                        onChange={(e) => setImageVia(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
                      >
                        <option className="bg-emerald-600" value="">Seleccionar</option>
                        <option className="bg-emerald-600" value="url">URL</option>
                        <option className="bg-emerald-600" value="local">Local</option>
                      </select>
                    </div>

                    {ImageVia === "url" && (
                      <div>
                        <label className="block text-sm text-emerald-200 mb-1">URL</label>
                        <input
                          value={form.url || ""}
                          onChange={(e) => handleFormChange("url", e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 rounded outline-none text-white"
                        />
                      </div>
                    )}

                    {ImageVia === "local" && (
                      <>
                        <label className="block text-sm text-emerald-200">
                          Subir imagen
                        </label>
                        <input type="file" onChange={(e) => handleFormChange("file", e.target.files[0])}
                          className="w-full px-3 py-1 bg-white/10 rounded"
                        />
                      </>
                    )}
                    {modalMode === "create" ? (
                      <button
                        onClick={() => {handleCreate()}}
                        className={`w-full mt-4 text-white font-medium rounded-lg text-sm px-3 py-2 bg-emerald-600 hover:bg-emerald-800`}>
                          Subir Imagen
                      </button>
                    ) : (
                      <button
                        onClick={() => {handleUpdate()}}
                        className={`w-full mt-4 text-white font-medium rounded-lg text-sm px-3 py-2 bg-emerald-600 hover:bg-emerald-800`}>
                          Guardar Cambios
                      </button>
                    )}
                  </div>
                )}

                {/* CATEGORÍAS */}
                {modalModel === "categorias" && (
                  <div className="backdrop-blur-xl rounded-lg p-4 sm:p-6 shadow-2xl">
                    <label className="block text-sm text-emerald-200 mb-1">Nombre</label>
                    <input
                      value={form.nombre || ""}
                      onChange={(e) => handleFormChange("nombre", e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 rounded outline-none text-white"
                    />
                  </div>
                )}

                {/* PROVEEDORES */}
                {modalModel === "proveedores" && (
                  <div className="backdrop-blur-xl rounded-lg p-4 sm:p-6 shadow-2xl space-y-3">
                    <div>
                      <label className="block text-sm text-emerald-200 mb-1">Nombre</label>
                      <input
                        value={form.nombre || ""}
                        onChange={(e) => handleFormChange("nombre", e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 rounded outline-none text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-emerald-200 mb-1">Teléfono</label>
                      <input
                        value={form.telefono || ""}
                        onChange={(e) => handleFormChange("telefono", e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 rounded outline-none text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-emerald-200 mb-1">Correo</label>
                      <input
                        value={form.correo || ""}
                        onChange={(e) => handleFormChange("correo", e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 rounded outline-none text-white"
                      />
                    </div>
                  </div>
                )}

                {/* CONTENIDO ESTÁTICO */}
                {modalModel === "contenidoEstatico" && (
                  <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl space-y-2">
                    <label className="block text-sm text-emerald-200">
                      Título
                    </label>
                    <input
                      value={form.titulo || ""}
                      onChange={(e) =>
                        handleFormChange("titulo", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/10 rounded outline-none"
                    />

                    <label className="block text-sm text-emerald-200">
                      Contenido
                    </label>
                    <textarea
                      value={form.contenido || ""}
                      onChange={(e) =>
                        handleFormChange("contenido", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/10 rounded outline-none"
                    />
                  </div>
                )}

                {/* COMENTARIOS */}
                {modalModel === "comentarios" && (
                  <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl space-y-2">
                    <label className="block text-sm text-emerald-200">
                      Usuario (id)
                    </label>
                    <input
                      value={form.user || form.user_id || ""}
                      onChange={(e) =>
                        handleFormChange("user", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/10 rounded outline-none"
                    />

                    <label className="block text-sm text-emerald-200">
                      Comentario
                    </label>
                    <textarea
                      value={form.comentario || ""}
                      onChange={(e) =>
                        handleFormChange("comentario", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white/10 rounded outline-none"
                    />
                  </div>
                )}

                {/* BOTÓN GENERICO PARA LOS MODALES (excepto imágenes que ya lo tiene) */}
                {modalModel !== 'imagenesCarrusel' && (
                  <div className="p-4">
                    <button
                      onClick={() => { modalMode === "create" ? handleCreate() : handleUpdate() }}
                      disabled={modalMode === 'edit' && !hasFormChanged()}
                      className={`w-full mt-2 text-white font-medium rounded-lg text-sm px-3 py-2 ${modalMode === 'edit' && !hasFormChanged() ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-800'}`}>
                      {modalMode === "create" ? "Crear222" : "Guardar Cambios222"}
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
        </div>
        
    </div>
  )
}

export default ModelsList
