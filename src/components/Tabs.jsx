/**
 * Tabs Component - Accessible tabbed content with keyboard navigation
 *
 * Features:
 * - Underline-style design
 * - Full keyboard navigation (Arrow keys, Home, End)
 * - ARIA attributes for accessibility
 * - Automatic focus management
 *
 * Usage:
 * <Tabs defaultTab="tab1">
 *   <Tabs.List>
 *     <Tabs.Tab id="tab1">Ingredients</Tabs.Tab>
 *     <Tabs.Tab id="tab2">Instructions</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panel id="panel1">Ingredients content...</Tabs.Panel>
 *   <Tabs.Panel id="panel2">Instructions content...</Tabs.Panel>
 * </Tabs>
 */

import { useState, useRef, useEffect } from 'react';
import './Tabs.css';

const Tabs = ({ children, defaultTab = null }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const tabListRef = useRef(null);
  const tabRefs = useRef({});

  // Initialize activeTab to first tab if not set
  useEffect(() => {
    if (!activeTab && tabListRef.current) {
      const firstTab = tabListRef.current.querySelector('[role="tab"]');
      if (firstTab) {
        setActiveTab(firstTab.id);
      }
    }
  }, [activeTab]);

  const handleKeyDown = (e) => {
    if (!tabListRef.current) return;

    const tabs = Array.from(tabListRef.current.querySelectorAll('[role="tab"]'));
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);

    let newTab = null;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newTab = tabs[(currentIndex + 1) % tabs.length];
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
        break;
      case 'Home':
        e.preventDefault();
        newTab = tabs[0];
        break;
      case 'End':
        e.preventDefault();
        newTab = tabs[tabs.length - 1];
        break;
      default:
        return;
    }

    if (newTab) {
      setActiveTab(newTab.id);
      newTab.focus();
    }
  };

  return (
    <div className="tabs-root">
      {Array.isArray(children)
        ? children.map(child => {
            if (child.type === TabsList) {
              return (
                <TabsList
                  key="tablist"
                  ref={tabListRef}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onKeyDown={handleKeyDown}
                  tabRefs={tabRefs}
                >
                  {child.props.children}
                </TabsList>
              );
            }
            return child;
          })
        : children}

      {Array.isArray(children)
        ? children.map(child => {
            if (child.type !== TabsList) {
              return (
                <div key={child.props.id}>
                  {child.type === TabsPanel
                    ? activeTab === child.props.id && child
                    : child}
                </div>
              );
            }
            return null;
          })
        : children}
    </div>
  );
};

const TabsList = ({
  children,
  activeTab,
  setActiveTab,
  onKeyDown,
  tabRefs,
  ...props
}) => {
  return (
    <div
      role="tablist"
      className="tabs-list"
      onKeyDown={onKeyDown}
      {...props}
    >
      {Array.isArray(children)
        ? children.map(child => {
            if (child.type === Tab) {
              return (
                <Tab
                  key={child.props.id}
                  {...child.props}
                  isActive={activeTab === child.props.id}
                  onSelect={() => setActiveTab(child.props.id)}
                  ref={el => {
                    if (el) tabRefs[child.props.id] = el;
                  }}
                />
              );
            }
            return child;
          })
        : children}
    </div>
  );
};

const Tab = ({
  id,
  children,
  isActive,
  onSelect,
  className = '',
  ...props
}) => {
  return (
    <button
      id={id}
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      className={`tabs-tab ${isActive ? 'active' : ''} ${className}`}
      onClick={onSelect}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsPanel = ({ id, children, className = '', ...props }) => {
  return (
    <div
      id={`panel-${id}`}
      role="tabpanel"
      aria-labelledby={id}
      className={`tabs-panel ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panel = TabsPanel;

export default Tabs;
