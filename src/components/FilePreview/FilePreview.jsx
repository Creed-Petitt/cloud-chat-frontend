import { useState, useEffect } from 'react'
import './FilePreview.css'

const FilePreview = ({ file, imageUrl, onRemove }) => {
  const [preview, setPreview] = useState(null)
  const [fileInfo, setFileInfo] = useState({ name: '', type: '', isImage: false })

  useEffect(() => {
    if (file) {
      const isImage = file.type.startsWith('image/')
      setFileInfo({
        name: file.name,
        type: file.type,
        isImage: isImage
      })

      if (isImage) {
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)
        return () => URL.revokeObjectURL(objectUrl)
      }
    } else if (imageUrl) {
      // Extract filename from URL or determine type
      const isPDF = imageUrl.toLowerCase().includes('.pdf') || imageUrl.toLowerCase().includes('application/pdf')
      const isImage = !isPDF

      // Try to extract filename from URL
      let filename = 'Uploaded file'
      try {
        const urlPath = imageUrl.split('?')[0] // Remove query params
        const urlParts = urlPath.split('/')
        const lastPart = urlParts[urlParts.length - 1]
        if (lastPart && lastPart.includes('.')) {
          filename = decodeURIComponent(lastPart)
        }
      } catch (e) {
        // Use default filename
      }

      setFileInfo({
        name: filename,
        type: isPDF ? 'application/pdf' : 'image',
        isImage: isImage
      })
      setPreview(imageUrl)
    }
  }, [file, imageUrl])

  if (!file && !imageUrl) {
    return null
  }

  return (
    <div className="file-preview-container">
      <div className="file-preview-card">
        {fileInfo.isImage ? (
          <div className="file-preview-image">
            <img src={preview} alt={fileInfo.name} />
          </div>
        ) : (
          <div className="file-preview-pdf">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="32px" height="32px" fill="#e8e8e8">
              <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/>
            </svg>
            <span className="file-name">{fileInfo.name}</span>
          </div>
        )}
        <button className="file-preview-remove" onClick={onRemove} aria-label="Remove file">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="18px" height="18px" fill="currentColor">
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default FilePreview
