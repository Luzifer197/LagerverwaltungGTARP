const state = {
    currentUser: null,
    storages: [],
    currentStorage: null,
    nextStorageId: 1,
    nextItemId: 1
};

// DOM Elements
const elements = {
    // Auth elements
    loginView: document.getElementById('login-view'),
    dashboardView: document.getElementById('dashboard-view'),
    loginSection: document.getElementById('login-section'),
    userInfo: document.getElementById('user-info'),
    userAvatar: document.getElementById('user-avatar'),
    username: document.getElementById('username'),
    discordLoginBtn: document.getElementById('discord-login-btn'),
    mainDiscordLoginBtn: document.getElementById('main-discord-login-btn'),
    logoutBtn: document.getElementById('logout-btn'),

    // Storage elements
    storageList: document.getElementById('storage-list'),
    emptyState: document.getElementById('empty-state'),
    emptyAddStorageBtn: document.getElementById('empty-add-storage-btn'),
    storageDetails: document.getElementById('storage-details'),
    storageName: document.getElementById('storage-name'),
    storageType: document.getElementById('storage-type'),
    storageDescription: document.getElementById('storage-description'),
    itemsList: document.getElementById('items-list'),
    noItemsMessage: document.getElementById('no-items-message'),
    addStorageBtn: document.getElementById('add-storage-btn'),
    editStorageBtn: document.getElementById('edit-storage-btn'),
    deleteStorageBtn: document.getElementById('delete-storage-btn'),
    addItemBtn: document.getElementById('add-item-btn'),
    storageSearch: document.getElementById('storage-search'),
    itemSearch: document.getElementById('item-search'),
    categoryFilter: document.getElementById('category-filter'),
    totalLocations: document.getElementById('total-locations'),
    totalItems: document.getElementById('total-items'),

    // Modals
    storageModal: document.getElementById('storage-modal'),
    storageModalTitle: document.getElementById('storage-modal-title'),
    storageForm: document.getElementById('storage-form'),
    storageId: document.getElementById('storage-id'),
    storageNameInput: document.getElementById('storage-name-input'),
    storageTypeSelect: document.getElementById('storage-type-select'),
    storageDescriptionInput: document.getElementById('storage-description-input'),
    saveStorageBtn: document.getElementById('save-storage-btn'),
    cancelStorageBtn: document.getElementById('cancel-storage-btn'),
    closeStorageModal: document.getElementById('close-storage-modal'),

    itemModal: document.getElementById('item-modal'),
    itemModalTitle: document.getElementById('item-modal-title'),
    itemForm: document.getElementById('item-form'),
    itemId: document.getElementById('item-id'),
    itemStorageId: document.getElementById('item-storage-id'),
    itemNameInput: document.getElementById('item-name-input'),
    itemQuantityInput: document.getElementById('item-quantity-input'),
    itemCategorySelect: document.getElementById('item-category-select'),
    itemDescriptionInput: document.getElementById('item-description-input'),
    saveItemBtn: document.getElementById('save-item-btn'),
    cancelItemBtn: document.getElementById('cancel-item-btn'),
    closeItemModal: document.getElementById('close-item-modal'),

    confirmModal: document.getElementById('confirm-modal'),
    confirmModalTitle: document.getElementById('confirm-modal-title'),
    confirmModalMessage: document.getElementById('confirm-modal-message'),
    confirmActionBtn: document.getElementById('confirm-action-btn'),
    cancelConfirmBtn: document.getElementById('cancel-confirm-btn'),
    closeConfirmModal: document.getElementById('close-confirm-modal')
};

// Initialize the app
function init() {
    loadUserData();
    setupEventListeners();

    if (state.currentUser) {
        showDashboard();
        loadServers();
    } else {
        showLogin();
    }
}

// Load servers for current user
function loadServers() {
    if (state.servers.length === 0) {
        // Add default server if none exists
        const defaultServer = {
            id: state.nextServerId++,
            name: 'Main Server',
            ip: 'gtarp.example.com',
            description: 'Your main GTA RP server'
        };
        state.servers.push(defaultServer);
        state.currentServer = defaultServer;
        saveUserData();
    }
    renderServerList();
}

// Render server list
function renderServerList() {
    elements.serverList.innerHTML = '';

    state.servers.forEach(server => {
        const serverElement = document.createElement('div');
        serverElement.className = `p-3 rounded cursor-pointer transition-colors ${state.currentServer?.id === server.id ? 'bg-blue-900 bg-opacity-50' : 'hover:bg-gray-800'}`;
        serverElement.dataset.id = server.id;

        serverElement.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-medium">${server.name}</h3>
                    <div class="text-xs text-gray-400 mt-1">${server.ip}</div>
                </div>
                <i class="fas fa-server text-blue-400"></i>
            </div>
        `;

        serverElement.addEventListener('click', () => {
            state.currentServer = server;
            loadStorages();
            renderServerList();
        });

        elements.serverList.appendChild(serverElement);
    });
}

// Show server modal
function showServerModal(action, serverId = null) {
    if (action === 'add') {
        elements.serverModalTitle.textContent = 'Add Server';
        elements.serverForm.reset();
        elements.serverId.value = '';
    } else if (action === 'edit') {
        const server = state.servers.find(s => s.id === serverId);
        if (!server) return;

        elements.serverModalTitle.textContent = 'Edit Server';
        elements.serverId.value = server.id;
        elements.serverNameInput.value = server.name;
        elements.serverIpInput.value = server.ip;
        elements.serverDescriptionInput.value = server.description || '';
    }

    elements.serverModal.classList.remove('hidden');
}

// Close server modal
function closeServerModal() {
    elements.serverModal.classList.add('hidden');
}

// Handle server form submit
function handleServerFormSubmit(e) {
    e.preventDefault();

    const serverData = {
        name: elements.serverNameInput.value.trim(),
        ip: elements.serverIpInput.value.trim(),
        description: elements.serverDescriptionInput.value.trim()
    };

    if (elements.serverId.value) {
        // Edit existing server
        const serverId = parseInt(elements.serverId.value);
        const serverIndex = state.servers.findIndex(s => s.id === serverId);

        if (serverIndex !== -1) {
            state.servers[serverIndex] = { ...serverData, id: serverId };
            if (state.currentServer?.id === serverId) {
                state.currentServer = state.servers[serverIndex];
            }
        }
    } else {
        // Add new server
        const newServer = {
            ...serverData,
            id: state.nextServerId++
        };
        state.servers.push(newServer);
    }

    saveUserData();
    renderServerList();
    closeServerModal();
}

// Load user data from localStorage
function loadUserData() {
    const userData = localStorage.getItem('gta_rp_storage_user');
    if (userData) {
        state.currentUser = JSON.parse(userData);
    }

    const storageData = localStorage.getItem(`gta_rp_storage_data_${state.currentUser?.id}`);
    if (storageData) {
        const data = JSON.parse(storageData);
        state.storages = data.storages || [];
        state.nextStorageId = data.nextStorageId || 1;
        state.nextItemId = data.nextItemId || 1;
    }
}

// Save user data to localStorage
function saveUserData() {
    if (state.currentUser) {
        localStorage.setItem('gta_rp_storage_user', JSON.stringify(state.currentUser));

        const storageData = {
            storages: state.storages,
            nextStorageId: state.nextStorageId,
            nextItemId: state.nextItemId
        };

        localStorage.setItem(`gta_rp_storage_data_${state.currentUser.id}`, JSON.stringify(storageData));
    }
}

// Setup event listeners
function setupEventListeners() {
    // Auth events
    elements.discordLoginBtn.addEventListener('click', handleDiscordLogin);
    elements.mainDiscordLoginBtn.addEventListener('click', handleDiscordLogin);
    elements.logoutBtn.addEventListener('click', handleLogout);

    // Server events
    elements.addServerBtn.addEventListener('click', () => showServerModal('add'));
    elements.serverForm.addEventListener('submit', handleServerFormSubmit);
    elements.cancelServerBtn.addEventListener('click', closeServerModal);
    elements.closeServerModal.addEventListener('click', closeServerModal);

    // Storage events
    elements.addStorageBtn.addEventListener('click', () => showStorageModal('add'));
    elements.emptyAddStorageBtn.addEventListener('click', () => showStorageModal('add'));
    elements.editStorageBtn.addEventListener('click', () => showStorageModal('edit'));
    elements.deleteStorageBtn.addEventListener('click', () => showConfirmModal('delete-storage'));
    elements.addItemBtn.addEventListener('click', () => showItemModal('add'));
    elements.storageSearch.addEventListener('input', filterStorages);
    elements.itemSearch.addEventListener('input', filterItems);
    elements.categoryFilter.addEventListener('change', filterItems);

    // Modal events
    elements.storageForm.addEventListener('submit', handleStorageFormSubmit);
    elements.cancelStorageBtn.addEventListener('click', closeStorageModal);
    elements.closeStorageModal.addEventListener('click', closeStorageModal);

    elements.itemForm.addEventListener('submit', handleItemFormSubmit);
    elements.cancelItemBtn.addEventListener('click', closeItemModal);
    elements.closeItemModal.addEventListener('click', closeItemModal);

    elements.confirmActionBtn.addEventListener('click', handleConfirmAction);
    elements.cancelConfirmBtn.addEventListener('click', closeConfirmModal);
    elements.closeConfirmModal.addEventListener('click', closeConfirmModal);
}

// Show login view
function showLogin() {
    elements.loginView.classList.remove('hidden');
    elements.dashboardView.classList.add('hidden');
    elements.loginSection.classList.remove('hidden');
    elements.userInfo.classList.add('hidden');
}

// Show dashboard view
function showDashboard() {
    elements.loginView.classList.add('hidden');
    elements.dashboardView.classList.remove('hidden');
    elements.loginSection.classList.add('hidden');
    elements.userInfo.classList.remove('hidden');

    // Update user info
    if (state.currentUser) {
        elements.userAvatar.src = state.currentUser.avatar;
        elements.username.textContent = state.currentUser.username;
    }

    updateStats();
}

// Handle Discord login
function handleDiscordLogin() {
    // Redirect to Discord OAuth2
    const clientId = 'YOUR_DISCORD_CLIENT_ID';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    const scope = encodeURIComponent('identify email');
    const responseType = 'code';
    
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
    
    window.location.href = authUrl;
}

// Handle Discord callback (to be called from auth callback page)
function handleDiscordCallback(code) {
    // Exchange code for token
    fetch('/api/discord/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token) {
            // Get user info
            return fetch('/api/discord/user', {
                headers: {
                    'Authorization': `Bearer ${data.access_token}`
                }
            });
        }
        throw new Error('Failed to get access token');
    })
    .then(response => response.json())
    .then(user => {
        state.currentUser = {
            id: user.id,
            username: user.username,
            avatar: user.avatar 
                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                : 'https://cdn.discordapp.com/embed/avatars/0.png'
        };
        
        saveUserData();
        showDashboard();
    })
    .catch(error => {
        console.error('Login failed:', error);
        alert('Login failed. Please try again.');
    });
}

// Handle logout
function handleLogout() {
    state.currentUser = null;
    state.storages = [];
    state.currentStorage = null;
    state.nextStorageId = 1;
    state.nextItemId = 1;

    saveUserData();
    showLogin();
    clearStorageDetails();
}

// Load storages for current user
function loadStorages() {
    if (state.storages.length === 0) {
        elements.emptyState.classList.remove('hidden');
        elements.storageDetails.classList.add('hidden');
    } else {
        elements.emptyState.classList.add('hidden');
        renderStorageList();
    }
}

// Render storage list
function renderStorageList(filteredStorages = null) {
    const storagesToRender = filteredStorages || state.storages;
    elements.storageList.innerHTML = '';

    if (storagesToRender.length === 0) {
        elements.storageList.innerHTML = '<p class="text-gray-500 text-center py-4">No storage locations found</p>';
        return;
    }

    storagesToRender.forEach(storage => {
        const storageElement = document.createElement('div');
        storageElement.className = `p-3 rounded cursor-pointer transition-colors ${state.currentStorage?.id === storage.id ? 'bg-blue-900 bg-opacity-50' : 'hover:bg-gray-800'}`;
        storageElement.dataset.id = storage.id;

        storageElement.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-medium">${storage.name}</h3>
                            <div class="flex items-center text-xs text-gray-400 mt-1">
                                <span class="capitalize">${storage.type}</span>
                                <span class="mx-2">•</span>
                                <span>${storage.items.length} items</span>
                            </div>
                        </div>
                        <i class="fas fa-${getStorageIcon(storage.type)} text-blue-400"></i>
                    </div>
                `;

        storageElement.addEventListener('click', () => showStorageDetails(storage.id));
        elements.storageList.appendChild(storageElement);
    });
}

// Get icon for storage type
function getStorageIcon(type) {
    switch (type) {
        case 'vehicle': return 'car';
        case 'warehouse': return 'warehouse';
        case 'apartment': return 'home';
        case 'garage': return 'garage-car';
        default: return 'box';
    }
}

// Show storage details
function showStorageDetails(storageId) {
    const storage = state.storages.find(s => s.id === storageId);
    if (!storage) return;

    state.currentStorage = storage;

    // Update storage info
    elements.storageName.textContent = storage.name;
    elements.storageType.textContent = `${storage.type.charAt(0).toUpperCase() + storage.type.slice(1)} Storage`;
    elements.storageDescription.textContent = storage.description || 'No description provided.';
    elements.storageDescription.classList.toggle('italic', !storage.description);
    elements.storageDescription.classList.toggle('text-gray-500', !storage.description);

    // Highlight selected storage in list
    const storageElements = elements.storageList.querySelectorAll('[data-id]');
    storageElements.forEach(el => {
        el.classList.toggle('bg-blue-900', el.dataset.id === storageId.toString());
        el.classList.toggle('bg-opacity-50', el.dataset.id === storageId.toString());
    });

    // Render items
    renderItemsList();

    // Show the details panel
    elements.emptyState.classList.add('hidden');
    elements.storageDetails.classList.remove('hidden');
}

// Render items list
function renderItemsList(filteredItems = null) {
    if (!state.currentStorage) return;

    const itemsToRender = filteredItems || state.currentStorage.items;
    elements.itemsList.innerHTML = '';

    if (itemsToRender.length === 0) {
        elements.noItemsMessage.classList.remove('hidden');
        return;
    }

    elements.noItemsMessage.classList.add('hidden');

    itemsToRender.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'gta-panel p-3 rounded-lg';
        itemElement.dataset.id = item.id;

        itemElement.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-medium">${item.name}</h3>
                            <div class="flex items-center text-xs text-gray-400 mt-1">
                                <span class="category-badge category-${item.category}">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                                <span class="mx-2">•</span>
                                <span>Qty: ${item.quantity}</span>
                            </div>
                            ${item.description ? `<p class="text-sm text-gray-300 mt-2">${item.description}</p>` : ''}
                        </div>
                        <div class="flex space-x-2">
                            <button class="edit-item-btn gta-button-secondary px-2 py-1 rounded text-xs" data-id="${item.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-item-btn gta-button-danger px-2 py-1 rounded text-xs" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;

        elements.itemsList.appendChild(itemElement);
    });

    // Add event listeners to item buttons
    document.querySelectorAll('.edit-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showItemModal('edit', parseInt(btn.dataset.id));
        });
    });

    document.querySelectorAll('.delete-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showConfirmModal('delete-item', parseInt(btn.dataset.id));
        });
    });
}

// Clear storage details
function clearStorageDetails() {
    elements.storageDetails.classList.add('hidden');
    elements.emptyState.classList.remove('hidden');
    state.currentStorage = null;
}

// Show storage modal (add or edit)
function showStorageModal(action, storageId = null) {
    if (action === 'add') {
        elements.storageModalTitle.textContent = 'Add Storage Location';
        elements.storageForm.reset();
        elements.storageId.value = '';
    } else if (action === 'edit' && state.currentStorage) {
        elements.storageModalTitle.textContent = 'Edit Storage Location';
        elements.storageId.value = state.currentStorage.id;
        elements.storageNameInput.value = state.currentStorage.name;
        elements.storageTypeSelect.value = state.currentStorage.type;
        elements.storageDescriptionInput.value = state.currentStorage.description || '';
    }

    elements.storageModal.classList.remove('hidden');
}

// Close storage modal
function closeStorageModal() {
    elements.storageModal.classList.add('hidden');
}

// Handle storage form submit
function handleStorageFormSubmit(e) {
    e.preventDefault();

    const storageData = {
        name: elements.storageNameInput.value.trim(),
        type: elements.storageTypeSelect.value,
        description: elements.storageDescriptionInput.value.trim(),
        items: []
    };

    if (elements.storageId.value) {
        // Edit existing storage
        const storageId = parseInt(elements.storageId.value);
        const storageIndex = state.storages.findIndex(s => s.id === storageId);

        if (storageIndex !== -1) {
            storageData.items = state.storages[storageIndex].items;
            state.storages[storageIndex] = { ...storageData, id: storageId };

            if (state.currentStorage && state.currentStorage.id === storageId) {
                state.currentStorage = state.storages[storageIndex];
                showStorageDetails(storageId);
            }
        }
    } else {
        // Add new storage
        const newStorage = {
            ...storageData,
            id: state.nextStorageId++
        };

        state.storages.push(newStorage);

        // If this is the first storage, show its details
        if (state.storages.length === 1) {
            state.currentStorage = newStorage;
            showStorageDetails(newStorage.id);
        }
    }

    saveUserData();
    renderStorageList();
    updateStats();
    closeStorageModal();

    // Hide empty state if it's visible
    elements.emptyState.classList.add('hidden');
}

// Show item modal (add or edit)
function showItemModal(action, itemId = null) {
    if (!state.currentStorage) return;

    if (action === 'add') {
        elements.itemModalTitle.textContent = 'Add Item';
        elements.itemForm.reset();
        elements.itemId.value = '';
        elements.itemQuantityInput.value = '1';
        elements.itemStorageId.value = state.currentStorage.id;
    } else if (action === 'edit') {
        const item = state.currentStorage.items.find(i => i.id === itemId);
        if (!item) return;

        elements.itemModalTitle.textContent = 'Edit Item';
        elements.itemId.value = item.id;
        elements.itemStorageId.value = state.currentStorage.id;
        elements.itemNameInput.value = item.name;
        elements.itemQuantityInput.value = item.quantity;
        elements.itemCategorySelect.value = item.category;
        elements.itemDescriptionInput.value = item.description || '';
    }

    elements.itemModal.classList.remove('hidden');
}

// Close item modal
function closeItemModal() {
    elements.itemModal.classList.add('hidden');
}

// Handle item form submit
function handleItemFormSubmit(e) {
    e.preventDefault();

    if (!state.currentStorage) return;

    const itemData = {
        name: elements.itemNameInput.value.trim(),
        quantity: parseInt(elements.itemQuantityInput.value),
        category: elements.itemCategorySelect.value,
        description: elements.itemDescriptionInput.value.trim()
    };

    if (elements.itemId.value) {
        // Edit existing item
        const itemId = parseInt(elements.itemId.value);
        const itemIndex = state.currentStorage.items.findIndex(i => i.id === itemId);

        if (itemIndex !== -1) {
            state.currentStorage.items[itemIndex] = { ...itemData, id: itemId };

            // Update the storage in the main array
            const storageIndex = state.storages.findIndex(s => s.id === state.currentStorage.id);
            if (storageIndex !== -1) {
                state.storages[storageIndex] = state.currentStorage;
            }
        }
    } else {
        // Add new item
        const newItem = {
            ...itemData,
            id: state.nextItemId++
        };

        state.currentStorage.items.push(newItem);

        // Update the storage in the main array
        const storageIndex = state.storages.findIndex(s => s.id === state.currentStorage.id);
        if (storageIndex !== -1) {
            state.storages[storageIndex] = state.currentStorage;
        }
    }

    saveUserData();
    renderItemsList();
    updateStats();
    closeItemModal();
}

// Show confirm modal
function showConfirmModal(action, itemId = null) {
    elements.confirmModal.classList.remove('hidden');

    if (action === 'delete-storage') {
        elements.confirmModalTitle.textContent = 'Delete Storage Location';
        elements.confirmModalMessage.textContent = 'Are you sure you want to delete this storage location and all its items? This action cannot be undone.';
        elements.confirmActionBtn.dataset.action = 'delete-storage';
    } else if (action === 'delete-item') {
        const item = state.currentStorage?.items.find(i => i.id === itemId);
        if (!item) return;

        elements.confirmModalTitle.textContent = 'Delete Item';
        elements.confirmModalMessage.textContent = `Are you sure you want to delete "${item.name}" from this storage?`;
        elements.confirmActionBtn.dataset.action = 'delete-item';
        elements.confirmActionBtn.dataset.id = itemId;
    }
}

// Close confirm modal
function closeConfirmModal() {
    elements.confirmModal.classList.add('hidden');
    elements.confirmActionBtn.dataset.action = '';
    elements.confirmActionBtn.dataset.id = '';
}

// Handle confirm action
function handleConfirmAction() {
    const action = elements.confirmActionBtn.dataset.action;

    if (action === 'delete-storage' && state.currentStorage) {
        // Delete storage
        const storageIndex = state.storages.findIndex(s => s.id === state.currentStorage.id);
        if (storageIndex !== -1) {
            state.storages.splice(storageIndex, 1);
            clearStorageDetails();

            if (state.storages.length === 0) {
                elements.emptyState.classList.remove('hidden');
            }
        }
    } else if (action === 'delete-item') {
        // Delete item
        const itemId = parseInt(elements.confirmActionBtn.dataset.id);
        if (state.currentStorage) {
            const itemIndex = state.currentStorage.items.findIndex(i => i.id === itemId);
            if (itemIndex !== -1) {
                state.currentStorage.items.splice(itemIndex, 1);

                // Update the storage in the main array
                const storageIndex = state.storages.findIndex(s => s.id === state.currentStorage.id);
                if (storageIndex !== -1) {
                    state.storages[storageIndex] = state.currentStorage;
                }

                renderItemsList();
            }
        }
    }

    saveUserData();
    renderStorageList();
    updateStats();
    closeConfirmModal();
}

// Filter storages by search term
function filterStorages() {
    const searchTerm = elements.storageSearch.value.toLowerCase();

    if (!searchTerm) {
        renderStorageList();
        return;
    }

    const filteredStorages = state.storages.filter(storage =>
        storage.name.toLowerCase().includes(searchTerm) ||
        storage.type.toLowerCase().includes(searchTerm) ||
        (storage.description && storage.description.toLowerCase().includes(searchTerm))
    );

    renderStorageList(filteredStorages);
}

// Filter items by search term and category
function filterItems() {
    if (!state.currentStorage) return;

    const searchTerm = elements.itemSearch.value.toLowerCase();
    const categoryFilter = elements.categoryFilter.value;

    let filteredItems = [...state.currentStorage.items];

    if (searchTerm) {
        filteredItems = filteredItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm))
        );
    }

    if (categoryFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === categoryFilter);
    }

    renderItemsList(filteredItems);
}

// Update stats
function updateStats() {
    const totalLocations = state.storages.length;
    const totalItems = state.storages.reduce((sum, storage) => sum + storage.items.length, 0);

    elements.totalLocations.textContent = totalLocations;
    elements.totalItems.textContent = totalItems;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);