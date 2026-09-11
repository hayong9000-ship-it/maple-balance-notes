# 메이플 밸런스 노트

48개 직업과 전 직업 공통 변경 사항을 한 페이지씩 스크롤해서 읽는 비공식 패치 정리 사이트입니다. 변경 전후 표, 공식 변경 설명, 원본 툴팁을 제공합니다.

## GitHub Pages 게시

공개 저장소의 `main` 브랜치에 이 프로젝트를 올리고, 저장소 **Settings → Pages → Source**를 **GitHub Actions**로 설정합니다. 이후 `main`에 변경 사항을 올리면 자동으로 사이트를 빌드하고 게시합니다. 비밀키를 직접 등록할 필요는 없습니다.

사이트 주소는 GitHub Pages가 발급한 `https://계정명.github.io/저장소명/` 형태입니다. 실제 주소는 게시 완료 후 Actions 결과와 Pages 설정에서 확인합니다.

## 자료 업데이트

`src/data.js`와 `src/assets`의 자료를 변경합니다. 직업군 구성과 자료 검증 원칙은 `TEMPLATE.md`를 따릅니다. 모든 스킬과 툴팁을 연속 표시하는 구조를 유지합니다.

로컬 확인: `node scripts/build.mjs`, `node scripts/validate.mjs`.

공식 공지: https://maplestory.nexon.com/testworld/news/all/198
참고 자료: https://jsmm-00.github.io/MapleStory-Balance-Patch/index.html
GitHub Pages 안내: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

게임 이미지와 툴팁의 권리는 NEXON에 있습니다.
