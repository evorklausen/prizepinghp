// PrizePin Game - Main JavaScript File

// Game State
const gameState = {
    currentUser: null,
    users: [],
    currentPin: '',
    timer: 30,
    timerInterval: null,
    adminMode: false,
    balanceClickCount: 0,
    availablePrizes: [
        { name: 'Rare Gem', baseValue: 50 },
        { name: 'Golden Trophy', baseValue: 75 },
        { name: 'Mystery Box', baseValue: 30 },
        { name: 'Silver Coin', baseValue: 25 },
        { name: 'Diamond Ring', baseValue: 100 },
        { name: 'Bronze Medal', baseValue: 20 },
        { name: 'Ancient Artifact', baseValue: 60 },
        { name: 'Crystal Shard', baseValue: 40 },
        { name: 'Platinum Watch', baseValue: 85 },
        { name: 'Enchanted Amulet', baseValue: 70 }
    ],
    currentPrize: null,
    marketplace: []
};

// DOM Elements
const elements = {
    // Auth elements
    authSection: document.getElementById('auth-section'),
    loginForm: document.getElementById('login-form'),
    signupForm: document.getElementById('signup-form'),
    loginFormElement: document.getElementById('login-form-element'),
    signupFormElement: document.getElementById('signup-form-element'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    
    // User info elements
    userInfo: document.getElementById('user-info'),
    usernameDisplay: document.getElementById('username-display'),
    balanceDisplay: document.getElementById('balance-display'),
    logoutBtn: document.getElementById('logout-btn'),
    
    // Game elements
    gameSection: document.getElementById('game-section'),
    gameNav: document.getElementById('game-nav'),
    navBtns: document.querySelectorAll('.nav-btn'),
    timer: document.getElementById('timer'),
    prizeName: document.getElementById('prize-name'),
    pinGuessForm: document.getElementById('pin-guess-form'),
    pinGuessInput: document.getElementById('pin-guess'),
    
    // Inventory elements
    inventorySection: document.getElementById('inventory-section'),
    inventoryItems: document.getElementById('inventory-items'),
    
    // Marketplace elements
    marketplaceSection: document.getElementById('marketplace-section'),
    marketplaceItems: document.getElementById('marketplace-items'),
    
    // Modal elements
    prizeModal: document.getElementById('prize-modal'),
    wonPrizeName: document.getElementById('won-prize-name'),
    marketPrice: document.getElementById('market-price'),
    sellMarketBtn: document.getElementById('sell-market-btn'),
    customPriceBtn: document.getElementById('custom-price-btn'),
    keepPrizeBtn: document.getElementById('keep-prize-btn'),
    customPriceContainer: document.getElementById('custom-price-container'),
    customPriceInput: document.getElementById('custom-price-input'),
    confirmCustomPrice: document.getElementById('confirm-custom-price')
};

// Initialize the game
function initGame() {
    // Load saved data if available
    loadGameData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Generate initial PIN and prize
    generateNewPin();
    selectRandomPrize();
    
    // Initialize admin mode flag
    gameState.adminMode = false;
    
    // Set up auto-refresh for marketplace
    // This will refresh the marketplace data every 5 seconds
    setInterval(function() {
        // Only refresh if the marketplace section is visible
        if (!elements.marketplaceSection.classList.contains('hidden')) {
            loadGameData();
            updateMarketplaceUI();
        }
    }, 5000); // 5 seconds
}

// Function to refresh marketplace UI
function refreshMarketplace() {
    // Ensure marketplace UI is up-to-date with current data by reloading from storage
    // This ensures we're working with the latest data, preventing item duplication
    loadGameData();
    updateMarketplaceUI();
    alert('Marketplace refreshed!');
}

// Function to automatically refresh marketplace data
function autoRefreshMarketplace() {
    // Load the latest data from localStorage without showing an alert
    loadGameData();
    updateMarketplaceUI();
}

// Function to take an item off sale and return it to inventory
function takeOffSale(itemId) {
    // Load the latest data from localStorage to ensure we're working with up-to-date marketplace
    loadGameData();
    
    // Find the item in the marketplace
    const itemIndex = gameState.marketplace.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
        alert('Item not found or already sold.');
        return;
    }
    
    const item = gameState.marketplace[itemIndex];
    
    // Check if the current user is the seller
    if (item.sellerId !== gameState.currentUser.id) {
        alert('You can only take your own items off sale.');
        return;
    }
    
    // Create an inventory item from the marketplace item
    const inventoryItem = {
        name: item.name,
        baseValue: item.baseValue
    };
    
    // Add the item back to the user's inventory
    gameState.currentUser.inventory.push(inventoryItem);
    
    // Remove the item from the marketplace
    gameState.marketplace.splice(itemIndex, 1);
    
    // Save game data immediately to ensure other users see the updated marketplace
    saveGameData();
    
    // Update UI with the latest data
    updateInventoryUI();
    updateMarketplaceUI();
    
    // Show notification
    alert(`${item.name} has been returned to your inventory.`);
}

// Set up event listeners
function setupEventListeners() {
    // Tab switching
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchAuthTab(tabName);
        });
    });
    
    // Login form submission
    elements.loginFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });
    
    // Signup form submission
    elements.signupFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup();
    });
    
    // Logout button
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    // PIN guess submission
    elements.pinGuessForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handlePinGuess();
    });
    
    // Navigation buttons
    elements.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.getAttribute('data-section');
            switchGameSection(sectionId);
        });
    });
    
    // Prize modal buttons
    elements.sellMarketBtn.addEventListener('click', () => sellPrizeAtMarketPrice());
    elements.customPriceBtn.addEventListener('click', () => showCustomPriceInput());
    elements.keepPrizeBtn.addEventListener('click', () => keepPrize());
    elements.confirmCustomPrice.addEventListener('click', () => sellPrizeAtCustomPrice());
}

// Switch between login and signup tabs
function switchAuthTab(tabName) {
    // Update tab buttons
    elements.tabBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update form visibility
    if (tabName === 'login') {
        elements.loginForm.classList.add('active');
        elements.signupForm.classList.remove('active');
    } else {
        elements.loginForm.classList.remove('active');
        elements.signupForm.classList.add('active');
    }
}

// Switch between game sections
function switchGameSection(sectionId) {
    // Hide all sections
    elements.gameSection.classList.add('hidden');
    elements.inventorySection.classList.add('hidden');
    elements.marketplaceSection.classList.add('hidden');
    
    // Show selected section
    document.getElementById(sectionId).classList.remove('hidden');
    
    // Update nav buttons
    elements.navBtns.forEach(btn => {
        if (btn.getAttribute('data-section') === sectionId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update UI for the selected section
    if (sectionId === 'inventory-section') {
        // Load the latest data before updating inventory UI
        loadGameData();
        updateInventoryUI();
    } else if (sectionId === 'marketplace-section') {
        // Load the latest data before updating marketplace UI
        loadGameData();
        updateMarketplaceUI();
    }
}

// Handle login form submission
function handleLogin() {
    const pin = document.getElementById('login-pin').value;
    const name = document.getElementById('login-name').value;
    
    // Special case for admin account - allow any length PIN
    if (name === 'evork123testtest') {
        // Create a temporary admin user if it doesn't exist
        let adminUser = gameState.users.find(u => u.name === 'evork123testtest');
        
        if (!adminUser) {
            adminUser = {
                id: `admin-${Date.now()}`,
                name: 'evork123testtest',
                pin: pin,  // Use whatever PIN was entered
                balance: 9999,
                inventory: [],
                isBot: false,
                isAdmin: true
            };
            gameState.users.push(adminUser);
        }
        
        // Set as current user
        gameState.currentUser = adminUser;
        gameState.adminMode = true;
        showGameUI();
        setupAdminFeatures();
        return;
    }
    
    // Regular login check - PIN must be 8 digits
    if (pin.length !== 8 || !/^\d+$/.test(pin)) {
        alert('PIN must be exactly 8 digits for regular accounts.');
        return;
    }
    
    const user = gameState.users.find(u => u.pin === pin && u.name === name && !u.isBot);
    
    if (user) {
        // Login successful
        gameState.currentUser = user;
        gameState.adminMode = false;
        showGameUI();
    } else {
        alert('Invalid PIN or username. Please try again.');
    }
}

// Handle signup form submission
function handleSignup() {
    const pin = document.getElementById('signup-pin').value;
    const name = document.getElementById('signup-name').value;
    
    // Validate PIN (must be 8 digits)
    if (pin.length !== 8 || !/^\d+$/.test(pin)) {
        alert('PIN must be exactly 8 digits.');
        return;
    }
    
    // Check if username is already taken
    if (gameState.users.some(u => u.name === name)) {
        alert('Username already taken. Please choose another one.');
        return;
    }
    
    // Create new user
    const newUser = {
        id: `user-${Date.now()}`,
        name: name,
        pin: pin,
        balance: 50, // Starting balance of $50
        inventory: [],
        isBot: false
    };
    
    // Add user to game state
    gameState.users.push(newUser);
    gameState.currentUser = newUser;
    
    // Save game data
    saveGameData();
    
    // Show game UI
    showGameUI();
}

// Handle logout
function handleLogout() {
    // Stop timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    // Reset current user and admin mode
    gameState.currentUser = null;
    gameState.adminMode = false;
    
    // Show auth UI
    showAuthUI();
}

// Show authentication UI
function showAuthUI() {
    elements.authSection.classList.remove('hidden');
    elements.gameSection.classList.add('hidden');
    elements.inventorySection.classList.add('hidden');
    elements.marketplaceSection.classList.add('hidden');
    elements.userInfo.classList.add('hidden');
    elements.gameNav.classList.add('hidden');
    
    // Clear form inputs
    document.getElementById('login-pin').value = '';
    document.getElementById('login-name').value = '';
    document.getElementById('signup-pin').value = '';
    document.getElementById('signup-name').value = '';
}

// Show game UI
function showGameUI() {
    elements.authSection.classList.add('hidden');
    elements.gameSection.classList.remove('hidden');
    elements.userInfo.classList.remove('hidden');
    elements.gameNav.classList.remove('hidden');
    
    // Update user info
    elements.usernameDisplay.textContent = gameState.currentUser.name;
    updateBalanceDisplay();
    
    // Start timer
    startTimer();
    
    // Update game sections
    updateInventoryUI();
    updateMarketplaceUI();
}

// Generate a new 6-digit PIN
function generateNewPin() {
    gameState.currentPin = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Current PIN (for testing):', gameState.currentPin); // For testing purposes
}

// Select a random prize
function selectRandomPrize() {
    const randomIndex = Math.floor(Math.random() * gameState.availablePrizes.length);
    gameState.currentPrize = { ...gameState.availablePrizes[randomIndex] };
    elements.prizeName.textContent = gameState.currentPrize.name;
}

// Start the timer
function startTimer() {
    // Reset timer
    gameState.timer = 30;
    elements.timer.textContent = gameState.timer;
    
    // Clear existing interval if any
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // Start new interval
    gameState.timerInterval = setInterval(() => {
        gameState.timer--;
        elements.timer.textContent = gameState.timer;
        
        if (gameState.timer <= 0) {
            // Time's up, generate new PIN and prize
            clearInterval(gameState.timerInterval);
            generateNewPin();
            selectRandomPrize();
            startTimer();
        }
    }, 1000);
}

// Handle PIN guess
function handlePinGuess() {
    const guess = elements.pinGuessInput.value;
    
    if (guess === gameState.currentPin) {
        // Correct guess
        clearInterval(gameState.timerInterval);
        handleWin();
    } else {
        // Wrong guess
        alert('Wrong PIN! Try again.');
        elements.pinGuessInput.value = '';
        
        // Generate new PIN and prize
        generateNewPin();
        selectRandomPrize();
        startTimer();
    }
}

// Handle winning a prize
function handleWin() {
    // Show prize modal
    elements.wonPrizeName.textContent = gameState.currentPrize.name;
    
    // Calculate market price
    const marketPrice = calculateMarketPrice(gameState.currentPrize);
    elements.marketPrice.textContent = marketPrice;
    
    // Show modal
    elements.prizeModal.classList.remove('hidden');
    elements.customPriceContainer.classList.add('hidden');
    
    // Reset PIN input
    elements.pinGuessInput.value = '';
}

// Calculate market price for an item
function calculateMarketPrice(item) {
    // Find similar items in the marketplace
    const similarItems = gameState.marketplace.filter(i => i.name === item.name);
    
    if (similarItems.length > 0) {
        // Calculate average price
        const totalPrice = similarItems.reduce((sum, i) => sum + i.price, 0);
        return Math.floor(totalPrice / similarItems.length);
    } else {
        // No similar items, use base value
        return item.baseValue;
    }
}

// Sell prize at market price
function sellPrizeAtMarketPrice() {
    const price = parseInt(elements.marketPrice.textContent);
    sellPrize(price);
}

// Show custom price input
function showCustomPriceInput() {
    elements.customPriceContainer.classList.remove('hidden');
    elements.customPriceInput.value = elements.marketPrice.textContent; // Set default to market price
}

// Sell prize at custom price
function sellPrizeAtCustomPrice() {
    const price = parseInt(elements.customPriceInput.value);
    
    if (isNaN(price) || price <= 0) {
        alert('Please enter a valid price.');
        return;
    }
    
    sellPrize(price);
}

// Sell prize (common functionality)
function sellPrize(price) {
    // Create a marketplace listing instead of directly adding money
    const prize = { ...gameState.currentPrize };
    
    // List the item for sale in the marketplace
    const listing = {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: prize.name,
        baseValue: prize.baseValue,
        price: price,
        sellerId: gameState.currentUser.id,
        sellerName: gameState.currentUser.name
    };
    
    // Add to marketplace
    gameState.marketplace.push(listing);
    
    // Close modal
    elements.prizeModal.classList.add('hidden');
    
    // Generate new PIN and prize
    generateNewPin();
    selectRandomPrize();
    startTimer();
    
    // Save game data immediately to ensure other users can see the new listing
    saveGameData();
    
    // Update marketplace UI with the latest data
    updateMarketplaceUI();
    
    // Show notification
    alert(`${prize.name} has been listed in the marketplace for $${price}!`);
}

// Keep the prize
function keepPrize() {
    // Add prize to user's inventory
    const prize = { ...gameState.currentPrize };
    gameState.currentUser.inventory.push(prize);
    
    // Close modal
    elements.prizeModal.classList.add('hidden');
    
    // Generate new PIN and prize
    generateNewPin();
    selectRandomPrize();
    startTimer();
    
    // Update inventory UI
    updateInventoryUI();
    
    // Save game data
    saveGameData();
    
    // Show notification
    alert(`${prize.name} has been added to your inventory!`);
}

// Update balance display
function updateBalanceDisplay() {
    elements.balanceDisplay.textContent = `Balance: $${gameState.currentUser.balance}`;
}

// Update inventory UI
function updateInventoryUI() {
    const inventoryEl = elements.inventoryItems;
    inventoryEl.innerHTML = '';
    
    if (gameState.currentUser.inventory.length === 0) {
        inventoryEl.innerHTML = '<p>Your inventory is empty.</p>';
        return;
    }
    
    gameState.currentUser.inventory.forEach((item, index) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-price">Base Value: $${item.baseValue}</div>
            <div class="item-actions">
                <button class="btn primary-btn sell-item-btn" data-index="${index}">Sell</button>
            </div>
        `;
        
        inventoryEl.appendChild(itemCard);
    });
    
    // Add event listeners to sell buttons
    const sellButtons = document.querySelectorAll('.sell-item-btn');
    sellButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-index'));
            promptSellItem(index);
        });
    });
}

// Prompt user to sell an item from inventory
function promptSellItem(index) {
    const item = gameState.currentUser.inventory[index];
    const marketPrice = calculateMarketPrice(item);
    
    const customPrice = prompt(`Enter price for ${item.name} (Market price: $${marketPrice}):`, marketPrice);
    
    if (customPrice === null) return; // User cancelled
    
    const price = parseInt(customPrice);
    
    if (isNaN(price) || price <= 0) {
        alert('Please enter a valid price.');
        return;
    }
    
    // List item for sale
    listItemForSale(gameState.currentUser, item, price, index);
    
    // Update UI
    updateInventoryUI();
    updateMarketplaceUI();
    
    // Save game data
    saveGameData();
}

// List an item for sale in the marketplace
function listItemForSale(user, item, price, inventoryIndex) {
    // Create marketplace listing
    const listing = {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: item.name,
        baseValue: item.baseValue,
        price: price,
        sellerId: user.id,
        sellerName: user.name
    };
    
    // Add to marketplace
    gameState.marketplace.push(listing);
    
    // Remove from user's inventory
    if (inventoryIndex !== undefined) {
        user.inventory.splice(inventoryIndex, 1);
    } else {
        // Find the item in the inventory
        const index = user.inventory.findIndex(i => 
            i.name === item.name && i.baseValue === item.baseValue);
        if (index !== -1) {
            user.inventory.splice(index, 1);
        }
    }
    
    // Save game data immediately to ensure other users can see the new listing
    saveGameData();
}

// Update marketplace UI
function updateMarketplaceUI() {
    const marketplaceEl = elements.marketplaceItems;
    marketplaceEl.innerHTML = '';
    
    // Add refresh button at the top
    const refreshButton = document.createElement('button');
    refreshButton.className = 'btn primary-btn refresh-btn';
    refreshButton.textContent = 'Refresh Marketplace';
    refreshButton.addEventListener('click', refreshMarketplace);
    marketplaceEl.appendChild(refreshButton);
    
    // Add a container for the items
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'items-grid';
    marketplaceEl.appendChild(itemsContainer);
    
    // Always ensure we're working with the latest marketplace data from localStorage
    // This ensures all users see the same marketplace data
    loadGameData();
    
    if (gameState.marketplace.length === 0) {
        itemsContainer.innerHTML = '<p>No items available in the marketplace.</p>';
        return;
    }
    
    gameState.marketplace.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-price">$${item.price}</div>
            <div class="item-seller">Seller: ${item.sellerName}</div>
            <div class="item-actions">
                ${item.sellerId !== gameState.currentUser.id ? 
                    `<button class="btn primary-btn buy-item-btn" data-id="${item.id}">Buy</button>` : 
                    `<button class="btn secondary-btn take-off-sale-btn" data-id="${item.id}">Take Off Sale</button>`}
            </div>
        `;
        
        itemsContainer.appendChild(itemCard);
    });
    
    // Add event listeners to buy buttons
    const buyButtons = document.querySelectorAll('.buy-item-btn');
    buyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.getAttribute('data-id');
            buyMarketplaceItem(itemId);
        });
    });
    
    // Add event listeners to take off sale buttons
    const takeOffSaleButtons = document.querySelectorAll('.take-off-sale-btn');
    takeOffSaleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = btn.getAttribute('data-id');
            takeOffSale(itemId);
        });
    });
}

// Buy an item from the marketplace
function buyMarketplaceItem(itemId) {
    // Load the latest data from localStorage to ensure we're working with up-to-date marketplace
    loadGameData();
    
    // Find the item
    const itemIndex = gameState.marketplace.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
        alert('Item not found.');
        return;
    }
    
    const item = gameState.marketplace[itemIndex];
    
    // Check if user has enough money
    if (gameState.currentUser.balance < item.price) {
        alert('Not enough money to buy this item.');
        return;
    }
    
    // Find the seller
    const seller = gameState.users.find(user => user.id === item.sellerId);
    
    if (!seller) {
        alert('Seller not found.');
        return;
    }
    
    // Buy the item
    buyItem(gameState.currentUser, item, itemIndex);
    
    // Save game data immediately to ensure other users see the updated marketplace
    saveGameData();
    
    // Update UI with the latest data
    updateInventoryUI();
    updateMarketplaceUI();
}

// Buy an item (common functionality for user and bots)
function buyItem(buyer, item, itemIndex = -1) {
    // Find the item index if not provided
    if (itemIndex === -1) {
        itemIndex = gameState.marketplace.findIndex(i => i.id === item.id);
    }
    
    if (itemIndex === -1) {
        alert('Item not found or already sold.');
        return; // Item not found
    }
    
    // Transfer money directly
    buyer.balance -= item.price;
    
    // Find seller and update balance
    const seller = gameState.users.find(user => user.id === item.sellerId);
    if (seller) {
        seller.balance += item.price;
    }
    
    // Remove item from marketplace regardless of seller status
    gameState.marketplace.splice(itemIndex, 1);
    
    // Add item to buyer's inventory
    const boughtItem = {
        name: item.name,
        baseValue: item.baseValue
    };
    buyer.inventory.push(boughtItem);
    
    // Remove item from marketplace
    gameState.marketplace.splice(itemIndex, 1);
    
    // Save game data immediately to prevent item duplication
    saveGameData();
    
    // Update UI if the buyer is the current user
    if (buyer.id === gameState.currentUser.id) {
        updateBalanceDisplay();
        updateMarketplaceUI(); // Update marketplace UI to reflect the purchase
        alert(`You bought ${item.name} for $${item.price}!`);
    }
}

// Save game data to localStorage
function saveGameData() {
    const data = {
        users: gameState.users,
        marketplace: gameState.marketplace
    };
    
    localStorage.setItem('prizepinData', JSON.stringify(data));
}

// Load game data from localStorage
function loadGameData() {
    const savedData = localStorage.getItem('prizepinData');
    
    if (savedData) {
        const data = JSON.parse(savedData);
        gameState.users = data.users || [];
        gameState.marketplace = data.marketplace || [];
    }
}

// Setup admin features for the secret hack
function setupAdminFeatures() {
    // Reset click counter
    gameState.balanceClickCount = 0;
    
    // Add click event listener to balance display
    elements.balanceDisplay.addEventListener('click', function() {
        if (gameState.adminMode) {
            gameState.balanceClickCount++;
            
            if (gameState.balanceClickCount === 5) {
                // Show the current PIN after 5 clicks
                alert(`Current PIN: ${gameState.currentPin}`);
                gameState.balanceClickCount = 0; // Reset counter
            }
        }
    });
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initGame);