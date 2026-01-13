import { LucidePlusSquare, Upload, Edit2, Save, X, Plus, Image as ImageIcon, User, Package, FileText, Trash2, DollarSign, Layers, EyeIcon, LucideXCircle, Search } from 'lucide-react';

import Loader from "./Loader"
import Alert, { showAlert } from "./Alert";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DeleteData, GetData, PatchData, PostData } from "../services/ApiServices";
import cloudDinaryServices from '../services/cloudDinaryServices';

function ProductsList() {
  
    const navigate = useNavigate()
    
    const [ShowLoader, setShowLoader] = useState(false);
    const [viewMode, setViewMode] = useState('view'); // 'view' or 'edit'
    const [showModal, setShowModal] = useState(true);
    
    const [ProductsList, setProductsList] = useState(false);
    const [ProductsData, setProductsData] = useState([]);
    const NumberProducts = ProductsData.length;

    const [CategoriesData, setCategoriesData] = useState([]);
    const [SuppliersData, setSuppliersData] = useState([]);

    const [SearchValue, setSearchValue] = useState("");

    const [images, setImages] = useState([]);
    const [NewImages, setNewImages] = useState([]);
    const [ShowGallery, setShowGallery] = useState(false);
    const [ShowGallery2, setShowGallery2] = useState(false);
    const [imagenPrincipal, setImagenPrincipal] = useState(null);
    const [AddProductActive, setAddProductActive] = useState(false);
    
    const [PlacehCode, setPlacehCode] = useState("");
    const [SeeProductDetail, setSeeProductDetail] = useState(false);
    
    const [originalData, setOriginalData] = useState(null);
    const [originalImages, setOriginalImages] = useState([]);
    const [originalPrincipal, setOriginalPrincipal] = useState(null);

    const [formData, setFormData] = useState({
      id: 0,
      codigo: '',
      nombre: '',
      precio: 0,
      stock: 0,
      calificacion: 0,
      descripcion: '',
      referenciaIMG: '',
      categoria: '',
      proveedor: ''
    });
    
    useEffect(() => {
    
        const fetchData = async () => {
            const GetProductsData = await GetData("productosAdmin/");
            const GetCategoriesData = await GetData("categorias/");
            const GetSuppliersData = await GetData("proveedores/");

            setSuppliersData(GetSuppliersData);
            
            
            const LatestProductCode = GetProductsData[GetProductsData.length - 1].codigo;
            
            
            // 1. Extraer la parte numérica
            const numero = parseInt(LatestProductCode.replace("PRD", ""), 10);

            // 2. Sumar 1
            const nuevoNumero = numero + 1;

            // 3. Volver a formatear con ceros (3 dígitos)
            const nuevoCodigo = "PRD" + nuevoNumero.toString().padStart(3, "0");
            setPlacehCode(nuevoCodigo);

            if ( GetProductsData && GetCategoriesData) {
                setProductsData(GetProductsData);                
                setCategoriesData(GetCategoriesData);
            }
        };
        fetchData();
    }, []);

    function FilterProducts(products, categories, searchValue) {
        if (!searchValue || searchValue.trim() === "") return products;

        const inputLowerCase = searchValue.toLowerCase();        

        return products.filter(product => {
            const category = categories.find(cat => cat.id == product.categoria);
            const categoryName = category ? category.nombre.toLowerCase() : "";            

            return (
                product.nombre.toLowerCase().includes(inputLowerCase) ||
                // (product.descripcion?.toLowerCase().includes(inputLowerCase)) ||
                (product.codigo?.toLowerCase().includes(inputLowerCase)) ||
                categoryName.includes(inputLowerCase) ||
                product.precio.toString().includes(inputLowerCase) ||
                product.stock.toString().includes(inputLowerCase)
            );
        });
    }

    // Uso
    let filteredProducts = FilterProducts(ProductsData, CategoriesData, SearchValue);
    

    const handleClose = () => {
      setAddProductActive(false)
      setSeeProductDetail(false)
    };
    
    const handleCloseEdit = () => {

    if (!originalData) return;      

      setFormData(originalData);
      setImages(originalImages);
      setImagenPrincipal(originalPrincipal);
      setViewMode('view');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // const handleCalificacionClick = (rating) => {
    // setFormData(prev => ({
    //     ...prev,
    //     calificacion: rating
    // }));
    // };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        
        // Calcular cuántas imágenes se pueden agregar (límite de 5)
        const espacioDisponible = 5 - images.length;
        const archivosPermitidos = files.slice(0, espacioDisponible);
        
        if (files.length > espacioDisponible) {
        // alert(`Solo puedes subir ${espacioDisponible} imagen(es) más. Límite: 5 imágenes.`);
        showAlert("info", "Límite de imágenes", `Solo puedes subir 5 imágenes por producto`);
        }
        
        const newImages = archivosPermitidos.map(file => ({
            id: Date.now() + Math.random(),
            url: URL.createObjectURL(file),
            file: file
        }));
        
        setImages(prev => [...prev, ...newImages]);
        setNewImages(prev => [...prev, ...newImages]);

        if (!imagenPrincipal && newImages.length > 0) {
            setImagenPrincipal(newImages[0].id);
            setFormData(prev => ({
                ...prev,
                referenciaIMG: newImages[0].url
            }));
        }        
    };

    const removeImage = (id) => {
        setImages(prev => prev.filter(img => img.id !== id));
        
        if (imagenPrincipal === id) {
        const remaining = images.filter(img => img.id !== id);
        setImagenPrincipal(remaining.length > 0 ? remaining[0].id : null);
        }
    };

    const setAsPrincipal = (id) => {
      setImagenPrincipal(id);
    };

    console.log("Original", originalPrincipal);
    console.log("Imagen pricipa", imagenPrincipal);
    

    const ProductDelete = async (id) => {

        const Delete = await Swal.fire({
            icon: "warning",
            iconColor: "red",
            title: "¿Estás seguro que deseas eliminar el producto?",
            text: "Esta acción es irreversible.",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonText: "Sí, eliminar",
            confirmButtonColor: "red",
            background: 'rgba(80, 80, 80, 0.75)', // gris translúcido
            color: "white",
        }).then((result) => {
            
            if (result.isConfirmed) {
                return true;
            }
        });
        
        if (Delete === true) {
            setShowLoader(true)
            const responseDelete = await DeleteData("productosAdmin/", id)
            
            setShowLoader(false)
            if (responseDelete.status === 204 || responseDelete.status === 201) {
                setProductsData(prev =>
                    prev.filter(product => product.id !== id)
                );
                
                showAlert("success", "ÉXITO", "Producto eliminado correctamente.");
            }
            
        }

    }

    const ValidateFields = () => {

        const regex = {
            codigo: /^[A-Z0-9\-]{3,15}$/,               // opcional
            nombre: /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]{3,100}$/, // obligatorio
            precio: /^\d{1,6}(\.\d{1,2})?$/,            // obligatorio
            stock: /^\d+$/,                             // obligatorio
            calificacion: /^[0-5]$/,                    // obligatorio
            descripcion: /^[\s\S]{0,500}$/              // opcional
        };
              
        // Campos obligatorios básicos
        if (images.length === 0) {
            showAlert("info", "Sin imágenes", "Por favor agregue al menos una imagen del producto.");
            return false;
        }

        if (!formData.nombre || !formData.precio) {
            showAlert("info", "Campos incompletos", "Por favor complete los campos obligatorios.");
            return false;
        }

        // Código (opcional)
        const codigo = String(formData.codigo ?? "");

        if (codigo.length > 0 && (codigo.length < 3 || codigo.length > 15)) {
            showAlert("info", "Código inválido", "El código del producto debe ser vacío o tener de 3 a 15 caracteres.");
            return false;
        }

        if (codigo.length === 0) {
            formData.codigo = PlacehCode;
        }

        // Nombre
        const nombre = formData.nombre.trim();

        if (nombre.length < 3) {
            showAlert("info", "Nombre inválido","El nombre del producto debe tener al menos 3 caracteres.");
            return false;
        }

        if (nombre.length > 100) {
            showAlert("info", "Nombre inválido", "El nombre del producto debe tener máximo 100 caracteres.");
            return false;
        }

        // Precio
        const precio = String(formData.precio);

        if (!regex.precio.test(precio)) {
            showAlert("info", "Precio inválido", "Ejemplo válido: 2000 o 900000.00");
            return false;
        }

        // Stock
        const stock = String(formData.stock);

        if (!regex.stock.test(stock)) {
            showAlert("info", "Stock inválido", "El stock debe ser mayor a 0.");
            return false;
        }

        // Categoría
        if (formData.categoria === "") {
            showAlert("info", "Categoría no seleccionada", "Por favor selecciona una categoría.");
            return false;
        }

        // Proveedor
        if (formData.proveedor === "") {
            showAlert("info", "Proveedor no seleccionado", "Por favor selecciona un proveedor.");
            return false;
        }

        return true;
    };

    const handleCreateProduct = async () => {
        /* ===============================
            VALIDACIONES
        ================================*/
        if (!ValidateFields()) return;

        try {
            /* ===============================
                VERIFICAR CÓDIGO ÚNICO
            ================================*/
            let codigoToUse = formData.codigo;
            if (codigoToUse && ProductsData.some(p => p.codigo === codigoToUse)) {
              const suggested = PlacehCode;
              const result = await Swal.fire({
                icon: 'warning',
                title: 'Código duplicado',
                html: `El código <b>${codigoToUse}</b> ya existe. ¿Deseas usar el código sugerido <b>${suggested}</b>?`,
                showCancelButton: true,
                confirmButtonText: 'Usar sugerido',
                cancelButtonText: 'Cancelar',
                background: 'rgba(80, 80, 80, 0.75)',
                color: 'white'
              });

              if (result.isConfirmed) {
                codigoToUse = suggested;
                setFormData(prev => ({ ...prev, codigo: suggested }));
              } else {
                showAlert('info', 'Operación cancelada', 'Por favor elige un código diferente antes de continuar.');
                return;
              }
            }

            /* ===============================
                SUBIR IMÁGENES (Cloudinary)
            ================================*/
            Swal.fire({
                title: "Subiendo imágenes",
                html: `<b>Subiendo imagen 1 / ${images.length}</b>`,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                background: 'rgba(80, 80, 80, 0.75)', // gris translúcido
                color: "white",
                didOpen: () => Swal.showLoading()
            });

            const imageUrls = [];

            for (let i = 0; i < images.length; i++) {
                Swal.update({
                    html: `<b>Subiendo imagen ${i + 1} / ${images.length}</b>`,
                });

                Swal.showLoading();

                const file = images[i].file;

                const url = await cloudDinaryServices.uploadImage(file);

                imageUrls.push(url);
            }

            /* ===============================
                CREAR PRODUCTO (FormData)
            ================================*/
            if(imageUrls.length === 0) return

            const payload = {
              ...formData,
              codigo: codigoToUse,
              referenciaIMG: imageUrls[0]
            };

            Swal.update({
                title: "Creando producto",
                html: "<b>Guardando información del producto...</b>"
            });

            Swal.showLoading();

            const productResponse = await PostData("productosAdmin/", payload);
            const productId = productResponse.data.id;

            setFormData(prev => ({
                ...prev,
                id: productId
            }));
            
            if (!productId) throw new Error("Producto no creado");

            /* ===============================
                GUARDAR IMÁGENES EN DB
            ================================*/
            Swal.update({
                title: "Finalizando",
                html: "<b>Guardando imágenes del producto...</b>"
            });

            Swal.showLoading();

            let AllImagesSaved = true;

            for (const img of imageUrls) {
                const responseProdImg = await PostData("imagesProductos/", {
                    producto: productId,
                    imagen: img
                });

                if(responseProdImg.status !== 200 && responseProdImg.status !== 201 && responseProdImg.status !== 204) {
                    AllImagesSaved = false;
                    break;
                }
            }

            if(AllImagesSaved) {
                Swal.close();
    
                showAlert("success", "¡Éxito!", "Producto agregado correctamente");
    
                setAddProductActive(false)
    
                //Limpiar formulario
                setImages([])
    
                setFormData({
                    id:0,
                    codigo: '',
                    nombre: '',
                    precio: 0,
                    stock: 0,
                    calificacion: 0,
                    descripcion: '',
                    referenciaIMG: '',
                    categoria: '',
                    proveedor: ''
                });
    
                // Actualizar la lista de productos
                setProductsData(prev => ([...prev, productResponse.data]));
            }


        } catch (error) {
            console.error(error);

            showAlert("error", "Error", "Ocurrió un error al agregar el producto");
        }
    };

    const handleEdit = () => {
      setViewMode('edit');
    };
    
    const handleCancel = () => {
      if (!originalData) return;

      setFormData(originalData);
      setImages(originalImages);
      setImagenPrincipal(originalPrincipal);
      setViewMode('view');
    };

    const getCategoryName = (catId) => {
      return CategoriesData.find(cat => cat.id === catId)?.nombre || 'Sin categoría';
    };

    const getSupplierName = (suppId) => {
      return SuppliersData.find(sup => sup.id === suppId)?.nombre || 'Sin proveedor';
    };

    const ProductDetails = async (product) => {

      setSeeProductDetail(true);
      setShowLoader(true);
    
      try {
        const responseImages = await GetData(`imagenesProducto/${product.id}/`);        

        if (!responseImages || responseImages.length === 0) {
          showAlert("info", "Sin imágenes", "Este producto no tiene imágenes");
          setImages([]);
        } else {
          const formattedImages = responseImages.map(img => ({
            id: img.id,
            url: img.imagen,
            fechaSubida: img.fechaSubida
          }));

          console.log("formattedImages", formattedImages);
          console.log("referenciaIMG", product.referenciaIMG);

          const IMG = formattedImages.find(item => item.url === product.referenciaIMG);
          console.log("IMG", IMG?.id);
          
          // imágenes
          setImages(formattedImages);
          setImagenPrincipal(IMG?.id);
          
          setOriginalImages(formattedImages);
          // setOriginalPrincipal(formattedImages[0]?.id || null);
          setOriginalPrincipal(IMG.id);
          console.log("Hola");

          setFormData({
            id: product.id,
            codigo: product.codigo,
            nombre: product.nombre,
            precio: product.precio,
            stock: product.stock,
            calificacion: product.calificacion,
            referenciaIMG: product.referenciaIMG,
            descripcion: product.descripcion,
            categoria: product.categoria,
            proveedor: product.proveedor
          });
  
          setOriginalData({
            id: product.id,
            codigo: product.codigo,
            nombre: product.nombre,
            precio: product.precio,
            stock: product.stock,
            calificacion: product.calificacion,
            referenciaIMG: product.referenciaIMG,
            descripcion: product.descripcion,
            categoria: product.categoria,
            proveedor: product.proveedor
          });
        }


      } catch (error) {
        console.error(error);
        showAlert("error", "ERROR", "No se pudo cargar el producto");
        setSeeProductDetail(false);
      } finally {
        setShowLoader(false);
      }
    };

    const handleSave = async () => {
      console.log(imagenPrincipal);
      
      // ─────────────────────────────
      // 2️⃣ VALIDAR CAMBIOS
      // ─────────────────────────────
      const hasFormChanges =
        JSON.stringify(formData) !== JSON.stringify(originalData);

      const imagesChanged =
        JSON.stringify(images) !== JSON.stringify(originalImages);

      const principalImageChanged =
        originalPrincipal !== imagenPrincipal;

      if (!hasFormChanges && !imagesChanged && !principalImageChanged) {
        showAlert("info", "Sin cambios", "No hay modificaciones para guardar.");
        return;
      }

      let imgURL = "";
      let codigoToPatch = formData.codigo;

      // Si el código fue modificado, verificar duplicados
      if (hasFormChanges && formData.codigo && originalData && formData.codigo !== originalData.codigo) {
        const exists = ProductsData.some(p => p.codigo === formData.codigo && p.id !== formData.id);
        if (exists) {
          const suggested = PlacehCode;
          const res = await Swal.fire({
            icon: 'warning',
            title: 'Código duplicado',
            html: `El código <b>${formData.codigo}</b> ya existe. ¿Deseas usar el código sugerido <b>${suggested}</b>?`,
            showCancelButton: true,
            confirmButtonText: 'Usar sugerido',
            cancelButtonText: 'Cancelar',
            background: 'rgba(80, 80, 80, 0.75)',
            color: 'white'
          });

          if (res.isConfirmed) {
            codigoToPatch = suggested;
            setFormData(prev => ({ ...prev, codigo: suggested }));
          } else {
            showAlert('info', 'Operación cancelada', 'Por favor elige un código diferente antes de continuar.');
            return;
          }
        }
      }

      if(principalImageChanged) {
        // setOriginalPrincipal(imagenPrincipal)
        console.log("images", images);
        console.log("imagenPrincipal", imagenPrincipal);
        
        const img = originalImages.find(item => item.id === imagenPrincipal || item.url === imagenPrincipal);
        
        console.log(img?.url);
          
        imgURL = img?.url
      }


      // ─────────────────────────────
      // 3️⃣ DETECTAR IMÁGENES ELIMINADAS
      // ─────────────────────────────
      const deletedImages = originalImages.filter(
        orig => !images.some(img => img.id === orig.id)
      );

      console.log("deletedImages", deletedImages);

      // ─────────────────────────────
      // 4️⃣ ELIMINAR SOLO LAS BORRADAS (DB)
      // ─────────────────────────────
      try {
        if (deletedImages.length > 0) {
          await Promise.all(
            deletedImages.map(img =>
              DeleteData("imagenesProducto/", img.id)
            )
          );

          /////////////////////////////////////////
          // Elimar images de cloudinary (Faltante)
          /////////////////////////////////////////

        }
      } catch (error) {
        showAlert("error", "ERROR", "No se pudieron eliminar las imágenes borradas.");
        return;
      }

      // ─────────────────────────────
      // 5️⃣ SUBIR SOLO IMÁGENES NUEVAS
      // ─────────────────────────────
      let uploadedUrls = [];

      try {
        if (NewImages.length > 0) {
          uploadedUrls = await Promise.all(
            NewImages.map(img =>
              cloudDinaryServices.uploadImage(img.file)
            )
          );
        }
      } catch (error) {
        showAlert("error", "ERROR", "Error al subir las imagenes."
        );
        return;
      }

      console.log("uploadedUrls", uploadedUrls);

      // Si la imagen principal cambia y corresponde a una imagen nueva,
      // asignar la URL subida correspondiente como referenciaIMG
      if (principalImageChanged && (!imgURL || imgURL === "")) {
        const newIndex = NewImages.findIndex(n => n.id === imagenPrincipal);

        if (newIndex !== -1 && uploadedUrls[newIndex]) {
          imgURL = uploadedUrls[newIndex];
          
          setFormData(prev => ({
            ...prev,
            referenciaIMG: imgURL
          }));
        } else {
          // En algunos casos la imagen principal puede estar en `images` (ya subida previamente)
          const maybeImg = images.find(item => item.id === imagenPrincipal || item.url === imagenPrincipal);
          if (maybeImg && maybeImg.url && !maybeImg.url.startsWith('blob:')) {
            imgURL = maybeImg.url;
            setFormData(prev => ({ ...prev, referenciaIMG: imgURL }));
          }
        }
      }

      // ─────────────────────────────
      // 6️⃣ POSTEAR SOLO LAS NUEVAS IMÁGENES
      // ─────────────────────────────
      let responsePostList = [];

      try {
        if (uploadedUrls.length > 0) {
          for (const url of uploadedUrls) {
            const responsePost = await PostData("imagenesProducto/", {
              producto: formData.id,
              imagen: url
            });
            responsePostList.push(responsePost);
          }
        }

      } catch (error) {
        showAlert("warning", "Advertencia", "El producto se guardó, pero hubo un problema al guardar las imágenes nuevas.");
      }

      console.log("responsePostList", responsePostList);

      // ─────────────────────────────
      // 7️⃣ ACTUALIZAR PRODUCTO (DATOS)
      // ─────────────────────────────
      let updatedProduct;

      try {
        if (hasFormChanges || principalImageChanged) {
          // Construir payload según qué cambió
          let payloadToPatch = null;

          if (hasFormChanges && imgURL && imgURL !== "") {
            payloadToPatch = { ...formData, referenciaIMG: imgURL, codigo: codigoToPatch };
          }
          else if (hasFormChanges) {
            payloadToPatch = { ...formData, codigo: codigoToPatch };
          }
          else if (principalImageChanged && imgURL && imgURL !== "") {
            payloadToPatch = { referenciaIMG: imgURL, codigo: codigoToPatch };
          }
          else if (principalImageChanged) {
            payloadToPatch = { referenciaIMG: formData.referenciaIMG || imgURL, codigo: codigoToPatch };
          }

          if (payloadToPatch) {
            updatedProduct = await PatchData(
              "productosAdmin/",
              formData.id,
              payloadToPatch
            );

            if (updatedProduct?.data) {
              // Sincronizar estados locales con lo que devolvió el servidor
              setFormData(prev => ({ ...prev, ...updatedProduct.data }));
              setOriginalData(updatedProduct.data);
            }
          }
        }

      } catch (error) {
        showAlert("error", "ERROR", "Error de comunicación con el servidor.");
        return;
      }

      if (!updatedProduct?.data) {
        showAlert("error", "ERROR", "No se pudieron guardar los datos del producto.");
        return;
      }

      console.log("Producto actualizado:", updatedProduct.data);

      // Recargar imágenes desde el servidor para evitar duplicados locales
      try {
        const serverImages = await GetData(`imagenesProducto/${updatedProduct.data.id}/`);
        if (serverImages && serverImages.length > 0) {
          const formatted = serverImages.map(img => ({
            id: img.id,
            url: img.imagen,
            fechaSubida: img.fechaSubida
          }));

          setImages(formatted);
          setOriginalImages(formatted);

          const main = formatted.find(f => f.url === updatedProduct.data.referenciaIMG) || formatted[0];
          setImagenPrincipal(main?.id || null);
          setOriginalPrincipal(main?.id || null);

          setFormData(prev => ({ ...prev, referenciaIMG: updatedProduct.data.referenciaIMG }));
        } else {
          setImages([]);
          setOriginalImages([]);
          setImagenPrincipal(null);
          setOriginalPrincipal(null);
        }
      } catch (err) {
        console.error('Error recargando imágenes del servidor:', err);
      }

      // ─────────────────────────────
      // 8️⃣ ACTUALIZAR LISTA LOCAL
      // ─────────────────────────────
      setProductsData(prev =>
        prev.map(product =>
          product.id === updatedProduct.data.id
            ? updatedProduct.data
            : product
        )
      );

      // ─────────────────────────────
      // 9️⃣ SINCRONIZAR ESTADOS
      // ─────────────────────────────

      setOriginalImages([...images]);
      setOriginalPrincipal(imagenPrincipal);
      setImagenPrincipal(imagenPrincipal);


      // ─────────────────────────────
      // 🔟 ÉXITO
      // ─────────────────────────────
      showAlert("success", "Éxito", "Cambios guardados correctamente.");

      setViewMode("view");
    };

    if (!showModal) return null;

    return (
        <div className="w-[100%] pb-10  min-h-[100vh] bg-[#adb6aac2] dark:bg-[#171731] dark:text-[#CEC19F]">
            {ShowLoader && (
                <Loader/>
            )}
            <Alert />
            
            <div className="relative w-[95%] md:w-[90%] mx-auto sm:rounded-l">
                <div className="flex items-center justify-between lg:justify-around sm:flex-row flex-wrap space-y-4 sm:space-y-0 py-3 gap-1 bg-transparent">

                    <h2 className="text-black dark:text-white text-2xl font-bold mt-2 mb-2 md:pl-2 text-cente"> Productos ({NumberProducts}) </h2>
    
                    <div className="flex gap-3 relative w-full lg:w-[80%] pr-0 md:pr-2">
                        <div className="w-[100%] md:w-[90%] mx-auto">
                            <div className="absolute inset-y-0 rtl:inset-r-0 start-[0%] flex items-center ps-3 pointer-events-none">
                                <Search size={18}/>
                            </div>
                            <input value={SearchValue} onChange={(e) => setSearchValue(e.target.value)} type="text" id="table-search-users" className="w-full block pt-2 ps-10 text-sm text-white placeholder-gray-100 border border-gray-300 rounded-lg bg-gray-400 focus:ring-[#38664e] focus:border-[#38664e] dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-[#38664e] dark:focus:border-[#38664e]" placeholder="Buscar producto"/>
                        </div>
    
                        <button onClick={() => setAddProductActive(true)} className="md:w-[30%] lg:w-[50%] xl:w-[30%] inline-flex gap-1 items-center justify-center text-white bg-gray-400 hover:bg-[#38664e] hover:scale-105 border border-gray-300 focus:outline-none font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400" type="button">
                            <LucidePlusSquare/>
                            <p className="hidden md:inline">Agregar producto</p>
                        </button>
                    </div>
                </div>
    
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-100 uppercase bg-[#3f763081] backdrop-blur-md ">
                        <tr>
                            <th className="px-2 py-3">Código</th>
                            <th className="px-2 py-3">Nombre</th>
                            <th className="px-2 py-3">Precio</th>
                            <th className="px-2 py-3">Stock</th>
                            <th className="px-2 py-3 text-center">Acciones</th>
                            {/* <th className="px-3 py-3">Categoría</th> */}
                        </tr>
                    </thead>
    
                    <tbody>
                        {filteredProducts.map((product, index) => {
                            const category = CategoriesData.find(cat => cat.id === product.categoria);
    
                            return (
                                <tr 
                                    key={index} 
                                    className="bg-transparent dark:border-gray-700 border-gray-300 border-b-1 hover:bg-gray-400 dark:hover:bg-gray-600 hover:scale-101"
                                >
                                    <td className="px-2 py-2">{product.codigo || "-"}</td>
                                    <td className="px-2 py-2">{product.nombre}</td>
                                    <td className="px-2 py-2">₡{product.precio}</td>
                                    <td className="px-2 py-2">{product.stock}</td>
                                    <td className="px-2 py-2 flex justify-center">

                                        <button onClick={() => ProductDetails(product)} className="flex gap-1 items-center justify-center text-white bg-[#0191ff60] hover:bg-[#0191ff] focus:ring-2 focus:outline-none focus:ring-[#0191ff] font-medium rounded-lg text-sm px-3 py-2 text-center">
                                            <EyeIcon size={18}/>
                                            <span className="hidden md:inline"> Ver producto </span>
                                        </button>

                                        <button onClick={() => ProductDelete(product.id)} className="flex gap-1 items-center justify-center ml-2 text-white bg-[#ff011f89] hover:bg-[#ff011f] focus:ring-2 focus:outline-none focus:ring-[#ff011f] font-medium rounded-lg text-sm px-3 py-0 text-center">
                                            <Trash2 size={18}/>
                                            <span className="hidden md:inline"> Elininar </span>
                                        </button>

                                    </td>
                                    {/* <td className="px-3 py-4">{category ? category.nombre : "-"}</td> */}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {AddProductActive && (
                <div className="fixed inset-0 z-40 bg-[#83917f7c] dark:bg-[#171731] backdrop-blur-md overflow-hidden">
                    <div className="h-full overflow-y-auto p-5">
                        <div className="w-full sm:w-[90%] mx-auto">
                        
                        {/* Header flotante */}
                        <div className="relative mb-6">
                            <div className="rounded-[10px] p-6 sm:p-5 shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                    <h1 className="text-2xl font-bold text-white mb-1">
                                        Nuevo Producto
                                    </h1>
                                    <p className="text-emerald-200">
                                        Agrega un nuevo producto al inventario
                                    </p>
                                    </div>
                                    <button
                                    onClick={handleClose}
                                    className="text-white/80 hover:text-white hover:bg-white/10 transition-all p-1 rounded-2xl"
                                    >
                                    <X size={28} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            
                            {/* Columna Izquierda - Visual */}
                            <div className="space-y-3">
                            
                            {/* Card de Imágenes */}
                            <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2 bg-emerald-500/20 rounded-2xl">
                                        <ImageIcon className="w-5 h-5 text-emerald-300" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-white">Galería Visual</h2>
                                </div>

                                <div 
                                onClick={() => setShowGallery(true)}
                                className="bg-white/5 border-2 border-dashed border-white/30 rounded-2xl p-8 text-center hover:border-emerald-400/50 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-4">
                                    <Upload className="h-10 w-10 text-emerald-300" />
                                </div>
                                <p className="text-white font-medium mb-1">
                                    {images.length > 0 ? `${images.length} imagen${images.length > 1 ? 'es' : ''} cargada${images.length > 1 ? 's' : ''}` : 'Agregar imágenes del producto'}
                                </p>
                                <p className="text-emerald-200 text-sm">
                                    Haz clic para gestionar la galería
                                </p>
                                </div>
                            </div>

                            {/* Card de Descripción */}
                            <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-500/20 rounded-2xl">
                                    <FileText className="w-6 h-6 text-purple-300" />
                                </div>
                                <h2 className="text-xl font-semibold text-white">Descripción</h2>
                                </div>
                                
                                <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                rows="6"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all resize-none text-white placeholder-white/50"
                                placeholder="Cuenta la historia de este producto..."
                                ></textarea>
                                </div>
                                </div>

                            {/* Columna Derecha - Datos */}
                            <div className="space-y-3">
                            
                            {/* Card de Identificación */}
                            <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-500/20 rounded-2xl">
                                        <Package className="w-6 h-6 text-blue-300" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-white">Identificación</h2>
                                </div>

                                <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                                    Código (opcional)
                                    </label>
                                    <input
                                    type="text"
                                    name="codigo"
                                    value={formData.codigo}
                                    onChange={handleInputChange}
                                    maxLength={15}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                                    placeholder="PROD-001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                                    Nombre del producto *
                                    </label>
                                    <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    maxLength={100}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                                    placeholder="1kg de papas"
                                    />
                                </div>
                                </div>
                            </div>

                            {/* Card de Comercial */}
                            <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-yellow-500/20 rounded-2xl">
                                        <DollarSign className="w-6 h-6 text-yellow-300" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-white">Información Comercial</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                                    Precio (₡) *
                                    </label>
                                    <input
                                    type="number"
                                    name="precio"
                                    value={formData.precio}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                                    placeholder="1000"
                                    step="0.01"
                                    min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                                    Stock
                                    </label>
                                    <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                                    min="0"
                                    placeholder="0"
                                    />
                                </div>
                                </div>
                            </div>

                            {/* Card de Clasificación */}
                            <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-pink-500/20 rounded-2xl">
                                    <Layers className="w-6 h-6 text-pink-300" />
                                </div>
                                <h2 className="text-xl font-semibold text-white">Clasificación</h2>
                                </div>

                                <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                                    Categoría
                                    </label>
                                    <select
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-white/10 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white cursor-pointer"
                                    >
                                    <option className="bg-emerald-600" value="">Seleccionar categoría</option>
                                    {CategoriesData.map(cat => (
                                        <option className="bg-emerald-600" key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-emerald-200 mb-2">
                                    Proveedor
                                    </label>
                                    <select
                                    name="proveedor"
                                    value={formData.proveedor}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white cursor-pointer"
                                    >
                                    <option className="bg-emerald-600" value="">Seleccionar proveedor</option>
                                    {SuppliersData.map(prov => (
                                        <option className="bg-emerald-600" key={prov.id} value={prov.id}>{prov.nombre}</option>
                                    ))}
                                    </select>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>

                        {/* Botones de acción flotantes */}
                        <div className="mt-3 px-6">
                            <div className="flex flex-col sm:flex-row justify-end gap-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-2xl font-medium transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateProduct}
                                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-medium transition-all shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
                            >
                                <Plus size={20} />
                                <span> Agregar Producto</span>
                            </button>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Galería */}
            {ShowGallery && (
                <div className="fixed inset-0 z-[60] backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-400/40 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                    
                    {/* Header del modal */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/20 rounded-2xl">
                            <ImageIcon className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">Gestionar Galería</h3>
                            <p className="text-sm text-emerald-200">Máximo 5 imágenes</p>
                        </div>
                        </div>
                        <button
                        onClick={() => setShowGallery(false)}
                        className="text-white/80 hover:text-white hover:bg-white/10 transition-all p-2 rounded-xl"
                        >
                        <X size={24} />
                        </button>
                    </div>

                    {/* Contenido del modal */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                        
                        {/* Input para subir imágenes */}
                        <div className="mb-6">
                        <div className="bg-white/5 border-2 border-dashed border-white/30 rounded-2xl p-6 text-center hover:border-emerald-400/50 hover:bg-white/10 transition-all">
                            <input
                            type="file"
                            id="imageUploadModal"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={images.length >= 5}
                            />
                            <label 
                            htmlFor="imageUploadModal" 
                            className={`${images.length >= 5 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} block`}
                            >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-3">
                                <Upload className="h-8 w-8 text-emerald-300" />
                            </div>
                            <p className="text-white font-medium mb-1">
                                {images.length >= 5 ? 'Límite alcanzado (5/5)' : 'Subir más imágenes'}
                            </p>
                            <p className="text-emerald-200 text-sm">
                                {images.length >= 5 ? 'Elimina alguna para agregar más' : `PNG, JPG, JPEG • ${images.length}/5 usadas`}
                            </p>
                            </label>
                        </div>
                        </div>

                        {/* Grid de imágenes */}
                        {images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {console.log(images)}
                            {images.map(img => (
                            <div key={img.id} className="relative">
                                <div
                                className={`relative overflow-hidden rounded-xl transition-all ${
                                    imagenPrincipal === img.id
                                    ? 'ring-4 ring-emerald-400'
                                    : 'ring-2 ring-white/20 hover:ring-white/40'
                                }`}
                                >
                                <img
                                    src={img.imagen}
                                    alt="Preview"
                                    className="w-full h-40 object-cover"
                                />

                                {/* Overlay opcional */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                                {/* BOTÓN ELIMINAR (SIEMPRE VISIBLE) */}
                                <button
                                    type="button"
                                    onClick={() => removeImage(img.id)}
                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg"
                                >
                                    <X size={16} />
                                </button>

                                {/* PRINCIPAL */}
                                {imagenPrincipal === img.id ? (
                                    <div className="absolute bottom-3 left-3 bg-emerald-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                                    ★ Principal
                                    </div>
                                ) : (
                                    <button
                                    type="button"
                                    onClick={() => setAsPrincipal(img.id)}
                                    className="absolute bottom-3 left-3 bg-white/90 hover:bg-emerald-500 hover:text-white text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg"
                                    >
                                    Marcar principal
                                    </button>
                                )}
                                </div>
                            </div>
                            ))}
                        </div>
                        ) : (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-4">
                            <ImageIcon className="w-10 h-10 text-white/30" />
                            </div>
                            <p className="text-white/60">No hay imágenes todavía</p>
                            <p className="text-white/40 text-sm mt-1">Sube tu primera imagen arriba</p>
                        </div>
                        )}

                    </div>
                    </div>
                </div>
            )}

            {SeeProductDetail && (
            
            <>
{/* {console.log("formData:", formData)}
{console.log("originalData:", originalData)} */}


              <div className="fixed inset-0 z-40 bg-[#83917f7c] dark:bg-[#171731] backdrop-blur-md overflow-hidden">
                <div className="h-full overflow-y-auto p-5">
                  <div className="w-full sm:w-[90%] mx-auto">
                    
                    {/* Header flotante */}
                    <div className="relative mb-6">
                      <div className="rounded-[10px] p-6 sm:p-5 shadow-2xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <h1 className="text-2xl font-bold text-white mb-1">
                              {viewMode === 'view' ? 'Detalles del Producto' : 'Editar Producto'}
                            </h1>
                            <p className="text-emerald-200">
                              {viewMode === 'view' ? 'Visualiza la información completa' : 'Actualiza la información del producto'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {viewMode === 'view' && (
                              <button
                                onClick={handleEdit}
                                className="text-white/80 hover:text-white hover:bg-white/10 transition-all p-2 rounded-2xl flex items-center gap-2"
                              >
                                <Edit2 size={24} />
                              </button>
                            )}
                            {viewMode === 'view' ? (
                              <button onClick={handleClose} className="text-white/80 hover:text-white hover:bg-white/10 transition-all p-2 rounded-2xl">
                                <X size={28} />
                              </button>
                            
                            ) : (
                              <button onClick={handleCloseEdit} className="text-white/80 hover:text-white hover:bg-white/10 transition-all p-2 rounded-2xl">
                                <X size={28} />
                              </button>
                            )}
                            
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      
                      {/* Columna Izquierda - Visual */}
                      <div className="space-y-3">
                        
                        {/* Card de Imágenes */}
                        <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-emerald-500/20 rounded-2xl">
                              <ImageIcon className="w-5 h-5 text-emerald-300" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Galería Visual</h2>
                          </div>

                          {viewMode === 'view' ? (
                            // Vista de solo lectura
                            <div className="space-y-4">
                              {images.length > 0 ? (
                                <>
                                  {/* Imagen principal */}
                                  <div className="relative rounded-2xl overflow-hidden">
                                    {console.log(formData.referenciaIMG)}
                                    <img
                                      src={formData.referenciaIMG || 
                                        images.find(img => img.id === imagenPrincipal)?.url ||
                                        images[0]?.url
                                      }
                                      alt="Imagen principal"
                                      className="w-full h-70 object-contain"
                                    />
                                    <div className="absolute top-3 left-3 bg-emerald-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                                      ★ Principal
                                    </div>
                                  </div>

                                  {/* Miniaturas (sin repetir la principal) */}
                                  {images.length > 1 && (
                                    <div className="grid grid-cols-4 gap-2">
                                      {images.map(img =>
                                        img.url !== formData.referenciaIMG ? (
                                          <div key={img.id} className="relative rounded-lg overflow-hidden h-30">
                                            <img
                                              src={img.url}
                                              alt="Miniatura"
                                              className="w-full h-full object-contain"
                                            />
                                          </div>
                                        ) : null
                                      )}
                                    </div>
                                  )}
                                </>

                              ) : (
                                <div className="bg-white/5 border-2 border-dashed border-white/30 rounded-2xl p-8 text-center">
                                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-4">
                                    <ImageIcon className="h-10 w-10 text-emerald-300" />
                                  </div>
                                  <p className="text-white/60">Sin imágenes</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            // Modo edición
                            <div 
                              onClick={() => setShowGallery2(true)}
                              className="bg-white/5 border-2 border-dashed border-white/30 rounded-2xl p-8 text-center hover:border-emerald-400/50 hover:bg-white/10 transition-all cursor-pointer"
                            >
                              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-4">
                                <Upload className="h-10 w-10 text-emerald-300" />
                              </div>
                              <p className="text-white font-medium mb-1">
                                {images.length > 0 ? `${images.length} imagen${images.length > 1 ? 'es' : ''} cargada${images.length > 1 ? 's' : ''}` : 'Agregar imágenes del producto'}
                              </p>
                              <p className="text-emerald-200 text-sm">
                                Haz clic para gestionar la galería
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Card de Descripción */}
                        <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-2xl">
                              <FileText className="w-6 h-6 text-purple-300" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Descripción</h2>
                          </div>
                          
                          {viewMode === 'view' ? (
                            <div className="bg-white/5 border border-white/20 rounded-2xl p-4">
                              <p className="text-white/90 leading-relaxed">
                                {formData.descripcion || 'Sin descripción'}
                              </p>
                            </div>
                          ) : (
                            <textarea
                              name="descripcion"
                              value={formData.descripcion}
                              onChange={handleInputChange}
                              rows="6"
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all resize-none text-white placeholder-white/50"
                              placeholder="Cuenta la historia de este producto..."
                            ></textarea>
                          )}
                        </div>
                      </div>

                      {/* Columna Derecha - Datos */}
                      <div className="space-y-3">
                        
                        {/* Card de Identificación */}
                        <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-500/20 rounded-2xl">
                              <Package className="w-6 h-6 text-blue-300" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Identificación</h2>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-emerald-200 mb-2">
                                Código
                              </label>
                              {viewMode === 'view' ? (
                                <div className="bg-white/5 border border-white/20 rounded-xl px-3 py-2">
                                  <p className="text-white">{formData.codigo || 'Sin código'}</p>
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  name="codigo"
                                  value={formData.codigo}
                                  onChange={handleInputChange}
                                  maxLength={15}
                                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                                  placeholder="PROD-001"
                                />
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-emerald-200 mb-2">
                                Nombre del producto *
                              </label>
                              {viewMode === 'view' ? (
                                <div className="bg-white/5 border border-white/20 rounded-xl px-3 py-2">
                                  <p className="text-white font-medium">{formData.nombre}</p>
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  name="nombre"
                                  value={formData.nombre}
                                  onChange={handleInputChange}
                                  maxLength={100}
                                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                                  placeholder="1kg de papas"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card de Comercial */}
                        <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-yellow-500/20 rounded-2xl">
                              <DollarSign className="w-6 h-6 text-yellow-300" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Información Comercial</h2>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-emerald-200 mb-2">
                                Precio (₡) *
                              </label>
                              {viewMode === 'view' ? (
                                <div className="bg-white/5 border border-white/20 rounded-xl px-3 py-2">
                                  <p className="text-white font-bold text-lg">₡{formData.precio.toLocaleString()}</p>
                                </div>
                              ) : (
                                <input
                                  type="number"
                                  name="precio"
                                  value={formData.precio}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                                  placeholder="1000"
                                  step="0.01"
                                  min="0"
                                />
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-emerald-200 mb-2">
                                Stock
                              </label>
                              {viewMode === 'view' ? (
                                <div className="bg-white/5 border border-white/20 rounded-xl px-3 py-2">
                                  <p className="text-white font-semibold">{formData.stock} unidades</p>
                                </div>
                              ) : (
                                <input
                                  type="number"
                                  name="stock"
                                  value={formData.stock}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                                  min="0"
                                  placeholder="0"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card de Clasificación */}
                        <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-pink-500/20 rounded-2xl">
                              <Layers className="w-6 h-6 text-pink-300" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Clasificación</h2>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-emerald-200 mb-2">
                                Categoría
                              </label>
                              {viewMode === 'view' ? (
                                <div className="bg-white/5 border border-white/20 rounded-xl px-3 py-2">
                                  <p className="text-white">{getCategoryName(formData.categoria)}</p>
                                </div>
                              ) : (
                                <select
                                  name="categoria"
                                  value={formData.categoria}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 bg-white/10 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white cursor-pointer"
                                >
                                  <option className="bg-emerald-600" value="">Seleccionar categoría</option>
                                  {CategoriesData.map(cat => (
                                    <option className="bg-emerald-600" key={cat.id} value={cat.id}>{cat.nombre}</option>
                                  ))}
                                </select>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-emerald-200 mb-2">
                                Proveedor
                              </label>
                              {viewMode === 'view' ? (
                                <div className="bg-white/5 border border-white/20 rounded-xl px-3 py-2">
                                  <p className="text-white">{getSupplierName(formData.proveedor)}</p>
                                </div>
                              ) : (
                                <select
                                  name="proveedor"
                                  value={formData.proveedor}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white cursor-pointer"
                                >
                                  <option className="bg-emerald-600" value="">Seleccionar proveedor</option>
                                  {SuppliersData.map(prov => (
                                    <option className="bg-emerald-600" key={prov.id} value={prov.id}>{prov.nombre}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción flotantes */}
                    <div className="mt-3 px-6">
                      <div className="flex flex-col sm:flex-row justify-end gap-4">
                        {viewMode === 'view' ? (
                          <button
                            type="button"
                            onClick={handleClose}
                            className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-2xl font-medium transition-all"
                          >
                            Cerrar
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={handleCancel}
                              className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-2xl font-medium transition-all"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={handleSave}
                              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-medium transition-all shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
                            >
                              <Save size={20} />
                              <span>Guardar Cambios</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal de Galería */}
              {ShowGallery2 && (
                <div className="fixed inset-0 z-[60] backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-gray-400/40 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                    
                    {/* Header del modal */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/20 rounded-2xl">
                          <ImageIcon className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">Gestionar Galería</h3>
                          <p className="text-sm text-emerald-200">Máximo 5 imágenes</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowGallery2(false)}
                        className="text-white/80 hover:text-white hover:bg-white/10 transition-all p-2 rounded-xl"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    {/* Contenido del modal */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                      
                      {/* Input para subir imágenes */}
                      <div className="mb-6">
                        <div className="bg-white/5 border-2 border-dashed border-white/30 rounded-2xl p-6 text-center hover:border-emerald-400/50 hover:bg-white/10 transition-all">
                          <input
                            type="file"
                            id="imageUploadModal"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={images.length >= 5}
                          />
                          <label 
                            htmlFor="imageUploadModal" 
                            className={`${images.length >= 5 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} block`}
                          >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-3">
                              <Upload className="h-8 w-8 text-emerald-300" />
                            </div>
                            <p className="text-white font-medium mb-1">
                              {images.length >= 5 ? 'Límite alcanzado (5/5)' : 'Subir más imágenes'}
                            </p>
                            <p className="text-emerald-200 text-sm">
                              {images.length >= 5 ? 'Elimina alguna para agregar más' : `PNG, JPG, JPEG • ${images.length}/5 usadas`}
                            </p>
                          </label>
                        </div>
                      </div>

                      {/* Grid de imágenes */}
                      {images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {images.map(img => (
                            <div key={img.id} className="relative">
                              <div
                                className={`relative overflow-hidden rounded-xl transition-all ${
                                  imagenPrincipal === img.url || imagenPrincipal === img.id
                                    ? 'ring-4 ring-emerald-400'
                                    : 'ring-2 ring-white/20 hover:ring-white/40'
                                }`}
                              >
                                <img
                                  src={img.url}
                                  alt="Preview"
                                  className="w-full h-40 object-cover"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                                {/* Botón eliminar */}
                                <button
                                  type="button"
                                  onClick={() => removeImage(img.id)}
                                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg"
                                >
                                  <X size={16} />
                                </button>
                                
                                {/* Principal */}
                                {imagenPrincipal === img.url || imagenPrincipal === img.id ? (
                                  <div className="absolute bottom-3 left-3 bg-emerald-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                                    ★ Principal
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setAsPrincipal(img.id)}
                                    className="absolute bottom-3 left-3 bg-white/90 hover:bg-emerald-500 hover:text-white text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg"
                                  >
                                    Marcar principal
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-4">
                            <ImageIcon className="w-10 h-10 text-white/30" />
                          </div>
                          <p className="text-white/60">No hay imágenes todavía</p>
                          <p className="text-white/40 text-sm mt-1">Sube tu primera imagen arriba</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>

            )}

        </div>
    )
}

export default ProductsList
