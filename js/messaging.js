const API_URL = 'https://moon.planetsidemar.co';
let currentUser = null;

async function fetchUsers() {
    try {
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();
        populateUserSelect(users);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

function populateUserSelect(users) {
    const select = document.getElementById('user-select');
    select.innerHTML = '<option value="">Select a user</option>';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        select.appendChild(option);
    });
    select.addEventListener('change', handleUserChange);
}

async function handleUserChange(event) {
    currentUser = event.target.value;
    if (currentUser) {
        await fetchMessages();
    } else {
        document.getElementById('message-container').innerHTML = '';
    }
}

async function fetchMessages() {
    if (!currentUser) return;
    try {
        const response = await fetch(`${API_URL}/messages?user_id=${currentUser}`);
        const messages = await response.json();
        displayMessages(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

function displayMessages(messages) {
    const container = document.getElementById('message-container');
    container.innerHTML = '';
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(message.sender_id === parseInt(currentUser) ? 'sent' : 'received');
        messageDiv.textContent = message.content;
        container.appendChild(messageDiv);
    });
    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    if (!currentUser) return;
    const messageInput = document.getElementById('new-message');
    const content = messageInput.value.trim();
    if (!content) return;

    try {
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                sender_id: parseInt(currentUser), 
                recipient_id: parseInt(currentUser), // For simplicity, sending to self
                content: content 
            })
        });
        if (response.ok) {
            messageInput.value = '';
            await fetchMessages();
        } else {
            console.error('Error sending message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

async function createUser() {
    const nameInput = document.getElementById('new-user-name');
    const name = nameInput.value.trim();
    if (!name) return;

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name })
        });
        if (response.ok) {
            nameInput.value = '';
            await fetchUsers();
        } else {
            console.error('Error creating user');
        }
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

async function deleteUser() {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const user = document.getElementById('user-select');

    try {
        const response = await fetch(`${API_URL}/users/${user.value}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            console.error('Error deleting item');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}

// WebSocket connection for real-time updates
let socket;

function connectWebSocket() {
    socket = new WebSocket('wss://moon.planetsidemar.co/ws');
    
    socket.onmessage = function(event) {
        if (event.data === 'update') {
            fetchMessages();
        }
    };

    socket.onclose = function(event) {
        console.log('WebSocket connection closed. Reconnecting...');
        setTimeout(connectWebSocket, 1000);
    };

    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    connectWebSocket();
});