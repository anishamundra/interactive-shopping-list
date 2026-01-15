// Data model 
let items = [];
// Current filter state ('all', 'active', or 'purchased')
let currentFilter = "all";

// DOM elements
// Get references to all important DOM elements
const itemInput = document.getElementById('item-input');
const addBtn = document.getElementById('add-btn');
const itemList = document.getElementById('item-list');
const clearAllBtn = document.getElementById('clear-all');
const clearPurchasedBtn = document.getElementById('clear-purchased');
const totalItemsSpan = document.getElementById('total-items');
const purchasedItemsSpan = document.getElementById('purchased-items');
const remainingItemsSpan = document.getElementById('remaining-items');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');
const notificationIcon = document.getElementById('notification-icon');
const filterButtons = document.querySelectorAll('.filter-btn');

// ===== CATEGORY DETECTION =====
// Regular expressions to detect item categories based on name patterns

const categoryPatterns = {
    'fruits': /\b(apples?|bananas?|oranges?|grapes?|strawberr(y|ies)|blueberr(y|ies)|mango(es)?|peaches?|pears?|kiwis?|lemons?|limes?|cherr(y|ies)|watermelons?|melons?|pineapples?|avocados?|papayas?|coconuts?|pomegranates?|figs?|plums?|raspberr(y|ies)|blackberr(y|ies)|cranberr(y|ies)|apricots?|nectarines?|tangerines?|grapefruits?|guavas?|lychees?|passion fruit|dragon fruit|star fruit|persimmons?|dates?|olives?)\b/i,
    'vegetables': /\b(broccoli|carrots?|cauliflower|spinach|kale|lettuce|cabbage|onions?|garlic|peppers?|tomatoes?|potatoes?|cucumbers?|zucchini|eggplants?|mushrooms?|celery|asparagus|peas|green beans|corn|sweet potatoes?|yams|radishes?|beets?|turnips?|artichokes?|brussels sprouts|bok choy|chard|collard greens|leeks|okra|parsnips?|rutabagas?|shallots?|rhubarb|squash|pumpkins?|acorn squash|butternut squash|spaghetti squash)\b/i,
    'dairy': /\b(milk|cheese|yogurt|butter|cream|ice cream|curd|paneer|custard|whipped cream|sour cream|buttermilk|provolone|cheddar|parmesan|mozzarella|feta|gouda|brie|camembert|ricotta|cottage cheese|cream cheese|swiss cheese|monterey jack|blue cheese|goat cheese|yoghurt|kefir|half.?and.?half|heavy cream|light cream|skim milk|whole milk|condensed milk|evaporated milk)\b/i,
    'meat': /\b(chicken|beef|pork|turkey|fish|salmon|tuna|cod|shrimp|prawns?|lamb|bacon|sausage|ham|steak|ribs?|veal|duck|venison|clams?|oysters?|mussels?|lobster|crab|scallops?|salami|pepperoni|pastrami|prosciutto|jerky|ground beef|ground turkey|ground chicken|roast|chops?|wings?|drumsticks?|thighs?|breasts?|filet|sirloin|ribeye|t.?bone|porterhouse|flank steak|short ribs|brisket)\b/i,
    'bakery': /\b(bread|baguette|croissant|muffins?|donuts?|pastr(y|ies)|cakes?|cookies?|biscuits?|rolls?|buns?|pitas?|tortillas?|bagels?|scones?|brownies|cupcakes?|pie|tarts?|ciabatta|sourdough|rye bread|wheat bread|white bread|multigrain bread|pumpernickel|naan|focaccia|pretzels?|crackers?|waffles?|pancakes?|french toast|croutons?|breadcrumbs?|shortbread|gingerbread)\b/i,
    'beverages': /\b(water|soda|coffee|tea|lemonade|smoothie|milkshake|espresso|latte|cappuccino|hot chocolate|cola|pepsi|dr pepper|sprite|root beer|energy drink|wine|beer|ale|lager|cider|champagne|whiskey|vodka|rum|gin|tonic|seltzer|sparkling water|mineral water|iced tea|herbal tea|green tea|black tea|oolong tea|chai|matcha|protein shake|sports drink|electrolyte drink|kombucha)\b/i
};

// Image mapping for each category
const imageMap = {
    'general': 'https://cdn-icons-png.flaticon.com/512/1170/1170679.png',
    'fruits': 'https://cdn-icons-png.flaticon.com/512/3081/3081985.png',
    'vegetables': 'https://cdn-icons-png.flaticon.com/512/2329/2329866.png',
    'dairy': 'https://cdn-icons-png.flaticon.com/512/2674/2674482.png',
    'meat': 'https://cdn-icons-png.flaticon.com/512/1046/1046857.png',
    'bakery': 'https://cdn-icons-png.flaticon.com/512/2921/2921889.png',
    'beverages': 'https://cdn-icons-png.flaticon.com/512/3208/3208720.png'
};

// Initialize the app
function init() {
    console.log("Initializing Smart Shopping List...");

    // Load items from localStorage if available
    const savedItems = localStorage.getItem('shoppingListItems');
    if (savedItems) {
        items = JSON.parse(savedItems);
        render();
    }

    // Set up event listeners
    addBtn.addEventListener('click', addItem);
    itemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem();
    });

    clearAllBtn.addEventListener('click', clearAllItems);
    clearPurchasedBtn.addEventListener('click', clearPurchasedItems);

    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active')); // Remove active class from all buttons
            button.classList.add('active'); // Add active class to clicked button
            currentFilter = button.dataset.filter; // Update current filter
            render();// Re-render the list
        });
    });

    // Event delegation for dynamic buttons
    itemList.addEventListener('click', (e) => {
        if (e.target.classList.contains('purchase-btn')) {
            const id = parseInt(e.target.closest('.list-item').dataset.id);
            togglePurchased(id);
        } else if (e.target.classList.contains('delete-btn')) {
            const id = parseInt(e.target.closest('.list-item').dataset.id);
            deleteItem(id);
        }
    });

    console.log("App initialized successfully");
}

// ===== CATEGORY DETECTION =====
// Detect the category of an item based on its name

function detectCategory(itemName) {
    // Convert to lowercase for case-insensitive matching
    const lowerName = itemName.toLowerCase();

    // Define category priority (fruits first to avoid misclassification with beverages)
    const priorityOrder = ['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'beverages'];

    // Check each category in priority order

    for (const category of priorityOrder) {
        if (categoryPatterns[category].test(lowerName)) {
            return category;
        }
    }

    // Default category if no match found
    return 'general';
}

// ===== NOTIFICATION SYSTEM =====
// Show a notification message to the user
function showNotification(message, type = 'success') {
    notificationText.textContent = message;

    if (type === 'error') {
        notification.style.background = '#e74c3c';
        notificationIcon.className = 'fas fa-exclamation-circle';
    } else if (type === 'warning') {
        notification.style.background = '#f39c12';
        notificationIcon.className = 'fas fa-exclamation-triangle';
        notificationText.style.color = '#212529';
    } else {
        notification.style.background = '#27ae60';
        notificationIcon.className = 'fas fa-check-circle';
    }

    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ===== ITEM MANAGEMENT =====
// Add a new item to the list

function addItem() {
    const text = itemInput.value.trim();

    if (text === '') {
        itemInput.classList.add('shake');
        setTimeout(() => itemInput.classList.remove('shake'), 300);
        itemInput.focus();
        showNotification('Please enter an item name', 'error');
        return;
    }

    // Detect category based on item name
    const category = detectCategory(text);

    const newItem = {
        id: Date.now(), // Simple unique ID using timestamp
        text: text,
        purchased: false,
        category: category,
        dateAdded: new Date().toISOString()
    };

    items.push(newItem);
    saveItems();
    render();
    showNotification(`"${text}" added to ${category} category`);

    // Clear input and focus
    itemInput.value = '';
    itemInput.focus();
}

// Toggle purchased status
function togglePurchased(id) {
    const item = items.find(item => item.id === id);
    if (item) {
        item.purchased = !item.purchased;
        saveItems();
        render();

        if (item.purchased) {
            showNotification(`Marked "${item.text}" as purchased`);
        } else {
            showNotification(`Marked "${item.text}" as not purchased`);
        }
    }
}

// Delete an item
function deleteItem(id) {
    const item = items.find(item => item.id === id);
    if (item) {
        items = items.filter(item => item.id !== id);
        saveItems();
        render();
        showNotification(`Removed "${item.text}" from your list`);
    }
}

// Clear all items
function clearAllItems() {
    if (items.length === 0) {
        showNotification('Your list is already empty', 'warning');
        return;
    }

    if (confirm('Are you sure you want to clear all items?')) {
        items = [];
        saveItems();
        render();
        showNotification('All items cleared');
    }
}

// Clear purchased items
function clearPurchasedItems() {
    const purchasedCount = items.filter(item => item.purchased).length;

    if (purchasedCount === 0) {
        showNotification('No purchased items to clear', 'warning');
        return;
    }

    if (confirm(`Are you sure you want to clear ${purchasedCount} purchased item(s)?`)) {
        items = items.filter(item => !item.purchased);
        saveItems();
        render();
        showNotification(`Cleared ${purchasedCount} purchased items`);
    }
}

// Save items to localStorage
function saveItems() {
    localStorage.setItem('shoppingListItems', JSON.stringify(items));
}

// Filter items based on current filter
function getFilteredItems() {
    switch (currentFilter) {
        case 'active':
            return items.filter(item => !item.purchased);
        case 'purchased':
            return items.filter(item => item.purchased);
        default:
            return items;
    }
}

// Render the list based on the items array
function render() {
    // Update stats
    const totalItems = items.length;
    const purchasedItems = items.filter(item => item.purchased).length;
    const remainingItems = totalItems - purchasedItems;

    totalItemsSpan.textContent = totalItems;
    purchasedItemsSpan.textContent = purchasedItems;
    remainingItemsSpan.textContent = remainingItems;

    // Clear the list
    itemList.innerHTML = '';

    // Get filtered items
    const filteredItems = getFilteredItems();

    // Show empty state if no items
    if (filteredItems.length === 0) {
        let message = '';
        if (items.length === 0) {
            message = 'Your shopping list is empty. Add some items!';
        } else {
            switch (currentFilter) {
                case 'active':
                    message = 'No active items. All items are purchased!';
                    break;
                case 'purchased':
                    message = 'No purchased items yet.';
                    break;
                default:
                    message = 'Your shopping list is empty. Add some items!';
            }
        }

        itemList.innerHTML = `
            <li class="empty-state">
                <i class="fas fa-shopping-basket"></i>
                <p>${message}</p>
            </li>
        `;
        return;
    }

    // Render each item
    filteredItems.forEach(item => {
        const li = document.createElement('li');
        li.className = `list-item ${item.purchased ? 'purchased' : ''}`;
        li.dataset.id = item.id;

        li.innerHTML = `
            <div class="item-content">
                <img src="${imageMap[item.category]}" alt="${item.category}" class="item-image">
                <span class="item-text">${item.text}</span>
            </div>
            <div class="item-controls">
                <button class="purchase-btn">
                    <i class="fas fa-${item.purchased ? 'undo' : 'check'}"></i>
                    ${item.purchased ? 'Unpurchase' : 'Purchase'}
                </button>
                <button class="delete-btn">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        `;

        itemList.appendChild(li);
    });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);