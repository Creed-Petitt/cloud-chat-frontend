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
  const { conversations, currentConversation, selectConversation, startNewConversation, deleteConversation } = useContext(Context)
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
  }

  const handleNewChat = () => {
    startNewConversation();
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
    return `https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true&name=${encodeURIComponent(name)}`
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
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M449-539q21 0 35.5-14.5T499-589q0-21-14.5-35.5T449-639q-21 0-35.5 14.5T399-589q0 21 14.5 35.5T449-539ZM822-80q-42 0-113-35t-152-95q-19 5-38.5 7.5T479-200q-117 0-198-81t-81-198q0-20 3-40t8-39q-59-81-94.5-151.5T81-822q0-27 15-42.5t41-15.5q26 0 67.5 18T319-801q-21 11-39 23t-35 26q-19-11-37-19t-38-17q18 38 38.5 74t43.5 71q38-54 97-85t130-31q117 0 198.5 81.5T759-479q0 71-31.5 130T642-252q35 23 71.5 44t74.5 38q-8-19-16.5-37T752-244q15-17 27-36t22-39q46 78 62.5 116.5T880-138q0 29-16 43.5T822-80ZM549-359q17 0 28.5-11.5T589-399q0-17-11.5-28.5T549-439q-17 0-28.5 11.5T509-399q0 17 11.5 28.5T549-359Zm50-140q13 0 21.5-8.5T629-529q0-13-8.5-21.5T599-559q-13 0-21.5 8.5T569-529q0 13 8.5 21.5T599-499ZM468-281q-51-44-98-91t-90-98q2 38 17 71.5t41 59.5q26 26 59 41t71 17Zm103-21q48-25 78-72.5T679-480q0-83-58.5-141T479-679q-58 0-105 30t-72 78q57 76 125 144t144 125Zm-197-73Zm117-116Z"/></svg>
  )
  
  return (
    <aside className={`sidebar ${expanded ? "" : "collapsed"}`}>
      <nav className="sidebar-nav">

        <div className={`sidebar-header`}>
          <div className={`sidebar-brand ${expanded ? "expanded" : "collapsed"}`}>
            <div style={{ paddingLeft: '4px'}}>
              <AetherisLogo />
            </div>
          </div>
          <button
            onClick={handleExpandToggle}
            className="sidebar-toggle"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <div className="sidebar-content">
          <button 
            onClick={handleNewChat}
            className={`sidebar-action-btn`}
          >
            <HiPlus size={20} />
            <span className={`sidebar-action-text ${expanded ? 'expanded' : 'collapsed'}`}>
              New Chat
            </span>
            {!expanded && (
              <div className="sidebar-item-tooltip">
                New Chat
              </div>
            )}
          </button>

          <button className={`sidebar-action-btn`}>
            <HiPhoto size={20} />
            <span className={`sidebar-action-text ${expanded ? 'expanded' : 'collapsed'}`}>
              Images
            </span>
            {!expanded && (
              <div className="sidebar-item-tooltip">
                Images
              </div>
            )}
          </button>
          <div className={`sidebar-section ${expanded ? '' : 'collapsed'}`}>
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
                    <IoClose size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sidebar-footer">
          <div 
            className="sidebar-user-section"
            onClick={handleUserSectionClick}
          >
            <img
              src={getUserAvatar()}
              alt=""
              className="sidebar-avatar"
            />
            <div className={`sidebar-user-info ${expanded ? "expanded" : "collapsed"}`}>
              <div className="sidebar-user-details">
                <h4 className="sidebar-user-name">{getUserDisplayName()}</h4>
                <span className="sidebar-user-email">{getUserEmail()}</span>
              </div>
              {user && <MoreVertical size={20} />}
              {!user && expanded && (
                <button className="sidebar-signin-button">
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