export class CategoryModal {
  constructor() {
    this.selectedCategories = []; // 선택된 카테고리 (최대 2개)
    this.maxSelection = 2;
    this.modal = null;
    this.onConfirm = null; // 확인 콜백
    this.categories = [
      { id: 1, name: "용돈벌기" },
      { id: 2, name: "디지털" },
      { id: 3, name: "그림" },
      { id: 4, name: "글쓰기/독서" },
      { id: 5, name: "건강/운동" },
      { id: 6, name: "동기부여/성장" },
      { id: 7, name: "취미힐링" },
      { id: 8, name: "외국어" },
    ];
  }

  // 모달 HTML 생성
  create() {
    const modal = document.createElement("div");
    modal.className = "category-modal";
    modal.innerHTML = `
      <div class="category-modal__backdrop"></div>
      <div class="category-modal__container">
        <header class="category-modal__header">
          <button class="category-modal__close" type="button">
            <span>×</span>
          </button>
          <h2 class="category-modal__title">카테고리 선택</h2>
          <div class="category-modal__spacer"></div>
        </header>
        
        <div class="category-modal__content">
          <p class="category-modal__description">최대 2개까지 선택할 수 있어요</p>
          <div class="category-list" id="categoryList"></div>
        </div>
        
        <footer class="category-modal__footer">
          <button class="btn btn--primary" id="categoryConfirm" type="button" disabled>
            다음으로
          </button>
        </footer>
      </div>
    `;

    this.modal = modal;
    this.renderCategories();
    this.attachEvents();
    return modal;
  }

  // 카테고리 목록
  renderCategories() {
    const categoryList = this.modal.querySelector("#categoryList");

    categoryList.innerHTML = this.categories
      .map((category) => {
        const isSelected = this.selectedCategories.some(
          (c) => c.id === category.id
        );
        return `
        <button 
          type="button"
          class="category-item ${isSelected ? "category-item--selected" : ""}" 
          data-id="${category.id}"
        >
          ${category.name}
        </button>
      `;
      })
      .join("");

    // 각 카테고리 목록에 클릭 이벤트
    categoryList.querySelectorAll(".category-item").forEach((item) => {
      item.addEventListener("click", () => {
        const categoryId = parseInt(item.dataset.id);
        this.toggleCategory(categoryId);
      });
    });

    // 다음으로 버튼 활성화
    this.updateConfirmButton();
  }

  // 카테고리 선택/해제 토글 클릭 이벤트
  toggleCategory(categoryId) {
    const category = this.categories.find((c) => c.id === categoryId);
    const index = this.selectedCategories.findIndex((c) => c.id === categoryId);

    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      if (this.selectedCategories.length >= this.maxSelection) {
        this.showToast(
          `카테고리는 최대 ${this.maxSelection}개까지 선택할 수 있어요`
        );
        return;
      }
      this.selectedCategories.push(category);
    }

    this.renderCategories();
  }

  // 다음으로 버튼 활성화
  updateConfirmButton() {
    const confirmBtn = this.modal.querySelector("#categoryConfirm");
    if (this.selectedCategories.length > 0) {
      confirmBtn.disabled = false;
      confirmBtn.classList.remove("btn--disabled");
    } else {
      confirmBtn.disabled = true;
      confirmBtn.classList.add("btn--disabled");
    }
  }

  // 이벤트 연결
  attachEvents() {
    const closeBtn = this.modal.querySelector(".category-modal__close");
    const backdrop = this.modal.querySelector(".category-modal__backdrop");
    const confirmBtn = this.modal.querySelector("#categoryConfirm");

    // 닫기 버튼
    closeBtn.addEventListener("click", () => this.close());

    // 백드롭 클릭
    backdrop.addEventListener("click", () => this.close());

    // 확인 버튼
    confirmBtn.addEventListener("click", () => {
      if (this.onConfirm) {
        this.onConfirm(this.selectedCategories);
      }
      this.close();
    });

    // ESC 키
    this.handleKeyDown = (e) => {
      if (e.key === "Escape") {
        this.close();
      }
    };
  }

  // 모달 열기
  open(initialCategories = []) {
    // 이전 선택 값 복원
    this.selectedCategories = [...initialCategories];

    if (!this.modal) {
      this.create();
    } else {
      this.renderCategories();
    }

    document.body.appendChild(this.modal);
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      this.modal.classList.add("active");
    });

    document.addEventListener("keydown", this.handleKeyDown);
  }

  // 모달 닫기
  close() {
    this.modal.classList.remove("active");

    setTimeout(() => {
      if (this.modal && this.modal.parentNode) {
        this.modal.remove();
      }
      document.body.style.overflow = "";
    }, 300);

    document.removeEventListener("keydown", this.handleKeyDown);
  }

  // 토스트
  showToast(message) {
    // 기존 토스트 제거
    const existingToast = document.querySelector(".toast");
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("toast--show");
    });

    setTimeout(() => {
      toast.classList.remove("toast--show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // 확인 콜백 설정
  setOnConfirm(callback) {
    this.onConfirm = callback;
  }
}
