const StarNotary = artifacts.require("StarNotary");

let accounts;
let owner;
let idCounter = counter();

function counter() {
    let value = 0;
    return {
        increment: function () {
            return value++;
        }
    }
}

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];

    it('can Create a Star', async () => {
        let tokenId = idCounter.increment();
        let instance = await StarNotary.deployed();

        await instance.createStar('Awesome Star!', 'STR', tokenId, { from: accounts[0] })
        let createdStar = await instance.tokenIdToStarInfo.call(tokenId);
        assert.equal(createdStar.name, 'Awesome Star!')
        assert.equal(createdStar.symbol, 'STR');
    });

    it('lets user1 put up their star for sale', async () => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let starId = idCounter.increment();
        let starPrice = web3.utils.toWei(".01", "ether");

        await instance.createStar('awesome star', 'STR', starId, { from: user1 });
        await instance.putStarUpForSale(starId, starPrice, { from: user1 });
        assert.equal(await instance.starsForSale.call(starId), starPrice);
    });

    it('lets user1 get the funds after the sale', async () => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId = idCounter.increment();
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");

        await instance.createStar('awesome star', 'STR', starId, { from: user1 });
        await instance.putStarUpForSale(starId, starPrice, { from: user1 });

        let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
        await instance.buyStar(starId, { from: user2, value: balance });
        let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);

        let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
        let value2 = Number(balanceOfUser1AfterTransaction);
        assert.equal(value1, value2);
    });

    it('lets user2 buy a star, if it is put up for sale', async () => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId = idCounter.increment();
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");

        await instance.createStar('awesome star', 'STR', starId, { from: user1 });
        await instance.putStarUpForSale(starId, starPrice, { from: user1 });

        await instance.buyStar(starId, { from: user2, value: balance });
        assert.equal(await instance.ownerOf.call(starId), user2);
    });

    it('lets user2 buy a star and decreases its balance in ether', async () => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId = idCounter.increment();
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");

        await instance.createStar('awesome star', 'STR', starId, { from: user1 });
        await instance.putStarUpForSale(starId, starPrice, { from: user1 });

        const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
        await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
        const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);

        let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
        assert.equal(value, starPrice);
    });

    // Implement Task 2 Add supporting unit tests

    it('can add the star name and star symbol properly', async () => {
        // 1. create a Star with different tokenId
        // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
        let tokenId = idCounter.increment();
        let instance = await StarNotary.deployed();

        await instance.createStar('Awesome Star!', 'STR', tokenId, { from: accounts[0] })
        let createdStar = await instance.tokenIdToStarInfo.call(tokenId);
        assert.equal(createdStar.name, 'Awesome Star!')
        assert.equal(createdStar.symbol, 'STR');
    });

    it('lets 2 users exchange stars', async () => {
        // 1. create 2 Stars with different tokenId
        // 2. Call the exchangeStars functions implemented in the Smart Contract
        // 3. Verify that the owners changed

        let user1 = accounts[0];
        let user2 = accounts[1];
        let idStar1 = idCounter.increment();
        let idStar2 = idCounter.increment();

        let instance = await StarNotary.deployed();
        await instance.createStar('User 1 Exchange Star', 'STR', idStar1, { from: user1 });
        await instance.createStar('User 2 Exchange Star', 'STR', idStar2, { from: user2 });
        await instance.exchangeStars(idStar1, idStar2, { from: user1 }); // Can be user2 as well.

        let starOneNewOwner = await instance.ownerOf(idStar1);
        let starTwoNewOwner = await instance.ownerOf(idStar2);

        assert.equal(starOneNewOwner, user2);
        assert.equal(starTwoNewOwner, user1);
    });

    it('lets a user transfer a star', async () => {
        // 1. create a Star with different tokenId
        // 2. use the transferStar function implemented in the Smart Contract
        // 3. Verify the star owner changed.

        let user1 = accounts[0];
        let user2 = accounts[1];
        let idStar = idCounter.increment();

        let instance = await StarNotary.deployed();
        await instance.createStar('Twinkle Star', 'STR', idStar, { from: user1 });
        await instance.transferStar(user2, idStar, { from: user1 }); // Can be user2 as well.
        let currentStarOwner = await instance.ownerOf(idStar);

        assert.equal(currentStarOwner, user2);
    });

    it('lookUptokenIdToStarInfo test', async () => {
        // 1. create a Star with different tokenId
        // 2. Call your method lookUptokenIdToStarInfo
        // 3. Verify if you Star name is the same

        let tokenId = idCounter.increment();

        let instance = await StarNotary.deployed();
        await instance.createStar('Awesome Star!', 'STR', tokenId, { from: accounts[0] })
        let starName = await instance.lookUptokenIdToStarInfo(tokenId);

        assert.equal(starName, 'Awesome Star!')
    });
});

