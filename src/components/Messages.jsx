import React, { useEffect, useState, useRef } from 'react'
import { GetData } from '../services/ApiServices'

function Messages() {
    const [consults, setConsults] = useState([])
    const [users, setUsers] = useState([])
    const [query, setQuery] = useState("")
    const [selected, setSelected] = useState(null)
    const [composer, setComposer] = useState("")
    const listRef = useRef(null)

    useEffect(() => {
        const fetchData = async () => {
            const c = await GetData('consultas/')
            const u = await GetData('users/')
            if (c) setConsults(c)
            if (u) setUsers(u)
        }
        fetchData()
    }, [])

    const filterConsults = (items, q) => {
        if (!q || q.trim() === '') return items
        const s = q.toLowerCase()
        return items.filter((it) => {
            return (
                (it.nombre_completo || '').toLowerCase().includes(s) ||
                (it.asunto || '').toLowerCase().includes(s) ||
                (it.mensaje || '').toLowerCase().includes(s) ||
                (it.correo || '').toLowerCase().includes(s)
            )
        })
    }

    const items = filterConsults(consults, query)

    const handleSelect = (item) => {
        setSelected(item)
        // scroll messages container to bottom if desired
        setTimeout(() => {
            if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
        }, 50)
    }

    const handleSend = () => {
        if (!composer.trim()) return
        // read-only view — do not POST here; just append locally for preview
        const newMsg = {
            id: Date.now(),
            nombre_completo: 'Tú',
            asunto: '',
            mensaje: composer,
            correo: null,
            created_at: new Date().toISOString(),
        }
        // append locally to selected view (non-persistent)
        setSelected((prev) => (prev ? { ...prev, _localReplies: [...(prev._localReplies || []), newMsg] } : prev))
        setComposer('')
        setTimeout(() => {
            if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
        }, 50)
    }

    return (
        <div className="w-[95%] mx-auto py-8">
            <div className="grid md:grid-cols-3 gap-6">
                {/* Left - Conversations */}
                <div className="md:col-span-1">
                    <div className="backdrop-blur-xl bg-white/5 dark:bg-gray-800 rounded-[10px] p-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Mensajes</h3>
                            <span className="text-sm text-gray-400">{items.length}</span>
                        </div>

                        <div className="relative mb-4">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar por nombre, asunto o mensaje"
                                className="w-full ps-10 text-sm text-white placeholder-gray-400 border border-gray-300 rounded-lg bg-gray-400/20 focus:ring-[#38664e] focus:border-[#38664e] px-3 py-2"
                            />
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-300">🔎</div>
                        </div>

                        <div className="max-h-[60vh] overflow-auto scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-transparent">
                            {items.length === 0 ? (
                                <div className="text-center text-sm text-gray-400 py-6">No hay mensajes</div>
                            ) : (
                                <ul className="space-y-2">
                                    {items.map((c) => (
                                        <li key={c.id}>
                                            <button
                                                onClick={() => handleSelect(c)}
                                                className={`w-full text-left p-3 rounded-lg hover:bg-white/10 flex items-start gap-3 ${selected && selected.id === c.id ? 'bg-emerald-600/10' : ''}`}
                                            >
                                                <div className="w-12 h-12 rounded-full bg-gray-300/30 flex items-center justify-center text-sm font-semibold text-white">{(c.nombre_completo || 'U').slice(0,1)}</div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-medium text-white">{c.nombre_completo}</div>
                                                        <div className="text-xs text-gray-400">{new Date(c.created_at || c.fecha || Date.now()).toLocaleDateString()}</div>
                                                    </div>
                                                    <div className="text-sm text-gray-300 truncate">{c.asunto || c.mensaje}</div>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right - Thread */}
                <div className="md:col-span-2">
                    <div className="backdrop-blur-xl bg-white/5 dark:bg-gray-800 rounded-[10px] p-4 shadow-2xl flex flex-col h-[70vh]">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                            <div>
                                <div className="text-lg font-semibold text-white">{selected ? selected.nombre_completo : 'Selecciona una conversación'}</div>
                                <div className="text-sm text-gray-400">{selected ? (selected.correo || 'Contacto externo') : 'Aquí verás el hilo de mensajes'}</div>
                            </div>
                            <div className="text-sm text-gray-400">{selected ? new Date(selected.created_at || selected.fecha || Date.now()).toLocaleString() : ''}</div>
                        </div>

                        <div ref={listRef} className="flex-1 overflow-auto space-y-4 px-1 py-2 scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-transparent">
                            {!selected ? (
                                <div className="h-full flex items-center justify-center text-gray-400">Selecciona un mensaje a la izquierda para ver detalles</div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/10 rounded-lg">
                                        <div className="text-sm text-gray-300">{selected.mensaje}</div>
                                        <div className="mt-2 text-xs text-gray-400">{selected.asunto}</div>
                                    </div>

                                    {/* local replies */}
                                    {(selected._localReplies || []).map((r) => (
                                        <div key={r.id} className="p-3 bg-emerald-600/10 rounded-lg text-white text-sm">
                                            <div className="text-sm">{r.mensaje}</div>
                                            <div className="text-xs text-gray-300 mt-1">{new Date(r.created_at).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    value={composer}
                                    onChange={(e) => setComposer(e.target.value)}
                                    placeholder={selected ? `Enviar mensaje a ${selected.nombre_completo}` : 'Selecciona una conversación primero'}
                                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white outline-none focus:ring-2 focus:ring-emerald-400"
                                    disabled={!selected}
                                />
                                <button onClick={handleSend} disabled={!selected || !composer.trim()} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">Enviar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Messages
