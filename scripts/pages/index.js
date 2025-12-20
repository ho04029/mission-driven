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
    // 프리뷰 이미지 선택시 파일 재선택 가능하도록
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
additionalImagesInput?.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);

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
  additionalImageFiles.forEach((file, index) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const slot = document.createElement("div");
      slot.className = "image-upload__slot image-upload__slot--filled";
      slot.innerHTML = `
        <img src="${e.target.result}" alt="추가 이미지 ${
        index + 1
      }" class="image-upload__slot-image">
      `;

      additionalImagesGrid.appendChild(slot);
    };

    reader.readAsDataURL(file);
  });
};
