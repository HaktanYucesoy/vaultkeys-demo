// ─── VaultKeys Cart Management ────────────────────────────────────────────────
const VKCart = (() => {
  const CART_KEY = 'vk_cart';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
  }

  function addItem(product, qty = 1) {
    const cart = getCart();
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id: product.id, slug: product.slug, title: product.title, price: product.price, category: product.category, color: product.color || '', qty });
    }
    saveCart(cart);
    return cart;
  }

  function removeItem(id) {
    saveCart(getCart().filter(i => i.id !== id));
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
  }

  function getTotal() {
    return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function getCount() {
    return getCart().reduce((sum, i) => sum + i.qty, 0);
  }

  function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const count = getCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  return { getCart, addItem, removeItem, clearCart, getTotal, getCount, updateCartBadge };
})();

document.addEventListener('DOMContentLoaded', () => VKCart.updateCartBadge());
