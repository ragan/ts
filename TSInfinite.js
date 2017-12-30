var log = require('../core/log');

// Let's create our own strategy
var strat = {};

var bought = false;

var currPrice = 0;
var lastPrice = 0;
var highPrice = 0;

var buyPrice = 0;
var dropLimit = 3;

var gainLimit = 3;

var dropCount = 0;
var gainCount = 0;

var stopLoss = 50;

var minimalProfit = 0.05;

// Prepare everything our strat needs
strat.init = function () {
    bought = false;

    buyPrice = this.settings.buyPrice;
    // sellPrice = this.settings.sellPrice;

    dropLimit = this.settings.dropLimit;
    gainLimit = this.settings.gainLimit;

    stopLoss = this.settings.stopLoss;

    minimalProfit = this.settings.minimalProfit;
};

// What happens on every new candle?
strat.update = function (candle) {
    updatePrice(candle.close);

};

var updatePrice = function (price) {
    var init = initializing();
    lastPrice = currPrice;
    currPrice = price;
    if (!init) {
        // gaining
        if (currPrice > lastPrice) {
            // highPrice = currPrice;
            // dropCount = 0;
            gainCount = Math.min(++gainCount, gainLimit);
            log.debug("++GAINING++ gainCount: ", gainCount);
            // dropping
        } else if (currPrice < lastPrice) {
            gainCount = 0;
            dropCount = Math.min(++dropCount, dropLimit);
            log.debug("--DROPPING-- dropCount: " + dropCount);
        }

        if (currPrice > highPrice) {
            log.debug("__HIGH PRICE GAIN__");
            highPrice = currPrice;
            log.debug("HIGH PRICE: " + highPrice);
            // sellPrice = highPrice - distance;
            // log.debug("SELL PRICE: " + sellPrice);
        }
    }
};

var initializing = function () {
    var i = currPrice === 0 && lastPrice === 0 && highPrice === 0;
    log.debug("initializing: " + i + ", currPrice: " + currPrice + ", lastPrice: " + lastPrice
              + ", highPrice: " + highPrice);
    return i;
};

// For debugging purposes.
strat.log = function () {
    // your code!
};

// Based on the newly calculated
// information, check if we should
// update or not.
strat.check = function (candle) {
    currPrice = candle.close;

    if (canBuy()) {
        buy(this);
    }
    if (canSell()) {
        sell(this);
    }
};

var canBuy = function () {
    return !bought && currPrice <= buyPrice;
};

var buy = function (o) {
    log.info("BUYING FOR: " + currPrice);
    o.advice("long");
    bought = true;
    buyPrice = currPrice;
    highPrice = currPrice;
};

var isProfitable = function () {
    return currPrice >= buyPrice * minimalProfit;
};

var canSell = function () {
    // return bought && currPrice >= sellPrice;
    return bought && isTrailStop() && currPrice >= buyPrice && isProfitable();
};

var isTrailStop = function () {
    return currPrice <= highPrice * (1.0 - stopLoss);
};

var sell = function (o) {
    log.info("SELLING FOR: " + currPrice);
    o.advice("short");
};

// Optional for executing code
// after completion of a backtest.
// This block will not execute in
// live use as a live gekko is
// never ending.
strat.end = function () {
    // your code!
};

module.exports = strat;
