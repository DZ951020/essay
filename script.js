// 随笔便笺应用 - JavaScript 核心逻辑

// DOM 元素获取
console.log('开始获取DOM元素...');
const newNoteBtn = document.getElementById('newNoteBtn');
const mobileNewNoteBtn = document.getElementById('mobileNewNoteBtn');
const noteModal = document.getElementById('noteModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const notesGrid = document.getElementById('notesGrid');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');

// 检查DOM元素是否正确获取
console.log('DOM元素获取结果:');
console.log('newNoteBtn:', newNoteBtn);
console.log('mobileNewNoteBtn:', mobileNewNoteBtn);
console.log('noteModal:', noteModal);
console.log('cancelBtn:', cancelBtn);
console.log('saveBtn:', saveBtn);
console.log('notesGrid:', notesGrid);
console.log('noteTitle:', noteTitle);
console.log('noteContent:', noteContent);

// API 配置
// 动态获取当前主机地址，确保在不同访问方式下都能正确访问API
const API_BASE_URL = `http://${window.location.hostname}:3000/api`;
console.log('API_BASE_URL 配置:', API_BASE_URL);

// 编辑状态变量
let currentEditId = null;

// 初始化应用
function init() {
    loadNotes();
    bindEvents();
}

// 绑定事件
function bindEvents() {
    // 新建随笔按钮
    newNoteBtn.addEventListener('click', () => openModal());
    mobileNewNoteBtn.addEventListener('click', () => openModal());
    
    // 模态框按钮
    cancelBtn.addEventListener('click', closeModal);
    saveBtn.addEventListener('click', saveNote);
    
    // 点击模态框背景关闭
    noteModal.addEventListener('click', (e) => {
        if (e.target === noteModal) {
            closeModal();
        }
    });
    
    // ESC 键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !noteModal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// 打开模态框（支持编辑）
function openModal(note = null) {
    const modalTitle = document.getElementById('modalTitle');
    
    // 添加调试信息
    console.log('openModal调用，note参数:', note);
    console.log('note参数类型:', typeof note);
    console.log('modalTitle元素:', modalTitle);
    
    // 先强制设置为新建模式
    currentEditId = null;
    modalTitle.textContent = '新建随笔';
    noteTitle.value = '';
    noteContent.value = '';
    console.log('先设置为新建模式');
    
    // 然后检查是否需要改为编辑模式
    // 更严格的条件检查：只有当note是一个包含id属性的对象时，才进入编辑模式
    if (note && typeof note === 'object' && note.id) {
        // 编辑模式
        currentEditId = note.id;
        console.log('进入编辑模式，标题设置为: 编辑随笔');
        modalTitle.textContent = '编辑随笔';
        noteTitle.value = note.title || '';
        noteContent.value = note.content || '';
    }
    
    noteModal.classList.remove('hidden');
    noteModal.classList.add('fade-in');
    noteModal.classList.add('flex');
    noteTitle.focus();
}

// 关闭模态框
function closeModal() {
    noteModal.classList.add('hidden');
    noteModal.classList.remove('fade-in');
    noteModal.classList.remove('flex');
    clearModal();
}

// 清空模态框
function clearModal() {
    currentEditId = null;
    noteTitle.value = '';
    noteContent.value = '';
}

// 从后端API加载笔记
function loadNotes() {
    console.log('开始加载笔记...');
    // 直接构造完整的API地址，避免可能的重复拼接问题
    const apiUrl = `http://${window.location.hostname}:3000/api/essays`;
    console.log('API地址:', apiUrl);
    
    fetch(apiUrl)
        .then(response => {
            console.log('响应状态:', response.status);
            console.log('响应头:', response.headers);
            if (!response.ok) {
                throw new Error(`网络响应失败，状态码: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('获取到的笔记数据:', data);
            renderNotes(data.essays || []);
        })
        .catch(error => {
            console.error('加载笔记失败的详细信息:', error);
            alert('加载笔记失败，请检查网络连接或服务器状态');
            renderNotes([]);
        });
}

// 保存或更新笔记到后端API
function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (!title && !content) {
        alert('请输入标题或内容');
        return;
    }
    
    const noteData = { title, content };
    // 直接构造完整的API地址
    const baseUrl = `http://${window.location.hostname}:3000/api`;
    const url = currentEditId ? `${baseUrl}/essays/${currentEditId}` : `${baseUrl}/essays`;
    const method = currentEditId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(currentEditId ? '更新笔记失败' : '保存笔记失败');
        }
        return response.json();
    })
    .then(() => {
        // 重新加载笔记列表
        loadNotes();
        // 关闭模态框
        closeModal();
    })
    .catch(error => {
        console.error(currentEditId ? '更新笔记失败:' : '保存笔记失败:', error);
        alert(currentEditId ? '更新笔记失败，请检查网络连接或服务器状态' : '保存笔记失败，请检查网络连接或服务器状态');
    });
}

// 删除笔记
function deleteNote(id) {
    if (confirm('确定要删除这条随笔吗？')) {
        // 直接构造完整的API地址
        const baseUrl = `http://${window.location.hostname}:3000/api`;
        fetch(`${baseUrl}/essays/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('删除笔记失败');
            }
            // 重新加载笔记列表
            loadNotes();
        })
        .catch(error => {
            console.error('删除笔记失败:', error);
            alert('删除笔记失败，请检查网络连接或服务器状态');
        });
    }
}

// 渲染笔记列表
function renderNotes(notes) {
    notesGrid.innerHTML = '';
    
    if (notes.length === 0) {
        notesGrid.innerHTML = `
            <div class="col-span-1 md:col-span-3 lg:col-span-4 text-center py-16 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="text-lg">还没有随笔，点击右上角/右下角按钮新建一条吧</p>
            </div>
        `;
        return;
    }
    
    notes.forEach(note => {
        const noteCard = createNoteCard(note);
        notesGrid.appendChild(noteCard);
    });
}

// 创建笔记卡片
function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200';
    
    // 处理时间格式（确保兼容后端返回的时间字符串）
    const createdAt = new Date(note.created_at || note.createdAt).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // 处理id字段（确保兼容后端返回的数字id）
    const noteId = note.id;
    
    card.innerHTML = `
        ${note.title ? `<h3 class="text-lg font-semibold text-gray-800 mb-2">${escapeHtml(note.title)}</h3>` : ''}
        <p class="text-gray-600 mb-3 whitespace-pre-wrap">${escapeHtml(note.content)}</p>
        <div class="flex justify-between items-center text-xs text-gray-500">
            <span>${createdAt}</span>
            <div class="flex gap-2">
                <button onclick="openModal(${JSON.stringify(note).replace(/"/g, '&quot;')})" class="text-blue-500 hover:text-blue-700 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
                <button onclick="deleteNote(${noteId})" class="text-red-500 hover:text-red-700 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// HTML 转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 页面加载完成后初始化
console.log('添加DOMContentLoaded事件监听器...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded事件触发！');
    init();
});

// 也尝试直接调用init函数（备用方案）
console.log('直接调用init函数...');
setTimeout(() => {
    init();
}, 100);