import './Main.css'
import { useContext } from 'react'
import { Context } from '../../context/ContextProvider'
import { useAuth } from '../../context/AuthContext'
import { formatMessageContent } from '../../utils/textFormatter'


const Main = () => {

	const { 
        loading, 
        resultData, 
        input, 
        setInput, 
        recentPrompt, 
        setRecentPrompt, 
        prevPrompts, 
        setPrevPrompts, 
        showResult, 
        setShowResult, 
        getChatResponse,
        messages,
        currentConversation,
        currentModel,
        setCurrentModel
    } = useContext(Context);

	const { currentUser } = useAuth();

	const handleCardClick = (prompt) => {
		setInput(prompt);
		// Pass the prompt directly to getChatResponse
		getChatResponse(prompt);
	};

	const getUserDisplayName = () => {
		if (!currentUser) return 'Guest';
		// Try to get first name from displayName
		if (currentUser.displayName) {
			return currentUser.displayName.split(' ')[0];
		}
		// Fallback to email username
		if (currentUser.email) {
			return currentUser.email.split('@')[0];
		}
		return 'User';
	};

	return (
		<div className="main">
			<div className="nav">
				<p>Aethereus</p>
				<div className="model-selector">
					<label htmlFor="model-select">AI Model:</label>
					<select 
						id="model-select"
						value={currentModel} 
						onChange={(e) => setCurrentModel(e.target.value)}
						className="model-dropdown"
					>
						<option value="gemini">Gemini</option>
						<option value="claude">Claude</option>
						<option value="openai">OpenAI</option>
					</select>
				</div>
			</div>
			<div className="main-container">
				{!showResult ?
					<>
						<div className="greet">
							<p><span>Hello, {getUserDisplayName()}</span></p>
							<p>Share your wildest thoughts...</p>
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
						{currentConversation && messages.length > 1 ? (
							<div className="conversation-history">
								{messages.map((message, index) => (
									<div key={message.id || index} className={`message ${message.type.toLowerCase()}`}>
										{message.type === 'USER' ? (
											<div className="user-message">
												<div className="message-content">
													<p>{message.content}</p>
												</div>
											</div>
										) : (
											<div className="ai-message">
												<div className="message-content">
													<div dangerouslySetInnerHTML={{ 
														__html: formatMessageContent(message.content) 
													}}></div>
												</div>
											</div>
										)}
									</div>
								))}
								{loading && (
									<div className="ai-message">
										<div className="message-content">
											<p>Loading...</p>
										</div>
									</div>
								)}
							</div>
						) : (
							<>
								<div className="user-message">
									<div className="message-content">
										<p>{recentPrompt}</p>
									</div>
								</div>
								<div className="ai-message">
									<div className="message-content">
										{loading ? <p>Loading...</p> : <p dangerouslySetInnerHTML={{ __html: resultData }}></p>}
									</div>
								</div>
							</>
						)}
					</div>}

				<div className="bottom">
					<div className="search-box">
						<input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='Whisper the question you would never dare to ask aloud' className="input" />
						<div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								height="24px" viewBox="0 -960 960 960"
								width="24px" fill="#e3e3e3"><path
									d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h320v80H200v560h560v-320h80v320q0 33-23.5 56.5T760-120H200Zm40-160h480L570-480 450-320l-90-120-120 160Zm440-320v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z" />
							</svg>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								height="24px" viewBox="0 -960 960 960"
								width="24px" fill="#e3e3e3"><path
									d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z" /></svg>
							<svg onClick={() => getChatResponse()}
								xmlns="http://www.w3.org/2000/svg"
								height="24px" viewBox="0 -960 960 960"
								width="24px" fill="#e3e3e3"><path
									d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" /></svg>
						</div>
					</div>
					<p>Even the wisest spirits may sometimes whisper truths that fade—take each revelation as a guide, not a certainty.</p>
				</div>
			</div>
		</div>
	)
}

export default Main