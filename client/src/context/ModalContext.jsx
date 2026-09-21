import React, { createContext, useContext, useRef, useCallback } from 'react';

const ModalContext = createContext({
  registerModal: () => {},
  unregisterModal: () => {},
  closeTopmostModal: () => false
});

export function ModalProvider({ children }) {
  // Stack of active modal descriptors: [{ id, closeFn }]
  const modalStackRef = useRef([]);

  const registerModal = useCallback((id, closeFn) => {
    // Remove if existing with same ID
    modalStackRef.current = modalStackRef.current.filter((m) => m.id !== id);
    // Push to top of stack
    modalStackRef.current.push({ id, closeFn });
  }, []);

  const unregisterModal = useCallback((id) => {
    modalStackRef.current = modalStackRef.current.filter((m) => m.id !== id);
  }, []);

  const closeTopmostModal = useCallback(() => {
    if (modalStackRef.current.length > 0) {
      const topModal = modalStackRef.current.pop();
      if (topModal && typeof topModal.closeFn === 'function') {
        try {
          topModal.closeFn();
        } catch (e) {
          console.warn('Error closing topmost modal:', e);
        }
        return true;
      }
    }
    return false;
  }, []);

  return (
    <ModalContext.Provider value={{ registerModal, unregisterModal, closeTopmostModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModalRegistry() {
  return useContext(ModalContext);
}

/**
 * Convenient hook for modals and drawers to automatically register/unregister with the hardware back button
 */
export function useModalRegistration(isOpen, onClose, modalId) {
  const { registerModal, unregisterModal } = useModalRegistry();
  const idRef = useRef(modalId || `modal-${Math.random().toString(36).slice(2, 9)}`);

  React.useEffect(() => {
    const id = idRef.current;
    if (isOpen && typeof onClose === 'function') {
      registerModal(id, onClose);
      return () => unregisterModal(id);
    } else {
      unregisterModal(id);
    }
  }, [isOpen, onClose, registerModal, unregisterModal]);
}

export default ModalContext;
