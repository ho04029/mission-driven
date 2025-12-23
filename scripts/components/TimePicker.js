export class TimePicker {
  constructor(startInputs, endInputs, sessionId) {
    this.sessionId = sessionId;

    // 시작 시간 inputs
    this.startPeriodBtn = startInputs.periodBtn;
    this.startHourInput = startInputs.hourInput;
    this.startMinuteInput = startInputs.minuteInput;

    // 종료 시간 inputs
    this.endPeriodBtn = endInputs.periodBtn;
    this.endHourInput = endInputs.hourInput;
    this.endMinuteInput = endInputs.minuteInput;

    // 초기값 설정
    this.init();
  }

  init() {
    this.setTime("start", "AM", 10, 0);
    this.setTime("end", "AM", 11, 0);

    // 이벤트 연결
    this.attachEvents();
  }

  // 이벤트 연결
  attachEvents() {
    // 시작 오전/오후 토글
    this.startPeriodBtn.addEventListener("click", () => {
      this.togglePeriod("start");
    });

    // 종료 오전/오후 토글
    this.endPeriodBtn.addEventListener("click", () => {
      this.togglePeriod("end");
    });

    // 시작 시간 입력
    this.startHourInput.addEventListener("input", () => {
      this.handleStartTimeChange();
    });

    this.startMinuteInput.addEventListener("input", () => {
      this.handleStartTimeChange();
    });

    // 종료 시간 입력
    this.endHourInput.addEventListener("input", () => {
      this.handleEndTimeChange();
    });

    this.endMinuteInput.addEventListener("input", () => {
      this.handleEndTimeChange();
    });

    // 숫자만 입력 가능
    [
      this.startHourInput,
      this.startMinuteInput,
      this.endHourInput,
      this.endMinuteInput,
    ].forEach((input) => {
      input.addEventListener("keypress", (e) => {
        if (!/[0-9]/.test(e.key)) {
          e.preventDefault();
        }
      });
    });

    // TODO: blur 부분 수정하기
    // 시 단위 blur
    [this.startHourInput, this.endHourInput].forEach((input) => {
      input.addEventListener("blur", () => {
        this.normalizeInput(input, 0, 12);
      });
    });

    // 분 단위 blur
    [this.startMinuteInput, this.endMinuteInput].forEach((input) => {
      input.addEventListener("blur", () => {
        this.normalizeInput(input, 0, 59);
      });
    });
  }

  // 오전/오후 토글
  togglePeriod(type) {
    if (type === "start") {
      const currentPeriod = this.startPeriodBtn.dataset.period;
      const newPeriod = currentPeriod === "AM" ? "PM" : "AM";

      this.startPeriodBtn.dataset.period = newPeriod;
      this.startPeriodBtn.textContent = newPeriod === "AM" ? "오전" : "오후";

      // 종료 시간도 동일하게 변경
      this.endPeriodBtn.dataset.period = newPeriod;
      this.endPeriodBtn.textContent = newPeriod === "AM" ? "오전" : "오후";
    } else {
      const currentPeriod = this.endPeriodBtn.dataset.period;
      const newPeriod = currentPeriod === "AM" ? "PM" : "AM";

      this.endPeriodBtn.dataset.period = newPeriod;
      this.endPeriodBtn.textContent = newPeriod === "AM" ? "오전" : "오후";
    }

    // 변경 후 유효성 검사
    this.validateTime();
  }

  // 시작 시간 변경 처리
  handleStartTimeChange() {
    this.filterNumeric(this.startHourInput);
    this.filterNumeric(this.startMinuteInput);

    // 유효성 검사
    this.validateTime();
  }

  // 종료 시간 변경 처리
  handleEndTimeChange() {
    this.filterNumeric(this.endHourInput);
    this.filterNumeric(this.endMinuteInput);

    // 유효성 검사
    // TODO: 여기도 blur로 옮겨야 할 것 같음
    this.validateTime();
  }

  // 숫자가 아닌 것들이 input에 들어올 경우 공백으로 바꾸기
  filterNumeric(input) {
    input.value = input.value.replace(/[^0-9]/g, "");
  }

  // 입력값 정규화 (범위 체크)
  normalizeInput(input, min, max) {
    if (input.value === "") {
      input.value = this.padZero(min);
      return;
    }

    let value = parseInt(input.value) || min;

    if (value < min) value = min;
    if (value > max) value = max;

    input.value = this.padZero(value);
  }

  // 시간 유효성 검사
  validateTime() {
    const startTime = this.getTime("start");
    const endTime = this.getTime("end");

    // 24시간 형식으로 변환
    const start24 = this.to24Hour(startTime);
    const end24 = this.to24Hour(endTime);

    // 시작 시간이 종료 시간보다 늦으면
    if (start24 >= end24) {
      this.showToast("시작 시간보다 종료 시간은 빠를 수 없습니다.");

      // 종료 시간을 시작 시간 + 1시간으로 자동 수정
      const startHour = parseInt(this.startHourInput.value) || 10;
      const startMinute = parseInt(this.startMinuteInput.value) || 0;
      const startPeriod = this.startPeriodBtn.dataset.period;

      let endHour = startHour + 1;
      let endPeriod = startPeriod;

      // 12시를 넘으면 오후로 전환
      if (startPeriod === "AM" && endHour > 12) {
        endHour = 1;
        endPeriod = "PM";
      } else if (startPeriod === "PM" && endHour > 12) {
        endHour = 1;
        endPeriod = "AM"; // 다음날 오전
      }

      this.setTime("end", endPeriod, endHour, startMinute);
    }
  }

  // 시간 설정
  setTime(type, period, hour, minute) {
    if (type === "start") {
      this.startPeriodBtn.dataset.period = period;
      this.startPeriodBtn.textContent = period === "AM" ? "오전" : "오후";
      this.startHourInput.value = this.padZero(hour);
      this.startMinuteInput.value = this.padZero(minute);
    } else {
      this.endPeriodBtn.dataset.period = period;
      this.endPeriodBtn.textContent = period === "AM" ? "오전" : "오후";
      this.endHourInput.value = this.padZero(hour);
      this.endMinuteInput.value = this.padZero(minute);
    }
  }

  // 시간 가져오기
  getTime(type) {
    if (type === "start") {
      return {
        period: this.startPeriodBtn.dataset.period,
        hour: parseInt(this.startHourInput.value) || 10,
        minute: parseInt(this.startMinuteInput.value) || 0,
      };
    } else {
      return {
        period: this.endPeriodBtn.dataset.period,
        hour: parseInt(this.endHourInput.value) || 11,
        minute: parseInt(this.endMinuteInput.value) || 0,
      };
    }
  }

  // 24시간 형식으로 변환 (분 단위까지 계산)
  to24Hour(time) {
    let hour = time.hour;

    if (time.period === "PM" && hour !== 12) {
      hour += 12;
    } else if (time.period === "AM" && hour === 12) {
      hour = 0;
    }

    return hour * 60 + time.minute; // 분 단위로 변환
  }

  // 숫자 앞에 0 추가
  padZero(num) {
    return num.toString().padStart(2, "0");
  }

  // 토스트 알림
  showToast(message) {
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

  // 최종 시간 문자열 반환 (저장용)
  getTimeString(type) {
    const time = this.getTime(type);
    const hour24 = this.to24Hour(time);
    const hour = Math.floor(hour24 / 60);
    const minute = hour24 % 60;

    return `${this.padZero(hour)}:${this.padZero(minute)}`;
  }
}
