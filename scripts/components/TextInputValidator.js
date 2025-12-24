// TextInput에 공통적으로 사용하는 컴포넌트
export class TextInputValidator {
  constructor(element, options = {}) {
    this.element = element;
    this.minLength = options.minLength || 0;
    this.maxLength = options.maxLength || 1000;
    this.required = options.required !== false;
    this.type = options.type || "input"; // 'input' or 'textarea'

    this.wrapper =
      this.element.closest(".input-wrapper") ||
      this.element.closest(".session-activity__wrapper");
    this.counter = this.wrapper?.querySelector('[class*="__counter"]');
    this.errorMessage = this.wrapper?.querySelector('[class*="__error"]');

    if (this.element && this.wrapper) {
      this.init();
    }
  }

  init() {
    this.attachEvents();
    this.updateCounter(0);
  }

  // 이벤트 연결
  attachEvents() {
    // 입력 이벤트
    this.element.addEventListener("input", (e) => this.handleInput(e));

    // 붙여넣기 이벤트
    this.element.addEventListener("paste", (e) => this.handlePaste(e));

    // 포커스 이벤트
    this.element.addEventListener("focus", () => this.handleFocus());
    this.element.addEventListener("blur", () => this.handleBlur());

    // 모바일 키보드 대응
    if (this.isMobile() && this.type === "input") {
      this.element.addEventListener("focus", () => this.scrollIntoView());
    }
  }

  // 입력 이벤트
  handleInput(e) {
    let value = e.target.value;

    // 최대 글자 수 제한
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

    // 최대 길이로 자르기
    let cleanedText = pastedText.slice(0, this.maxLength);

    // 현재 선택 영역에 삽입
    const start = this.element.selectionStart;
    const end = this.element.selectionEnd;
    const currentValue = this.element.value;

    const newValue =
      currentValue.substring(0, start) +
      cleanedText +
      currentValue.substring(end);

    // 최대 길이 체크
    if (newValue.length > this.maxLength) {
      this.element.value = newValue.slice(0, this.maxLength);
    } else {
      this.element.value = newValue;
    }

    // 커서 위치 조정
    const newCursorPos = Math.min(start + cleanedText.length, this.maxLength);
    this.element.setSelectionRange(newCursorPos, newCursorPos);

    // 글자 수 업데이트
    this.updateCounter(this.element.value.length);

    // 유효성 검사
    this.validate(this.element.value);
  }

  // 포커스 이벤트
  handleFocus() {
    this.wrapper.classList.add(
      "input-wrapper--focused",
      "session-activity__wrapper--focused"
    );
  }

  // blur 이벤트
  handleBlur() {
    this.wrapper.classList.remove(
      "input-wrapper--focused",
      "session-activity__wrapper--focused"
    );

    // blur시에도 유효성 검사 유지
    this.validate(this.element.value);
  }

  // 글자 수 업데이트
  updateCounter(length) {
    if (this.counter) {
      this.counter.textContent = length;
    }
  }

  // 유효성 검사
  validate(value) {
    const length = value.length;
    const trimmedLength = value.trim().length;

    // 에러 상태 초기화
    this.clearError();

    // 최소 글자 수 체크 (입력이 시작된 경우만)
    if (length > 0 && trimmedLength < this.minLength) {
      this.setError(`${this.minLength}자 이상 입력해주세요.`);
      return false;
    }

    // 유효함
    this.wrapper.classList.add(
      "input-wrapper--valid",
      "session-activity__wrapper--valid"
    );
    return true;
  }

  // 에러 표시
  setError(message) {
    this.wrapper.classList.add(
      "input-wrapper--error",
      "session-activity__wrapper--error"
    );
    this.wrapper.classList.remove(
      "input-wrapper--valid",
      "session-activity__wrapper--valid"
    );

    if (this.errorMessage) {
      this.errorMessage.textContent = message;
      this.errorMessage.style.display = "block";
    }
  }

  // 에러 상태 초기화
  clearError() {
    this.wrapper.classList.remove(
      "input-wrapper--error",
      "session-activity__wrapper--error"
    );

    if (this.errorMessage) {
      this.errorMessage.textContent = "";
      this.errorMessage.style.display = "none";
    }
  }

  scrollIntoView() {
    setTimeout(() => {
      this.element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  }

  // 모바일 대응
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  getValue() {
    return this.element.value.trim();
  }

  validateUI() {
    return this.validate(this.element.value);
  }

  setValue(value) {
    this.element.value = value;
    this.updateCounter(value.length);
    this.validate(value);
  }

  reset() {
    this.element.value = "";
    this.updateCounter(0);
    this.clearError();
    this.wrapper.classList.remove(
      "input-wrapper--valid",
      "session-activity__wrapper--valid"
    );
  }

  isValid() {
    const value = this.element.value;
    const trimmedLength = value.trim().length;

    // required 체크
    if (this.required && trimmedLength === 0) {
      return false;
    }

    // 최소 길이 체크
    if (trimmedLength > 0 && trimmedLength < this.minLength) {
      return false;
    }

    // 최대 길이는 입력 단계에서 이미 보장됨
    return true;
  }
}
