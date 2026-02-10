// ProtectedRoute
// useAuth()로 AuthProvider가 제공하는 user 정보를 읽음
// 권한(roles) 조건에 따라 접근 허용/차단 결정
//차단 시:
// 로그인 안 되어 있으면 → /login 리다이렉트 (원래 위치 state.from에 저장)
// 로그인은 되어 있지만 권한 부족 → /forbidden 리다이렉트
// 허용 시:
// 그대로 children(보호된 페이지 컴포넌트) 렌더링

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ roles }) {
    const { user } = useAuth(); //OAuth 로그인 후 user 객체 하나로 모든 판단

    // 로그인 안 됨
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 권한 체크
    if (roles && !roles.some((r) => user.roles?.includes(r))) {
        return <Navigate to="/forbidden" replace />;
    }

    return <Outlet />;
}


