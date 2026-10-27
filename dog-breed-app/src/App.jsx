

import { useEffect, useState } from 'react'
import './App.css'

const BREEDS_API = 'https://dog.ceo/api/breeds/list/all'
const IMAGE_API = 'https://dog.ceo/api/breed'

function App() {
  const [breeds, setBreeds] = useState([])
  const [selectedBreed, setSelectedBreed] = useState('poodle')
  const [dogImage, setDogImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Get all dog breeds from the API
  useEffect(() => {
    async function fetchBreeds() {
      try {
        const response = await fetch(BREEDS_API)
        const data = await response.json()

        if (data.status !== 'success') {
          throw new Error('Failed to load dog breeds.')
        }

        const breedList = []

        Object.entries(data.message).forEach(
          ([breed, subBreeds]) => {
            if (subBreeds.length === 0) {
              breedList.push({
                value: breed,
                label: breed.charAt(0).toUpperCase() + breed.slice(1),
              })
            } else {
              subBreeds.forEach((subBreed) => {
                breedList.push({
                  value: `${breed}/${subBreed}`,
                  label: `${subBreed} ${breed}`,
                })
              })
            }
          }
        )

        breedList.sort((a, b) =>
          a.label.localeCompare(b.label)
        )

        setBreeds(breedList)

        // Keep Poodle selected by default
        if (!breedList.some((breed) => breed.value === 'poodle')) {
          setSelectedBreed(breedList[0]?.value || '')
        }
      } catch {
        setError('Unable to load dog breeds. Please try again.')
      }
    }

    fetchBreeds()
  }, [])

  // Get a random image for the selected breed
  async function fetchDogImage() {
    if (!selectedBreed) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${IMAGE_API}/${selectedBreed}/images/random`
      )

      const data = await response.json()

      if (!response.ok || data.status !== 'success') {
        throw new Error('Unable to fetch a dog image.')
      }

      setDogImage(data.message)
    } catch {
      setError('Unable to load the image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load an image when the selected breed changes
  useEffect(() => {
    if (selectedBreed) {
      fetchDogImage()
    }
  }, [selectedBreed])

  return (
    <main className="page">
      <section className="dog-card">
        <select
          value={selectedBreed}
          onChange={(event) => setSelectedBreed(event.target.value)}
          aria-label="Select dog breed"
        >
          {breeds.map((breed) => (
            <option key={breed.value} value={breed.value}>
              {breed.label}
            </option>
          ))}
        </select>

        {loading && <p>Loading dog image...</p>}

        {error && <p className="error">{error}</p>}

        {dogImage && !loading && (
          <img
            className="dog-image"
            src={dogImage}
            alt={`${selectedBreed.replace('/', ' ')} dog`}
          />
        )}

        <button
          onClick={fetchDogImage}
          disabled={loading || !selectedBreed}
        >
          {loading ? 'Loading...' : 'Fetch Again'}
        </button>
      </section>
    </main>
  )
}

export default App
