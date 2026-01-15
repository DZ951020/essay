// 随笔便笺应用 - JavaScript 核心逻辑

// DOM 元素获取
const newNoteBtn = document.getElementById('newNoteBtn');
const mobileNewNoteBtn = document.getElementById('mobileNewNoteBtn');
const noteModal = document.getElementById('noteModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const notesGrid = document.getElementById('notesGrid');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');

// 存储键名
const STORAGE_KEY = 'responsive-notes';

// 初始化应用
function init() {
    loadNotes();
    bindEvents();
}

// 绑定事件
function bindEvents() {
    // 新建随笔按钮
    newNoteBtn.addEventListener('click', openModal);
    mobileNewNoteBtn.addEventListener('click', openModal);
    
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

// 打开模态框
function openModal() {
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
    noteTitle.value = '';
    noteContent.value = '';
}

// 从 localStorage 加载笔记
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // 按时间倒序排序
    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderNotes(notes);
}

// 保存笔记到 localStorage
function saveNotesToStorage(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// 保存新笔记
function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (!title && !content) {
        alert('请输入标题或内容');
        return;
    }
    
    const newNote = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString()
    };
    
    // 获取现有笔记
    const notes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // 添加新笔记到开头
    notes.unshift(newNote);
    // 保存到 localStorage
    saveNotesToStorage(notes);
    // 重新渲染笔记
    loadNotes();
    // 关闭模态框
    closeModal();
}

// 删除笔记
function deleteNote(id) {
    if (confirm('确定要删除这条随笔吗？')) {
        const notes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const updatedNotes = notes.filter(note => note.id !== id);
        saveNotesToStorage(updatedNotes);
        loadNotes();
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
    
    const createdAt = new Date(note.createdAt).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    card.innerHTML = `
        ${note.title ? `<h3 class="text-lg font-semibold text-gray-800 mb-2">${escapeHtml(note.title)}</h3>` : ''}
        <p class="text-gray-600 mb-3 whitespace-pre-wrap">${escapeHtml(note.content)}</p>
        <div class="flex justify-between items-center text-xs text-gray-500">
            <span>${createdAt}</span>
            <button onclick="deleteNote('${note.id}')" class="text-red-500 hover:text-red-700 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
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
document.addEventListener('DOMContentLoaded', init);