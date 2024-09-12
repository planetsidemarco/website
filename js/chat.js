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
    try {
        const response = await fetch(`${API_URL}/messages`);
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
        
        const senderName = document.createElement('span');
        senderName.classList.add('sender-name');
        senderName.textContent = message.sender_name;
        messageDiv.appendChild(senderName);
        
        const content = document.createElement('p');
        content.textContent = message.content;
        messageDiv.appendChild(content);
        
        const timestamp = document.createElement('span');
        timestamp.classList.add('timestamp');
        timestamp.textContent = new Date(message.timestamp).toLocaleString();
        messageDiv.appendChild(timestamp);
        
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
    if (!currentUser || !confirm('Are you sure you want to delete this user?')) return;

    try {
        const response = await fetch(`${API_URL}/users/${currentUser}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            currentUser = null;
            document.getElementById('user-select').value = '';
            document.getElementById('message-container').innerHTML = '';
            await fetchUsers();
            await fetchMessages();
        } else {
            console.error('Error deleting user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

let socket;

function connectWebSocket() {
    socket = new WebSocket('wss://moon.planetsidemar.co/ws');
    
    socket.onmessage = function(event) {
        if (event.data === 'update') {
            fetchMessages();
        } else if (event.data === 'user_deleted') {
            fetchUsers();
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

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    fetchMessages();
    connectWebSocket();
});