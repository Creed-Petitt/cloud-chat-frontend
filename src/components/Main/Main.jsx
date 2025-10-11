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

	    const handleImageGenCard = (prompt) => {
	        setIsImageMode(true);
	        setCurrentModel('imagen');
	        generateImage(prompt);
	    };
	const handleFileUploadCard = (prompt, acceptType = 'image/*,application/pdf') => {
		setInput(prompt);
		setIsImageMode(false);
		setCurrentModel('openai');
		if (fileInputRef.current) {
			fileInputRef.current.accept = acceptType;
			fileInputRef.current.click();
		}
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
		if (currentUser?.isAnonymous) return 'Guest';
		if (currentUser?.displayName) {
			return currentUser.displayName.split(' ')[0];
		}
		if (currentUser?.email) {
			return currentUser.email.split('@')[0];
		}
		return 'Guest';
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
									<div
										className="card"
										onMouseEnter={() => {
											setInput("Create a futuristic cityscape at sunset in ultra realistic style, with towering skyscrapers and warm golden light");
											setIsImageMode(true);
											setCurrentModel('imagen');
										}}
										onMouseLeave={() => {
											setInput("");
											setIsImageMode(false);
										}}
										onClick={() => handleImageGenCard("Create a futuristic cityscape at sunset in ultra realistic style, with towering skyscrapers and warm golden light")}
									>
										<p>Create a futuristic cityscape at sunset</p>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#b8b8b8"><path d="m734-556-56-58 86-84 56 56-86 86ZM80-160v-80h800v80H80Zm360-520v-120h80v120h-80ZM226-558l-84-86 56-56 86 86-58 56Zm71 158h366q-23-54-72-87t-111-33q-62 0-111 33t-72 87Zm-97 80q0-117 81.5-198.5T480-600q117 0 198.5 81.5T760-320H200Zm280-80Z"/></svg>
									</div>
									<div
										className="card"
										onMouseEnter={() => {
											setInput("I need to design a database schema for a new project. Could you help me create it? I can provide details about the project's requirements, the types of data I need to store, and the relationships between them. Please ask me questions to help elicit the necessary information to generate a well-structured schema.");
											setIsImageMode(false);
											setCurrentModel('openai');
										}}
										onMouseLeave={() => {
											setInput("");
										}}
										onClick={() => getChatResponse("I need to design a database schema for a new project. Could you help me create it? I can provide details about the project's requirements, the types of data I need to store, and the relationships between them. Please ask me questions to help elicit the necessary information to generate a well-structured schema.", null)}
									>
										<p>Create a database schema</p>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#b8b8b8"><path d="M480-120q-151 0-255.5-46.5T120-280v-400q0-66 105.5-113T480-840q149 0 254.5 47T840-680v400q0 67-104.5 113.5T480-120Zm0-479q89 0 179-25.5T760-679q-11-29-100.5-55T480-760q-91 0-178.5 25.5T200-679q14 30 101.5 55T480-599Zm0 199q42 0 81-4t74.5-11.5q35.5-7.5 67-18.5t57.5-25v-120q-26 14-57.5 25t-67 18.5Q600-528 561-524t-81 4q-42 0-82-4t-75.5-11.5Q287-543 256-554t-56-25v120q25 14 56 25t66.5 18.5Q358-408 398-404t82 4Zm0 200q46 0 93.5-7t87.5-18.5q40-11.5 67-26t32-29.5v-98q-26 14-57.5 25t-67 18.5Q600-328 561-324t-81 4q-42 0-82-4t-75.5-11.5Q287-343 256-354t-56-25v99q5 15 31.5 29t66.5 25.5q40 11.5 88 18.5t94 7Z"/></svg>
									</div>
									<div
										className="card"
										onMouseEnter={() => {
											setInput("I have a project idea I'd like to plan out. Could you help me break it down into actionable steps? Specifically, I'm looking for: tech stack recommendations, core features to prioritize first, and potential challenges. Feel free to ask me clarifying questions about my idea, timeline, or technical constraints. Keep your response practical and conversational.");
											setIsImageMode(false);
											setCurrentModel('openai');
										}}
										onMouseLeave={() => {
											setInput("");
										}}
										onClick={() => getChatResponse("I have a project idea I'd like to plan out. Could you help me break it down into actionable steps? Specifically, I'm looking for: tech stack recommendations, core features to prioritize first, and potential challenges. Feel free to ask me clarifying questions about my idea, timeline, or technical constraints. Keep your response practical and conversational.", null)}
									>
										<p>Help me plan my next full stack website</p>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#b8b8b8"><path d="M160-240v-480 520-40Zm0 80q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v200h-80v-200H447l-80-80H160v480h200v80H160ZM584-56 440-200l144-144 56 57-87 87 87 87-56 57Zm192 0-56-57 87-87-87-87 56-57 144 144L776-56Z"/></svg>
									</div>
									<div
										className="card"
										onClick={() => handleFileUploadCard("I'm uploading my resume. Could you review it and provide constructive feedback on: structure and formatting, content clarity, how well it highlights my skills and experience, and any suggestions for improvement? Please be specific and actionable in your recommendations.", "application/pdf")}
									>
										<p>Review my resume and give feedback</p>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#b8b8b8">
											<path d="M200-800v241-1 400-640 200-200Zm0 720q-33 0-56.5-23.5T120-160v-640q0-33 23.5-56.5T200-880h320l240 240v100q-19-8-39-12.5t-41-6.5v-41H480v-200H200v640h241q16 24 36 44.5T521-80H200Zm460-120q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29ZM864-40 756-148q-21 14-45.5 21t-50.5 7q-75 0-127.5-52.5T480-300q0-75 52.5-127.5T660-480q75 0 127.5 52.5T840-300q0 26-7 50.5T812-204L920-96l-56 56Z"/>
										</svg>
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