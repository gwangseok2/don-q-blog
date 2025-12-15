import React from "react";

// 쿠팡 파트너스 iframe에 필요한 속성들의 타입을 정의합니다.
// HTML iframe 요소가 사용하는 속성들을 기반으로 정의했습니다.
interface CoupangIframeProps {
  /** 쿠팡 파트너스에서 제공하는 iframe의 src URL */
  src: string;
  /** iframe의 가로 길이 (예: '120px', '100%') */
  width?: string | number;
  /** iframe의 세로 길이 (예: '240px') */
  height?: string | number;
  /** iframe의 제목 (접근성 향상) */
  title?: string;
  /** iframe의 테두리 여부 (HTML에서는 'frameborder=0'을 사용, React에서는 'frameBorder={0}' 사용) */
  frameBorder?: number | string;
  /** 스크롤바 표시 여부 (HTML에서는 'scrolling=no', React에서는 'scrolling="no"' 사용) */
  scrolling?: "yes" | "no" | "auto";
  /** 전체 화면 모드 허용 여부 (HTML에서는 'allowfullscreen', React에서는 'allowFullScreen' 사용) */
  allowFullScreen?: boolean;
  /** 추가적인 스타일 객체 */
  style?: React.CSSProperties;
  /** 추가적인 클래스 이름 */
  className?: string;
}

const CoupangPartnersIframe: React.FC<CoupangIframeProps> = ({
  src,
  width = "100%",
  height = "100%",
  title = "쿠팡 파트너스 광고",
  frameBorder = 0, // React에서는 'frameBorder'로 카멜 케이스 사용
  scrolling = "no",
  allowFullScreen = false, // React에서는 'allowFullScreen'으로 카멜 케이스 사용
  style,
  className,
}) => {
  // 쿠팡 파트너스 iframe의 기본 권장 스타일을 적용하고, 사용자가 전달한 스타일을 병합합니다.
  const defaultStyle: React.CSSProperties = {
    // 필수 스타일 (쿠팡 가이드라인에 따라)
    border: "none",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    // 사용자가 전달한 width와 height 적용
    width: width,
    height: height,
    ...style,
  };

  return (
    <iframe
      // 필수 속성
      src={src}
      title={title}
      // React에서 카멜 케이스로 변환된 속성
      width={width}
      height={height}
      frameBorder={frameBorder}
      scrolling={scrolling}
      allowFullScreen={allowFullScreen}
      // 스타일 및 클래스
      style={defaultStyle}
      className={className}
      // 기타 권장 속성
      referrerPolicy="unsafe-url" // 쿠팡 파트너스 트래킹을 위해 필요할 수 있음
    />
  );
};

export default CoupangPartnersIframe;
