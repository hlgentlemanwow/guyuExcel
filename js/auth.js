const DEFAULT_USERS = [
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
    }
};

function initUsers() {
    const stored = localStorage.getItem('excel_users');
    if (!stored) {
        localStorage.setItem('excel_users', JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
    }
    return JSON.parse(stored);
}

function saveUsers(users) {
    localStorage.setItem('excel_users', JSON.stringify(users));
}

function getUsers() {
    const stored = localStorage.getItem('excel_users');
    return stored ? JSON.parse(stored) : initUsers();
}

function getUserByUsername(username) {
    const users = getUsers();
    return users.find(u => u.username === username);
}

function addUser(user) {
    const users = getUsers();
    if (users.find(u => u.username === user.username)) {
        return { success: false, message: '用户名已存在' };
    }
    users.push(user);
    saveUsers(users);
    
    const columnConfig = getColumnConfig();
    const defaultPerm = {};
    columnConfig.forEach(col => {
        defaultPerm[col.key] = { visible: true, editable: false };
    });
    const permissions = getAllPermissions();
    permissions[user.username] = defaultPerm;
    savePermissions(permissions);
    
    return { success: true };
}

function updateUser(username, updatedUser) {
    const users = getUsers();
    const index = users.findIndex(u => u.username === username);
    if (index === -1) {
        return { success: false, message: '用户不存在' };
    }
    
    if (username !== updatedUser.username) {
        if (users.find(u => u.username === updatedUser.username)) {
            return { success: false, message: '新用户名已存在' };
        }
        const permissions = getAllPermissions();
        permissions[updatedUser.username] = permissions[username];
        delete permissions[username];
        savePermissions(permissions);
    }
    
    users[index] = updatedUser;
    saveUsers(users);
    return { success: true };
}

function deleteUser(username) {
    if (username === 'admin') {
        return { success: false, message: '不能删除管理员账号' };
    }
    
    const users = getUsers();
    const newUsers = users.filter(u => u.username !== username);
    if (newUsers.length === users.length) {
        return { success: false, message: '用户不存在' };
    }
    
    saveUsers(newUsers);
    
    const permissions = getAllPermissions();
    delete permissions[username];
    savePermissions(permissions);
    
    return { success: true };
}

function getColumnConfig() {
    return COLUMN_CONFIG;
}

function login(username, password) {
    const user = getUserByUsername(username);
    if (user && user.password === password) {
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
    
    const columnConfig = getColumnConfig();
    const defaultPerm = {};
    columnConfig.forEach(col => {
        defaultPerm[col.key] = { visible: true, editable: false };
    });
    return defaultPerm;
}

function getAllPermissions() {
    const stored = localStorage.getItem('excel_permissions');
    if (stored) {
        return JSON.parse(stored);
    }
    
    const permissions = { ...DEFAULT_PERMISSIONS };
    const users = getUsers();
    const columnConfig = getColumnConfig();
    
    users.forEach(user => {
        if (!permissions[user.username]) {
            const defaultPerm = {};
            columnConfig.forEach(col => {
                defaultPerm[col.key] = { visible: true, editable: false };
            });
            permissions[user.username] = defaultPerm;
        }
    });
    
    savePermissions(permissions);
    return permissions;
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