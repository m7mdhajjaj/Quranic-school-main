

interface LogoutConfirmationOptions {
  userType?: 'admin' | 'user';
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const showLogoutConfirmation = async (options: LogoutConfirmationOptions = {}) => {
  const { userType = 'user', onConfirm, onCancel } = options;
  
  return new Promise<boolean>((resolve) => {
    // Create modal HTML
    const modal = createLogoutModal(userType);
    document.body.appendChild(modal);
    
    // Add event listeners
    const confirmBtn = modal.querySelector('.confirm-logout') as HTMLButtonElement;
    const cancelBtn = modal.querySelector('.cancel-logout') as HTMLButtonElement;
    const overlay = modal.querySelector('.modal-overlay') as HTMLDivElement;
    
    const handleConfirm = async () => {
      // Show loading
      showLoadingState(modal);
      
      // Execute logout
      if (onConfirm) {
        onConfirm();
      }
      
      // Show success and cleanup
      await showSuccessState(modal, userType);
      cleanup();
      resolve(true);
    };
    
    const handleCancel = () => {
      if (onCancel) {
        onCancel();
      }
      cleanup();
      resolve(false);
    };
    
    const cleanup = () => {
      modal.remove();
    };
    
    // Bind events
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    overlay.addEventListener('click', handleCancel);
    
    // Handle escape key
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
    
    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add('show');
    });
  });
};

const createLogoutModal = (userType: 'admin' | 'user') => {
  const isAdmin = userType === 'admin';
  
  const modal = document.createElement('div');
  modal.className = 'logout-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content ${isAdmin ? 'admin-modal' : 'user-modal'}">
      <div class="modal-header">
        <div class="modal-icon question-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9,9a3,3,0,1,1,4,2.829,1.5,1.5,0,0,0-1,1.426V14.5"></path>
            <path d="M12,17.5v.5"></path>
          </svg>
        </div>
        <h2 class="modal-title">تسجيل الخروج</h2>
      </div>
      
      <div class="modal-body">
        <p class="modal-text">هل أنت متأكد من رغبتك في تسجيل الخروج؟</p>
      </div>
      
      <div class="modal-footer">
        <button class="btn cancel-logout ${isAdmin ? 'admin-cancel' : 'user-cancel'}">
          إلغاء
        </button>
        <button class="btn confirm-logout ${isAdmin ? 'admin-confirm' : 'user-confirm'}">
          نعم، سجل الخروج
        </button>
      </div>
    </div>
  `;
  
  return modal;
};

const showLoadingState = (modal: HTMLElement) => {
  const content = modal.querySelector('.modal-content') as HTMLElement;
  content.innerHTML = `
    <div class="modal-header">
      <div class="modal-icon loading-icon">
        <div class="loading-spinner"></div>
      </div>
      <h2 class="modal-title">جاري تسجيل الخروج...</h2>
    </div>
    <div class="modal-body">
      <p class="modal-text">الرجاء الانتظار</p>
    </div>
  `;
};

const showSuccessState = (modal: HTMLElement, userType: 'admin' | 'user') => {
  return new Promise<void>((resolve) => {
    const content = modal.querySelector('.modal-content') as HTMLElement;
    const isAdmin = userType === 'admin';
    
    content.innerHTML = `
      <div class="modal-header">
        <div class="modal-icon success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
        </div>
        <h2 class="modal-title ${isAdmin ? 'text-green-700' : 'text-blue-700'}">تم تسجيل الخروج</h2>
      </div>
      <div class="modal-body">
        <p class="modal-text">تم تسجيل خروجك بنجاح! نراك قريباً.</p>
      </div>
    `;
    
    // Auto close after 1.5 seconds
    setTimeout(() => {
      resolve();
    }, 1500);
  });
};