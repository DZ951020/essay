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
const isPublicCheckbox = document.getElementById('isPublic');

// Auth DOM
const authButtons = document.getElementById('authButtons');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const userMenu = document.getElementById('userMenu');
const usernameDisplay = document.getElementById('usernameDisplay');
const logoutBtn = document.getElementById('logoutBtn');
const authModal = document.getElementById('authModal');
const authModalTitle = document.getElementById('authModalTitle');
const authForm = document.getElementById('authForm');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const toggleAuthModeBtn = document.getElementById('toggleAuthMode');
const closeAuthModalBtn = document.getElementById('closeAuthModal');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Tabs DOM
const tabPlaza = document.getElementById('tabPlaza');
const tabMyNotes = document.getElementById('tabMyNotes');

// API 配置
const API_BASE_URL = `http://${window.location.hostname}:3000/api`;

// 状态变量
let currentEditId = null;
let isLoginMode = true; // true for login, false for register
let currentTab = 'plaza'; // 'plaza' or 'my'
let currentUser = null; // { id, username } or null

// 初始化应用
function init() {
    checkLoginStatus();
    bindEvents();
    switchTab('plaza'); // Default to Plaza
}

function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
        currentUser = JSON.parse(userStr);
        showLoggedInState();
    } else {
        currentUser = null;
        showLoggedOutState();
    }
}

function showLoggedInState() {
    authButtons.classList.add('hidden');
    userMenu.classList.remove('hidden');
    usernameDisplay.textContent = currentUser.username;

    // Show "My Notes" tab and "New Note" buttons
    tabMyNotes.classList.remove('hidden');
    newNoteBtn.classList.remove('hidden');
    mobileNewNoteBtn.classList.remove('hidden');
}

function showLoggedOutState() {
    authButtons.classList.remove('hidden');
    userMenu.classList.add('hidden');

    // Hide "My Notes" tab and "New Note" buttons
    tabMyNotes.classList.add('hidden');
    newNoteBtn.classList.add('hidden');
    mobileNewNoteBtn.classList.add('hidden');

    // Force switch to Plaza if not already
    if (currentTab === 'my') {
        switchTab('plaza');
    }
}

// 绑定事件
function bindEvents() {
    // 基础随笔事件
    newNoteBtn.addEventListener('click', () => openModal());
    mobileNewNoteBtn.addEventListener('click', () => openModal());
    cancelBtn.addEventListener('click', closeModal);
    saveBtn.addEventListener('click', saveNote);
    noteModal.addEventListener('click', (e) => { if (e.target === noteModal) closeModal(); });

    // Auth 事件
    loginBtn.addEventListener('click', () => openAuthModal(true));
    registerBtn.addEventListener('click', () => openAuthModal(false));
    closeAuthModalBtn.addEventListener('click', closeAuthModal);
    authModal.addEventListener('click', (e) => { if (e.target === authModal) closeAuthModal(); });
    toggleAuthModeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        updateAuthModalUI();
    });
    authForm.addEventListener('submit', handleAuthSubmit);
    logoutBtn.addEventListener('click', handleLogout);

    // Tab 事件
    tabPlaza.addEventListener('click', () => switchTab('plaza'));
    tabMyNotes.addEventListener('click', () => switchTab('my'));
}

// --- Tab Logic ---
function switchTab(tab) {
    currentTab = tab;

    // Update UI Styles
    if (tab === 'plaza') {
        tabPlaza.className = "px-6 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600 focus:outline-none transition-colors";
        tabMyNotes.className = "px-6 py-3 text-sm font-medium text-gray-500 hover:text-blue-600 focus:outline-none transition-colors";
        if (!currentUser && !tabMyNotes.classList.contains('hidden')) {
            // If logout happened but My Notes still visible (edge case), hide it
            tabMyNotes.classList.add('hidden');
        }
    } else {
        tabMyNotes.className = "px-6 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600 focus:outline-none transition-colors";
        tabPlaza.className = "px-6 py-3 text-sm font-medium text-gray-500 hover:text-blue-600 focus:outline-none transition-colors";
    }

    loadNotes();
}

// --- Auth Logic ---
function openAuthModal(isLogin) {
    isLoginMode = isLogin;
    updateAuthModalUI();
    authModal.classList.remove('hidden');
    authModal.classList.add('flex');
}

function closeAuthModal() {
    authModal.classList.add('hidden');
    authModal.classList.remove('flex');
    usernameInput.value = '';
    passwordInput.value = '';
}

function updateAuthModalUI() {
    if (isLoginMode) {
        authModalTitle.textContent = '登录';
        authSubmitBtn.textContent = '登录';
        toggleAuthModeBtn.textContent = '没有账号？去注册';
    } else {
        authModalTitle.textContent = '注册';
        authSubmitBtn.textContent = '注册';
        toggleAuthModeBtn.textContent = '已有账号？去登录';
    }
}

function handleAuthSubmit(e) {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) return alert('请填写完整');

    const endpoint = isLoginMode ? '/login' : '/register';

    fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || '操作失败');
            return data;
        })
        .then(data => {
            if (isLoginMode) {
                // Login Success
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                closeAuthModal();
                checkLoginStatus();
                alert('登录成功');
            } else {
                // Register Success
                alert('注册成功，请登录');
                isLoginMode = true; // Switch to login
                updateAuthModalUI();
                // Auto fill logic could be here
            }
        })
        .catch(err => {
            alert(err.message);
        });
}

function handleLogout() {
    if (confirm("确定要退出吗？")) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        checkLoginStatus();
        alert("已退出登录");
    }
}

// --- Helper for Authorized Fetch ---
function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = options.headers || {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
}


// --- Note Logic ---

function openModal(note = null) {
    const modalTitle = document.getElementById('modalTitle');
    currentEditId = null;
    modalTitle.textContent = '新建随笔';
    noteTitle.value = '';
    noteContent.value = '';
    isPublicCheckbox.checked = false; // Default private

    if (note && typeof note === 'object' && note.id) {
        currentEditId = note.id;
        modalTitle.textContent = '编辑随笔';
        noteTitle.value = note.title || '';
        noteContent.value = note.content || '';
        isPublicCheckbox.checked = !!note.is_public;
    }

    noteModal.classList.remove('hidden');
    noteModal.classList.add('flex');
    noteTitle.focus();
}

function closeModal() {
    noteModal.classList.add('hidden');
    noteModal.classList.remove('flex');
}

function loadNotes() {
    const type = currentTab === 'my' ? 'my' : 'public';
    const url = `${API_BASE_URL}/essays?type=${type}`;

    // Use authFetch even for public to be safe, though public endpoint might not need it strictly
    authFetch(url)
        .then(res => {
            if (res.status === 401 || res.status === 403) {
                // Token invalid or expired
                if (type === 'my') {
                    handleLogout(); // Force logout
                    throw new Error("认证失效，请重新登录");
                }
            }
            if (!res.ok) throw new Error("加载失败");
            return res.json();
        })
        .then(data => renderNotes(data.essays || []))
        .catch(err => {
            console.error(err);
            if (currentTab === 'my') {
                notesGrid.innerHTML = `<p class="text-center text-red-500 w-full col-span-4 mt-10">${err.message}</p>`;
            } else {
                // If public load fails, maybe just show empty
                renderNotes([]);
            }
        });
}

function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    const isPublic = isPublicCheckbox.checked;

    if (!title && !content) return alert('请输入标题或内容');

    const noteData = { title, content, is_public: isPublic };
    const url = currentEditId ? `${API_BASE_URL}/essays/${currentEditId}` : `${API_BASE_URL}/essays`;
    const method = currentEditId ? 'PUT' : 'POST';

    authFetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
    })
        .then(async res => {
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '保存失败');
            }
            return res.json();
        })
        .then(() => {
            loadNotes();
            closeModal();
        })
        .catch(err => {
            alert(err.message);
        });
}

function deleteNote(id) {
    if (confirm('确定要删除这条随笔吗？')) {
        authFetch(`${API_BASE_URL}/essays/${id}`, { method: 'DELETE' })
            .then(async res => {
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || '删除失败');
                }
                loadNotes();
            })
            .catch(err => alert(err.message));
    }
}

function renderNotes(notes) {
    notesGrid.innerHTML = '';

    if (notes.length === 0) {
        notesGrid.innerHTML = `
            <div class="col-span-1 md:col-span-3 lg:col-span-4 text-center py-16 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="text-lg">没有找到随笔</p>
                ${currentTab === 'my' ? '<p class="text-sm mt-2">点击"新建随笔"添加一条吧</p>' : ''}
            </div>
        `;
        return;
    }

    notes.forEach(note => {
        notesGrid.appendChild(createNoteCard(note));
    });
}

function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200';

    const createdAt = new Date(note.created_at || note.createdAt).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    // Ownership check for buttons
    let buttonsHtml = '';
    // Only show delete/edit if current user owns the note
    // Note: Backend won't allow it anyway, but UI should hide it
    if (currentUser && note.user_id === currentUser.id) {
        buttonsHtml = `
            <div class="flex gap-2">
                <button onclick="window.editNoteHelper(${note.id})" class="text-blue-500 hover:text-blue-700 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" title="编辑">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
                <button onclick="deleteNote(${note.id})" class="text-red-500 hover:text-red-700 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" title="删除">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
         `;
    }

    // Badge
    const badge = note.is_public ?
        `<span class="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">公开</span>` :
        `<span class="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">私密</span>`;

    card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            ${note.title ? `<h3 class="text-lg font-semibold text-gray-800 line-clamp-1 flex-1">${escapeHtml(note.title)}</h3>` : '<div class="flex-1"></div>'}
            ${currentTab === 'my' ? badge : ''}
        </div>
        <p class="text-gray-600 mb-3 whitespace-pre-wrap line-clamp-4">${escapeHtml(note.content)}</p>
        <div class="flex justify-between items-center text-xs text-gray-500">
            <span>${createdAt}</span>
            ${buttonsHtml}
        </div>
    `;

    // Hack to attach data for edit helper since onclick stringifying is messy with quotes
    // Storing data in a global map or simply fetching it again on edit is better, 
    // but here we can just attach it to a property of the button if we constructed safely, 
    // or use a global helper.
    // Let's use a global helper that finds the note from current memory.
    // Ideally we should keep 'notes' in memory.
    window.currentNotesMap = window.currentNotesMap || {};
    window.currentNotesMap[note.id] = note;

    return card;
}

// Global helper for edit button
window.editNoteHelper = function (id) {
    const note = window.currentNotesMap[id];
    if (note) openModal(note);
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', init);