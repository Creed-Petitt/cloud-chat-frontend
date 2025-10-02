import { MoreVertical, ChevronLast, ChevronFirst, LogOut } from "lucide-react"
import { IoAdd, IoImagesOutline, IoClose } from "react-icons/io5"
import { HiPlus, HiPhoto } from "react-icons/hi2"
import { useState, useEffect, useRef, useContext } from "react"
import { useAuth } from '../../context/AuthContext'
import { Context } from '../../context/ContextProvider'
import AuthModal from '../AuthModal/AuthModal'
import './Sidebar.css'

export default function Sidebar({ onExpandedChange }) {
  const [expanded, setExpanded] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const { currentUser: user, logout: signOut } = useAuth()
  const { conversations, currentConversation, selectConversation, startNewConversation, deleteConversation, setCurrentView } = useContext(Context)
  const userMenuRef = useRef(null)
  
  const handleExpandToggle = () => {
    const newExpanded = !expanded
    setExpanded(newExpanded)
    if (onExpandedChange) {
      onExpandedChange(newExpanded)
    }
  }
  
  const recentChats = conversations.map(conv => ({
    id: conv.id,
    title: conv.title || 'Untitled Chat',
    timestamp: conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString() : ''
  }));

  const handleChatClick = (chatId) => {
    selectConversation(chatId);
    setCurrentView('chat');
  }

  const handleNewChat = () => {
    startNewConversation();
    setCurrentView('chat');
  }

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation(); // Prevent selecting the chat when clicking delete
    deleteConversation(chatId);
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleUserSectionClick = () => {
    if (user) {
      setShowUserMenu(!showUserMenu)
    } else {
      setIsAuthModalOpen(true)
    }
  }

  const getUserDisplayName = () => {
    if (!user) return 'Guest'
    return user.displayName || user.email?.split('@')[0] || 'User'
  }

  const getUserEmail = () => {
    return user?.email || 'Not signed in'
  }

  const getUserAvatar = () => {
    if (user?.photoURL) {
      return user.photoURL
    }

    const name = getUserDisplayName()
    const bgColor = user ? '0ccc46' : 'cccccc'
    const textColor = user ? '161cbe' : '333333'
    return `https://ui-avatars.com/api/?background=${bgColor}&color=${textColor}&bold=true&name=${encodeURIComponent(name)}`
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const AetherisLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#ffffff"><path d="M449-539q21 0 35.5-14.5T499-589q0-21-14.5-35.5T449-639q-21 0-35.5 14.5T399-589q0 21 14.5 35.5T449-539ZM822-80q-42 0-113-35t-152-95q-19 5-38.5 7.5T479-200q-117 0-198-81t-81-198q0-20 3-40t8-39q-59-81-94.5-151.5T81-822q0-27 15-42.5t41-15.5q26 0 67.5 18T319-801q-21 11-39 23t-35 26q-19-11-37-19t-38-17q18 38 38.5 74t43.5 71q38-54 97-85t130-31q117 0 198.5 81.5T759-479q0 71-31.5 130T642-252q35 23 71.5 44t74.5 38q-8-19-16.5-37T752-244q15-17 27-36t22-39q46 78 62.5 116.5T880-138q0 29-16 43.5T822-80ZM549-359q17 0 28.5-11.5T589-399q0-17-11.5-28.5T549-439q-17 0-28.5 11.5T509-399q0 17 11.5 28.5T549-359Zm50-140q13 0 21.5-8.5T629-529q0-13-8.5-21.5T599-559q-13 0-21.5 8.5T569-529q0 13 8.5 21.5T599-499ZM468-281q-51-44-98-91t-90-98q2 38 17 71.5t41 59.5q26 26 59 41t71 17Zm103-21q48-25 78-72.5T679-480q0-83-58.5-141T479-679q-58 0-105 30t-72 78q57 76 125 144t144 125Zm-197-73Zm117-116Z"/></svg>
  )
  
  return (
    <aside className={`sidebar ${expanded ? "" : "collapsed"}`}>
      <nav className="sidebar-nav">

        <div className={`sidebar-header`}>
          <div className={`sidebar-brand ${expanded ? "expanded" : "collapsed"}`}>
            <div style={{ paddingLeft: '8px'}}>
              <AetherisLogo />
            </div>
          </div>
          <button
            onClick={handleExpandToggle}
            className="sidebar-toggle"
          >
            {expanded ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
          </button>
        </div>

        <div className="sidebar-content">
          <button 
            onClick={handleNewChat}
            className={`sidebar-action-btn`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#a0a0a0"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z"/></svg>
            <span className={`sidebar-action-text ${expanded ? 'expanded' : 'collapsed'}`}>
              New Chat
            </span>
            {!expanded && (
              <div className="sidebar-item-tooltip">
                New Chat
              </div>
            )}
          </button>

          <button onClick={() => setCurrentView('images')} className={`sidebar-action-btn`}>
            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#a0a0a0"><path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 32.5-156t88-127Q256-817 330-848.5T488-880q80 0 151 27.5t124.5 76q53.5 48.5 85 115T880-518q0 115-70 176.5T640-280h-74q-9 0-12.5 5t-3.5 11q0 12 15 34.5t15 51.5q0 50-27.5 74T480-80Zm0-400Zm-220 40q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm120-160q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm200 0q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm120 160q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17ZM480-160q9 0 14.5-5t5.5-13q0-14-15-33t-15-57q0-42 29-67t71-25h70q66 0 113-38.5T800-518q0-121-92.5-201.5T488-800q-136 0-232 93t-96 227q0 133 93.5 226.5T480-160Z"/></svg>
            <span className={`sidebar-action-text ${expanded ? 'expanded' : 'collapsed'}`}>
              Gallery
            </span>
            {!expanded && (
              <div className="sidebar-item-tooltip">
                Gallery
              </div>
            )}
          </button>
          {expanded && (
            <div className="sidebar-section">
              <div className="sidebar-section-header expanded recents-header">
                <span className="sidebar-section-title expanded">
                  Recents
                </span>
              </div>
              
              <ul className="sidebar-chat-list">
                {recentChats.map((chat) => (
                  <li 
                    key={chat.id}
                    className={`sidebar-chat-item ${currentConversation?.id === chat.id ? 'active' : ''}`}
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <div className="sidebar-chat-content">
                      <span className="sidebar-chat-title">
                        {chat.title.length > 35 ? `${chat.title.substring(0, 35)}...` : chat.title}
                      </span>
                    </div>
                    <button
                      className="sidebar-chat-menu"
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                    >
                      <IoClose size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user-section">
            {user ? (
              <img
                src={getUserAvatar()}
                alt=""
                className="sidebar-avatar"
              />
            ) : (
              <div className="sidebar-avatar-guest">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                  <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/>
                </svg>
              </div>
            )}
            <div className={`sidebar-user-info ${expanded ? "expanded" : "collapsed"}`}>
              {user && <h4 className="sidebar-user-name">{getUserDisplayName()}</h4>}
              {user && (
                <button
                  className="sidebar-user-menu-trigger"
                  onClick={handleUserSectionClick}
                >
                  <MoreVertical size={16} />
                </button>
              )}
              {!user && expanded && (
                <button className="sidebar-signin-button" onClick={handleUserSectionClick}>
                  Sign In
                </button>
              )}
            </div>
          </div>
          {showUserMenu && user && expanded && (
            <div className="sidebar-user-menu" ref={userMenuRef}>
              <button 
                className="sidebar-user-menu-item"
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </nav>
    </aside>
  )
}