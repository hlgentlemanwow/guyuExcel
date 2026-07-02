const USERS = [
    { username: 'admin', password: 'admin', role: 'admin', name: '管理员' },
    { username: 'user1', password: 'user1', role: 'user', name: '张三' },
    { username: 'user2', password: 'user2', role: 'user', name: '李四' },
    { username: 'user3', password: 'user3', role: 'user', name: '王五' }
];

const COLUMN_CONFIG = [
    { key: 'id', label: '序号' },
    { key: 'name', label: '姓名' },
    { key: 'department', label: '部门' },
    { key: 'salary', label: '薪资' },
    { key: 'phone', label: '电话' },
    { key: 'email', label: '邮箱' },
    { key: 'address', label: '地址' },
    { key: 'notes', label: '备注' }
];

const DEFAULT_PERMISSIONS = {
    admin: {
        id: { visible: true, editable: false },
        name: { visible: true, editable: true },
        department: { visible: true, editable: true },
        salary: { visible: true, editable: true },
        phone: { visible: true, editable: true },
        email: { visible: true, editable: true },
        address: { visible: true, editable: true },
        notes: { visible: true, editable: true }
    },
    user1: {
        id: { visible: true, editable: false },
        name: { visible: true, editable: true },
        department: { visible: true, editable: false },
        salary: { visible: false, editable: false },
        phone: { visible: true, editable: true },
        email: { visible: true, editable: true },
        address: { visible: true, editable: true },
        notes: { visible: true, editable: true }
    },
    user2: {
        id: { visible: true, editable: false },
        name: { visible: true, editable: false },
        department: { visible: true, editable: false },
        salary: { visible: true, editable: false },
        phone: { visible: true, editable: false },
        email: { visible: true, editable: true },
        address: { visible: true, editable: true },
        notes: { visible: true, editable: true }
    },
    user3: {
        id: { visible: true, editable: false },
        name: { visible: true, editable: false },
        department: { visible: true, editable: false },
        salary: { visible: false, editable: false },
        phone: { visible: false, editable: false },
        email: { visible: false, editable: false },
        address: { visible: true, editable: false },
        notes: { visible: true, editable: true }
    }
};

function getUsers() {
    return USERS;
}

function getColumnConfig() {
    return COLUMN_CONFIG;
}

function login(username, password) {
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
        const permissions = getPermissions(username);
        const session = {
            username: user.username,
            role: user.role,
            name: user.name,
            permissions: permissions
        };
        sessionStorage.setItem('excel_session', JSON.stringify(session));
        return { success: true, user: user, permissions: permissions };
    }
    return { success: false, message: '用户名或密码错误' };
}

function logout() {
    sessionStorage.removeItem('excel_session');
}

function getCurrentSession() {
    const sessionStr = sessionStorage.getItem('excel_session');
    return sessionStr ? JSON.parse(sessionStr) : null;
}

function isLoggedIn() {
    return getCurrentSession() !== null;
}

function isAdmin() {
    const session = getCurrentSession();
    return session && session.role === 'admin';
}

function getPermissions(username) {
    const stored = localStorage.getItem('excel_permissions');
    if (stored) {
        const permissions = JSON.parse(stored);
        if (permissions[username]) {
            return permissions[username];
        }
    }
    return DEFAULT_PERMISSIONS[username] || DEFAULT_PERMISSIONS.user1;
}

function getAllPermissions() {
    const stored = localStorage.getItem('excel_permissions');
    if (stored) {
        return JSON.parse(stored);
    }
    return DEFAULT_PERMISSIONS;
}

function savePermissions(permissions) {
    localStorage.setItem('excel_permissions', JSON.stringify(permissions));
    const session = getCurrentSession();
    if (session && permissions[session.username]) {
        session.permissions = permissions[session.username];
        sessionStorage.setItem('excel_session', JSON.stringify(session));
    }
}

function getColumnPermission(columnKey) {
    const session = getCurrentSession();
    if (!session) {
        return { visible: false, editable: false };
    }
    const permission = session.permissions[columnKey];
    return permission || { visible: true, editable: true };
}

function checkAccess() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function checkAdminAccess() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    if (!isAdmin()) {
        window.location.href = 'excel.html';
        return false;
    }
    return true;
}