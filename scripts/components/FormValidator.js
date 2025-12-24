export class FormValidator {
  constructor(formElement, submitButtons, options = {}) {
    this.form = formElement;
    this.submitButtons = Array.isArray(submitButtons)
      ? submitButtons
      : [submitButtons];
    this.validators = new Map(); // 각 필드의 validator 저장
    this.customValidators = new Map(); // 커스텀 검증 함수

    this.init();
  }

  init() {
    // 초기 상태: 버튼 비활성화
    this.disableSubmit();
  }

  // Validator 등록
  registerValidator(fieldName, validator) {
    this.validators.set(fieldName, validator);

    // validator의 input 이벤트에 전체 검증 연결
    if (validator.element) {
      validator.element.addEventListener("input", () => {
        this.validateAll();
      });
    }
  }

  // 커스텀 검증 함수 등록
  registerCustomValidator(name, validatorFn) {
    this.customValidators.set(name, validatorFn);
  }

  // 전체 필드 검증
  validateAll() {
    let allValid = true;

    // 등록된 validator 검증
    for (const [fieldName, validator] of this.validators) {
      if (!validator.isValid()) {
        allValid = false;
        break;
      }
    }

    // 커스텀 validator 검증
    if (allValid) {
      for (const [name, validatorFn] of this.customValidators) {
        if (!validatorFn()) {
          allValid = false;
          break;
        }
      }
    }

    // 버튼 상태 업데이트
    if (allValid) {
      this.enableSubmit();
    } else {
      this.disableSubmit();
    }

    return allValid;
  }

  // 제출 버튼 활성화
  enableSubmit() {
    this.submitButtons.forEach((button) => {
      button.disabled = false;
      button.classList.remove("btn--disabled");
      button.classList.add("btn--active");
    });
  }

  // 제출 버튼 비활성화
  disableSubmit() {
    this.submitButtons.forEach((button) => {
      button.disabled = true;
      button.classList.add("btn--disabled");
      button.classList.remove("btn--active");
    });
  }

  // 수동 검증 트리거
  validate() {
    return this.validateAll();
  }
}
