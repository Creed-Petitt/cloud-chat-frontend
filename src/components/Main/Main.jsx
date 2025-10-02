import './Main.css'
import { useContext, useRef, useEffect, useState } from 'react'
import { Context } from '../../context/ContextProvider'
import { useAuth } from '../../context/AuthContext'
import { formatMessageContent } from '../../utils/textFormatter';
import ModelSelector from '../ModelSelector/ModelSelector';
import ImageGallery from '../ImageGallery/ImageGallery';
import ImageModal from '../ImageModal/ImageModal';
import FileUploadPopup from '../FileUploadPopup/FileUploadPopup';
import FilePreview from '../FilePreview/FilePreview';


const Main = () => {
	const messagesEndRef = useRef(null);
	const textareaRef = useRef(null);
	const [selectedImage, setSelectedImage] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
	const [showFilePopup, setShowFilePopup] = useState(false);
	const fileInputRef = useRef(null);

	const {
        loading,
        input,
        setInput,
        showResult,
        getChatResponse,
        generateImage,
        messages,
        currentModel,
        setCurrentModel,
		isImageMode,
		setIsImageMode,
		currentView,
		uploadFile
    } = useContext(Context);

	const { currentUser } = useAuth();

	const scrollToBottom = (instant = false) => {
		messagesEndRef.current?.scrollIntoView({ behavior: instant ? "auto" : "smooth" });
	};

	// Auto-resize textarea
	const adjustTextareaHeight = () => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto'; // Reset height
			// If input is empty, keep it at minimum height
			if (!input.trim()) {
				textarea.style.height = 'auto';
			} else {
				const newHeight = Math.min(textarea.scrollHeight, 200); // Max 200px
				textarea.style.height = `${newHeight}px`;
			}
		}
	};

	useEffect(() => {
		if (currentView === 'chat' && messages.length > 0) {
			// Instant scroll on first load, smooth for new messages
			const isFirstLoad = messages.length > 2;
			scrollToBottom(isFirstLoad);
		}
	}, [messages, loading, currentView]);

	// Auto-adjust textarea height when input changes
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		adjustTextareaHeight();
	}, [input]);

	// Add click listeners to chat images
	useEffect(() => {
		const handleImageClick = (e) => {
			if (e.target.classList.contains('chat-image')) {
				setSelectedImage({
					imageUrl: e.target.src,
					prompt: e.target.alt
				});
			}
		};

		document.addEventListener('click', handleImageClick);
		return () => document.removeEventListener('click', handleImageClick);
	}, []);

	const handleCardClick = (prompt) => {
		setInput(prompt);
		getChatResponse(prompt);
	};

	const handleSend = async () => {
		// Allow sending if either input has text OR a file/image is selected
		if (!input.trim() && !selectedFile && !uploadedImageUrl) return;

		let imageUrl = null;
		let messageText = input.trim();

		// Upload file first if selected
		if (selectedFile) {
			try {
				imageUrl = await uploadFile(selectedFile);

				// If no text was entered, use the filename as placeholder
				if (!messageText) {
					const fileExtension = selectedFile.name.split('.').pop().toUpperCase();
					messageText = `[Attached ${fileExtension}: ${selectedFile.name}]`;
				}
			} catch (error) {
				console.error('Error uploading file:', error);
				// Continue with message send even if upload fails
			}
		} else if (uploadedImageUrl) {
			// Use the URL that was pasted
			imageUrl = uploadedImageUrl;

			// If no text was entered, use a placeholder
			if (!messageText) {
				messageText = '[Attached image from URL]';
			}
		}

		if (isImageMode) {
			generateImage(input);
		} else {
			getChatResponse(messageText, imageUrl);
		}

		setInput("");
		// Clear file after sending
		setSelectedFile(null);
		setUploadedImageUrl(null);
		// Reset textarea height after clearing
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
		}
	};

	const handleKeyDown = (e) => {
		// Allow Enter to send if there's text input OR a file/image is selected
		if (e.key === 'Enter' && !e.shiftKey && (input.trim() || selectedFile || uploadedImageUrl)) {
			e.preventDefault();
			handleSend();
		}
	};

	const getUserDisplayName = () => {
		if (!currentUser) return 'Guest';
		if (currentUser.displayName) {
			return currentUser.displayName.split(' ')[0];
		}
		if (currentUser.email) {
			return currentUser.email.split('@')[0];
		}
		return 'User';
	};

	const handleFileInputChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setSelectedFile(file);
			setUploadedImageUrl(null);
			setShowFilePopup(false);
			// Reset input so same file can be selected again
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleUrlSelect = (url) => {
		setUploadedImageUrl(url);
		setSelectedFile(null); // Clear file if URL is selected
	};

	const handleRemoveFile = () => {
		setSelectedFile(null);
		setUploadedImageUrl(null);
	};

	return (
		<div className="main">
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*,application/pdf"
				onChange={handleFileInputChange}
				style={{ display: 'none' }}
			/>
			<div className="nav">
				<p>{currentView === 'images' ? 'Gallery' : 'CloudChat'}</p>
			</div>
			{currentView === 'chat' ? (
				<>
					<div className={`main-container${!showResult ? ' centered' : ''}`}>
						{!showResult ?
							<>
								<div className="greet">
									<p><span>Hello, {getUserDisplayName()}!</span></p>
									<p>{currentUser ? "What can I help you with today?" : "Sign in to save your images"}</p>
								</div>
								<div className="cards">
									<div className="card" onClick={() => handleCardClick("Explain the concept of cloud computing.")}>
										<p>Explain the concept of cloud computing.</p>
										<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M160-160v-80h109q-51-44-80-106t-29-134q0-112 68-197.5T400-790v84q-70 25-115 86.5T240-480q0 54 21.5 99.5T320-302v-98h80v240H160Zm440 0q-50 0-85-35t-35-85q0-48 33-82.5t81-36.5q17-36 50.5-58.5T720-480q53 0 91.5 34.5T858-360q42 0 72 29t30 70q0 42-29 71.5T860-160H600Zm116-360q-7-41-27-76t-49-62v98h-80v-240h240v80H691q43 38 70.5 89T797-520h-81ZM600-240h260q8 0 14-6t6-14q0-8-6-14t-14-6h-70v-50q0-29-20.5-49.5T720-400q-29 0-49.5 20.5T650-330v10h-50q-17 0-28.5 11.5T560-280q0 17 11.5 28.5T600-240Zm120-80Z" /></svg>
									</div>
									<div className="card" onClick={() => handleCardClick("Tell me how computers operate at a low level")}>
										<p>Tell me how computers operate at a low level</p>
										<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M40-120v-80h880v80H40Zm120-120q-33 0-56.5-23.5T80-320v-440q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v440q0 33-23.5 56.5T800-240H160Zm0-80h640v-440H160v440Zm0 0v-440 440Z" /></svg>
									</div>
									<div className="card" onClick={() => handleCardClick("Give me a detailed breakdown on how the internet works")}>
										<p>Give me a detailed breakdown on how the internet works</p>
										<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M196-276q-57-60-86.5-133T80-560q0-78 29.5-151T196-844l48 48q-48 48-72 110.5T148-560q0 63 24 125.5T244-324l-48 48Zm96-96q-39-39-59.5-88T212-560q0-51 20.5-100t59.5-88l48 48q-30 27-45 64t-15 76q0 36 15 73t45 67l-48 48ZM280-80l135-405q-16-14-25.5-33t-9.5-42q0-42 29-71t71-29q42 0 71 29t29 71q0 23-9.5 42T545-485L680-80h-80l-26-80H387l-27 80h-80Zm133-160h134l-67-200-67 200Zm255-132-48-48q30-27 45-64t15-76q0-36-15-73t-45-67l48-48q39 39 58 88t22 100q0 51-20.5 100T668-372Zm96 96-48-48q48-48 72-110.5T812-560q0-63-24-125.5T716-796l48-48q57 60 86.5 133T880-560q0 78-28 151t-88 133Z" /></svg>
									</div>
									<div className="card" onClick={() => handleCardClick("Give me 5 creative ideas for a weekend project I can build using Python")}>
										<p>Give me 5 creative ideas for a weekend project I can build using Python</p>
										<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M320-240 80-480l240-240 57 57-184 184 183 183-56 56Zm320 0-57-57 184-184-183-183 56-56 240 240-240 240Z" /></svg>
									</div>
								</div>
							</> :
							<div className="result">
								{messages.map((message, index) => {
									const messageType = message.messageType || message.type;
									const messageContent = message.content;
									const imageUrl = message.imageUrl;

									if (messageType === 'USER') {
										return (
											<div key={message.id || index} className="message user">
												<div className="user-message">
													<div className="message-content">
														{imageUrl && (
															<div className="message-file-wrapper">
																<FilePreview imageUrl={imageUrl} onRemove={null} />
															</div>
														)}
														<p>{messageContent}</p>
													</div>
												</div>
											</div>
										);
								} else {
									let finalContent;
									// Check if message has an imageUrl (either messageType=IMAGE or ASSISTANT with imageUrl)
									if (imageUrl || messageType === 'IMAGE') {
										const url = imageUrl || (messageContent.match(/\(([^)]+)\)/) || [])[1];
										finalContent = url ? `![Image](${url})` : "Image not available";
									} else {
										finalContent = messageContent;
									}
									return (
										<div key={message.id || index} className="message assistant">
											<div className="ai-message">
												<div className="message-content">
													<div dangerouslySetInnerHTML={{
														__html: formatMessageContent(finalContent)
													}}></div>
												</div>
											</div>
										</div>
									);
								}
								})}
								<div ref={messagesEndRef} />
							</div>}
					</div>
					<div className="main-bottom">
						<div className="search-box">
							{(selectedFile || uploadedImageUrl) && (
								<FilePreview
									file={selectedFile}
									imageUrl={uploadedImageUrl}
									onRemove={handleRemoveFile}
								/>
							)}
							<div className="search-box-input-area">
								<textarea
									ref={textareaRef}
									onChange={(e) => {
										setInput(e.target.value);
										adjustTextareaHeight();
									}}
									onKeyDown={handleKeyDown}
									value={input}
									placeholder={isImageMode ? 'Enter a prompt to generate an image...' : 'How can I help you today?'}
									rows="1"
									style={{ overflow: 'hidden' }}
								/>
							</div>

							<div className="search-box-controls">
								<div className="search-box-left-controls">
									<div className="icon-wrapper" onClick={() => setShowFilePopup(!showFilePopup)} style={{ position: 'relative' }}>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#b8b8b8">
											<path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
										</svg>
										<FileUploadPopup
											isOpen={showFilePopup}
											onClose={() => setShowFilePopup(false)}
											onUploadClick={handleUploadClick}
											onUrlSelect={handleUrlSelect}
										/>
									</div>
					<div className={`icon-wrapper ${isImageMode ? 'active' : ''}`} onClick={() => setIsImageMode(!isImageMode)}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#b8b8b8">
							<path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 32.5-156t88-127Q256-817 330-848.5T488-880q80 0 151 27.5t124.5 76q53.5 48.5 85 115T880-518q0 115-70 176.5T640-280h-74q-9 0-12.5 5t-3.5 11q0 12 15 34.5t15 51.5q0 50-27.5 74T480-80Zm0-400Zm-220 40q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm120-160q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm200 0q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm120 160q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17ZM480-160q9 0 14.5-5t5.5-13q0-14-15-33t-15-57q0-42 29-67t71-25h70q66 0 113-38.5T800-518q0-121-92.5-201.5T488-800q-136 0-232 93t-96 227q0 133 93.5 226.5T480-160Z"/>
						</svg>
					</div>
									<ModelSelector currentModel={currentModel} setCurrentModel={setCurrentModel} isImageMode={isImageMode} />
								</div>
								<div className="search-box-right-controls">
								<button onClick={handleSend} className="send-button">
									<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
										<path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
									</svg>
								</button>
								</div>
							</div>
						</div>
					</div>
				</>
			) : (
				<ImageGallery />
			)}
			<ImageModal
				imageUrl={selectedImage?.imageUrl}
				prompt={selectedImage?.prompt}
				isOpen={!!selectedImage}
				onClose={() => setSelectedImage(null)}
			/>
		</div>
	)
}

export default Main