const http = require('http');
const fs = require("fs");

const hostname = '127.0.0.1';
const port = 3000;
const pricingConfig = JSON.parse(fs.readFileSync("config.json", "utf8"));

const pricingRules = {};

const catalog = {
    op10: { name: "Oneplus 10", price: 849.99 },
    op11: { name: "Oneplus 11", price: 949.99 },
    buds: { name: "Earbuds", price: 129.99 },
    wtch: { name: "Smart Watch", price: 229.99 },
  };
  
  // Define pricing rules as functions
  pricingConfig.rules.forEach((rule) => {
    const { sku, type } = rule;
    switch (type) {
      case "discount":
        pricingRules[sku] = (quantity) => {
          const sets = Math.floor(quantity / rule.quantityRequired);
          const remaining = quantity % rule.quantityRequired;
          return (sets * rule.discountedQuantity + remaining) * catalog[sku].price;
        };
        break;
      case "bulkDiscount":
        pricingRules[sku] = (quantity) =>
          quantity >= rule.minQuantity ? quantity * rule.discountedPrice : quantity * catalog[sku].price;
        break;
      default:
        pricingRules[sku] = (quantity) => quantity * catalog[sku].price;
        break;
    }
  });

  class Checkout {
    constructor(pricingRules) {
      this.cart = {};
      this.pricingRules = pricingRules;
    }
  
    scan(item) {
      if (!this.cart[item]) {
        this.cart[item] = 0;
      }
      this.cart[item]++;
    }
  
    total() {
      let total = 0;
      for (const item in this.cart) {
        if (this.cart.hasOwnProperty(item)) {
          const quantity = this.cart[item];
          const priceFunction = this.pricingRules[item] || ((qty) => qty * catalog[item].price);
          total += priceFunction(quantity);
        }
      }
      return total.toFixed(2); // Return total as a formatted string with 2 decimal places
    }
  }

const co = new Checkout(pricingRules);

// Scan items
co.scan("wtch");
co.scan("op11");
co.scan("op11");
co.scan("op11");
co.scan("buds");
co.scan("buds");
co.scan("op11");
co.scan("op11");

// Calculate the total
const totalPrice = co.total();


const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');

});
 
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log("Total Price: $" + totalPrice);

});
