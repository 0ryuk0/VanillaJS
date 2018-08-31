    'use strict';
    var shoppingCart = (function() {
        let products = data;
        let cart = (JSON.parse(localStorage.getItem('cart')) || []);
        let addToCartButtonsDOM = document.querySelectorAll('[data-action="ADD_TO_CART"]');
        const cartDOM = document.querySelector('.cart');
        const productsDOM = document.querySelector('.products');
        const totalDOM = document.querySelector('.total');

        function _init(){
            _renderProductList();
            _renderCart();

        };

        function _renderProductList(){        
            products.map(product => {
                if(product.discount > 0){
                    if(!product['updatedPrice']){
                        product['updatedPrice'] = 0;
                    }
                    product['updatedPrice'] = product.price - (product.discount*product.price*0.01);
                }
                _insertProductsToList(product);
            });
        };
    
        function _renderCart(){
            if (cart.length > 0) {
                _initCart();
            };
        };
    
        function _initCart(){
            cart.forEach(cartItem => {
                const product = cartItem;
                _insertItemToDOM(product);
                
                addToCartButtonsDOM.forEach(addToCartButtonDOM => {
                const productDOM = addToCartButtonDOM.parentNode.parentNode;
            
                if (productDOM.querySelector('.product__name').innerText === product.name) {
                    _handleActionButtons(addToCartButtonDOM, product);
                }
                });
            });   
            
            _countCartTotal();
        };
    
        function clearCart(partial) {
            if(partial){
                cartDOM.querySelectorAll('.cart__item').forEach(cartItemDOM => {
                    cartItemDOM.classList.add('cart__item--removed');
                    setTimeout(() => cartItemDOM.remove(), 250);
                }); 
            }else{
                cartDOM.querySelectorAll('.cart__item').forEach(cartItemDOM => {
                    cartItemDOM.classList.add('cart__item--removed');
                    setTimeout(() => cartItemDOM.remove(), 250);
                });          
    
                cart = [];
                localStorage.removeItem('cart');
                addToCartButtonsDOM.forEach(addToCartButtonDOM => {
                    addToCartButtonDOM.innerText = 'Add To Cart';
                    addToCartButtonDOM.disabled = false;
                });
            }
        
        };
    
        function _countCartTotal() {
            let totalSummary = {
                cartTotal: 0,
                cartItemCount: 0,
                totalRawPrice: 0,
                totalDiscount: 0,
                typeDiscount: 0
            }
    
            totalDOM.querySelectorAll('.total-box').forEach(totalItemDOM => {
                totalItemDOM.classList.add('total-box--removed');
                totalItemDOM.remove()
            });
    
            cart.forEach((cartItem) => {
                totalSummary.cartItemCount += (cartItem.quantity? cartItem.quantity: 0);
                totalSummary.totalRawPrice += cartItem.price * (cartItem.quantity? cartItem.quantity: 1);
                totalSummary.typeDiscount += cartItem.type === 'fiction' ? 
                                                (cartItem.updatedPrice ? (cartItem.updatedPrice*0.15) : (cartItem.price*0.15)) * 
                                                (cartItem.quantity? cartItem.quantity : 1) :
                                                0;
                totalSummary.cartTotal += (cartItem.quantity * (cartItem.updatedPrice? cartItem.updatedPrice :cartItem.price)) - totalSummary.typeDiscount;                                        
                totalSummary.totalDiscount = totalSummary.totalRawPrice - totalSummary.cartTotal - totalSummary.typeDiscount;
            });
            
            // insert total-order summary component
            totalDOM.insertAdjacentHTML('beforeend', `
                <div class="total-box sticky">
                    <strong>Total</strong>
                    <p>Items(${totalSummary.cartItemCount})    <span>: $${totalSummary.totalRawPrice.toFixed(2)}</span></p>
                    <p>Discount       <span>: -$${totalSummary.totalDiscount.toFixed(2)}</span></p>
                    <p>Type Discount  <span>: -$${totalSummary.typeDiscount.toFixed(2)}</span></p>
                    <p>Order Total <span>: $${totalSummary.cartTotal.toFixed(2)}</span></p>
                </div>	
            `);
        };
    
        function _insertProductsToList(product){
            productsDOM.insertAdjacentHTML('beforeend', `
                <div class="product">
                    ${(product.discount > 0 ?
                        `<div class="discount-ribbon">${product.discount}% off</div>` : ``
                    )}
                    <img class="product__image" src="${product.img_url}" alt="${product.type}">
                    <div class="product-info">
                        <small class="product__name">${product.name}</small>
                        ${(product.discount ?
                        `<p class="product__price"><s class="text-striked">${product.price}</s> $${product.updatedPrice}
                            <button class="btn btn--primary" data-action="ADD_TO_CART" onclick="shoppingCart.addToCartEvent(${product.id})">Add To Cart</button>
                        </p>`
                        : 
                        `<p class="product__price">${product.price}
                            <button class="btn btn--primary" data-action="ADD_TO_CART" onclick="shoppingCart.addToCartEvent(${product.id})">Add To Cart</button>
                        </p>`
                        )}
                    </div>
                </div>
            `);
    
            addToCartButtonsDOM = document.querySelectorAll('[data-action="ADD_TO_CART"]');
        };
    
        function _insertItemToDOM(product) {
            cartDOM.insertAdjacentHTML('beforeend', `
                <div class="cart__item">
                <img class="cart__item__image" src="${product.img_url}" alt="${product.name}">
                <h3 class="cart__item__name">${product.name}</h3>
                <h3 class="cart__item__price">${(product.updatedPrice? product.updatedPrice: product.price)}</h3>
                <button data-action="DECREASE_ITEM">&minus;</button>
                <h3 class="cart__item__quantity">${product.quantity}</h3>
                <button data-action="INCREASE_ITEM">&plus;</button>
                <button data-action="REMOVE_ITEM">&times;</button>
                </div>
            `);
            
            addToCartButtonsDOM.forEach(addToCartButtonDOM => {
                const productDOM = addToCartButtonDOM.parentNode.parentNode;            
                if (productDOM.querySelector('.product__name').innerText === product.name) {
                    _handleActionButtons(addToCartButtonDOM, product);
                }
            });
        };
    
        function _handleActionButtons(addToCartButtonDOM, product) {
            const cartItemsDOM = cartDOM.querySelectorAll('.cart__item');
            cartItemsDOM.forEach(cartItemDOM => {
                if (cartItemDOM.querySelector('.cart__item__name').innerText === product.name) {
                cartItemDOM.querySelector('[data-action="INCREASE_ITEM"]').addEventListener('click', () => increaseItem(product, cartItemDOM));
                cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').addEventListener('click', () => decreaseItem(product, cartItemDOM, addToCartButtonDOM));
                cartItemDOM.querySelector('[data-action="REMOVE_ITEM"]').addEventListener('click', () => removeItem(product, cartItemDOM, addToCartButtonDOM));
                }
            });
        };
    
        function increaseItem(product, cartItemDOM) {
            cart.forEach(cartItem => {
                if (cartItem.name === product.name) {
                    cartItemDOM.querySelector('.cart__item__quantity').innerText = ++cartItem.quantity;
                    cartItemDOM.querySelector('[data-action="DECREASE_ITEM"]').classList.remove('btn--danger');
                    localStorage.setItem('cart', JSON.stringify(cart));
                }
            });
            _countCartTotal();
        };
    
        function decreaseItem(product, cartItemDOM, addToCartButtonDOM) {
            cart.forEach(cartItem => {
                if (cartItem.name === product.name) {
                    if (cartItem.quantity > 1) {
                        cartItemDOM.querySelector('.cart__item__quantity').innerText = --cartItem.quantity;
                        localStorage.setItem('cart', JSON.stringify(cart));
                    } else {
                        removeItem(product, cartItemDOM, addToCartButtonDOM);
                    }
                }
            });
            _countCartTotal();
        };
    
        function removeItem(product, cartItemDOM, addToCartButtonDOM) {
            cartItemDOM.classList.add('cart__item--removed');
            setTimeout(() => cartItemDOM.remove(), 250);
            cart = cart.filter(cartItem => cartItem.name !== product.name);
            localStorage.setItem('cart', JSON.stringify(cart));
            addToCartButtonDOM.innerText = 'Add To Cart';
            addToCartButtonDOM.disabled = false;  
            cart.length === 0 ? backToProducts() : null;
            _countCartTotal();
        };

        function backToProducts(){
            cartDOM.parentNode.parentNode.classList.add('inactive');
            productsDOM.parentNode.classList.remove('inactive');
        };
    
        function goToCart(){
            if(cart.length > 0){
                cartDOM.parentNode.parentNode.classList.remove('inactive');
                productsDOM.parentNode.classList.add('inactive');
                _countCartTotal();
            }
        };
    
        function addToCartEvent(id){
            var currentProduct = products.filter(product => product.id === id);
            var isProductInCart = cart.filter((product) => {
                if(product.id === id){
                    product.quantity+=1;
                    return product;
                }
            });
            if(isProductInCart.length === 0){
                if(!currentProduct[0]['quantity']){
                    currentProduct[0]['quantity'] = 1;
                }
                _insertItemToDOM(currentProduct[0]);
                cart.push(currentProduct[0]);
            }else{
                clearCart(true);
                _initCart();
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            var toaster = document.getElementById("snackbar");    
                toaster.className = "show";    
                setTimeout(function(){ toaster.className = toaster.className.replace("show", ""); }, 1500);
        };    

       _init();

       return{
        addToCartEvent: addToCartEvent,
        goToCart: goToCart,
        backToProducts: backToProducts
       }

    })();
