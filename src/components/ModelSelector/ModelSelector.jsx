import { useState, useRef, useEffect } from 'react'
import './ModelSelector.css'

const ModelSelector = ({ currentModel, setCurrentModel, isImageMode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Filter models based on image mode
  const allModels = [
    { id: 'gemini', name: 'Gemini' },
    { id: 'claude', name: 'Claude' },
    { id: 'openai', name: 'OpenAI' }
  ]

  const models = isImageMode 
    ? allModels.filter(m => m.id === 'gemini')  // Only Gemini for images
    : allModels.filter(m => m.id !== 'gemini'); // Only OpenAI and Claude for chat

  const currentModelData = models.find(model => model.id === currentModel) || models[0]

  const handleModelSelect = (modelId) => {
    setCurrentModel(modelId)
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="model-selector" ref={dropdownRef}>
      <button
        className={`model-selector-trigger ${isImageMode ? 'disabled' : ''}`}
        onClick={() => !isImageMode && setIsOpen(!isOpen)}
        disabled={isImageMode}
        aria-label={`Current model: ${currentModelData.name}`}
      >
        <span className="model-name">{currentModelData.name}</span>
        <svg
          className={`chevron ${isOpen ? 'open' : ''}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>

      {isOpen && !isImageMode && (
        <div className="model-selector-dropdown">
          {models.map((model) => (
            <button
              key={model.id}
              className={`model-option ${model.id === currentModel ? 'active' : ''}`}
              onClick={() => handleModelSelect(model.id)}
            >
              <span>{model.name}</span>
              {model.id === currentModel && (
                <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ModelSelector