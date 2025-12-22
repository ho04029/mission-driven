export class TitleInput {
  constructor(inputElement, options = {}) {
    this.input = inputElement;
    this.minLength = options.minLength || 8;
    this.maxLength = options.maxLength || 80;
    this.required = options.required !== false;

    this.wrapper = this.input.closest(".input-wrapper");
    this.counter = this.wrapper?.querySelector(".input-wrapper__count span");
    this.errorMessage = this.wrapper?.querySelector(".input-wrapper__error");

    this.init();
  }

  init() {
    if (!this.input || !this.wrapper) {
      console.error("TitleInput: Required elements not found");
      return;
    }

    this.attachEvents();
    this.updateCounter(0);
  }

  // 이벤트 연결
  attachEvents() {
    // 입력 이벤트
    this.input.addEventListener("input", (e) => this.handleInput(e));

    // 붙여넣기 이벤트
    this.input.addEventListener("paste", (e) => this.handlePaste(e));

    // 포커스 이벤트
    this.input.addEventListener("focus", () => this.handleFocus());
    this.input.addEventListener("blur", () => this.handleBlur());

    // 모바일 키보드 대응
    if (this.isMobile()) {
      this.input.addEventListener("focus", () => this.scrollIntoView());
    }
  }

  // 입력 이벤트
  handleInput(e) {
    let value = e.target.value;
    value = value.replace(/\s{2,}/g, " ");

    if (value.length > this.maxLength) {
      value = value.slice(0, this.maxLength);
    }

    e.target.value = value;

    // 글자 수 업데이트
    this.updateCounter(value.length);

    // 유효성 검사
    this.validate(value);
  }

  // 붙여넣기 이벤트
  handlePaste(e) {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData(
      "text"
    );

    let cleanedText = pastedText.replace(/\s{2,}/g, " ");

    if (cleanedText.length > this.maxLength) {
      cleanedText = cleanedText.slice(0, this.maxLength);
    }

    const start = this.input.selectionStart;
    const end = this.input.selectionEnd;
    const currentValue = this.input.value;

    const newValue =
      currentValue.substring(0, start) +
      cleanedText +
      currentValue.substring(end);

    // 최대 길이 체크
    if (newValue.length > this.maxLength) {
      this.input.value = newValue.slice(0, this.maxLength);
    } else {
      this.input.value = newValue;
    }

    const newCursorPos = start + cleanedText.length;
    this.input.setSelectionRange(newCursorPos, newCursorPos);

    // 글자 수 업데이트
    this.updateCounter(this.input.value.length);

    // 유효성 검사
    this.validate(this.input.value);
  }

  // 포커스 이벤트
  handleFocus() {
    this.wrapper.classList.add("input-wrapper--focused");
  }

  // blur 이벤트
  handleBlur() {
    this.wrapper.classList.remove("input-wrapper--focused");

    // 유효성 검사
    this.validate(this.input.value);
  }

  // 글자수 세기
  updateCounter(length) {
    if (this.counter) {
      this.counter.textContent = length;

      const counterElement = this.counter.parentElement;
      if (length >= this.maxLength) {
        counterElement.classList.add("input-wrapper__count--max");
      } else {
        counterElement.classList.remove("input-wrapper__count--max");
      }
    }
  }

  // 유효성 검사
  validate(value) {
    const length = value.length;
    const trimmedLength = value.trim().length;

    this.clearError();

    if (length === 0 && !this.required) {
      return true;
    }

    // 8자 미만일때 에러
    if (length > 0 && trimmedLength < this.minLength) {
      this.setError(`${this.minLength}자 이상 입력해주세요.`);
      return false;
    }

    this.wrapper.classList.add("input-wrapper--valid");
    return true;
  }

  // 8자 미만일때 에러
  setError(message) {
    this.wrapper.classList.add("input-wrapper--error");
    this.wrapper.classList.remove("input-wrapper--valid");

    if (this.errorMessage) {
      this.errorMessage.textContent = message;
      this.errorMessage.style.display = "block";
    }
  }

  // 에러 상태 초기화
  clearError() {
    this.wrapper.classList.remove("input-wrapper--error");

    if (this.errorMessage) {
      this.errorMessage.textContent = "";
      this.errorMessage.style.display = "none";
    }
  }

  // 모바일 키보드 대응
  scrollIntoView() {
    setTimeout(() => {
      this.input.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  }

  // 모바일 감지
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  // 현재 값 가져오기
  getValue() {
    return this.input.value.trim();
  }

  // 유효성 검사 (외부에서 호출)
  isValid() {
    return this.validate(this.input.value);
  }

  // 값 설정
  setValue(value) {
    this.input.value = value;
    this.updateCounter(value.length);
    this.validate(value);
  }

  // 초기화
  reset() {
    this.input.value = "";
    this.updateCounter(0);
    this.clearError();
    this.wrapper.classList.remove("input-wrapper--valid");
  }
}
