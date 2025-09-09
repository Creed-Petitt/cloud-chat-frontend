import Sidebar from './components/Sidebar/Sidebar'
import Main from './components/Main/Main'
import { useState } from 'react'

const App = () => {
	const [sidebarExpanded, setSidebarExpanded] = useState(true)
	
	return (
		<div style={{ display: 'flex' }}>
			<Sidebar onExpandedChange={setSidebarExpanded} />
			<div style={{ 
				marginLeft: sidebarExpanded ? '260px' : '48px', 
				width: sidebarExpanded ? 'calc(100vw - 260px)' : 'calc(100vw - 48px)', 
				height: '100vh',
				transition: 'margin-left 0.3s ease, width 0.3s ease'
			}}>
				{<Main />}
			</div>
		</div>
	)
}

export default App
