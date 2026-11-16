import { useEffect, useState } from 'react'
import {
  getDestinatii,
  postDestinatie,
  patchVizitat,
} from './api/destinatii.js'
import { getNevizitate, totalZile } from './utils/destinatii.js'

import Rezumat from './components/Rezumat.jsx'
import FormularDestinatie from './components/FormularDestinatie.jsx'
import Cautare from './components/Cautare.jsx'
import ListaDestinatii from './components/ListaDestinatii.jsx'
import './App.css'

export default function App() {
  const [destinatii, setDestinatii] = useState([])
  const [incarcare, setIncarcare] = useState(true)
  const [eroare, setEroare] = useState(null)
  const [seTrimite, setSeTrimite] = useState(false)
  const [cautare, setCautare] = useState('')
  const [pagina, setPagina] = useState(1)
  const [totalPagini, setTotalPagini] = useState(1)

  useEffect(() => {
    async function incarca() {
      setIncarcare(true)
      try {
        const rezultat = await getDestinatii(pagina)
        setDestinatii(rezultat.data)
        setTotalPagini(rezultat.pages)
      } catch (err) {
        setEroare(err.message)
      } finally {
        setIncarcare(false)
      }
    }
    incarca()
  }, [pagina])

  async function handleToggle(id) {
    const destinatieCurenta = destinatii.find((d) => d.id === id)
    if (!destinatieCurenta) return

    try {
      const salvata = await patchVizitat(id, !destinatieCurenta.vizitat)
      setDestinatii((curent) =>
        curent.map((d) => (d.id === id ? salvata : d))
      )
    } catch (err) {
      setEroare(err.message)
    }
  }

  async function handleAdd(nouaDestinatie) {
    setSeTrimite(true)
    try {
      const salvata = await postDestinatie(nouaDestinatie)
      setDestinatii((curent) => [...curent, salvata])
    } catch (err) {
      setEroare(err.message)
    } finally {
      setSeTrimite(false)
    }
  }

  const nevizitate = getNevizitate(destinatii)
  const textCautare = cautare.trim().toLowerCase()
  const afisate = destinatii.filter(
    (d) =>
      d.oras.toLowerCase().includes(textCautare) ||
      d.tara.toLowerCase().includes(textCautare)
  )

  return (
    <main>
      <h1>City Explorer</h1>

      {incarcare && <p className="stare">Se încarcă destinațiile...</p>}
      {eroare && (
        <p className="stare eroare">Nu am putut încărca datele: {eroare}</p>
      )}

      {!incarcare && !eroare && (
        <>
          <Rezumat
            total={destinatii.length}
            nevizitate={nevizitate.length}
            zile={totalZile(nevizitate)}
          />
          <FormularDestinatie onAdd={handleAdd} seTrimite={seTrimite} />
          <Cautare valoare={cautare} onChange={setCautare} />

          {destinatii.length === 0 ? (
            <p className="gol">
              Nu există nicio destinație. Adaugă prima din formular.
            </p>
          ) : afisate.length === 0 ? (
            <p className="gol">Niciun rezultat pentru „{cautare}”.</p>
          ) : (
            <ListaDestinatii destinatii={afisate} onToggle={handleToggle} />
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1.5rem',
            }}
          >
            <button
              type="button"
              disabled={pagina <= 1}
              onClick={() => setPagina((p) => p - 1)}
            >
              Înapoi
            </button>
            <span>
              pagina {pagina} din {totalPagini}
            </span>
            <button
              type="button"
              disabled={pagina >= totalPagini}
              onClick={() => setPagina((p) => p + 1)}
            >
              Înainte
            </button>
          </div>
        </>
      )}
    </main>
  )
}