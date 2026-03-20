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
/*
 * 화면접근 제어 문지기 역할
 * user가 없으면 로그인 페이지로 보내고
 * roles 조건이 있으면 권한 없을 때 /forbidden으로 리턴
 */
export default function ProtectedRoute({ roles = [] }) {
    const { user } = useAuth(); //OAuth 로그인 후 user 객체 하나로 모든 판단

    // 로그인 안 됨
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 권한 체크
    if (roles.length > 0) {
        const userRole = user?.role?.startsWith("ROLE_")
            ? user.role.slice(5)
            : user?.role;

        const allowed = roles.includes(userRole);
        if (!allowed) {
            return <Navigate to="/forbidden" replace />;
        }
    }

    return <Outlet />;
}


