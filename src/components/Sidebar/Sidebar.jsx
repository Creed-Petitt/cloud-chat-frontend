import { MoreVertical, ChevronLast, ChevronFirst, LogOut } from "lucide-react"
import { IoAdd, IoImagesOutline, IoEllipsisHorizontal } from "react-icons/io5"
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
  const { conversations, currentConversation, selectConversation, startNewConversation } = useContext(Context)
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
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff">
      <path d="M480-80q-134 0-227-93t-93-227v-200q0-122 96-201t224-79q128 0 224 79t96 201v520H480Zm0-80h80q-19-25-29.5-55.5T520-280v-42q-10 1-20 1.5t-20 .5q-67 0-129.5-23.5T240-415v15q0 100 70 170t170 70Zm120-120q0 50 35 85t85 35v-255q-26 26-56 44.5T600-340v60ZM440-560q0-66-45-111t-109-48q-22 24-34 54t-12 65q0 89 72.5 144.5T480-400q95 0 167.5-55.5T720-600q0-35-12-65.5T674-720q-64 2-109 48t-45 112h-80Zm-100 0q-17 0-28.5-11.5T300-600q0-17 11.5-28.5T340-640q17 0 28.5 11.5T380-600q0 17-11.5 28.5T340-560Zm280 0q-17 0-28.5-11.5T580-600q0-17 11.5-28.5T620-640q17 0 28.5 11.5T660-600q0 17-11.5 28.5T620-560ZM370-778q34 14 62 37t48 52q20-29 47.5-52t61.5-37q-25-11-52.5-16.5T480-800q-29 0-56.5 5.5T370-778Zm430 618H520h280Zm-320 0q-100 0-170-70t-70-170q0 100 70 170t170 70h80-80Zm120-120q0 50 35 85t85 35q-50 0-85-35t-35-85ZM480-689Z"/>
    </svg>
  )
  
  return (
    <aside className={`sidebar ${expanded ? "" : "collapsed"}`}>
      <nav className="sidebar-nav">

        <div className={`sidebar-header ${expanded ? "" : "collapsed"}`}>
          <div className={`sidebar-brand ${expanded ? "expanded" : "collapsed"}`}>
            <AetherisLogo />
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
            className={`sidebar-action-btn ${expanded ? 'expanded' : 'collapsed'}`}
          >
            <IoAdd size={20} />
            <span className={`sidebar-action-text ${expanded ? 'expanded' : 'collapsed'}`}>
              New Chat
            </span>
            {!expanded && (
              <div className="sidebar-item-tooltip">
                New Chat
              </div>
            )}
          </button>

          <button className={`sidebar-action-btn ${expanded ? 'expanded' : 'collapsed'}`}>
            <IoImagesOutline size={20} />
            <span className={`sidebar-action-text ${expanded ? 'expanded' : 'collapsed'}`}>
              Images
            </span>
            {!expanded && (
              <div className="sidebar-item-tooltip">
                Images
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
                    <button className="sidebar-chat-menu">
                      <IoEllipsisHorizontal size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
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