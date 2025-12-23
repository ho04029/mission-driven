import { TextInputValidator } from "./TextInputValidator.js";

// 상세 정보(회차) - 활동내용에 들어가는 input용 컴포넌트
export class SessionActivityInput extends TextInputValidator {
  constructor(textareaElement, options = {}) {
    super(textareaElement, {
      ...options,
      type: "textarea",
    });

    // textarea 전용 설정
    this.setupTextarea();
  }

  setupTextarea() {
    // 스크롤 가능하도록 높이 제한
    this.element.style.overflowY = "auto";
    this.element.style.resize = "none";
  }
}
