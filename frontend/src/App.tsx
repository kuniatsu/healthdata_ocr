import { useState, useRef } from 'react'
import './App.css'

interface AnalysisResult {
  date: string
  items: Array<{
    name: string
    value: string
    unit: string
  }>
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const apiUrl = import.meta.env.VITE_API_URL

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setError(null)
    } else {
      setError('Please select an image file')
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over')
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze image')
      }

      const data: AnalysisResult = await response.json()
      setResult(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            健康診断 OCR
          </h1>
          <p className="text-gray-600">
            健康診断書の画像をアップロードして、検査データを自動抽出します
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer transition-colors hover:border-blue-400 drag-over:border-blue-500 drag-over:bg-blue-50"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleInputChange}
            />
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-14-8v14m0-14l7 7m-7-7l-7 7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mb-2">
              {selectedFile ? (
                <>
                  <p className="text-lg font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-900">
                    ここにドラッグ＆ドロップ
                  </p>
                  <p className="text-sm text-gray-500">
                    またはクリックして画像を選択
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Analyze Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || isLoading}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading && (
                <div className="inline-block animate-spin">
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              )}
              {isLoading ? '解析中...' : '解析する'}
            </button>
          </div>
        </div>

        {/* Results Table */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">解析結果</h2>

            {/* Date */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">測定日</p>
              <p className="text-lg font-semibold text-gray-900">
                {result.date}
              </p>
            </div>

            {/* Results Table */}
            {result.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        検査項目
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        測定値
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        単位
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((item, index) => (
                      <tr
                        key={index}
                        className={`border-b ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-blue-50 transition-colors`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {item.value}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">データが抽出されませんでした</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
