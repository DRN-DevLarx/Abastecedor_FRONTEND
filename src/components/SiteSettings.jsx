import React, { useEffect, useState } from 'react'
import { Search, X, Edit, ColumnsSettings, Briefcase, BriefcaseBusiness, Eye, File, Mail, Phone, Tag } from 'lucide-react'
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
  const [informacionUsuarios, setInformacionUsuarios] = useState([])
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
  const [commentExpanded, setCommentExpanded] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [value, setValue] = useState('')
  const [OriginalCategory, setOriginalCategory] = useState("")

  
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

      const [c, prov, img, cont, com, users, infoUsers] = await Promise.all([
        GetData('categorias/'),
        GetData('proveedores/'),
        GetData('imagenesCarrusel/'),
        GetData('contenidoEstatico/'),
        GetData('comentarios/'),
        GetData("users/"),
        GetData('informacionUsuarios/')
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
      if (infoUsers) setInformacionUsuarios(infoUsers)

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

  const filterListWithUsers = (list, fields = [], userField) => {
    const q = query?.trim().toLowerCase()
    if (!q) return list

    return list.filter(item => {
      // 1️⃣ Buscar en campos normales
      const fieldMatch = fields.some(f =>
        String(item[f] || '').toLowerCase().includes(q)
      )

      // 2️⃣ Buscar en usuario relacionado
      const userMatch = userField
        ? resolveUserSearchText(item[userField]).includes(q)
        : false

      return fieldMatch || userMatch
    })
  }



  const resolveUserSearchText = (userId) => {
    const u = Users.find(u => String(u.id) === String(userId))
    if (!u) return ''
    return `${u.username || ''} ${u.first_name || ''} ${u.last_name || ''}`.toLowerCase()
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

  const openView = (model, item) => {
    setModalMode('view')
    setModalModel(model)
    setForm(item)
    setOriginalForm(null)
    setModalOpen(true)
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
      if (mode === 'edit' && !hasFormChanged()) {
        showAlert('info', 'Info', 'No hay cambios para guardar.')
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
    setCommentExpanded(false)
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
      const payload2 = { ...form }

      // Para comentarios, enviar username en vez de id
      if (modalModel === 'comentarios') {
        const userInput = form.user || form.user_id || ''
        const userObj = Users.find(u => String(u.id) === String(userInput) || u.username === userInput)
        payload2.user = userObj ? userObj.username : String(userInput)
      }

      // Para contenidoEstatico, enviar el ID del usuario actual
      if (modalModel === 'contenidoEstatico') {
        payload2.modificado_por = CurrentUser?.id
        payload2.actualizado_el = new Date().toISOString()
      }

      setIsUploading(true)
      
      try {
        const res = await PostData(`${modalModel}/`, payload2)
        const created = res && (res.id ? res : (res.data ? res.data : null))
        const createdOk = created || (res && res.status >= 200 && res.status < 300)

        if (createdOk) {
          const newItem = created || { id: Date.now(), ...payload2 }
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
    
    if (modalModel === "categorias") {
      
      if (value.trim() === "") {
        showAlert('info', 'Nombre vacío', 'Ingresa el nombre de la categoría.')
        return
      }

      if (value === OriginalCategory) {
        setEditingId(null)
        return
      }

      const CategoryUpdate = await PutData("categorias/", editingId, { nombre: value })

      if (!CategoryUpdate) {
        showAlert("error", "Error", "No se pudo actualizar la categoría.")
        return
      }

      setCategorias(prev =>
        prev.map(cat =>
          cat.id === editingId ? CategoryUpdate : cat
        )
      )

      setEditingId(null)
      showAlert("success", "Éxito", "Categoría actualizada correctamente.")
      return
    }

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

      const payload = { estado: ImageStatus, subida_por: CurrentUsers?.id }

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
      await PatchData(`${modalModel}/`, form.id, form)
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
    const u = users.find(u => String(u.id) === String(userId) || u.username === String(userId))
    return u ? (u.first_name || u.username) : (String(userId) || 'Desconocido')
  }

  const getUserByIdentifier = (users, idOrUsername) => {
    if (!users || !users.length) return null
    const u = users.find(u => String(u.id) === String(idOrUsername) || u.username === String(idOrUsername)) || null
    if (!u) return null
    const info = informacionUsuarios && informacionUsuarios.find(i => String(i.user) === String(u.id))
    return info ? ({ ...u, referenciaIMG: info.referenciaIMG || info.referenciaImg || null }) : u
  }

  const ValueSet = (id, nombre) => {
    setEditingId(id)
    setValue(nombre)
    setOriginalCategory(nombre)
    
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
        // const list = filterList(imagenesCarrusel, ['url']).slice().sort((a, b) => (b.id || 0) - (a.id || 0))
        const list = imagenesCarrusel.slice().sort((a, b) => (b.id || 0) - (a.id || 0))

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
      
      case 'comentarios': {
        const list = filterListWithUsers(comentarios,
          ['comentario'], // solo campos de texto reales
          'user',         // FK al usuario
          Users,          // lista de usuarios
          query
        )
          .slice()
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          
        return (
          <div className="max-h-[60vh] overflow-auto scrollbar-thin scrollbar-thumb-emerald-400">
            {list.length === 0 ? (
              <div className="text-center text-sm text-gray-400 py-6">No hay comentarios</div>
            ) : (
              <ul className="space-y-2">
                {list.map(({ id, user, comentario, publicado_el }) => {
                  const userObj = getUserByIdentifier(Users, user)
                  const displayName = userObj?.first_name || userObj?.username || String(user) || 'Desconocido'
                  const displayLastName = userObj?.last_name || userObj?.username || String(user) || 'Desconocido'
                  const avatarSrc = userObj?.referenciaIMG || userObj?.avatar || userObj?.profile_image || null
                  const avatarLetter = (userObj?.username || userObj?.first_name || String(user) || 'U')[0]?.toUpperCase()

                  return (
                    <li key={id} className="p-3 rounded-lg bg-gray-500/20 hover:bg-white/10 flex gap-3">

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-white font-semibold overflow-hidden">
                        {avatarSrc ? (
                          <img src={userObj?.referenciaIMG} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">{avatarLetter}</span>
                        )}
                      </div>

                      {/* Texto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm">
                          <span className="text-black dark:text-white font-medium">{displayName} {displayLastName}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(publicado_el).toLocaleDateString()}</span>
                        </div>

                        <p className="text-gray-500 dark:text-gray-400 truncate">{comentario}</p>

                        {/* Acciones */}
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => openView('comentarios', { id, user, comentario, publicado_el })}
                            className="text-xs px-2 py-1 rounded bg-emerald-400/50 hover:bg-emerald-500 text-black"
                          >
                            Ver comentario
                          </button>
                          <button
                            onClick={() => handleDelete('comentarios', id)}
                            className="text-xs px-2 py-1 rounded bg-red-500/60 hover:bg-red-500 text-black"
                          >
                            Borrar
                          </button>
                        </div>
                      </div>

                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      }

      case 'contenidoEstatico': {
        const list = filterList(contenidoEstatico, ['titulo', 'contenido']).slice().sort((a, b) => (b.id || 0) - (a.id || 0))

        return (
          <div className="max-h-[60vh]  scrollbar-thin scrollbar-thumb-emerald-400">
            {list.length === 0 ? (
              <div className="text-center text-sm text-gray-400 py-6">No hay contenido estático</div>
            ) : (
              <ul className="space-y-2">
                {list.map(({ id, titulo, contenido, modificado_por, actualizado_el }) => {
                  const userObj = getUserByIdentifier(Users, modificado_por)
                  const displayName = userObj?.first_name || userObj?.username || String(modificado_por) || 'Desconocido'
                  const avatarSrc = userObj?.referenciaIMG || userObj?.avatar || userObj?.profile_image || null
                  const avatarLetter = (userObj?.username || userObj?.first_name || String(modificado_por) || 'U')[0]?.toUpperCase()

                  return (
                    <li key={id} className="p-3 rounded-lg bg-gray-500/20 hover:bg-white/10 flex gap-3">

                      {/* Icono para contenido estático */}
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-white font-semibold">
                        {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg> */}
                        <File/>
                      </div>

                      {/* Texto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm">
                          <span className="text-black dark:text-white font-medium">{titulo}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(actualizado_el || Date.now()).toLocaleDateString()}</span>
                        </div>

                        <p className="text-gray-500 dark:text-gray-400 truncate">{contenido}</p>

                        {/* Acciones */}
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => openEdit('contenidoEstatico', { id, titulo, contenido, modificado_por, actualizado_el })}
                            className="text-xs px-2 py-1 rounded bg-emerald-400/50 hover:bg-emerald-500 text-black"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete('contenidoEstatico', id)}
                            className="text-xs px-2 py-1 rounded bg-red-500/60 hover:bg-red-500 text-black"
                          >
                            Borrar
                          </button>
                        </div>
                      </div>

                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      }

      case 'proveedores': {
        const list = filterList(proveedores, ['nombre', 'telefono', 'correo']).slice().sort((a, b) => (b.id || 0) - (a.id || 0))

        return (
          <div className="max-h-[60vh]  scrollbar-thin scrollbar-thumb-emerald-400">
            {list.length === 0 ? (
              <div className="text-center text-sm text-gray-400 py-6">No hay proveedores</div>
            ) : (
              <ul className="space-y-2">
                {list.map(({ id, nombre, telefono, telefono2, correo, direccion }) => {
                  return (
                    <li key={id} className="p-3 rounded-lg bg-gray-500/20 hover:bg-white/10 flex gap-3">

                      {/* Icono para proveedores */}
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-white font-semibold">
                        <BriefcaseBusiness/>
                      </div>

                      {/* Texto */}
                      <div className="flex-1 min-w-0">

                        <div className="flex justify-between text-sm">
                          <span className="text-black dark:text-white font-medium">{nombre}</span>
                            {telefono || telefono2 ? (
                              
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Tel: {telefono || telefono2}
                              </span>
                              
                            ) : (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Tel: No registrado
                              </span>

                            )}
                        </div>


                        <p className="text-gray-500 dark:text-gray-400 truncate"> {direccion || "Dirección no registrada"} </p>

                        {/* Acciones */}
                        <div className="flex gap-2 mt-1">
                          {(telefono || telefono2) && nombre && correo && direccion && (
                            <button
                              onClick={() => openView('proveedores', { id, nombre, telefono, telefono2, correo, direccion })}
                              className="text-xs px-2 py-1 rounded bg-emerald-400/50 hover:bg-emerald-500 text-black"
                            >
                              Ver proveedor
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete('proveedores', id)}
                            className="text-xs px-2 py-1 rounded bg-red-500/60 hover:bg-red-500 text-black"
                          >
                            Borrar
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      }

      case 'categorias': {
        const list = filterList(categorias, ['nombre']).slice().sort((a, b) => (b.id || 0) - (a.id || 0))

        return (
          <div className="max-h-[60vh] scrollbar-thin scrollbar-thumb-emerald-400">
            {list.length === 0 ? (
              <div className="text-center text-sm text-gray-400 py-6">No hay categorías</div>
            ) : (
              <ul className="space-y-2">
                {list.map(({ id, nombre }) => {
                  const isEditing = editingId === id

                  return (
                    <li
                      key={id}
                      className="p-3 rounded-lg bg-gray-500/20 hover:bg-white/10 flex items-center gap-3"
                    >
                      {/* Icono */}
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-white">
                        <Tag  size={18}/>
                      </div>

                      <div className="flex flex-col gap-1">
                        {/* Nombre / Input */}
                        {isEditing ? (
                          <input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full px-2 py-1 rounded bg-white/10 text-black dark:text-white focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className=" text-black dark:text-white font-medium px-2 py-1">
                            {nombre}
                          </span>
                        )}

                        {/* Acciones */}
                        <div className="flex gap-2">
                          {isEditing ? (
                            <button
                              onClick={() => (setModalModel("categorias"), handleUpdate())}
                              className="text-xs px-2 py-1 rounded bg-blue-400 hover:bg-blue-500 text-black"
                            >
                              Guardar
                            </button>
                          ) : (
                            <button
                              onClick={() => ValueSet(id, nombre)}
                              className="text-xs px-2 py-1 rounded bg-emerald-400 hover:bg-emerald-500 text-black"
                            >
                              Editar
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete('categorias', id)}
                            className="text-xs px-2 py-1 rounded bg-red-500/60 hover:bg-red-500 text-black"
                          >
                            Borrar
                          </button>
                        </div>

                      </div>

                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      }

      default:
        return <div>No hay datos</div>
    }
  }

  return (
    <div className="w-full px-2 sm:px-4 lg:w-[95%] mx-auto bg-[#adb6aac2] dark:bg-[#171731] dark:text-[#CEC19F]">
      <Alert/>

      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 pb-3 px-4">
        
        {/* TÍTULO — siempre arriba en móvil */}
        <h2 className="order-1 sm:order-none w-full sm:w-auto  text-xl sm:text-2xl font-bold  text-black dark:text-white  sm:text-left">
          Ajustes generales
        </h2>

        {/* INPUT — full width en móvil */}
        <div className="order-2 sm:order-none relative w-full md:max-w-md sm:flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-200"
          />
          <input value={query} onChange={(e) => setQuery(e.target.value)} type="text" placeholder="Busqueda general"
            className="w-full pl-10 pr-3 py-2 text-sm text-white placeholder-gray-100 bg-emerald-400/20 border border-emerald-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:placeholder-gray-400"
          />
        </div>

      </div>

      <div className="p-2 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-6">

          {!query?.trim() && (
            <>
              {/* Imagenes Carrusel Card */}
              <div className="md:col-span-6 backdrop-blur-xl rounded-lg px-3 sm:px-4 pb-3 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3">
                  <h3 className="text-black dark:text-white text-base sm:text-lg font-bold">
                    Imágenes del Carrusel ({imagenesCarrusel.length})
                  </h3>
                  
                  <button 
                    onClick={() => openCreate('imagenesCarrusel')} 
                    className="w-[94%] mx-auto sm:mx-0 sm:w-auto inline-flex gap-1 items-center justify-center text-white bg-gray-400 hover:bg-[#38664e] border border-gray-300 font-medium rounded-lg text-sm px-3 py-2 dark:bg-gray-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Agregar</span>
                  </button>
                </div>
                <div className="overflow-auto px-4 sm:px-1">{renderTableCard('imagenesCarrusel')}</div>
              </div>
            </>
          )}

          {/* Comentarios Card */}
          <div className="md:col-span-3 rounded-lg px-3 sm:px-4 pb-3 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3">
              <h3 className="text-black dark:text-white text-base sm:text-lg font-bold">
                Comentarios ({comentarios.length})
              </h3>
            </div>
            <div className="max-h-80 overflow-auto">{renderTableCard('comentarios')}</div>
          </div>

          {/* Contenido Estatico Card */}
          <div className="md:col-span-3 backdrop-blur-xl rounded-lg px-3 sm:px-4 pb-3 shadow-sm">
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
          <div className="md:col-span-4 backdrop-blur-xl rounded-lg px-3 sm:px-4 pb-3 shadow-sm">
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
          <div className="md:col-span-2 backdrop-blur-xl rounded-lg px-3 sm:px-4 pb-3 shadow-sm">
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
                <div className="absolute top-0 z-[950] flex items-center justify-center bg-black/40">
                  <Loader />
                </div>
              )}
              {/* HEADER (oculto para modal de comentario en vista) */}
              {!(modalModel === 'comentarios' && modalMode === 'view') && (
                <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gray-500/60 backdrop-blur-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h1 className="text-base sm:text-lg font-bold text-white">
                        {modalModel === "imagenesCarrusel" ? (
                          <> {modalMode === "create" ? "Subir" : "Editar"} Imagenes de Carrusel </>
                        ) : modalModel === "proveedores" && modalMode === "view" ? (
                          <>Ver proveedor</>
                        ) : (
                          <>
                          {modalMode === "create" ? "Crear" : "Editar"} {modalModel}
                          </>
                        )}
                      </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-200">
                      {modalMode === 'view' ? 'Visualiza la información del proveedor' : 'Rellena los campos y guarda'}
                    </p>
                  </div>

                  {modalModel === 'proveedores' && modalMode !== 'create' && (
                    <button
                      onClick={() => {
                        if (modalMode === 'view') {
                          setModalMode('edit')
                          setOriginalForm(JSON.parse(JSON.stringify(form)))
                        } else {
                          setModalMode('view')
                          setOriginalForm(null)
                        }
                      }}
                      className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
                      title={modalMode === 'view' ? 'Editar' : 'Ver'}
                    >
                      {modalMode === 'view' ? <Edit size={20} /> : <Eye size={20} />}
                    </button>
                  )}

                  <button
                    onClick={closeModal}
                    className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
                  >
                    <X />
                  </button>

                </div>
              )}

              {/* BODY */}
              <div className="p-4 space-y-4">

                {/* IMÁGENES CARRUSEL */}
                {modalModel === "imagenesCarrusel" && (
                  <div className="rounded-lg px-4 py-2 space-y-3">
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

                {/* COMENTARIOS */}
                {modalModel === "comentarios" && modalMode === 'view' && (
                  <>
                  <div className="relative max-w-2xl px-8 py-4 bg-gray-400 rounded-lg shadow-md dark:bg-gray-800">
                      <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 p-1 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-400/50 transition"
                      >
                        <X size={20} />
                      </button>
                      <div className="flex items-center justify-between">
                          <span className="text-sm font-light text-gray-600 dark:text-gray-400">{new Date(form.publicado_el).toLocaleDateString('es-ES')}</span>
                      </div>

                      <div className="mt-2">
                         
                          <p className={`mt-2 text-gray-600 dark:text-gray-300 ${!commentExpanded ? 'line-clamp-3' : ''}`}>
                            {form.comentario}
                          </p>
                          {form.comentario && form.comentario.length > 100 && (
                            <button
                              onClick={() => setCommentExpanded(!commentExpanded)}
                              className="mt-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                            >
                              {commentExpanded ? 'Ver menos' : 'Ver más...'}
                            </button>
                          )}
                      </div>

                      <div className="flex items-center justify-end mt-4">
                          <div className="flex items-center">
                              {(() => {
                                const userObj = getUserByIdentifier(Users, form.user);
                                const avatarSrc = userObj?.referenciaIMG || userObj?.avatar || userObj?.profile_image || null;
                                const displayName = userObj?.first_name || userObj?.username || String(form.user) || 'Usuario';
                                const displayLastName = userObj?.last_name || String(form.user) || 'Usuario';
                                return (
                                  <>
                                    {avatarSrc && (
                                      <img className="object-cover w-10 h-10 mx-4 rounded-full" src={avatarSrc} alt="avatar"/>
                                    )}
                                    <a className="font-bold text-gray-700 cursor-pointer dark:text-gray-200" tabindex="0" role="link">{displayName} {displayLastName}</a>
                                  </>
                                );
                              })()}
                          </div>
                      </div>
                  </div>


                  </>
                )}
                
                {/* CONTENIDO ESTÁTICO */}
                {modalModel === "contenidoEstatico" && (
                  <div className="rounded-[10px] px-4 py-2 space-y-4">
                    <div>
                      <label className="block text-sm text-emerald-200 mb-1">
                        Título
                      </label>
                      <input
                        value={form.titulo || ""}
                        onChange={(e) =>
                          handleFormChange("titulo", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white/10 rounded outline-none text-white"
                        placeholder="Ingresa el título"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-emerald-200 mb-1">
                        Contenido
                      </label>
                      <textarea
                        value={form.contenido || ""}
                        onChange={(e) =>
                          handleFormChange("contenido", e.target.value)
                        }
                        className="w-full px-3 py-2 min-h-40 max-h-60 bg-white/10 rounded outline-none focus:ring-2 focus:ring-emerald-400 text-white"
                        placeholder="Ingresa el contenido"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => { modalMode === "create" ? handleCreate() : handleUpdate() }}
                        className="w-full text-white font-medium rounded-lg text-sm px-3 py-2 bg-emerald-600 hover:bg-emerald-800">
                        {modalMode === "create" ? "Crear Contenido" : "Guardar Cambios"}
                      </button>
                    </div>
                  </div>
                )}

                {/* PROVEEDORES */}
                {modalModel === "proveedores" && (

                  <div>
                    <div>
                      {modalMode === 'view' ? (
                        <>
                          <div class='w-full px-4 py-3 bg-gray-400 dark:bg-gray-800 rounded-md shadow-md'>
                              <div>
                                  <h1 class="mt-2 text-lg font-semibold text-gray-800 dark:text-white">{form.nombre} </h1>
                                  <p class="mt-2 text-sm text-gray-600 dark:text-gray-300"> {form.direccion} </p>
                              </div>
                              <div>
                                <div class="mt-2 text-gray-700 dark:text-gray-200">
                                    <span>Contacto:</span>
                                    <div className="flex gap-1 items-center">
                                      <a href={`malito:${form.correo}`} class="flex items-center gap-1 mx-2 text-blue-600 cursor-pointer dark:text-blue-400 hover:underline"  tabindex="0" role="link"> <Mail size={18}/> {form.correo} </a>
                                      |
                                      <a href={form.telefono || form.telefono2} class="flex items-center gap-1 mx-2 text-blue-600 cursor-pointer dark:text-blue-400 hover:underline" tabindex="0" role="link"> <Phone size={18}/> {form.telefono || form.telefono2} </a>
                                    </div>

                                </div>
                              </div>
                          </div>

                        </>
                      ) : (
                        <>
                          <div class='w-full px-4 py-3 bg-transparent dark:bg-gray-800'>
                              <label className="block text-sm text-emerald-200 mb-1"> Nombre</label>
                              <input value={form.nombre || ""} onChange={(e) => handleFormChange("nombre", e.target.value)} className="w-full px-3 py-1 bg-white/10 rounded outline-none text-white" placeholder="Ingresa el nombre"/>  

                              <label className="block text-sm text-emerald-200 mb-1"> Teléfono</label>
                              <input value={form.telefono || ""} onChange={(e) => handleFormChange("telefono", e.target.value)} className="w-full px-3 py-1 bg-white/10 rounded outline-none text-white" placeholder="Ingresa el teléfono"/>
                            
                              <label className="block text-sm text-emerald-200 mb-1"> Correo </label>
                              <input value={form.correo || ""} onChange={(e) => handleFormChange("correo", e.target.value)} className="w-full px-3 py-1 bg-white/10 rounded outline-none text-white" placeholder="Ingresa el correo"/>
                          
                              <label className="block text-sm text-emerald-200 mb-1"> Dirección </label>
                              <textarea value={form.direccion || ""} onChange={(e) => handleFormChange("direccion", e.target.value)} className="w-full min-h-10 max-h-23 px-3 py-2 bg-white/10 rounded outline-none focus:ring-2 focus:ring-emerald-400 text-white" placeholder="Ingresa la dirección"/>

                            </div>
                        </>
                      )}
                    </div>

                    {modalMode !== 'view' && (
                      <div>
                        <button
                          onClick={() => { modalMode === "create" ? handleCreate() : handleUpdate() }}
                          className="w-full text-white font-medium rounded-lg text-sm px-3 py-2 bg-emerald-600 hover:bg-emerald-800">
                          {modalMode === "create" ? "Crear Proveedor" : "Guardar Cambios"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
          
                {/* CATEGORÍAS */}
                {modalModel === "categorias" && (
                  <>
                    <label className="block text-sm text-emerald-200 mb-1">Nombre</label>
                    <input
                      value={form.nombre || ""}
                      onChange={(e) => handleFormChange("nombre", e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 rounded outline-none text-white"
                    />
            
                    <div>
                      <button
                        onClick={() => { modalMode === "create" ? handleCreate() : handleUpdate() }}
                        className="w-full mt-4 text-white font-medium rounded-lg text-sm px-3 py-2 bg-emerald-600 hover:bg-emerald-800">
                        Crear categoria
                      </button>
                    </div>
                  </>
            
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
