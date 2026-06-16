// Change this to your backend URL when deploying
const API_URL = "http://localhost:3000";

let currentTab = "signin";

// ─── Tab Switching ───────────────────────────────────────────────
function switchTab(tab) {
    currentTab = tab;
    document.getElementById("tab-signin").classList.toggle("active", tab === "signin");
    document.getElementById("tab-signup").classList.toggle("active", tab === "signup");
    document.getElementById("auth-btn").textContent = tab === "signin" ? "Sign In" : "Sign Up";
    hideMessages();
}

// ─── Auth ────────────────────────────────────────────────────────
async function handleAuth(e) {
    e.preventDefault();
    hideMessages();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (currentTab === "signup") {
        await signup(username, password);
    } else {
        await signin(username, password);
    }
}

async function signup(username, password) {
    const res = await apiFetch("/signup", "POST", { username, password });
    if (res.ok) {
        showSuccess("Account created! You can now sign in.");
        switchTab("signin");
    } else {
        const data = await res.json();
        showError(data.message || "Signup failed");
    }
}

async function signin(username, password) {
    const res = await apiFetch("/signin", "POST", { username, password });
    const data = await res.json();
    if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        showApp(username);
    } else {
        showError(data.message || "Sign in failed");
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    document.getElementById("auth-section").classList.remove("hidden");
    document.getElementById("todos-section").classList.add("hidden");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}

// ─── Todos ───────────────────────────────────────────────────────
async function loadTodos() {
    const res = await apiFetch("/todos", "GET");
    if (!res.ok) {
        if (res.status === 403) { logout(); return; }
        return;
    }
    const data = await res.json();
    renderTodos(data.todos || []);
}

function renderTodos(todos) {
    const container = document.getElementById("todos-container");
    if (todos.length === 0) {
        container.innerHTML = '<p class="empty-msg">No todos yet. Add one above!</p>';
        return;
    }
    container.innerHTML = todos.map(todo => `
        <div class="todo-item" id="todo-${todo._id}">
            <div class="todo-content">
                <h3>${escapeHtml(todo.title)}</h3>
                ${todo.description ? `<p>${escapeHtml(todo.description)}</p>` : ""}
            </div>
            <button class="btn-delete" onclick="deleteTodo('${todo._id}')" title="Delete">&#10005;</button>
        </div>
    `).join("");
}

async function addTodo(e) {
    e.preventDefault();
    const title = document.getElementById("todo-title").value.trim();
    const description = document.getElementById("todo-desc").value.trim();

    document.getElementById("todo-error").classList.add("hidden");

    const res = await apiFetch("/todo", "POST", { title, description });
    const data = await res.json();

    if (res.ok) {
        document.getElementById("todo-title").value = "";
        document.getElementById("todo-desc").value = "";
        await loadTodos();
    } else {
        document.getElementById("todo-error").textContent = data.message || "Failed to add todo";
        document.getElementById("todo-error").classList.remove("hidden");
    }
}

async function deleteTodo(id) {
    const res = await apiFetch(`/todo/${id}`, "DELETE");
    if (res.ok) {
        const el = document.getElementById(`todo-${id}`);
        if (el) el.remove();
        if (document.querySelectorAll(".todo-item").length === 0) {
            document.getElementById("todos-container").innerHTML = '<p class="empty-msg">No todos yet. Add one above!</p>';
        }
    }
}

// ─── Helpers ─────────────────────────────────────────────────────
async function apiFetch(path, method, body) {
    const token = localStorage.getItem("token");
    const opts = {
        method,
        headers: { "Content-Type": "application/json" }
    };
    if (token) opts.headers["Authorization"] = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);
    return fetch(API_URL + path, opts);
}

function showApp(username) {
    document.getElementById("auth-section").classList.add("hidden");
    document.getElementById("todos-section").classList.remove("hidden");
    document.getElementById("welcome-text").textContent = `Hi, ${username}`;
    loadTodos();
}

function showError(msg) {
    const el = document.getElementById("auth-error");
    el.textContent = msg;
    el.classList.remove("hidden");
}

function showSuccess(msg) {
    const el = document.getElementById("auth-success");
    el.textContent = msg;
    el.classList.remove("hidden");
}

function hideMessages() {
    document.getElementById("auth-error").classList.add("hidden");
    document.getElementById("auth-success").classList.add("hidden");
}

function escapeHtml(str) {
    return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ─── Init ────────────────────────────────────────────────────────
(function init() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (token && username) {
        showApp(username);
    }
})();
