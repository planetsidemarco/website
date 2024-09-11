const API_URL = 'https://moon.planetsidemar.co';

async function fetchItems() {
    try {
        const response = await fetch(`${API_URL}/items`);
        const items = await response.json();
        displayItems(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        document.getElementById('items-container').innerHTML = 'Error loading items.';
    }
}

function displayItems(items) {
    const container = document.getElementById('items-container');
    if (items.length === 0) {
        container.innerHTML = 'No items found.';
    } else {
        const itemsList = items.map(item => `
            <div class="item">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <button onclick="editItem(${item.id})">Edit</button>
                <button onclick="deleteItem(${item.id})">Delete</button>
            </div>
        `).join('');
        container.innerHTML = itemsList;
    }
}

async function createItem() {
    const name = document.getElementById('new-name').value;
    const description = document.getElementById('new-description').value;
    
    try {
        const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });
        if (response.ok) {
            fetchItems();
            document.getElementById('new-name').value = '';
            document.getElementById('new-description').value = '';
        } else {
            console.error('Error creating item');
        }
    } catch (error) {
        console.error('Error creating item:', error);
    }
}

async function editItem(id) {
    const newName = prompt('Enter new name:');
    const newDescription = prompt('Enter new description:');
    
    if (newName === null || newDescription === null) return;

    try {
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, description: newDescription })
        });
        if (response.ok) {
            fetchItems();
        } else {
            console.error('Error updating item');
        }
    } catch (error) {
        console.error('Error updating item:', error);
    }
}

async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            fetchItems();
        } else {
            console.error('Error deleting item');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}

// Fetch items when the page loads
window.addEventListener('load', fetchItems);

function updateImage() {
    const select = document.getElementById('image-select');
    const image = document.getElementById('displayed-image');
    image.src = `https://moon.planetsidemar.co/image/${select.value}`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchItems();
    
    const imageSelect = document.getElementById('image-select');
    imageSelect.addEventListener('change', updateImage);
    
    // Initialize with the default selected image
    updateImage();
});