const MOCK_DATA = [
    { id: 1, name: '张三', department: '技术部', salary: '15000', phone: '13800138001', email: 'zhangsan@example.com', address: '北京市朝阳区', notes: '高级工程师' },
    { id: 2, name: '李四', department: '市场部', salary: '12000', phone: '13800138002', email: 'lisi@example.com', address: '北京市海淀区', notes: '市场经理' },
    { id: 3, name: '王五', department: '人事部', salary: '10000', phone: '13800138003', email: 'wangwu@example.com', address: '北京市西城区', notes: 'HR专员' },
    { id: 4, name: '赵六', department: '技术部', salary: '18000', phone: '13800138004', email: 'zhaoliu@example.com', address: '北京市东城区', notes: '架构师' },
    { id: 5, name: '钱七', department: '财务部', salary: '11000', phone: '13800138005', email: 'qianqi@example.com', address: '北京市丰台区', notes: '财务主管' },
    { id: 6, name: '孙八', department: '市场部', salary: '9000', phone: '13800138006', email: 'sunba@example.com', address: '北京市石景山区', notes: '市场专员' },
    { id: 7, name: '周九', department: '技术部', salary: '14000', phone: '13800138007', email: 'zhoujiu@example.com', address: '北京市通州区', notes: '前端开发' },
    { id: 8, name: '吴十', department: '人事部', salary: '8500', phone: '13800138008', email: 'wushi@example.com', address: '北京市顺义区', notes: 'HR助理' }
];

let currentData = [...MOCK_DATA];

function renderTable() {
    const table = document.getElementById('excelTable');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    const columnConfig = getColumnConfig();
    const session = getCurrentSession();
    const permissions = session ? session.permissions : {};
    
    thead.innerHTML = '<tr></tr>';
    tbody.innerHTML = '';
    
    const visibleColumns = columnConfig.filter(col => {
        const perm = permissions[col.key];
        return !perm || perm.visible !== false;
    });
    
    visibleColumns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col.label;
        th.dataset.columnKey = col.key;
        thead.querySelector('tr').appendChild(th);
    });
    
    currentData.forEach(row => {
        const tr = document.createElement('tr');
        tr.dataset.rowId = row.id;
        
        visibleColumns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = row[col.key];
            td.dataset.columnKey = col.key;
            
            const perm = permissions[col.key];
            if (perm && perm.editable === true) {
                td.contentEditable = true;
                td.addEventListener('blur', handleCellEdit);
            } else {
                td.contentEditable = false;
            }
            
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
}

function handleCellEdit(e) {
    const td = e.target;
    const rowId = parseInt(td.parentElement.dataset.rowId);
    const columnKey = td.dataset.columnKey;
    const newValue = td.textContent.trim();
    
    const rowIndex = currentData.findIndex(row => row.id === rowId);
    if (rowIndex !== -1) {
        currentData[rowIndex][columnKey] = newValue;
    }
}

function initUserInfo() {
    const session = getCurrentSession();
    if (session) {
        document.getElementById('currentUserName').textContent = session.name;
        document.getElementById('currentUserRole').textContent = session.role === 'admin' ? '管理员' : '普通用户';
        
        if (session.role !== 'admin') {
            document.getElementById('adminBtn').style.display = 'none';
        }
    }
}

function initEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
        window.location.href = 'login.html';
    });
    
    document.getElementById('adminBtn').addEventListener('click', function() {
        window.location.href = 'admin.html';
    });
}

function init() {
    if (!checkAccess()) {
        return;
    }
    initUserInfo();
    initEventListeners();
    renderTable();
}