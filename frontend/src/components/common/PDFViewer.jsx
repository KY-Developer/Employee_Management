import { useState } from 'react'
import { FiDownload, FiX } from 'react-icons/fi'

const PDFViewer = ({ url, onClose }) => {
  const [isLoading, setIsLoading] = useState(true)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = 'document.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">PDF Viewer</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-primary-600"
              title="Download"
            >
              <FiDownload size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-primary-600"
              title="Close"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          )}
          <iframe
            src={url}
            className={`w-full h-full ${isLoading ? 'hidden' : 'block'}`}
            onLoad={() => setIsLoading(false)}
            title="PDF Viewer"
          ></iframe>
        </div>
      </div>
    </div>
  )
}

export default PDFViewer