import { useState, useRef, useEffect } from 'react'
import './FileUploadPopup.css'

const FileUploadPopup = ({ isOpen, onClose, onUploadClick, onUrlSelect }) => {
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
        setShowUrlInput(false)
        setUrlInput('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUrlSelect(urlInput.trim())
      setUrlInput('')
      setShowUrlInput(false)
      onClose()
    }
  }

  const handleUploadButtonClick = (e) => {
    e.stopPropagation()
    onUploadClick()
  }

  const handleInsertLinkClick = (e) => {
    e.stopPropagation()
    setShowUrlInput(true)
  }

  if (!isOpen) return null

  return (
    <div className="file-upload-popup" ref={dropdownRef}>
      {!showUrlInput ? (
        <div className="file-upload-options">
          <button className="file-upload-option" onClick={handleUploadButtonClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="20px" height="20px" fill="currentColor">
              <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
            </svg>
            <span>Upload from computer</span>
          </button>
          <button className="file-upload-option" onClick={handleInsertLinkClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="20px" height="20px" fill="currentColor">
              <path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"/>
            </svg>
            <span>Insert image link</span>
          </button>
        </div>
      ) : (
        <div className="url-input-container">
          <input
            type="text"
            className="url-input"
            placeholder="Paste image URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            autoFocus
          />
          <div className="url-input-actions">
            <button className="url-action-button cancel" onClick={() => {
              setShowUrlInput(false)
              setUrlInput('')
            }}>
              Cancel
            </button>
            <button className="url-action-button submit" onClick={handleUrlSubmit}>
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUploadPopup
