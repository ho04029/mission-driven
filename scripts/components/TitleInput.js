import { TextInputValidator } from "./TextInputValidator.js";

// 콘텐츠 제목 input에 사용하는 컴포넌트
export class TitleInput extends TextInputValidator {
  constructor(inputElement, options = {}) {
    super(inputElement, {
      ...options,
      type: "input",
      preventMultipleSpaces: true,
    });
  }
}
