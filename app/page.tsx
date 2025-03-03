"use client"

import { useState, useEffect, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function Home() {
  const [url, setUrl] = useState("")
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [savedUrls, setSavedUrls] = useState<string[]>([])
  const [selectedUrl, setSelectedUrl] = useState<string>("")
  
  useEffect(() => {
    const savedData = localStorage.getItem("savedUrls")
    if (savedData) {
      setSavedUrls(JSON.parse(savedData))
    }
  }, [])

  const fetchData = async (url: string) => {
    try {
      setError(null)

      const fetchUrl = url
      const response = await fetch(`/api/scrape?url=${encodeURIComponent(fetchUrl)}`)
      const result = await response.json()

      if (!response.ok) throw new Error(result.error || "Failed to fetch data")

      setData(result)

      if (!savedUrls.includes(fetchUrl)) {
        const newSavedUrls = [...savedUrls, fetchUrl]
        setSavedUrls(newSavedUrls)
        localStorage.setItem("savedUrls", JSON.stringify(newSavedUrls))
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const chartElement = useMemo(() => {
    if (data.length === 0) return <></>
    return (
      <LineChart data={data}>
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    )
  }, [data])

  return (
    <div className="flex flex-col items-center p-10">
      <h1 className="text-2xl font-bold mb-4">Wikipedia Table Chart Creator</h1>
      <select
        value={selectedUrl}
        onChange={(e) => {
          const value = e.target.value
          if (value !== "") {
            fetchData(e.target.value)
          }
          setSelectedUrl(e.target.value)
        }
        }
        className="p-2 border rounded w-140 mb-4"
      >
        <option value="">Select a previous URL</option>
        {savedUrls.map((savedUrl, index) => (
          <option key={index} value={savedUrl}>
            {savedUrl}
          </option>
        ))}
      </select>
      <div>
        <input
          type="text"
          placeholder="Enter Wikipedia URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="p-2 border rounded w-90 mb-4"
        />
        <div className="inline px-4">
          <button onClick={() => { fetchData(url) }} className="bg-blue-500 text-white px-4 py-2 rounded">
            Generate Chart
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="mt-6 w-full h-96">
        {data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            {chartElement}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
