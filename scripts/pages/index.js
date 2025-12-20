const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_ADDITIONAL_IMAGES = 4;

const mainImageInput = document.getElementById("mainImage");
const mainImagePreview = document.getElementById("mainImagePreview");
const mainImageLabel = document.getElementById("mainImageLabel");

const additionalImagesInput = document.getElementById("additionalImages");
const additionalImagesGrid = document.getElementById("additionalImagesGrid");

// 대표 이미지 등록
let mainImageFile = null;
mainImageInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 이미지 검증
  const validation = validateImage(file);
  if (!validation.valid) {
    alert(validation.error);
    mainImageInput.value = ""; // input 초기화
    return;
  }

  mainImageFile = file;
  //이미지 미리보기
  displayMainImage(file);
});

// 이미지 검증로직
const validateImage = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "JPG, PNG 파일만 업로드 가능합니다." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "파일 크기는 15MB 이하만 가능합니다." };
  }

  return { valid: true };
};

// 이미지 미리보기
const displayMainImage = (file) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    // 이미지 미리보기 생성
    mainImagePreview.innerHTML = `
      <img src="${e.target.result}" alt="대표 이미지" class="image-upload__preview-image">
    `;

    mainImagePreview.classList.add("active");
    // 프리뷰 이미지 선택시 이미지 교체
    mainImagePreview.addEventListener("click", handlePreviewClick);
  };

  reader.readAsDataURL(file);
};

const handlePreviewClick = (e) => {
  // 파일 선택 창 열기
  mainImageInput.click();
};

// 추가 이미지 등록
let additionalImageFiles = [];
let currentEditingIndex = null;

additionalImagesInput?.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);

  // 이미지 교체 모드인 경우
  if (currentEditingIndex !== null) {
    if (files.length !== 1) {
      alert("이미지를 1장만 선택해주세요.");
      additionalImagesInput.value = "";
      return;
    }

    const file = files[0];
    const validation = validateImage(file);
    if (!validation.valid) {
      alert(validation.error);
      additionalImagesInput.value = "";
      currentEditingIndex = null;
      return;
    }

    // 해당 인덱스의 이미지 교체
    additionalImageFiles[currentEditingIndex] = file;
    currentEditingIndex = null;
    additionalImagesInput.value = "";
    displayAdditionalImages();
    return;
  }

  // 새 이미지 추가
  // 현재 개수 + 새로 추가할 개수 체크
  if (additionalImageFiles.length + files.length > MAX_ADDITIONAL_IMAGES) {
    alert(`추가 이미지는 최대 ${MAX_ADDITIONAL_IMAGES}장까지 등록 가능합니다.`);
    additionalImagesInput.value = "";
    return;
  }

  // 각 파일 검증
  for (const file of files) {
    const validation = validateImage(file);
    if (!validation.valid) {
      alert(validation.error);
      additionalImagesInput.value = "";
      return;
    }
  }

  // 파일 추가
  additionalImageFiles.unshift(...files);
  additionalImagesInput.value = ""; // input 초기화 (같은 파일 재선택 가능하게)

  // 이미지 미리보기
  displayAdditionalImages();
});

// 이미지 미리보기
const displayAdditionalImages = () => {
  // 그리드 초기화
  additionalImagesGrid.innerHTML = "";

  // 각 이미지 표시
  // 모든 이미지를 Promise 배열로 변환
  // 이미지 순서 및 이미지 등록 버튼 순서 유지를 위해 해당 로직 추가
  const imagePromises = additionalImageFiles.map((file, index) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const slot = document.createElement("div");
        slot.className = "image-upload__slot image-upload__slot--filled";
        slot.dataset.index = index;
        slot.innerHTML = `
          <img src="${e.target.result}" alt="추가 이미지 ${
          index + 1
        }" class="image-upload__slot-image">
        `;

        // 프리뷰 이미지 선택시 이미지 교체
        slot.addEventListener("click", (e) => {
          handleAdditionalImageClick(index);
        });

        resolve(slot); // slot 반환
      };

      reader.readAsDataURL(file);
    });
  });

  // 모든 이미지가 로드된 후 순서대로 추가
  Promise.all(imagePromises).then((slots) => {
    slots.forEach((slot) => {
      additionalImagesGrid.appendChild(slot);
    });

    // 추가 이미지 4장 미만일 때 이미지 추가 버튼이 맨 끝에 옴
    if (additionalImageFiles.length < MAX_ADDITIONAL_IMAGES) {
      const addButton = document.createElement("label");
      addButton.htmlFor = "additionalImages";
      addButton.className = "image-upload__slot image-upload__slot--add";
      addButton.innerHTML =
        '<img src="./assets/ImagePlusIcon.png" alt="이미지 추가" />';

      additionalImagesGrid.appendChild(addButton);
    }
  });
};

// 프리뷰 이미지 선택시 이미지 교체
const handleAdditionalImageClick = (index) => {
  currentEditingIndex = index;

  // multiple 속성 임시 제거 (1장만 선택하도록)
  additionalImagesInput.removeAttribute("multiple");
  additionalImagesInput.click();

  // 선택 후 다시 multiple 속성 복원
  setTimeout(() => {
    additionalImagesInput.setAttribute("multiple", "");
  }, 100);
};
