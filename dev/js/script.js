window.addEventListener('DOMContentLoaded', ()=>{
  var lazyLoadInstance = new LazyLoad();
  const catalog = axios.get('http://my-json-server.typicode.com/demeja1610/redsoft_test/catalog').then((response)=>{
    fillCatalog(response.data);
  }).catch((error)=>{
    console.log(error.response)
    show_notification(`Ошибка!<br/> Status: ${error.response.status}<br/> Status text: ${error.response.statusText}`, 'error', 1)
  });

  document.querySelector('body').addEventListener('click', function(e){
    const id = e.target.getAttribute('data-id');

    if(e.target.classList.contains('catalog__item-buy') && !e.target.classList.contains('added')){
      e.target.classList.add('loading')
      // вместо "3" можно подставлять id продукта
      axios.get(`https://reqres.in/api/products/3`).then((response)=>{
        AddToCart(id); 
        e.target.classList.remove('loading');
        e.target.innerHTML = "В корзине";
        e.target.classList.add('added');
      }).catch((error)=>{
        console.log(error.response)
        show_notification(`Ошибка!<br/> Status: ${error.response.status}<br/> Status text: ${error.response.statusText}`, 'error', 0)
      });
    }else if(e.target.classList.contains('catalog__item-buy') && e.target.classList.contains('added')){
      e.target.innerHTML = "Купить";
      e.target.classList.remove('added');
      deleteLocalCartItem(id);
    }else{
      return false;
    }
  })
});

function show_notification(text, className, isInfinite){
  Toastify({
    text: text,
    duration: isInfinite ? -1 : 3000, 
    newWindow: true,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: 'right', // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    className: className
  }).showToast();
}

function fillCatalog(data){
  catalogWrapper = document.querySelector('.catalog');
  if(data && catalogWrapper){
    catalogWrapper.classList.contains('loading') ? catalogWrapper.classList.remove('loading') : 0;
    
    data.forEach(item => {
      let catalogItem = document.createElement('div');
      let localCart = localStorage.getItem('cart');
      catalogItem.classList.add('catalog__item');
      catalogItem.setAttribute('data-id', item.id);
      if(item.sold){
        catalogItem.classList.add('sold');
      }
      catalogItem.innerHTML = `
        <picture class="catalog__item-image">
          <source class="catalog__item-img" srcset="${item.webp}">
          <img class="catalog__item-img" src="${item.image}" alt="">
        </picture>
        <div class="catalog__item-info">
          <p class="catalog__item-title">${item.title}</p>
          <div class="catalog__item-price">
            ${!item.sold && !item.sold != 0 && item.sale && item.sale != 0 ? `<del class="catalog__item-del">${item.price}</del>`: ''}
            <ins class="catalog__item-ins">
              ${item.sold || item.sold != 0 ? 'Продана на аукционе' : `${item.sale && item.sale != 0 ? item.sale : item.price}`}
            </ins>
          </div>
          ${!item.sold ? 
            `<button 
              class="btn catalog__item-buy ${localCart && localCart.indexOf(`${item.id}`) != -1 ? 'added' : ''}" 
              data-id="${item.id}">${localCart && localCart.indexOf(`${item.id}`) != -1 ? 'В корзине' : 'Купить'}</button>` : 
            ''
          }
        </div>`;
        catalogWrapper.appendChild(catalogItem);
    });
  }
}

function AddToCart(id){
  setLocalCartItem(id);
}

function setLocalCartItem(id){
  let localCart = localStorage.getItem('cart');
  
  if(isEmptyCart()){
    localStorage.setItem('cart', JSON.stringify([]));
    localCart = localStorage.getItem('cart');
  }
  
  localCart = JSON.parse(localCart);
  if(localCart.indexOf(`${id}`) == -1){
    localCart.push(id);
    localStorage.setItem('cart', JSON.stringify(localCart));
  }else{
    show_notification('Товар уже находится в корзине!');
  }
}
function deleteLocalCartItem(id){
  let localCart = localStorage.getItem('cart');
  
  if(!isEmptyCart()){
    localCart = JSON.parse(localCart);
    if(localCart.indexOf(`${id}`) != -1){
      console.log(localCart.indexOf(`${id}`));
      localCart.splice(localCart.indexOf(`${id}`), 1);
      localStorage.setItem('cart', JSON.stringify(localCart));
    }else{
      show_notification('Товар не в корзине!');
    }
  }
}

function isEmptyCart(){
  let cart = localStorage.getItem('cart');
  let isEmpty = false;
  if(!cart){
    isEmpty = true;
  }else{
    cart = JSON.parse(cart);
    if(cart.length === 0){
      isEmpty = true;
    }else{
      isEmpty = false;
    }
  }
  return isEmpty;
}