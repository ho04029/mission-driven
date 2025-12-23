export class ConfirmModal {
  constructor() {
    this.modal = null;
    this.onConfirm = null;
    this.onCancel = null;
  }

  // 모달 생성
  create(options = {}) {
    const {
      title = "작성한 내용을 삭제하시겠어요?",
      message = "삭제한 내용은 복구할 수 없습니다.",
      cancelText = "취소",
      confirmText = "삭제하기",
    } = options;

    const modal = document.createElement("div");
    modal.className = "delete-modal";
    modal.innerHTML = `
      <div class="delete-modal__backdrop"></div>
      <div class="delete-modal__container">
        <button class="delete-modal__close" type="button" aria-label="닫기">
          <span>×</span>
        </button>
        
        <div class="delete-modal__content">          
          <h2 class="delete-modal__title">${title}</h2>
          <p class="delete-modal__message">${message}</p>
        </div>
        
        <div class="delete-modal__actions">
          <button class="delete-modal__button delete-modal__button--cancel" type="button">
            ${cancelText}
          </button>
          <button class="delete-modal__button delete-modal__button--confirm" type="button">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    this.modal = modal;
    this.attachEvents();
    return modal;
  }

  // 이벤트 연결
  attachEvents() {
    const closeBtn = this.modal.querySelector(".delete-modal__close");
    const backdrop = this.modal.querySelector(".delete-modal__backdrop");
    const cancelBtn = this.modal.querySelector(".delete-modal__button--cancel");
    const confirmBtn = this.modal.querySelector(
      ".delete-modal__button--confirm"
    );

    // 닫기 버튼
    closeBtn.addEventListener("click", () => this.close(false));

    // 백드롭 클릭
    backdrop.addEventListener("click", () => this.close(false));

    // 취소 버튼
    cancelBtn.addEventListener("click", () => this.close(false));

    // 확인 버튼
    confirmBtn.addEventListener("click", () => this.close(true));

    // ESC 키
    this.handleKeyDown = (e) => {
      if (e.key === "Escape") {
        this.close(false);
      }
    };
  }

  // 모달 열기
  open(options = {}) {
    if (!this.modal) {
      this.create(options);
    }

    document.body.appendChild(this.modal);
    document.body.style.overflow = "hidden";
    this.modal.classList.add("active");

    document.addEventListener("keydown", this.handleKeyDown);

    return new Promise((resolve) => {
      this.onConfirm = () => resolve(true);
      this.onCancel = () => resolve(false);
    });
  }

  // 모달 닫기
  close(confirmed = false) {
    this.modal.classList.remove("active");

    setTimeout(() => {
      if (this.modal && this.modal.parentNode) {
        this.modal.remove();
      }
      document.body.style.overflow = "";
    }, 300);

    document.removeEventListener("keydown", this.handleKeyDown);

    if (confirmed && this.onConfirm) {
      this.onConfirm();
    } else if (!confirmed && this.onCancel) {
      this.onCancel();
    }
  }
}
