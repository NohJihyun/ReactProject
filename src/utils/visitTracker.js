function generateUuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

export function trackVisit() {
    try {
        const KEY_UUID = 'rh_visitor_uuid';
        const KEY_DATE = 'rh_visit_date';
        const today = new Date().toISOString().slice(0, 10);

        if (localStorage.getItem(KEY_DATE) === today) return;

        let uuid = localStorage.getItem(KEY_UUID);
        if (!uuid) {
            uuid = generateUuid();
            localStorage.setItem(KEY_UUID, uuid);
        }

        const device = window.innerWidth <= 768 ? 'MOBILE' : 'PC';
        const base = process.env.REACT_APP_API_BASE_URL || '';

        fetch(`${base}/api/visit?uuid=${uuid}&device=${device}`, { method: 'POST' })
            .then(res => { if (res.ok) localStorage.setItem(KEY_DATE, today); })
            .catch(() => {});
    } catch {
        // localStorage 접근 불가(시크릿 모드 등) 무시
    }
}
