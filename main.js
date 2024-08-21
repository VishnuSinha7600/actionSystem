import { database } from './firebase-config.js';  // Import the database
import { ref, set, update, onValue } from 'firebase/database';  // Import necessary Firebase functions

document.addEventListener('DOMContentLoaded', () => {
    // Function to create a new auction
    function createAuction(auctionId, auctionData) {
        set(ref(database, 'auctions/' + auctionId), auctionData)
            .then(() => {
                console.log("Auction created successfully!");
                displayAuctions(); // Update auctions list after creating a new auction
            })
            .catch((error) => {
                console.error("Error creating auction: ", error);
            });
    }

    // Function to place a bid
    function placeBid(auctionId, bidAmount, userId) {
        const auctionRef = ref(database, 'auctions/' + auctionId);

        update(auctionRef, {
            currentPrice: bidAmount,
            [`bids/${userId}`]: {
                amount: bidAmount,
                timestamp: Date.now()
            }
        })
        .then(() => {
            console.log("Bid placed successfully!");
        })
        .catch((error) => {
            console.error("Error placing bid: ", error);
        });
    }

    // Function to display active auctions
    function displayAuctions() {
        const auctionListRef = ref(database, 'auctions/');
        
        onValue(auctionListRef, (snapshot) => {
            const auctions = snapshot.val();
            const auctionList = document.getElementById('auction-list');
            auctionList.innerHTML = '';

            for (let auctionId in auctions) {
                const auction = auctions[auctionId];
                auctionList.innerHTML += `
                    <div class="auction-item">
                        <img src="${auction.imageUrl}" alt="${auction.itemName}">
                        <h3>${auction.itemName}</h3>
                        <p>${auction.description}</p>
                        <p>Current Price: $${auction.currentPrice}</p>
                        <p>Ends at: ${new Date(auction.endTime).toLocaleString()}</p>
                        <button class="bid-button" data-id="${auctionId}" data-price="${auction.currentPrice + 10}">Place Bid</button>
                    </div>
                `;
            }

            // Attach event listeners to all bid buttons
            document.querySelectorAll('.bid-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const auctionId = event.target.getAttribute('data-id');
                    const bidAmount = parseFloat(event.target.getAttribute('data-price'));
                    const userId = 'user1';  // Replace with actual user ID
                    placeBid(auctionId, bidAmount, userId);
                });
            });
        });
    }

    // Call the function to display auctions on page load
    displayAuctions();

    // Example of creating an auction (Replace with your actual logic for form submission)
    document.getElementById('create-auction-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const auctionId = `auction_${Date.now()}`;
        const auctionData = {
            itemName: document.getElementById('item-name').value,
            description: document.getElementById('item-description').value,
            startingPrice: parseFloat(document.getElementById('starting-price').value),
            currentPrice: parseFloat(document.getElementById('starting-price').value),
            imageUrl: '',  // Handle image upload and set the URL here
            endTime: Date.now() + (24 * 60 * 60 * 1000), // Set auction end time to 24 hours from now
            bids: {}
        };
        createAuction(auctionId, auctionData);
    });
});
